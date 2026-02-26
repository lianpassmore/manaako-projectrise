import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import ReflectionAgent from './ReflectionAgent';
import ReflectionForm from './ReflectionForm';

export default function ReflectionGate() {
  const [step, setStep] = useState('identify'); // identify | choose | consent | talk | write
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [participant, setParticipant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    participantId: null,
    participationType: null,
    aiConsentGiven: false,
    found: false,
  });

  const [consents, setConsents] = useState({
    understand_process: false,
    understand_recording: false,
    voluntary: false,
    understand_ai: false,
    research_use: false,
    age_confirm: false,
    ready: false,
  });

  const consentItems = [
    { id: 'understand_process', text: 'I understand what this research involves and how my data will be processed, including by ElevenLabs under their Terms of Service' },
    { id: 'understand_recording', text: 'I understand my conversation will be recorded, transcribed, and stored for research purposes' },
    { id: 'voluntary', text: 'I understand my participation is voluntary, consent is ongoing, and I can withdraw at any time' },
    { id: 'understand_ai', text: 'I understand the AI is a tool with limitations — it is not a person, teacher, or authority' },
    { id: 'research_use', text: "I consent to my anonymised insights being used in Lian Passmore's and Lee Palamo's master's research at AcademyEX, and in any public resource developed from this research" },
    { id: 'age_confirm', text: 'I confirm I am 18 years or older' },
    { id: 'ready', text: 'I am ready to begin' },
  ];

  // --- Step: Identify ---
  const handleIdentify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.target);
    const firstName = form.get('first_name').trim();
    const lastName = form.get('last_name').trim();
    const email = form.get('email').trim().toLowerCase();

    let participantData = {
      firstName,
      lastName,
      email,
      participantId: null,
      participationType: null,
      aiConsentGiven: false,
      found: false,
    };

    try {
      const { data } = await supabase
        .from('participants')
        .select('id, first_name, last_name, participation_type, reflection_ai_consent')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (data) {
        participantData = {
          ...participantData,
          participantId: data.id,
          participationType: data.participation_type,
          aiConsentGiven: data.participation_type === 'AI Conversation' || data.reflection_ai_consent === true,
          found: true,
        };
      }
    } catch (err) {
      console.error('Lookup error:', err);
    }

    setParticipant(participantData);
    setStep('choose');
    setLoading(false);
  };

  // --- Step: Consent ---
  const handleConsent = (e) => {
    setConsents(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const submitConsent = async () => {
    const allChecked = consentItems.every(item => consents[item.id] === true);
    if (!allChecked) {
      setError("Please confirm all consent checkboxes to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (participant.participantId) {
        await supabase
          .from('participants')
          .update({
            reflection_ai_consent: true,
            reflection_ai_consent_timestamp: new Date().toISOString(),
          })
          .eq('id', participant.participantId);
      } else {
        const { data } = await supabase
          .from('participants')
          .insert([{
            first_name: participant.firstName,
            last_name: participant.lastName,
            email: participant.email,
            participation_type: 'Reflection Only',
            consent_agreed: true,
            consent_timestamp: new Date().toISOString(),
            reflection_ai_consent: true,
            reflection_ai_consent_timestamp: new Date().toISOString(),
          }])
          .select();

        if (data?.[0]?.id) {
          setParticipant(prev => ({ ...prev, participantId: data[0].id }));
        }
      }
    } catch (err) {
      console.error('Consent save error:', err);
    }

    setParticipant(prev => ({ ...prev, aiConsentGiven: true }));
    setStep('talk');
    setLoading(false);
  };

  // --- Renders ---

  if (step === 'identify') {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-sm border border-kakahu/20 animate-fade-in">
        <h2 className="text-2xl font-bold text-whenua mb-2">Kia ora — let us know who you are</h2>
        <p className="text-whenua/70 mb-6 text-sm">
          We need your name and email so we can match your reflections with your earlier participation.
        </p>

        <form onSubmit={handleIdentify} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-crisis p-3 rounded border border-crisis/20 text-sm">{error}</div>
          )}

          <div>
            <label className="block font-bold text-whenua mb-1 text-sm">First name</label>
            <input type="text" name="first_name" required className="w-full p-3 border border-kakahu rounded" placeholder="Your first name" />
          </div>

          <div>
            <label className="block font-bold text-whenua mb-1 text-sm">Last name</label>
            <input type="text" name="last_name" required className="w-full p-3 border border-kakahu rounded" placeholder="Your last name" />
          </div>

          <div>
            <label className="block font-bold text-whenua mb-1 text-sm">Email</label>
            <p className="text-whenua/50 text-xs mb-1">Use the same email you registered with.</p>
            <input type="email" name="email" required className="w-full p-3 border border-kakahu rounded" placeholder="your@email.com" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-whenua text-rauhuia font-bold py-3 rounded hover:bg-papa transition disabled:opacity-50"
          >
            {loading ? "Looking you up..." : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'choose') {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm border border-kakahu/20 text-center">
          <h2 className="text-2xl font-bold text-whenua mb-2">
            Kia ora {participant.firstName}
          </h2>

          {!participant.found && (
            <p className="text-whenua/60 text-sm mb-4 bg-amber-50 p-3 rounded border border-amber-200">
              We couldn't find a registration with that email, but that's okay — you can still participate.
            </p>
          )}

          <p className="text-whenua/70 mb-8 text-sm">
            How would you like to share your reflections?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (participant.aiConsentGiven) {
                  setStep('talk');
                } else {
                  setStep('consent');
                }
              }}
              className="w-full bg-white border-2 border-whenua text-whenua font-bold py-4 rounded-lg hover:bg-whenua hover:text-rauhuia transition"
            >
              Talk to the AI
              <span className="block text-xs font-normal mt-1 opacity-70">~5 minute voice conversation with Lian's Digital Voice</span>
            </button>

            <button
              onClick={() => setStep('write')}
              className="w-full bg-white border-2 border-whenua text-whenua font-bold py-4 rounded-lg hover:bg-whenua hover:text-rauhuia transition"
            >
              Write your reflections
              <span className="block text-xs font-normal mt-1 opacity-70">~5 minute written form</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'consent') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-5 md:p-8 rounded-lg shadow-sm border border-kakahu/20 animate-fade-in">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-whenua">Before you talk to the AI</h2>
          <p className="text-whenua/80 text-sm">
            Because this is your first time using the voice AI in this research, we need to walk you through how it works and get your consent. This only takes a minute. Consent is ongoing — you can change your mind at any time.
          </p>

          {error && (
            <div className="bg-red-50 text-crisis p-3 rounded border border-crisis/20 text-sm">{error}</div>
          )}

          {/* AI Consent Disclosure Sections */}
          <div className="space-y-0 border border-kakahu/30 rounded-lg overflow-hidden bg-white">

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">About the AI</span>
                  <span className="text-sm text-whenua/60">This is a tool, not a person. It makes mistakes. That's part of what we're studying.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>This is a conversational AI. It uses Lian's voice, but it is not Lian. It is not a person, a teacher, a therapist, or an authority on anything. It is a tool — and like all tools, it has limitations.</p>
                <p>The AI can make mistakes. It may misunderstand what you say, respond in ways that do not quite fit, or miss nuance that a person would catch. It does not hold cultural knowledge the way a person does. It cannot read your body language or your silence. It does not remember you between sessions.</p>
                <p>We are not presenting it as something it is not. Part of what this research explores is exactly where AI works and where it falls short — and your experience of those edges is some of the most valuable data we will collect.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">How your voice is processed</span>
                  <span className="text-sm text-whenua/60">Processed by ElevenLabs (US). We've opted out of training. Full terms linked.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>When you speak to the AI agent, your voice and words are processed by ElevenLabs, a US-based voice AI company. Your conversation is sent to their servers in the United States. All data is transferred to and stored in the United States, regardless of your location.</p>
                <p>We have opted out of ElevenLabs using your data for AI model training. However, by using the agent, your conversation is subject to ElevenLabs' <a href="https://elevenlabs.io/terms-of-use" target="_blank" rel="noopener" className="text-ako underline">Terms of Service</a>, which grants them a broad, perpetual license to use conversation data to provide and improve their services. We cannot revoke this license after the fact.</p>
                <p>ElevenLabs also reserves the right to moderate conversations for safety purposes, which means their staff or contractors may access your conversation content.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">Your voice as biometric information</span>
                  <span className="text-sm text-whenua/60">Your voice is classified as biometric information under NZ law. We explain why we collect it and what that means.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>Under New Zealand's Biometric Processing Privacy Code 2025, your voice is classified as biometric information — some of the most sensitive personal data there is. We take this seriously.</p>
                <p>We use voice because this research specifically investigates how people experience conversational AI in vulnerable contexts. Text alone would not generate the same insights — the nuance, hesitation, emotion, and instinct that voice carries is central to what we are studying. We have assessed that this research purpose justifies the collection of voice data, and that no lower-privacy-risk alternative would achieve the same result.</p>
                <p>By consenting to participate, you are authorising the cross-border transfer of your personal information (including voice data) to ElevenLabs in the United States for processing, as described above. This authorisation is made in accordance with Information Privacy Principle 12 of New Zealand's Privacy Act 2020.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">How we use your korero</span>
                  <span className="text-sm text-whenua/60">Anonymised, used in both master's projects, and may inform a public resource.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>Your conversation transcript is stored in ElevenLabs. We download it from there for analysis as part of both Lian's and Lee's master's research projects at AcademyEX. Your registration details are stored separately in Supabase (Sydney, Australia) with row-level security.</p>
                <p>All data used in our research will be anonymised — your name and identifying details will be removed before analysis or publication. Anonymised insights and themes from this research may also be used to develop a public-facing resource (such as a report or guide) to share what we have learned about designing conversational AI for vulnerable and culturally significant spaces.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">Two layers of data control</span>
                  <span className="text-sm text-whenua/60">We control the research use. ElevenLabs controls the tech processing.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p><strong>Lian and Lee</strong> control how your conversation content is used for research purposes — what gets analysed and how findings are shared. Your registration data is in Supabase; transcripts are downloaded from ElevenLabs. You can ask us to delete your registration data at any time.</p>
                <p><strong>ElevenLabs</strong> controls the technical processing and storage of your voice recordings on their platform. Their retention and usage policies are governed by their own Terms of Service.</p>
                <p>Our research protocols are separate from ElevenLabs' platform policies. You have rights under both.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">Your rights</span>
                  <span className="text-sm text-whenua/60">Voluntary. Ongoing consent. Withdraw anytime. 18+ only.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Participation is completely voluntary</li>
                  <li>You can stop the conversation at any time — just close the browser</li>
                  <li>You can withdraw your data from our research database up to two weeks after the wananga by emailing us</li>
                  <li>We will delete our copy of your transcript within 3 years of project completion, or earlier at your request</li>
                  <li>ElevenLabs retains voice data for up to 3 years after last interaction — we cannot control their retention or use of data already processed through their platform</li>
                  <li>You must be 18 or older to participate</li>
                  <li>Choosing not to participate has no consequences whatsoever</li>
                  <li>You can request access to, correction of, or deletion of your personal information at any time by emailing us</li>
                  <li>Your voice is classified as biometric information under New Zealand's Biometric Processing Privacy Code 2025. You have the right to make a complaint to the New Zealand Privacy Commissioner about how your biometric information is handled: <a href="https://privacy.org.nz" target="_blank" rel="noopener" className="text-ako underline">privacy.org.nz</a></li>
                </ul>
              </div>
            </details>

            <details className="group">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">If something comes up</span>
                  <span className="text-sm text-whenua/60">Support resources available. You can stop anytime, no explanation needed.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>These conversations can touch on personal experiences of vulnerability, shame, or cultural harm. If anything feels uncomfortable, you are welcome to stop at any time. You do not need to explain why.</p>
                <p>If you would like to talk to someone:</p>
                <div className="space-y-2">
                  <p><strong>Mental Health Support</strong><br/>1737 — free call or text, anytime (24/7)<br/>Lifeline — 0800 543 354</p>
                  <p><strong>Domestic Violence</strong><br/>Women's Refuge — 0800 733 843</p>
                  <p><strong>Emergency</strong><br/>111</p>
                </div>
                <p>Lian and Lee are also available if you want to debrief: <a href="mailto:lianpassmore@gmail.com" className="text-ako underline">lianpassmore@gmail.com</a> or <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a></p>
              </div>
            </details>

          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-3 pt-4 border-t border-kakahu/30">
            {consentItems.map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={item.id}
                  onChange={handleConsent}
                  className="mt-1 w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] shrink-0 text-ako rounded border-gray-300 focus:ring-ako appearance-none border-2 checked:bg-ako checked:border-ako"
                />
                <span className="text-sm text-whenua">{item.text}</span>
              </label>
            ))}
          </div>

          <p className="text-xs text-whenua/50">
            By proceeding, you are giving informed consent as described above. You can revisit or change your mind about any part of this at any time. If you have any questions, email{' '}
            <a href="mailto:lianpassmore@gmail.com" className="text-ako underline">lianpassmore@gmail.com</a> or{' '}
            <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a>, or{' '}
            <a href="https://calendar.app.google/9tWGVwUnDeSaXL3z6" target="_blank" rel="noopener" className="text-ako underline">book a korero with us</a>.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('choose')}
              className="px-6 py-3 border border-kakahu rounded font-bold text-whenua hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={submitConsent}
              disabled={loading}
              className="flex-1 bg-ako text-white font-bold py-3 rounded hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "I Agree — Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'talk') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-5 md:p-8 rounded-lg shadow-sm border border-kakahu/20 text-center animate-fade-in">
        <h2 className="text-xl md:text-2xl font-bold text-whenua mb-3 md:mb-4">Kōrero with Lian's Digital Voice (Reflection Mode)</h2>
        <p className="text-whenua/80 mb-6 md:mb-8 text-sm md:text-base">This is a shorter conversation (about 5 minutes) to capture your immediate thoughts.</p>
        <ReflectionAgent
          firstName={participant.firstName}
          lastName={participant.lastName}
          participantId={participant.participantId || ''}
        />
      </div>
    );
  }

  if (step === 'write') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-5 md:p-8 rounded-lg shadow-sm border border-kakahu/20 animate-fade-in">
        <ReflectionForm
          email={participant.email}
          firstName={participant.firstName}
        />
      </div>
    );
  }

  return null;
}
