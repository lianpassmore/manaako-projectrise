# SAFETY EXTRACTION — Mana Ako × Project Rise
**Masters Thesis Safety Design Audit**
*Extracted: 2026-03-23 | Audited by: Claude Code (claude-sonnet-4-6)*

---

## 1. PROJECT IDENTITY

**Project name:** Mana Ako × Project Rise — *Wānanga 2026*
**Site domain:** culturemeetsai.space

**What it does:**
A research platform supporting two linked Masters studies at AcademyEX. It recruits participants to interact with a voice-based conversational AI agent (or alternatives), then brings them together in an online wānanga to collectively reflect on what it felt like. The platform handles participant registration, informed consent, AI voice sessions, written form submissions, and post-wānanga reflections.

**The two research projects embedded in this platform:**
- **Project Rise** (Lian Passmore): *"How might we design ethical conversational AI for vulnerable interactions using Māori and Pasifika values?"* — case study: Ray, a relationship coaching AI
- **Mana Ako** (Lee Palamo): *"How might conversational AI support te reo Māori learners with a culturally grounded, emotionally safe experience?"* — agent: Oriwa (named after Lee's grandmother)

**Who the users are:**
Adults 18+ in Aotearoa New Zealand, specifically recruiting: te reo Māori learners, teachers/kaiako, kaupapa Māori practitioners, community members, technology/AI professionals, and researchers. The platform explicitly targets Māori, Pasifika, and other communities with lived experience of cultural vulnerability in digital spaces.

**Vulnerability level:**
High. The research sits at the intersection of:
- Relational vulnerability (relationship coaching AI)
- Cultural and linguistic identity (te reo Māori learners, whakamā/shame)
- Historical harm (Māori data sovereignty, digital exclusion)
- Biometric data (voice as personal identifier under NZ Biometric Processing Privacy Code 2025)
- Emotional disclosure to a machine (AI-mediated conversations about identity, culture, personal experience)

**Date range built:**
February 10, 2026 – March 3, 2026 (per git log; wānanga ran February 26, 2026)

**Tech stack:**
- **Framework:** Astro 5.17.1 with React 19.2.4 (islands architecture)
- **Voice AI:** ElevenLabs (`@elevenlabs/react` v0.14.0) — agent ID: `agent_8001kh5cvx8ze489jzgv04207tnp`
- **Database:** Supabase (`@supabase/supabase-js` v2.95.3) — hosted in Sydney, Australia
- **Styling:** Tailwind CSS with custom te reo Māori colour tokens
- **Deployment:** Vercel
- **Video:** Zoom (wānanga)
- **Booking:** Google Calendar Appointments

---

## 2. SYSTEM PROMPTS & AI INSTRUCTIONS

### Critical Finding: No System Prompt Exists in This Codebase

After a complete search of all ~4,200 lines of source code, **no system prompt, persona definition, character instruction, or AI behaviour specification was found in this repository.** The agent's instructions are stored and managed entirely on the ElevenLabs platform, outside the researchers' version-controlled codebase.

**What IS in the code — dynamic variables passed to ElevenLabs at session start:**

File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L44-L51)
```javascript
await conversation.startSession({
  agentId: agentId,
  dynamicVariables: {
    first_name: firstName,
    last_name: lastName,
    participant_id: participantId,
    reflection_mode: (typeof window !== 'undefined' && window.location.pathname.includes('/reflections')) ? 'true' : 'false',
  },
});
```

**What these variables imply about the external agent configuration:**
- `first_name` / `last_name` — the agent can address participants by name
- `participant_id` — the agent knows which research record to link the conversation to
- `reflection_mode: 'true' | 'false'` — the agent behaves differently in post-wānanga reflections vs. initial participation. This implies at minimum two distinct behavioural modes are configured in ElevenLabs.

**The external agent described in user-facing text** ([`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L682)):

> "In a moment, you will hear Lian's voice. But it is not Lian — it is a conversational AI using her voice."

And from the consent section ([`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L498)):

> "This is a conversational AI. It uses Lian's voice, but it is not Lian. It is not a person, a teacher, a therapist, or an authority on anything. It is a tool — and like all tools, it has limitations."

**The only commit referencing agent configuration:**
```
dc3ccdb "agent config"   — 2026-02-12 07:37:49 +1300
```
No diff is available to audit what changed in that commit. The prompt itself lives in ElevenLabs, not in git.

**Implication for the thesis:**
The agent's actual safety boundaries, topic restrictions, crisis response behaviour, and cultural protocols are unauditable from this codebase. They constitute a black box from a code-level safety audit perspective. This is a structural limitation of using third-party hosted AI agents.

---

## 3. SAFETY MECHANISMS

### Conversation Boundaries

**Topics the AI is told to handle/avoid:**
Not auditable from code (system prompt is external). However, the platform design reveals *intended* scope:

- The AI is framed as a research tool exploring "safety, vulnerability, and cultural considerations around conversational AI" — not therapy, not language teaching directly
- The consent form explicitly states the AI is "not a person, a teacher, a therapist, or an authority"
- The pre-conversation screen warns: "The AI can make mistakes, miss nuance, or respond in ways that feel off"

**No keyword triggers, sentiment detection, or escalation routing found in the codebase.** There is no code that monitors the conversation in real-time and routes users to crisis support if distress is detected. Crisis support is available but passively — through a fixed button, not triggered by content.

**Agent unavailability fallback** ([`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L749-L803)):
When ElevenLabs returns an error, `onUnavailable()` is called, which sets `agentUnavailable = true`. The UI then shows a written form fallback:

```jsx
{step === 4 && agentUnavailable && (
  <div className="space-y-8 animate-fade-in">
    <h2 className="text-3xl font-bold text-whenua mb-3">
      Aroha mai — our voice agent is temporarily unavailable
    </h2>
    <p className="text-whenua/80 text-base max-w-lg mx-auto">
      We've had so much amazing kōrero that our voice agent has run out of credits for now.
      That's actually a beautiful problem to have — it means your community showed up.
    </p>
```
**Note:** This fallback was triggered in the live research (credit limit was reached). The graceful reframe ("beautiful problem") is a safety and dignity consideration — participants are not left stranded.

---

### Opening and Closing Protocols

**Opening — Pre-Conversation Preparation Screen (Step 3)**

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L662-L720)

Before any AI session begins, participants see a full preparation page with four sections:

**1. "Honouring the space":**
```
This kōrero may touch on things that sit close to the heart — identity, culture, vulnerability, shame.
For some people, this kind of conversation naturally sits in a space that deserves care.

If it feels right for you, you are welcome to take a moment before you start — whether that is a karakia,
a quiet breath, or simply checking in with yourself. There is no right or wrong way to enter this space.
How you begin and end is entirely yours.
```

**2. "What you are walking into":**
```
In a moment, you will hear Lian's voice. But it is not Lian — it is a conversational AI using her voice.
It will introduce itself and guide the conversation.

The AI is a tool. It can make mistakes, miss nuance, or respond in ways that feel off. That is okay —
noticing those moments is part of what makes your experience valuable to this research.

The AI's pronunciation of te reo Māori may not be accurate. This is a known limitation of the technology
and does not reflect the mana of the language.
```

**3. "What to notice":**
```
As you talk, pay attention to how it feels. Notice where trust forms or breaks down. Notice where the AI
feels helpful — and where it feels unsafe or insufficient.

This works best in a quiet space with headphones. The conversation runs about 10 to 15 minutes.
You can say as much or as little as you like. There are no wrong answers — we are exploring, not testing.
```

**4. "If you want to stop":**
```
If you want to stop at any time, just close the page. If you decide you would rather talk to a person
instead, you can reach Lian or Lee at lianpassmore@gmail.com or leepalamo275@gmail.com,
or book a time.
```

**Consent confirmation required before proceeding.** The CTA is "Start the kōrero" — a deliberate, affirmative action rather than an automatic start.

---

**Closing — Post-Conversation Protocol (Step 5)**

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L806-L900)

After the AI conversation:
1. Affirmation: *"Ngā mihi — thank you. Your kōrero matters."*
2. Two mandatory exit questions:
   - "Would you use something like this again?" (Yes / No / Maybe)
   - "Would you recommend this experience to someone you care about?" (Yes / No / Maybe)
3. Optional open-ended field: "Is there anything else sitting with you right now?"
4. "What happens next" — wānanga invitation details
5. Path-switching offer: *"If that conversation made you want to talk to a person, you can book a kōrero with Lian or Lee anytime."*

**The two mandatory questions serve dual purpose:** they are data collection for the research AND a structured check-in that prompts participants to consciously evaluate their experience before leaving.

---

**Consent flow before the conversation begins:**

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L453-L660)

For the AI path, participants pass through:
1. **Path selection** — explicit choice among four options
2. **Registration** — name, email, cultural identities (optional), age range
3. **Consent** — expandable sections, all must be checked:
   - `understand_process` — *"I understand what this research involves and how my data will be processed, including by ElevenLabs under their Terms of Service"*
   - `understand_recording` — *"I understand my conversation will be recorded, transcribed, and stored for research purposes"*
   - `voluntary` — *"I understand my participation is voluntary, consent is ongoing, and I can withdraw at any time"*
   - `understand_ai` — *"I understand the AI is a tool with limitations — it is not a person, teacher, or authority"* (**AI path only**)
   - `research_use` — consent to anonymised use in both Masters projects
   - `age_confirm` — *"I confirm I am 18 years or older"*
   - `ready` — *"I am ready to begin"*
4. **Preparation screen** (described above)
5. **AI session**

The consent checkboxes are rendered dynamically — the AI path gets 7 items (including `understand_ai`), the written form gets 6. File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L267-L279).

---

### Emotional Safety

**Distress acknowledgement language (embedded throughout):**

In the CrisisModal ([`src/components/CrisisModal.jsx`](src/components/CrisisModal.jsx#L33-L35)):
```
These conversations can touch on personal experiences of vulnerability, shame, or cultural harm.
If anything feels uncomfortable, you are welcome to stop at any time.
```

In the "If something comes up" consent section ([`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L617)):
```
These conversations can touch on personal experiences of vulnerability, shame, or cultural harm.
If anything feels uncomfortable, you are welcome to stop at any time. You do not need to explain why.
```

This exact phrasing appears in **three places**: the CrisisModal, the participation consent, and the wānanga consent — consistent language by design.

**No automated distress detection exists.** There is no sentiment analysis, no keyword monitoring, no escalation trigger in the codebase. Emotional safety relies on:
1. Pre-conversation framing
2. Always-visible crisis modal
3. Explicit permission to stop at any time
4. Researcher contact always provided

**Mute and End controls during AI session:**
File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L130-L161)

```jsx
{started && (
  <div className="flex items-center gap-4">
    <button onClick={handleMute}>
      {muted ? 'Unmute' : 'Mute'}
    </button>
    <button onClick={handleEnd} className="... bg-crisis text-white ...">
      End Call
    </button>
  </div>
)}
```

Both controls are always visible once a session starts. End Call is styled in the crisis/red colour, making it visually distinct and immediately findable.

**Persistent AI disclaimer** (always shown below the orb):
File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L124-L126)
```
This is an AI tool, not a person. It can make mistakes, miss nuance, or get things wrong.
Its pronunciation of te reo Māori may not be accurate.
```

**Crisis support resources — always-accessible modal:**
File: [`src/components/CrisisModal.jsx`](src/components/CrisisModal.jsx)

Fixed to bottom-right of every page on the site. Contents:

```
Mental Health Support:
  1737 — Free call or text, anytime (24/7)
  Lifeline — 0800 543 354

Domestic Violence:
  Women's Refuge — 0800 733 843

Emergency:
  111

Researcher debrief:
  lianpassmore@gmail.com
  leepalamo275@gmail.com
```

The researcher debrief option is notable: it positions Lian and Lee as a support contact alongside national crisis lines, not just as data collectors.

**In-app browser detection** — a safety mechanism for access:
File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L5-L8)

```javascript
function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Messenger|Line\/|Twitter|Snapchat|WhatsApp|MicroMessenger/i.test(ua);
}
```

If detected, the user sees a clear message to open in Safari or Chrome with a copy-link button. This prevents the frustrating experience of the AI silently failing due to microphone restrictions in embedded browsers — a source of confusion that could be distressing in a vulnerable research context. This was added in a named commit:
```
4f24d30 Detect in-app browsers and prompt users to open in Safari/Chrome — 2026-02-24
```

---

### Data Handling

**What the researchers control:**

File: [`src/pages/privacy.astro`](src/pages/privacy.astro#L21-L22)
```
Your registration details are stored in Supabase (Sydney, AU) with row-level security.
Transcripts stay in ElevenLabs — we download them from there for analysis.
You can ask us to delete your registration data anytime.
```

File: [`src/lib/supabase.js`](src/lib/supabase.js)
```javascript
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;
```

**Supabase instance:** Sydney, Australia (ap-southeast-2 region)

**Row-Level Security:** Referenced in user-facing privacy text and consent copy: *"stored in Supabase (Sydney, Australia) with row-level security"* — appears 3 times in the codebase. RLS policy definitions are not in this repository; they are configured in the Supabase dashboard.

**Database tables (inferred from code):**

| Table | Key fields | Who can access |
|-------|-----------|---------------|
| `participants` | id, first_name, last_name, email, age_range, location, role_context, cultural_identities, consent_agreed, consent_timestamp, participation_type, hui_attendance, use_again, recommend, anything_else | Researchers via Supabase dashboard + anon key (RLS-restricted) |
| `reflections` | id, email, first_name, what_shifted, what_holding, what_matters_most, paradox, what_surprised, anything_else, one_word_feeling, submitted_at | Researchers via Supabase dashboard |
| `form_responses` | id, email, first_name, last_name, feeling, q1–q4 | Researchers via Supabase dashboard |
| `written_responses` | id, participant_id (FK), responses (JSON), submitted_at | Researchers via Supabase dashboard |

**Consent timestamp** is stored as ISO 8601 for each participant — creates an audit trail of when consent was given.

**What ElevenLabs controls:**

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L513-L515)
```
When you speak to the AI agent, your voice and words are processed by ElevenLabs, a US-based voice AI company.
Your conversation is sent to their servers in the United States. All data is transferred to and stored in
the United States, regardless of your location.
```

From the privacy page ([`src/pages/privacy.astro`](src/pages/privacy.astro#L26-L28)):
```
ElevenLabs (US) processes your voice. Your audio goes to US servers. We've opted out of model training,
but their Terms of Service grant a broad license. We can't revoke that after the fact.
```

**Data location table** (from [`src/pages/privacy.astro`](src/pages/privacy.astro#L43-L58)):

| Data | Where |
|------|-------|
| Registration | Supabase (Sydney) |
| Voice & transcript | ElevenLabs (US) |
| Transcripts (downloaded for analysis) | ElevenLabs (US) → researcher devices |
| Wānanga recording | Zoom (US) |

**Retention:**
- Researchers: 3 years from project completion, or earlier on request
- ElevenLabs: up to 3 years after last interaction — **researchers cannot force deletion**
- No data deletion receipt or confirmation mechanism exists in the code

**User rights documented:**
File: [`src/pages/privacy.astro`](src/pages/privacy.astro#L67-L76)
```
- Stop anytime — close the browser
- Switch between AI and person whenever
- Withdraw from our database up to two weeks after wānanga
- We delete our copy within 3 years (or earlier on request)
- ElevenLabs retains up to 3 years — we can't control that
- You must be 18 or older to participate
- Not participating has zero consequences
```

**Can users delete their data?** Yes, by emailing the researchers. No automated deletion mechanism exists in the codebase. The withdrawal window is up to two weeks post-wānanga.

**NZ Privacy Commissioner complaint link:** privacy.org.nz — linked from the biometric consent section and footer.

---

### Cultural Safety

**Te reo Māori use throughout the codebase:**

Te reo Māori is woven through UI copy, variable names, colour tokens, and page headings. This is not decorative — it reflects the kaupapa of the research.

| Context | Te reo Māori used |
|---------|-------------------|
| Navigation | "Wānanga 2026", "Kōrero" |
| Button labels | "Start the kōrero", "Ngā mihi" |
| CSS colour tokens | `whenua` (land), `ako` (learning/teaching), `kakahu` (garment), `rauhuia`, `marama` (moon), `papa` |
| Page headings | "Your data, honestly." (note: heading uses plain English, cultural framing is contextual) |
| Whakataukī | *"Mā te kōrero ka ora"* — Through conversation, there is life (appears 5+ times) |
| Agent name | "Oriwa" (Lee's grandmother's name — te reo Māori) |
| Consent sections | "How we use your kōrero", "Honouring the space" |
| Concepts | whakamā (shame), tapu/noa, vā, utu tūturu, mana motuhake |
| Research framework | Kiri Dell's compass (Kei raro / Kei mua / Kei runga / Kei roto / Kei waho) |

**Te reo pronunciation caveat — explicit acknowledgement of limitation:**

Appears in THREE places:
1. Pre-conversation screen: *"The AI's pronunciation of te reo Māori may not be accurate. This is a known limitation of the technology and does not reflect the mana of the language."*
2. Persistent disclaimer under the orb during AI sessions
3. Consent "About the AI" section

**Māori/Pasifika values as structural framework:**

File: [`src/pages/about.astro`](src/pages/about.astro#L88-L104)

The three core values structuring Project Rise:
- **Vā** — the sacred relational space between people (Pasifika)
- **Utu Tūturu** — enduring collective reciprocity (Māori)
- **Mana Motuhake** — absolute data sovereignty (Māori)

Lee's project grounds in Ngāti Awa specifically before broader scaling. The agent "Oriwa" is named after Lee's grandmother — not a generic name but a specific whakapapa connection.

**Acknowledgement of sovereignty gap:**

File: [`src/pages/about.astro`]
```
Te Hiku Media has shown what sovereignty looks like. We are not there.
We are honest about that.
```

File: [`src/pages/privacy.astro`](src/pages/privacy.astro#L81-L84)
```
The tools we're using don't align with the data sovereignty principles our research is built on.
We chose them because building our own voice AI was beyond our capacity. That contradiction is real —
and it's one of the things this research explores.
```

**Cultural safety in consent:**
- Participants are asked to self-identify cultural identities (optional field)
- The wānanga consent references "culturally grounded group discussion"
- Consent sections reference "cultural harm" as a recognised risk alongside vulnerability and shame
- The wānanga space is described as "a culturally grounded space to sit with what came up"

**Research ethics approvals** (in footer of every page, `src/layouts/Layout.astro`):
- Lian: MTF.8888.275 (approved 21/07/2025 – 21/07/2027)
- Lee: MTF.8888.274 (approved 21/07/2025 – 21/07/2027)
- Process: AcademyEX Research, Enterprise & Ethics (REE)

---

## 4. WHAT'S NOT THERE (GAPS)

These are absent from the codebase. Each represents a safety design decision — either deliberately deferred, beyond resource capacity, or not yet considered.

### Gap 1: Auditable system prompt
The AI's actual instructions — what it says, what it avoids, how it handles distress, whether it has cultural guardrails — are stored on ElevenLabs' platform. No version of the prompt is in git. If the prompt was changed before or during the research, there is no record. For a study specifically investigating the safety of AI in vulnerable contexts, the primary safety control is inaccessible to audit.

### Gap 2: Real-time distress detection
No code monitors the conversation for signs of participant distress. There is no sentiment analysis, no keyword detection, no automatic pause, and no escalation path that triggers from conversation content. If a participant discloses something severe during the voice call, the AI's response depends entirely on its (unauditable) ElevenLabs configuration.

### Gap 3: Data deletion receipt
When a participant requests deletion of their data, there is no confirmation email, no deletion record, and no audit trail of the deletion. The process is email-only and entirely manual.

### Gap 4: Child safety / mandatory reporting protocol
No code documents how the AI should respond if a participant discloses harm to a child. This is a gap for any AI operating in vulnerable emotional spaces, even when the platform is restricted to 18+.

### Gap 5: No session time limit or inactivity timeout
The AI session has no maximum length and no inactivity timeout in the code. A distressed participant who goes silent would leave the session open indefinitely.

### Gap 6: No in-conversation check-in
The AI conversation has no structured mid-session check-in ("Are you okay to continue?"). The preparation screen does pre-session framing, and the post-session screen does a structured debrief, but nothing in the code creates a check-in mid-conversation.

### Gap 7: ElevenLabs moderation is invisible to researchers
The consent copy states: *"ElevenLabs also reserves the right to moderate conversations for safety purposes, which means their staff or contractors may access your conversation content."* Researchers have no visibility into when or whether this occurs, and no process for being notified.

### Gap 8: No transcript access for participants
Participants are told their transcript is stored in ElevenLabs. They are told they can request their data. But there is no in-app mechanism to download or view their own transcript. Access is email-only and dependent on researchers manually fulfilling the request.

### Gap 9: Accessibility
No WCAG 2.1 AA compliance assessment is referenced. The voice-only AI path has no captioning or text transcript alternative for d/Deaf users or those with hearing impairments. The orb animation as the only visual status indicator may be insufficient for screen reader users.

### Gap 10: No data breach notification plan
No code or documented process exists for notifying participants in the event of a Supabase data breach. Given that participant data includes cultural identities and sensitive research responses, this is an omission.

---

## 5. DESIGN DECISIONS LOG

### Git commits with safety relevance

The majority of commits use terse labels ("x", "c", "send", "update"). The named commits that carry design rationale are:

```
098127e Initial commit from Astro                      — 2026-02-10
e2adca9 Add project pages, components, layouts...     — 2026-02-10
426619a Update four participation paths: AI, form,
         kōrero with person, contact us               — 2026-02-10
ba7d663 Fix Vercel build: remove GitHub Pages config,
         make Supabase init safe for build time        — 2026-02-10
4333600 Mobile optimize entire site: hamburger menu,
         circular photo, responsive layout             — 2026-02-10
6a29ccf Mobile-first copy rewrite: headers tell
         the story, content reorganised               — 2026-02-11
dc3ccdb "agent config"                                — 2026-02-12
4f24d30 Detect in-app browsers and prompt users
         to open in Safari/Chrome                     — 2026-02-24
```

**Design decisions readable from commit history:**

1. **`e2adca9` — "Add project pages, components, layouts, styles, and Tailwind config"** (Feb 10)
   The custom Tailwind colour tokens using te reo Māori names (`whenua`, `ako`, `kakahu`, etc.) appear in this first real commit. Cultural naming was an architectural decision from day one.

2. **`426619a` — "Update four participation paths: AI, form, kōrero with person, contact us"** (Feb 10)
   Four distinct participation paths were a design decision, not a compromise. The "Talk to a Person" and "Not Sure Yet" options were built in from the beginning — evidence that participant autonomy was a primary design constraint, not an afterthought.

3. **`ba7d663` — "Fix Vercel build: make Supabase init safe for build time"** (Feb 10)
   The null fallback in supabase.js (`export const supabase = supabaseUrl ? createClient(...) : null`) was added to prevent build failures — but it also means the entire app gracefully degrades if Supabase is unavailable, rather than crashing.

4. **`dc3ccdb` — "agent config"** (Feb 12)
   This is the only named commit suggesting the ElevenLabs agent was configured. No diff is auditable. This is the single point of configuration for all AI safety behaviour, and it is a black box.

5. **`4f24d30` — "Detect in-app browsers and prompt users to open in Safari/Chrome"** (Feb 24)
   Added two weeks into development, likely after user testing revealed participants were trying to access via Facebook Messenger or Instagram. The detection is comprehensive (7 browser patterns). This is a participant safety decision — preventing a confusing failure mid-consent.

### Code comments with safety rationale

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L213-L221):
```javascript
// AI path goes to prepare screen; other paths skip to post-conversation
const nextStep = participationType === 'AI Conversation' ? 3 : participationType === 'Written Form' ? 7 : 5;

// Proceed anyway so participants aren't blocked
const nextStep = participationType === 'AI Conversation' ? 3 : participationType === 'Written Form' ? 7 : 5;
setStep(nextStep);
```

The comment **"Proceed anyway so participants aren't blocked"** in the catch block is a deliberate safety decision: if the Supabase insert fails (network error, etc.), the participant is not prevented from continuing. Research participation is not gated on database success.

### TODO / FIXME related to safety
None found in the codebase.

### Iteration evidence
The `reflection_mode` dynamic variable passed to ElevenLabs (true/false based on URL path) suggests the agent was iterated to handle two distinct contexts — initial participation and post-wānanga reflection — within the same agent. This two-mode design is evidence of iteration after the wānanga was added to the research design.

---

## 6. USER-FACING SAFETY COPY

### Privacy notice (full page)

URL: `/privacy` | File: [`src/pages/privacy.astro`](src/pages/privacy.astro)

**Headline:** *"Your data, honestly."*

**Opening paragraph:**
> We're researching data sovereignty while using platforms we don't control. Here's exactly how that works.

**"Why we're being this direct" section:**
> The tools we're using don't align with the data sovereignty principles our research is built on. We chose them because building our own voice AI was beyond our capacity. That contradiction is real — and it's one of the things this research explores.

**User rights listed:**
```
- Stop anytime — close the browser
- Switch between AI and person whenever
- Withdraw from our database up to two weeks after wānanga
- We delete our copy within 3 years (or earlier on request)
- ElevenLabs retains up to 3 years — we can't control that
- You must be 18 or older to participate
- Not participating has zero consequences
```

---

### AI limitations disclaimer (persistent, shown during every AI session)

File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L124-L126)
```
This is an AI tool, not a person. It can make mistakes, miss nuance, or get things wrong.
Its pronunciation of te reo Māori may not be accurate.
```

---

### Consent "About the AI" section (shown only to AI path participants)

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L497-L501)
> This is a conversational AI. It uses Lian's voice, but it is not Lian. It is not a person, a teacher, a therapist, or an authority on anything. It is a tool — and like all tools, it has limitations.
>
> The AI can make mistakes. It may misunderstand what you say, respond in ways that do not quite fit, or miss nuance that a person would catch. It does not hold cultural knowledge the way a person does. It cannot read your body language or your silence. It does not remember you between sessions.
>
> We are not presenting it as something it is not. Part of what this research explores is exactly where AI works and where it falls short — and your experience of those edges is some of the most valuable data we will collect.

---

### Biometric data warning (AI path only)

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L527-L531)
> Under New Zealand's Biometric Processing Privacy Code 2025, your voice is classified as biometric information — some of the most sensitive personal data there is. We take this seriously.
>
> We use voice because this research specifically investigates how people experience conversational AI in vulnerable contexts. Text alone would not generate the same insights — the nuance, hesitation, emotion, and instinct that voice carries is central to what we are studying. We have assessed that this research purpose justifies the collection of voice data, and that no lower-privacy-risk alternative would achieve the same result.
>
> By consenting to participate, you are authorising the cross-border transfer of your personal information (including voice data) to ElevenLabs in the United States for processing, as described above. This authorisation is made in accordance with Information Privacy Principle 12 of New Zealand's Privacy Act 2020.

---

### "If something comes up" — crisis copy (appears 3 times in codebase)

Wording is consistent across all three occurrences (CrisisModal, participation consent, wānanga consent):

> These conversations can touch on personal experiences of vulnerability, shame, or cultural harm. If anything feels uncomfortable, you are welcome to stop at any time. You do not need to explain why.

Followed by:
```
Mental Health Support
  1737 — free call or text, anytime (24/7)
  Lifeline — 0800 543 354

Domestic Violence
  Women's Refuge — 0800 733 843

Emergency
  111

Lian and Lee are also available if you want to debrief:
  lianpassmore@gmail.com  |  leepalamo275@gmail.com
```

---

### In-app browser error message

File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L78-L83)
> Please open this link in Safari or Chrome
>
> The in-app browser (e.g. Messenger, Instagram) does not support microphone access. Tap the button below to copy the link, then paste it in Safari or Chrome.

---

### Microphone access denied error

File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L38)
```
Microphone access denied. Please allow microphone access in your browser settings,
or try opening this page in Safari or Chrome.
```

---

### ElevenLabs connection error

File: [`src/components/AgentConversation.jsx`](src/components/AgentConversation.jsx#L26)
```
Unable to connect to the agent. Please try refreshing the page.
```

---

### Agent unavailable fallback

File: [`src/components/ParticipationFlow.jsx`](src/components/ParticipationFlow.jsx#L753-L760)
> Aroha mai — our voice agent is temporarily unavailable
>
> We've had so much amazing kōrero that our voice agent has run out of credits for now. That's actually a beautiful problem to have — it means your community showed up.
>
> Please complete your reflections using the written form below instead. Your voice still matters, even in writing.

---

### Footer (every page)

File: [`src/layouts/Layout.astro`]
```
Lian Passmore · Lee Palamo
Supervisors: Felix Scholz (Lian) · Paula Gair (Lee)
Ethics approvals: MTF.8888.275 · MTF.8888.274
AcademyEX Research, Enterprise & Ethics (REE)
NZ Privacy Act 2020 + Biometric Processing Privacy Code 2025
privacy.org.nz
```

---

## Appendix: Files Audited

| File | Lines | Safety content |
|------|-------|----------------|
| [src/components/AgentConversation.jsx](src/components/AgentConversation.jsx) | 166 | In-app browser detection, mic permissions, AI disclaimer, mute/end controls, error messages |
| [src/components/CrisisModal.jsx](src/components/CrisisModal.jsx) | 70 | Crisis support button and modal, NZ support lines, researcher debrief |
| [src/components/ConsentForm.jsx](src/components/ConsentForm.jsx) | 372 | Wānanga consent flow, expandable sections, 6-item checklist, "If something comes up" |
| [src/components/ParticipationFlow.jsx](src/components/ParticipationFlow.jsx) | 1103 | Path selection, registration, AI/form consent, preparation screen, AI session, post-conversation, fallback |
| [src/components/ReflectionForm.jsx](src/components/ReflectionForm.jsx) | 155 | Post-wānanga reflection, optional anonymity, researcher debrief in success state |
| [src/components/ReflectionGate.jsx](src/components/ReflectionGate.jsx) | 117 | Email-based identity matching, fallback if not found |
| [src/lib/supabase.js](src/lib/supabase.js) | 9 | Client initialisation, null fallback if unconfigured |
| [src/layouts/Layout.astro](src/layouts/Layout.astro) | 108 | Header nav including Privacy & Data Rights, footer with ethics approvals |
| [src/pages/index.astro](src/pages/index.astro) | 210 | Path selection, wānanga timeline, withdrawal window information |
| [src/pages/about.astro](src/pages/about.astro) | 360 | Research framework, core values (Vā, Utu Tūturu, Mana Motuhake), limitations acknowledgement |
| [src/pages/privacy.astro](src/pages/privacy.astro) | 103 | Full data handling disclosure, rights, data location table, sovereignty gap acknowledgement |
| [src/pages/consent.astro](src/pages/consent.astro) | 22 | Wānanga consent wrapper |
| [src/pages/participate.astro](src/pages/participate.astro) | 22 | Participation flow wrapper |
| [src/pages/reflections.astro](src/pages/reflections.astro) | 28 | Post-wānanga reflection entry point |
| [src/pages/human.astro](src/pages/human.astro) | 56 | Human booking path, Google Calendar embed |
| [src/pages/recap.astro](src/pages/recap.astro) | 346 | Wānanga recap, central paradox documentation |
| [package.json](package.json) | 25 | Dependencies (ElevenLabs, Supabase versions) |
| [astro.config.mjs](astro.config.mjs) | 11 | Site domain, integrations |

**Total source lines reviewed:** ~4,200

---

*End of safety extraction. Every finding traces to a specific file and line number above.*
