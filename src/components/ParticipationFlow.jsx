import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PATH_MAP = {
  ai: { type: 'AI Conversation', step: 1 },
  form: { type: 'Written Form', step: 1 },
  contact: { type: 'Contact Me', step: 6 },
};

export default function ParticipationFlow() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participationType, setParticipationType] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get('path');
    if (path && PATH_MAP[path]) {
      setParticipationType(PATH_MAP[path].type);
      setStep(PATH_MAP[path].step);
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age_range: '',
    location: '',
    role_context: '',
    cultural_identities: '',
  });

  // Consent State
  const [consents, setConsents] = useState({
    understand_process: false,
    understand_recording: false,
    voluntary: false,
    understand_ai: false,
    research_use: false,
    age_confirm: false,
    ready: false,
  });

  // Post-conversation State
  const [postData, setPostData] = useState({
    use_again: '',
    recommend: '',
    anything_else: '',
  });

  // Written Form State
  const [formAnswers, setFormAnswers] = useState({});
  const [formFeeling, setFormFeeling] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const writtenQuestions = [
    "Think about a time you wanted to share something personal or important in a digital space (online, an app, a form). What was that experience like? What made it feel safe or unsafe?",
    "Imagine someone talking to an AI about something deeply personal — their relationship, something tied to their identity, or something painful. What's your gut reaction to that idea? Where would you draw the line?",
    "Some knowledge and experiences feel sacred or protected — things that shouldn't just become \"data.\" In te ao Māori this is described as tapu (sacred/protected) vs noa (ordinary/freely shared). How do you think about what should stay protected vs what can be shared with or through technology?",
    "If researchers are building AI for vulnerable conversations (relationship support, language learning, cultural spaces), what must they absolutely get right? What should they never forget?",
  ];

  // Contact Me State
  const [contactData, setContactData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contact_preference: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const choosePath = (type) => {
    if (type === 'Talk to a Person') {
      window.location.href = '/human';
      return;
    }
    if (type === 'Contact Me') {
      setParticipationType(type);
      setStep(6);
      window.scrollTo(0, 0);
      return;
    }
    setParticipationType(type);
    setStep(1);
    window.scrollTo(0, 0);
  };

  const submitContact = async (e) => {
    e.preventDefault();
    if (!contactData.first_name || !contactData.last_name || !contactData.email || !contactData.contact_preference) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (supabase) {
        const { error: dbError } = await supabase
          .from('participants')
          .insert([{
            first_name: contactData.first_name,
            last_name: contactData.last_name,
            email: contactData.email,
            participation_type: 'Contact Me',
          }]);
        if (dbError) console.error('Supabase error:', dbError);
      }
      setContactSubmitted(true);
    } catch (err) {
      console.error(err);
      setContactSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const submitFormAnswers = async () => {
    const answered = Object.values(formAnswers).filter(a => a && a.trim()).length;
    if (answered === 0) {
      setError("Please answer at least one question.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (supabase) {
        const { error: dbError } = await supabase
          .from('form_responses')
          .insert([{
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            feeling: formFeeling,
            ...Object.fromEntries(
              writtenQuestions.map((q, i) => [`q${i + 1}`, formAnswers[i] || ''])
            ),
          }]);
        if (dbError) console.error('Supabase error:', dbError);
      }
      setFormSubmitted(true);
    } catch (err) {
      console.error(err);
      setFormSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConsent = (e) => {
    setConsents({ ...consents, [e.target.name]: e.target.checked });
  };

  // Step 1 -> 2: Validation
  const submitRegistration = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError("Please fill in the required fields (Name & Email).");
      return;
    }
    setError(null);
    setStep(2);
    window.scrollTo(0, 0);
  };

  // Step 2 -> 3 (or 4 for non-AI paths): Save to Supabase

  const submitConsent = async () => {
    const allChecked = Object.values(consents).every(val => val === true);
    if (!allChecked) {
      setError("Please confirm all consent checkboxes to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (supabase) {
        const { error: dbError } = await supabase
          .from('participants')
          .insert([{
            ...formData,
            consent_agreed: true,
            consent_timestamp: new Date().toISOString(),
            participation_type: participationType
          }])
          .select();

        if (dbError) {
          console.error('Supabase error:', dbError);
        }
      } else {
        console.warn('Supabase not configured — skipping save');
      }

      // AI path goes to prepare screen; other paths skip to post-conversation
      const nextStep = participationType === 'AI Conversation' ? 3 : participationType === 'Written Form' ? 7 : 5;
      setStep(nextStep);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Registration save error:', err);
      // Proceed anyway so participants aren't blocked
      const nextStep = participationType === 'AI Conversation' ? 3 : participationType === 'Written Form' ? 7 : 5;
      setStep(nextStep);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Save post-conversation feedback
  const submitPostConversation = async () => {
    if (!postData.use_again || !postData.recommend) return;

    try {
      await supabase
        .from('participants')
        .update({
          use_again: postData.use_again,
          recommend: postData.recommend,
          anything_else: postData.anything_else,
        })
        .eq('email', formData.email);
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass = "w-full bg-transparent border-b border-whenua/20 py-3 text-lg text-whenua focus:border-ako focus:outline-none transition-colors placeholder-whenua/20";
  const selectClass = "w-full bg-rauhuia border-b border-whenua/20 py-3 text-lg text-whenua focus:border-ako focus:outline-none transition-colors";
  const labelClass = "block text-xs uppercase tracking-widest text-marama mb-2";

  return (
    <div className="max-w-3xl mx-auto bg-white/60 p-6 md:p-10 rounded-lg shadow-sm border border-kakahu/20">

      {/* Progress Indicator - only show for registration/consent flows */}
      {step >= 1 && step <= 5 && (
        <div className="flex justify-between mb-8 text-xs font-bold tracking-widest uppercase text-marama">
          <span className={step >= 1 ? "text-ako" : ""}>1. Details</span>
          <span className={step >= 2 ? "text-ako" : ""}>2. Consent</span>
          {participationType === 'AI Conversation' && (
            <>
              <span className={step >= 3 ? "text-ako" : ""}>3. Prepare</span>
              <span className={step >= 4 ? "text-ako" : ""}>4. Kōrero</span>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-crisis p-4 mb-6 rounded border border-crisis/20">
          {error}
        </div>
      )}

      {/* STEP 0: CHOOSE YOUR PATH */}
      {step === 0 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-3xl font-bold text-whenua">How would you like to take part?</h2>
          <p className="text-whenua/80">
            Pick whatever feels right. You can switch anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => choosePath('AI Conversation')}
              className="text-left bg-white/60 border border-kakahu/20 p-5 md:p-6 rounded-lg hover:border-ako/40 transition-colors group"
            >
              <p className="font-bold text-ako mb-1.5">Talk to the AI</p>
              <p className="text-whenua/70 text-sm">10–15 min voice conversation using Lian's voice.</p>
            </button>

            <button
              onClick={() => choosePath('Written Form')}
              className="text-left bg-white/60 border border-kakahu/20 p-5 md:p-6 rounded-lg hover:border-ako/40 transition-colors group"
            >
              <p className="font-bold text-ako mb-1.5">Fill in a form</p>
              <p className="text-whenua/70 text-sm">Share your thoughts in writing, in your own time.</p>
            </button>

            <button
              onClick={() => choosePath('Talk to a Person')}
              className="text-left bg-white/60 border border-kakahu/20 p-5 md:p-6 rounded-lg hover:border-ako/40 transition-colors group"
            >
              <p className="font-bold text-ako mb-1.5">Talk to a person</p>
              <p className="text-whenua/70 text-sm">30 min kōrero with Lian or Lee. Also available for under 18s.</p>
            </button>

            <button
              onClick={() => choosePath('Contact Me')}
              className="text-left bg-white/60 border border-kakahu/20 p-5 md:p-6 rounded-lg hover:border-ako/40 transition-colors group"
            >
              <p className="font-bold text-ako mb-1.5">Not sure yet</p>
              <p className="text-whenua/70 text-sm">Leave your details and we'll reach out.</p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: REGISTRATION */}
      {step === 1 && (
        <form onSubmit={submitRegistration} className="space-y-6 animate-fade-in">
          <button type="button" onClick={() => { setStep(0); window.scrollTo(0, 0); }} className="text-sm text-whenua/60 hover:text-ako transition-colors">
            ← Back to path selection
          </button>
          <h2 className="text-3xl font-bold text-whenua">Your Details</h2>
          <p className="text-whenua/80">
            Kia ora — before we begin, we need a few details. This takes about 60 seconds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>First Name *</label>
              <input type="text" name="first_name" required placeholder="Enter your first name" className={inputClass} onChange={handleInput} value={formData.first_name} />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input type="text" name="last_name" required placeholder="Enter your last name" className={inputClass} onChange={handleInput} value={formData.last_name} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address *</label>
            <input type="email" name="email" required placeholder="you@example.com" className={inputClass} onChange={handleInput} value={formData.email} />
            <p className="text-xs text-marama mt-1">This is how we will send your wānanga invitation.</p>
          </div>

          <div>
            <label className={labelClass}>Which best describes you?</label>
            <select name="role_context" className={selectClass} onChange={handleInput} value={formData.role_context}>
              <option value="">Select...</option>
              <option value="Te reo Māori learner">Te reo Māori learner</option>
              <option value="Te reo Māori speaker or practitioner">Te reo Māori speaker or practitioner</option>
              <option value="Educator or kaiako">Educator or kaiako</option>
              <option value="Kaupapa Māori practitioner">Kaupapa Māori practitioner</option>
              <option value="Technology or AI professional">Technology or AI professional</option>
              <option value="Researcher or academic">Researcher or academic</option>
              <option value="Community member">Community member</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Which cultural identities do you connect with?</label>
            <input type="text" name="cultural_identities" placeholder="e.g. Māori, Samoan, Pākehā..." className={inputClass} onChange={handleInput} value={formData.cultural_identities} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Age Range</label>
              <select name="age_range" className={selectClass} onChange={handleInput} value={formData.age_range}>
                <option value="">Select...</option>
                <option value="18-24">18–24</option>
                <option value="25-34">25–34</option>
                <option value="35-44">35–44</option>
                <option value="45-54">45–54</option>
                <option value="55-64">55–64</option>
                <option value="65+">65+</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Where in Aotearoa are you based?</label>
              <input type="text" name="location" placeholder="e.g. Hamilton, Tai Tokerau" className={inputClass} onChange={handleInput} value={formData.location} />
            </div>
          </div>

          <p className="text-sm text-whenua/50">
            These details help us understand who is in the room. They are optional — share what feels comfortable. Nothing here affects your ability to participate.
          </p>

          <button type="submit" className="w-full bg-ako text-white font-bold py-4 rounded hover:bg-teal-700 transition-colors shadow-md">
            Next Step: Consent
          </button>
        </form>
      )}

      {/* STEP 2: CONSENT */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-3xl font-bold text-whenua">Consent</h2>
          <p className="text-whenua/80">
            Before we start the kōrero, please read through the following and confirm you are comfortable to proceed. Consent is ongoing — you can change your mind at any time.
          </p>

          {/* Expandable consent sections */}
          <div className="space-y-0 border border-kakahu/30 rounded-lg overflow-hidden bg-white">

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">What this involves</span>
                  <span className="text-sm text-whenua/60">10–15 min voice conversation with an AI using Lian's voice, then an online wānanga.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>You will have a 10 to 15 minute voice conversation with a conversational AI agent. It uses Lian's voice and will ask you about safety, vulnerability, and cultural considerations around conversational AI. After the conversation, you will be invited to an online wānanga on Thursday 26 February, 6.30pm to 8pm NZDT, where we explore these themes as a group.</p>
                <p>If at any point during the AI conversation you would prefer to talk to a person instead, you can stop and book a kōrero with Lian or Lee. The same applies in reverse.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
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
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
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
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">How we use your kōrero</span>
                  <span className="text-sm text-whenua/60">Downloaded from ElevenLabs for analysis. Used for both master's projects.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>Your conversation transcript is stored in ElevenLabs. We download it from there for analysis as part of both Lian's and Lee's master's research projects at AcademyEX. Your registration details are stored separately in Supabase (Sydney, Australia) with row-level security.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
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
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">Who sees your responses</span>
                  <span className="text-sm text-whenua/60">Lian, Lee, and supervisors. Cultural advisors see de-identified themes only.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>Lian and Lee (the researchers), and our academic supervisors (Felix Scholz and Paula Gair). Cultural advisors may review de-identified themes. Your name will not appear in any published work unless you specifically request attribution.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">▶</span>
                <div>
                  <span className="font-bold text-whenua block">Your rights</span>
                  <span className="text-sm text-whenua/60">Voluntary. Ongoing consent. Withdraw anytime. 18+ for AI.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Participation is completely voluntary — and consent is ongoing, not a one-time decision</li>
                  <li>You can stop the conversation at any time — just close the browser</li>
                  <li>You can switch from the AI to a person, or from a person to the AI, at any point</li>
                  <li>You can withdraw your data from our research database up to two weeks after the wānanga by emailing us</li>
                  <li>We will delete our copy of your transcript within 3 years of project completion, or earlier at your request</li>
                  <li>ElevenLabs retains voice data for up to 3 years after last interaction — we cannot control their retention</li>
                  <li>You must be 18 or older to use the AI agent</li>
                  <li>If you are under 18 or prefer not to use AI, you can <a href="/human" className="text-ako underline">book a conversation with us directly</a></li>
                  <li>Choosing not to participate has no consequences whatsoever</li>
                </ul>
              </div>
            </details>

            <details className="group">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/60 transition-colors">
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
            {[
              { id: 'understand_process', text: 'I understand what this research involves and how my data will be processed, including by ElevenLabs under their Terms of Service' },
              { id: 'understand_recording', text: 'I understand my conversation will be recorded, transcribed, and stored for research purposes' },
              { id: 'voluntary', text: 'I understand my participation is voluntary, consent is ongoing, and I can withdraw at any time' },
              { id: 'understand_ai', text: 'I understand the AI is a tool with limitations — it is not a person, teacher, or authority' },
              { id: 'research_use', text: "I consent to my insights being used in Lian Passmore's and Lee Palamo's master's research at AcademyEX" },
              { id: 'age_confirm', text: 'I confirm I am 18 years or older' },
              { id: 'ready', text: 'I am ready to begin' },
            ].map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={item.id}
                  onChange={handleConsent}
                  className="mt-1 w-5 h-5 text-ako rounded border-gray-300 focus:ring-ako"
                />
                <span className="text-sm text-whenua">{item.text}</span>
              </label>
            ))}
          </div>

          <p className="text-xs text-whenua/50">
            By proceeding, you are giving informed consent as described above. You can revisit or change your mind about any part of this at any time. If you have any questions before starting, email{' '}
            <a href="mailto:lianpassmore@gmail.com" className="text-ako underline">lianpassmore@gmail.com</a> or{' '}
            <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a>, or{' '}
            <a href="https://calendar.app.google/9tWGVwUnDeSaXL3z6" target="_blank" rel="noopener" className="text-ako underline">book a kōrero with us</a>.
          </p>

          <button
            onClick={submitConsent}
            disabled={loading}
            className="w-full bg-ako text-white font-bold py-4 rounded hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "I Agree — Continue"}
          </button>
        </div>
      )}

      {/* STEP 3: PRE-CONVERSATION (PAUSE) */}
      {step === 3 && (
        <div className="space-y-8 py-6 animate-fade-in">
          <h2 className="text-4xl font-bold text-whenua text-center">Before you begin.</h2>

          <div className="max-w-xl mx-auto text-lg text-whenua/80 leading-relaxed space-y-6">
            <div>
              <h3 className="font-bold text-whenua text-xl mb-3">Honouring the space</h3>
              <p>
                This kōrero may touch on things that sit close to the heart — identity, culture, vulnerability, shame. For some people, this kind of conversation naturally sits in a space that deserves care.
              </p>
              <p className="mt-4">
                If it feels right for you, you are welcome to take a moment before you start — whether that is a karakia, a quiet breath, or simply checking in with yourself. There is no right or wrong way to enter this space. How you begin and end is entirely yours.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-whenua text-xl mb-3">What you are walking into</h3>
              <p>
                In a moment, you will hear Lian's voice. But it is not Lian — it is a conversational AI using her voice. It will introduce itself and guide the conversation. You do not need to prepare anything.
              </p>
              <p className="mt-4">
                The AI is a tool. It can make mistakes, miss nuance, or respond in ways that feel off. That is okay — noticing those moments is part of what makes your experience valuable to this research.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-whenua text-xl mb-3">What to notice</h3>
              <p>
                As you talk, pay attention to how it feels. Notice where trust forms or breaks down. Notice where the AI feels helpful — and where it feels unsafe or insufficient. You do not need to analyse this in the moment. Just let yourself notice.
              </p>
              <p className="mt-4">
                This works best in a quiet space with headphones. The conversation runs about 10 to 15 minutes. You can say as much or as little as you like. There are no wrong answers — we are exploring, not testing.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-whenua text-xl mb-3">If you want to stop</h3>
              <p>
                If you want to stop at any time, just close the page. If you decide you would rather talk to a person instead, you can reach Lian or Lee at{' '}
                <a href="mailto:lianpassmore@gmail.com" className="text-ako underline">lianpassmore@gmail.com</a> or{' '}
                <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a>, or{' '}
                <a href="https://calendar.app.google/9tWGVwUnDeSaXL3z6" target="_blank" rel="noopener" className="text-ako underline">book a time</a>.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => { setStep(4); window.scrollTo(0, 0); }}
              className="mt-4 bg-ako text-white font-bold px-10 py-4 rounded-full hover:bg-teal-700 transition-all shadow-lg transform hover:scale-105"
            >
              Start the kōrero
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ELEVENLABS CONVERSATION */}
      {step === 4 && (
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-whenua mb-4">Kōrero with Ray</h2>

          <p className="text-sm text-marama mb-8">
            Click the microphone to start. Speak naturally. When you are finished, click "End Conversation".
          </p>

          <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-lg border border-kakahu/30 p-8 shadow-inner">
            <elevenlabs-convai
              agent-id="YOUR_AGENT_ID_HERE"
              className="w-full max-w-sm"
            ></elevenlabs-convai>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => { setStep(5); window.scrollTo(0, 0); }}
              className="text-whenua underline hover:text-ako text-sm"
            >
              I have finished the conversation →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: POST-CONVERSATION */}
      {step === 5 && (
        <div className="space-y-8 py-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-ako mb-4">Ngā mihi — thank you.</h2>
            <p className="text-xl text-whenua/80 max-w-xl mx-auto">
              Your kōrero matters. What you have just shared will help shape how we think about designing conversational AI for vulnerable spaces.
            </p>
          </div>

          {/* Quick Feedback Questions */}
          <div className="bg-white p-6 rounded-lg border border-kakahu/20 space-y-6">
            <h3 className="font-bold text-whenua text-lg">Before you go — two quick questions</h3>

            <div>
              <label className="block font-bold text-whenua mb-2">Would you use something like this again?</label>
              <div className="flex gap-4">
                {['Yes', 'No', 'Maybe'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="use_again"
                      value={opt}
                      onChange={(e) => setPostData({ ...postData, use_again: e.target.value })}
                      className="w-4 h-4 text-ako focus:ring-ako"
                    />
                    <span className="text-whenua">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-whenua mb-2">Would you recommend this experience to someone you care about?</label>
              <div className="flex gap-4">
                {['Yes', 'No', 'Maybe'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      value={opt}
                      onChange={(e) => setPostData({ ...postData, recommend: e.target.value })}
                      className="w-4 h-4 text-ako focus:ring-ako"
                    />
                    <span className="text-whenua">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-whenua mb-2">Is there anything else sitting with you right now? <span className="font-normal text-whenua/50">(Optional)</span></label>
              <textarea
                name="anything_else"
                rows="3"
                className="w-full p-3 border border-kakahu rounded"
                onChange={(e) => setPostData({ ...postData, anything_else: e.target.value })}
              ></textarea>
            </div>

            <button
              onClick={submitPostConversation}
              className="bg-ako text-white font-bold py-3 px-6 rounded hover:bg-teal-700 transition-colors"
            >
              Submit
            </button>
          </div>

          {/* What happens next */}
          <div className="bg-white p-6 rounded-lg border-l-4 border-ako text-left">
            <h3 className="font-bold text-whenua mb-3">What happens next</h3>
            <p className="text-whenua/80 mb-4">
              Check your email — we have sent you an invitation to the online wānanga on <strong>Thursday 26 February, 6.30pm to 8pm NZDT</strong>. That is where we take everything that has been shared in these individual conversations and explore it together as a group. The wānanga is a culturally grounded space to sit with what came up and make sense of it alongside others.
            </p>
            <p className="text-whenua/80">
              You will also receive a reminder the day before, and an hour before we start.
            </p>
          </div>

          {/* Want to switch paths */}
          <div className="bg-white/60 p-6 rounded-lg border border-kakahu/20">
            <h3 className="font-bold text-whenua mb-2">Want to switch paths?</h3>
            <p className="text-whenua/80 mb-3">
              If that conversation made you want to talk to a person, you can book a kōrero with Lian or Lee anytime.
            </p>
            <a href="https://calendar.app.google/9tWGVwUnDeSaXL3z6" target="_blank" rel="noopener" className="text-ako font-bold hover:underline">
              Book a kōrero →
            </a>
          </div>

          {/* Can't make the wānanga */}
          <div className="text-whenua/60 text-sm space-y-4">
            <p>
              <strong className="text-whenua">Can't make the wānanga?</strong> That is okay. Your conversation still contributes to the research and we value it. We will send you a summary of what we learned after the wānanga.
            </p>
            <p>
              <strong className="text-whenua">Want to talk to us?</strong> If anything came up during the conversation that you would like to discuss — or if you just want to say hi before the wānanga — reach out anytime:{' '}
              <a href="mailto:lianpassmore@gmail.com" className="text-ako underline">lianpassmore@gmail.com</a> or{' '}
              <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a>
            </p>
          </div>

          <div className="text-center pt-4">
            <a href="/" className="text-ako font-bold hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      )}

      {/* STEP 6: CONTACT ME */}
      {step === 6 && (
        <div className="space-y-6 animate-fade-in">
          {!contactSubmitted ? (
            <form onSubmit={submitContact} className="space-y-6">
              <h2 className="text-3xl font-bold text-whenua">We'll reach out to you</h2>
              <p className="text-whenua/80">
                Leave your details and we'll get in touch to find the right way for you to take part.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input type="text" required placeholder="Enter your first name" className={inputClass}
                    value={contactData.first_name}
                    onChange={(e) => setContactData({ ...contactData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input type="text" required placeholder="Enter your last name" className={inputClass}
                    value={contactData.last_name}
                    onChange={(e) => setContactData({ ...contactData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address *</label>
                <input type="email" required placeholder="you@example.com" className={inputClass}
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" placeholder="e.g. 021 123 4567" className={inputClass}
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>How would you like us to contact you? *</label>
                <div className="flex gap-6 pt-2">
                  {['Email', 'Call', 'Text'].map(method => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contact_preference"
                        value={method}
                        required
                        onChange={(e) => setContactData({ ...contactData, contact_preference: e.target.value })}
                        className="w-4 h-4 text-ako focus:ring-ako"
                      />
                      <span className="text-whenua">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ako text-white font-bold py-4 rounded hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send my details"}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-8">
              <h2 className="text-3xl font-bold text-ako">Ngā mihi — we'll be in touch.</h2>
              <p className="text-lg text-whenua/80 max-w-xl mx-auto">
                We've got your details and will reach out by {contactData.contact_preference.toLowerCase()} soon.
              </p>
              <div className="pt-4">
                <a href="/" className="text-ako font-bold hover:underline">
                  Return to Home
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 7: WRITTEN FORM */}
      {step === 7 && (
        <div className="space-y-6 animate-fade-in">
          {!formSubmitted ? (
            <>
              <h2 className="text-3xl font-bold text-whenua">Your kōrero, in writing</h2>
              <p className="text-whenua/80">
                Answer as many or as few as you like. There are no right or wrong answers — we are interested in your honest experience and instincts. 3–5 sentences per question is ideal, but write as much or as little as feels right.
              </p>

              {/* Ice-breaker */}
              <div className="bg-white p-5 rounded-lg border border-kakahu/20">
                <label className="block font-bold text-whenua mb-3">How are you feeling about this experience?</label>
                <div className="flex flex-wrap gap-3">
                  {['Comfortable', 'A bit nervous', 'Curious', 'Sceptical', 'Other'].map(option => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="feeling"
                        value={option}
                        checked={formFeeling === option}
                        onChange={(e) => setFormFeeling(e.target.value)}
                        className="w-4 h-4 text-ako focus:ring-ako"
                      />
                      <span className="text-whenua text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Core Questions */}
              <div className="space-y-8">
                {writtenQuestions.map((question, i) => (
                  <div key={i}>
                    <label className="block font-bold text-whenua mb-2">{i + 1}. {question}</label>
                    <textarea
                      rows="4"
                      className="w-full p-3 border border-kakahu/20 rounded-lg bg-white text-whenua focus:border-ako focus:outline-none transition-colors"
                      placeholder="Write your thoughts here..."
                      value={formAnswers[i] || ''}
                      onChange={(e) => setFormAnswers({ ...formAnswers, [i]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={submitFormAnswers}
                disabled={loading}
                className="w-full bg-ako text-white font-bold py-4 rounded hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit my answers"}
              </button>
            </>
          ) : (
            <div className="space-y-8 py-6">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-ako mb-4">Ngā mihi — thank you.</h2>
                <p className="text-xl text-whenua/80 max-w-xl mx-auto">
                  Your written kōrero matters. What you have shared will help shape how we think about designing conversational AI for vulnerable spaces.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-ako text-left">
                <h3 className="font-bold text-whenua mb-3">What happens next</h3>
                <p className="text-whenua/80 mb-4">
                  You are invited to the online wānanga on <strong>Thursday 26 February, 6.30pm to 8pm NZDT</strong>, where we explore these themes as a group.
                </p>
              </div>

              <div className="bg-white/60 p-6 rounded-lg border border-kakahu/20">
                <h3 className="font-bold text-whenua mb-2">Want to try another path?</h3>
                <p className="text-whenua/80 mb-3">
                  You can also talk to the AI or book a kōrero with Lian or Lee.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => { setFormSubmitted(false); setStep(0); window.scrollTo(0, 0); }} className="text-ako font-bold hover:underline">
                    Choose another path
                  </button>
                </div>
              </div>

              <div className="text-center pt-4">
                <a href="/" className="text-ako font-bold hover:underline">
                  Return to Home
                </a>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
