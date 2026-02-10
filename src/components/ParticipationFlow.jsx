import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ParticipationFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Step 2 -> 3: Save to Supabase
  const submitConsent = async () => {
    const allChecked = Object.values(consents).every(val => val === true);
    if (!allChecked) {
      setError("Please confirm all consent checkboxes to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('participants')
        .insert([{
          ...formData,
          consent_agreed: true,
          consent_timestamp: new Date().toISOString(),
          participation_type: 'AI Conversation'
        }])
        .select();

      if (dbError) throw dbError;

      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError("Unable to save registration. Please try again.");
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

      {/* Progress Indicator */}
      <div className="flex justify-between mb-8 text-xs font-bold tracking-widest uppercase text-marama">
        <span className={step >= 1 ? "text-ako" : ""}>1. Details</span>
        <span className={step >= 2 ? "text-ako" : ""}>2. Consent</span>
        <span className={step >= 3 ? "text-ako" : ""}>3. Prepare</span>
        <span className={step >= 4 ? "text-ako" : ""}>4. Kōrero</span>
      </div>

      {error && (
        <div className="bg-red-50 text-crisis p-4 mb-6 rounded border border-crisis/20">
          {error}
        </div>
      )}

      {/* STEP 1: REGISTRATION */}
      {step === 1 && (
        <form onSubmit={submitRegistration} className="space-y-6 animate-fade-in">
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
            Before we start the kōrero, please read through the following and confirm you are comfortable to proceed. Consent is not a one-time gate — it is ongoing. You can change your mind about any part of your participation at any time, no questions asked.
          </p>

          {/* Scrollable consent content */}
          <div className="prose prose-sm text-whenua/90 bg-white p-6 rounded border border-kakahu/30 max-h-[500px] overflow-y-auto space-y-6">

            <div>
              <h3 className="font-bold text-lg text-whenua">WHAT THIS INVOLVES</h3>
              <p>You will have a 10 to 15 minute voice conversation with a conversational AI agent. It uses Lian's voice and will ask you about safety, vulnerability, and cultural considerations around conversational AI. After the conversation, you will be invited to an online wānanga on Thursday 26 February, 6.30pm to 8pm NZDT, where we explore these themes as a group.</p>
              <p>If at any point during the AI conversation you would prefer to talk to a person instead, you can stop and book a kōrero with Lian or Lee. The same applies in reverse — if you start with a person and want to try the AI, you can.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">ABOUT THE AI</h3>
              <p>Before you begin, we want to be upfront about what you are talking to.</p>
              <p>This is a conversational AI. It uses Lian's voice, but it is not Lian. It is not a person, a teacher, a therapist, or an authority on anything. It is a tool — and like all tools, it has limitations.</p>
              <p>The AI can make mistakes. It may misunderstand what you say, respond in ways that do not quite fit, or miss nuance that a person would catch. It does not hold cultural knowledge the way a person does. It cannot read your body language or your silence. It does not remember you between sessions.</p>
              <p>We are not presenting it as something it is not. Part of what this research explores is exactly where AI works and where it falls short — and your experience of those edges is some of the most valuable data we will collect.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">HOW YOUR KŌRERO IS PROCESSED</h3>
              <p>When you speak to the AI agent, your voice and words are processed by ElevenLabs, a US-based voice AI company. Your conversation is sent to their servers in the United States to generate the AI response and create a transcript. All data is transferred to and stored in the United States, regardless of your location.</p>
              <p>We have opted out of ElevenLabs using your data for AI model training. However, by using the agent, your conversation is subject to ElevenLabs' Terms of Service, which grants them a broad, perpetual license to use conversation data to provide and improve their services. We cannot revoke this license after the fact. You can read their full terms at <a href="https://elevenlabs.io/terms-of-use" target="_blank" rel="noopener" className="text-ako underline">elevenlabs.io/terms-of-use</a>.</p>
              <p>ElevenLabs also reserves the right to moderate conversations for safety purposes, which means their staff or contractors may access your conversation content. The AI does not retain memory between sessions — it will not remember you if you come back.</p>
              <p>Your conversation will not be used to train any AI model. Your words stay as your words — they do not become part of how this or any other AI learns.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">HOW WE USE YOUR KŌRERO</h3>
              <p>We separately store your conversation transcript in our own research database (Supabase, hosted in Sydney, Australia) with row-level security ensuring your data is isolated and protected. Your insights will be analysed as part of both Lian's and Lee's master's research projects at AcademyEX.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">TWO LAYERS OF DATA CONTROL</h3>
              <p>There are two separate systems handling your data, each with different controls.</p>
              <p><strong>Lian and Lee</strong> control how your conversation content is used for research purposes — what gets analysed, how it is stored in Supabase, and how findings are shared. You can ask us to delete your research data at any time.</p>
              <p><strong>ElevenLabs</strong> controls the technical processing and storage of your voice recordings on their platform. Their retention and usage policies are governed by their own Terms of Service.</p>
              <p>Our research protocols are separate from ElevenLabs' platform policies. You have rights under both.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">WHO WILL SEE YOUR RESPONSES</h3>
              <p>Lian and Lee (the researchers), and our academic supervisors (Felix Scholz and Paula Gair). Cultural advisors may review de-identified themes. Your name will not appear in any published work unless you specifically request attribution.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">WHY WE ARE BEING THIS DIRECT</h3>
              <p>We are two master's students with participants spread across Aotearoa. Our first choice would always be kanohi ki te kanohi — face to face. But geography and funding mean that is not possible right now, so we are using the best tools available to us and being completely transparent about what those tools can and cannot do.</p>
              <p>We are researching data sovereignty while using a platform we do not control, hosted in a country with different privacy laws than Aotearoa. The terms of that platform do not align with the Indigenous data sovereignty principles our research is built on. We chose it because building our own voice AI was beyond our capacity, and we believe this research needs to happen now rather than waiting for perfect infrastructure.</p>
              <p>You deserve to know exactly what you are agreeing to. This contradiction is real, and it is one of the things we are exploring in this research. What we lack in resources, we are making up for in honesty.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">YOUR RIGHTS</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Participation is completely voluntary — and consent is ongoing, not a one-time decision</li>
                <li>You can stop the conversation at any time — just close the browser</li>
                <li>You can switch from the AI to a person, or from a person to the AI, at any point</li>
                <li>You can withdraw your data from our research database up to two weeks after the wānanga by emailing us</li>
                <li>We will delete our copy of your transcript within 3 years of project completion, or earlier at your request</li>
                <li>ElevenLabs retains voice data for up to 3 years after last interaction — we cannot control their retention or use of data already processed through their platform</li>
                <li>You can participate in the AI conversation without attending the wānanga, or vice versa</li>
                <li>You must be 18 or older to use the AI agent</li>
                <li>If you are under 18 or prefer not to use AI, you can <a href="/human" className="text-ako underline">book a conversation with us directly</a> instead</li>
                <li>Choosing not to participate has no consequences whatsoever</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">WHAT IS IN IT FOR YOU</h3>
              <p>You are helping build something that does not exist yet — a culturally grounded framework for how conversational AI should behave in vulnerable spaces. After the wānanga, we will share what we learned with all participants. Your insights directly shape how these tools are designed.</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-whenua">IF SOMETHING COMES UP</h3>
              <p>These conversations can touch on personal experiences of vulnerability, shame, or cultural harm. If anything feels uncomfortable, you are welcome to stop at any time. You do not need to explain why.</p>
              <p>If you would like to talk to someone:</p>
              <div className="space-y-2 mt-2">
                <p><strong>Mental Health Support</strong><br/>1737 — free call or text, anytime (24/7)<br/>Lifeline — 0800 543 354</p>
                <p><strong>Domestic Violence</strong><br/>Women's Refuge — 0800 733 843</p>
                <p><strong>Emergency</strong><br/>111</p>
              </div>
              <p className="mt-2">Lian and Lee are also available if you want to debrief: <a href="mailto:lianpassmore@gmail.com" className="text-ako underline">lianpassmore@gmail.com</a> or <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a></p>
            </div>
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

    </div>
  );
}
