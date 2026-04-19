#!/usr/bin/env node
/**
 * ElevenLabs Conversation Extractor
 * Fetches all conversations for the Mana Ako / Project Rise agent,
 * redacts participant names, and saves as anonymised markdown.
 *
 * Usage: node extract-conversations.mjs
 *
 * Reads ELEVENLABS_API and PUBLIC_ELEVENLABS_AGENT from .env.local
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env from .env.local ──────────────────────────────────────────────────

function loadEnv(filePath) {
  try {
    const lines = readFileSync(filePath, 'utf8').split('\n');
    const env = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv(join(__dirname, '.env.local'));
const API_KEY = process.env.ELEVENLABS_API || env.ELEVENLABS_API;
const AGENT_ID = process.env.PUBLIC_ELEVENLABS_AGENT || env.PUBLIC_ELEVENLABS_AGENT;

if (!API_KEY || !AGENT_ID) {
  console.error('Missing ELEVENLABS_API or PUBLIC_ELEVENLABS_AGENT');
  process.exit(1);
}

const BASE = 'https://api.elevenlabs.io/v1';
const HEADERS = { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' };

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchAllConversations() {
  const conversations = [];
  let cursor = null;

  do {
    const url = new URL(`${BASE}/convai/conversations`);
    url.searchParams.set('agent_id', AGENT_ID);
    url.searchParams.set('page_size', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), { headers: HEADERS });
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 401 && text.includes('missing_permissions')) {
        throw new Error(
          `API key missing "convai_read" permission.\n` +
          `Go to ElevenLabs → Profile → API Keys, create a new key with\n` +
          `Conversational AI → Read enabled, then update ELEVENLABS_API in .env.local`
        );
      }
      throw new Error(`List conversations failed ${res.status}: ${text}`);
    }
    const data = await res.json();
    const items = data.conversations ?? data.items ?? [];
    conversations.push(...items);
    cursor = data.next_cursor ?? data.cursor ?? null;
  } while (cursor);

  return conversations;
}

async function fetchConversationDetail(conversationId) {
  const res = await fetch(`${BASE}/convai/conversations/${conversationId}`, {
    headers: HEADERS,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get conversation ${conversationId} failed ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Name redaction ────────────────────────────────────────────────────────────

/**
 * Build a redaction map from a conversation's dynamic variables.
 * Returns { originalTerm: replacement } pairs, longest first to avoid
 * partial-match issues (e.g. "Smith" matched before "John Smith").
 */
function buildRedactionMap(detail, conversationIndex) {
  const vars = detail?.metadata?.custom_llm_extra_body?.dynamic_variables
    ?? detail?.conversation_config_override?.custom_llm_extra_body?.dynamic_variables
    ?? detail?.dynamic_variables
    ?? {};

  const firstName = vars.first_name ?? '';
  const lastName = vars.last_name ?? '';
  const participantId = vars.participant_id ?? '';

  const label = `Participant ${conversationIndex}`;
  const map = {};

  // Full name variants (case-insensitive handled in redact())
  if (firstName && lastName) {
    map[`${firstName} ${lastName}`] = `[${label}]`;
    map[`${lastName}, ${firstName}`] = `[${label}]`;
    map[`${lastName} ${firstName}`] = `[${label}]`;
  }
  if (firstName) map[firstName] = `[${label}]`;
  if (lastName) map[lastName] = `[${label}]`;
  if (participantId) map[participantId] = `[ID-${conversationIndex}]`;

  return map;
}

function redact(text, redactionMap) {
  if (!text) return text;
  let out = text;
  // Sort by length descending so longer strings are replaced first
  const terms = Object.keys(redactionMap).sort((a, b) => b.length - a.length);
  for (const term of terms) {
    if (!term) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    out = out.replace(re, redactionMap[term]);
  }
  return out;
}

// ── Markdown formatting ───────────────────────────────────────────────────────

function formatTimestamp(unixSecs) {
  if (!unixSecs) return 'Unknown';
  return new Date(unixSecs * 1000).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}

function formatDuration(secs) {
  if (!secs && secs !== 0) return '—';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function conversationToMarkdown(detail, index, redactionMap) {
  const id = detail.conversation_id ?? detail.id ?? 'unknown';
  const status = detail.status ?? '—';
  const startTime = formatTimestamp(detail.metadata?.start_time_unix_secs ?? detail.start_time_unix_secs);
  const durationSecs = detail.metadata?.call_duration_secs ?? detail.call_duration_secs;
  const duration = formatDuration(durationSecs);
  const transcript = detail.transcript ?? [];

  const lines = [
    `## Conversation ${index} — \`${id}\``,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| Started | ${startTime} |`,
    `| Duration | ${duration} |`,
    `| Status | ${status} |`,
    `| Messages | ${transcript.length} |`,
    '',
    `### Transcript`,
    '',
  ];

  if (transcript.length === 0) {
    lines.push('_No transcript available._');
  } else {
    for (const turn of transcript) {
      const role = turn.role === 'agent' ? '**Agent**' : '**Participant**';
      const timeInCall = turn.time_in_call_secs != null
        ? ` _(${formatDuration(turn.time_in_call_secs)})_`
        : '';
      const message = redact(turn.message ?? turn.content ?? '', redactionMap);
      lines.push(`${role}${timeInCall}: ${message}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching conversations for agent: ${AGENT_ID}`);

  const summaries = await fetchAllConversations();
  console.log(`Found ${summaries.length} conversation(s). Fetching details…`);

  const sections = [];
  let participantCounter = 1;

  for (let i = 0; i < summaries.length; i++) {
    const summary = summaries[i];
    const convId = summary.conversation_id ?? summary.id;
    process.stdout.write(`  [${i + 1}/${summaries.length}] ${convId} … `);

    let detail;
    try {
      detail = await fetchConversationDetail(convId);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
      continue;
    }

    const redactionMap = buildRedactionMap(detail, participantCounter);
    const hasName = Object.keys(redactionMap).some(k => k.length > 0);
    if (hasName) participantCounter++;

    sections.push(conversationToMarkdown(detail, i + 1, redactionMap));
    console.log('done');
  }

  const now = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const doc = [
    `# ElevenLabs Conversations — Anonymised`,
    '',
    `> **Project:** Mana Ako × Project Rise`,
    `> **Agent:** \`${AGENT_ID}\``,
    `> **Extracted:** ${now}`,
    `> **Total conversations:** ${summaries.length}`,
    `> **Redaction:** Participant names replaced with \`[Participant N]\`. Participant IDs replaced with \`[ID-N]\`.`,
    '',
    '---',
    '',
    ...sections.flatMap(s => [s, '', '---', '']),
  ].join('\n');

  const outPath = join(__dirname, 'conversations-anonymised.md');
  writeFileSync(outPath, doc, 'utf8');
  console.log(`\nSaved: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
