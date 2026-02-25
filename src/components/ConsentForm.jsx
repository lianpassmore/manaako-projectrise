import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ConsentForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age_range: '',
    location: '',
    role_context: '',
    cultural_identities: '',
  });

  const [consents, setConsents] = useState({
    understand_process: false,
    understand_recording: false,
    voluntary: false,
    research_use: false,
    age_confirm: false,
    ready: false,
  });

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConsent = (e) => {
    setConsents({ ...consents, [e.target.name]: e.target.checked });
  };

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
        const participantData = {
          ...formData,
          consent_agreed: true,
          consent_timestamp: new Date().toISOString(),
          participation_type: 'Wānanga Only',
        };
        const { error: dbError } = await supabase
          .from('participants')
          .insert([participantData]);

        if (dbError) {
          console.error('Supabase error:', dbError);
        }
      } else {
        console.warn('Supabase not configured — skipping save');
      }

      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Consent save error:', err);
      setStep(3);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-transparent border-b border-whenua/20 py-3 text-lg text-whenua focus:border-ako focus:outline-none transition-colors placeholder-whenua/20";
  const selectClass = "w-full bg-rauhuia border-b border-whenua/20 py-3 text-lg text-whenua focus:border-ako focus:outline-none transition-colors";
  const labelClass = "block text-xs uppercase tracking-widest text-marama mb-2";

  return (
    <div className="max-w-3xl mx-auto bg-white/60 p-6 md:p-10 rounded-lg shadow-sm border border-kakahu/20">

      {/* Progress Indicator */}
      {step <= 2 && (
        <div className="flex justify-between mb-8 text-xs font-bold tracking-widest uppercase text-marama">
          <span className={step >= 1 ? "text-ako" : ""}>1. Details</span>
          <span className={step >= 2 ? "text-ako" : ""}>2. Consent</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-crisis p-4 mb-6 rounded border border-crisis/20">
          {error}
        </div>
      )}

      {/* STEP 1: DETAILS */}
      {step === 1 && (
        <form onSubmit={submitRegistration} className="space-y-6 animate-fade-in">
          <h2 className="text-3xl font-bold text-whenua">Your Details</h2>
          <p className="text-whenua/80">
            Kia ora — before the wānanga, we need a few details and your consent. This takes about two minutes.
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
          <button type="button" onClick={() => { setStep(1); window.scrollTo(0, 0); }} className="text-sm text-whenua/60 hover:text-ako transition-colors">
            ← Back to details
          </button>
          <h2 className="text-3xl font-bold text-whenua">Consent</h2>
          <p className="text-whenua/80">
            Before the wānanga, please read through the following and confirm you are comfortable to proceed. Consent is ongoing — you can change your mind at any time.
          </p>

          {/* Expandable consent sections */}
          <div className="space-y-0 border border-kakahu/30 rounded-lg overflow-hidden bg-white">

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">&#9654;</span>
                <div>
                  <span className="font-bold text-whenua block">What this involves</span>
                  <span className="text-sm text-whenua/60">An online wānanga exploring themes around AI, vulnerability, and cultural safety.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>You are joining an online wānanga as part of Lian Passmore's and Lee Palamo's master's research at AcademyEX. The wānanga is a culturally grounded group discussion where we explore themes of safety, vulnerability, and cultural considerations around conversational AI.</p>
                <p>Other participants may have had a one-on-one conversation with an AI agent or completed a written form before the wānanga. You do not need to have done either — your presence and perspective in the group kōrero is valuable on its own.</p>
                <p>The wānanga will be recorded for research purposes only — the recording will not be shared publicly.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">&#9654;</span>
                <div>
                  <span className="font-bold text-whenua block">What will happen at the wānanga</span>
                  <span className="text-sm text-whenua/60">A group kōrero facilitated by Lian and Lee, exploring shared themes.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>The wānanga will be held online and will run for approximately 90 minutes. It will be facilitated by Lian and Lee and will include group discussion around themes that emerged from the individual conversations and written responses.</p>
                <p>You will be invited to share your thoughts and experiences, but you are not required to speak. You can participate in whatever way feels comfortable — listening is participation too.</p>
                <p>The wānanga is not a formal interview. It is a space to sit with the themes together, to challenge, question, and build on what has come up.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">&#9654;</span>
                <div>
                  <span className="font-bold text-whenua block">How we use your kōrero</span>
                  <span className="text-sm text-whenua/60">Anonymised, used in both master's projects, and may inform a public resource.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>The wānanga will be recorded and transcribed. Your contributions will be analysed as part of both Lian's and Lee's master's research projects at AcademyEX.</p>
                <p>All data used in our research will be anonymised — your name and identifying details will be removed before analysis or publication. Anonymised insights and themes from this research may also be used to develop a public-facing resource (such as a report or guide) to share what we have learned about designing conversational AI for vulnerable and culturally significant spaces.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">&#9654;</span>
                <div>
                  <span className="font-bold text-whenua block">Who sees your responses</span>
                  <span className="text-sm text-whenua/60">Lian, Lee, and supervisors. Cultural advisors see de-identified themes only.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>Lian and Lee (the researchers), and our academic supervisors (Felix Scholz and Paula Gair). Cultural advisors may review de-identified themes. All responses are anonymised before analysis — your name will not appear in any published work or public resource unless you specifically request attribution.</p>
              </div>
            </details>

            <details className="group border-b border-kakahu/20">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">&#9654;</span>
                <div>
                  <span className="font-bold text-whenua block">Your rights</span>
                  <span className="text-sm text-whenua/60">Voluntary. Ongoing consent. Withdraw anytime. 18+ only.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Participation is completely voluntary</li>
                  <li>You can leave the wānanga at any time — no explanation needed</li>
                  <li>You can withdraw your data from our research database up to two weeks after the wānanga by emailing us</li>
                  <li>We will delete our copy of the wānanga recording and transcript within 3 years of project completion, or earlier at your request</li>
                  <li>You do not need to speak during the wānanga — listening is participation</li>
                  <li>You must be 18 or older to participate</li>
                  <li>Choosing not to participate has no consequences whatsoever</li>
                  <li>You can request access to, correction of, or deletion of your personal information at any time by emailing us</li>
                </ul>
              </div>
            </details>

            <details className="group">
              <summary className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                <span className="text-ako mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-90">&#9654;</span>
                <div>
                  <span className="font-bold text-whenua block">If something comes up</span>
                  <span className="text-sm text-whenua/60">Support resources available. You can leave anytime, no explanation needed.</span>
                </div>
              </summary>
              <div className="px-4 pb-4 pl-10 text-sm text-whenua/80 space-y-3">
                <p>These conversations can touch on personal experiences of vulnerability, shame, or cultural harm. If anything feels uncomfortable, you are welcome to leave at any time. You do not need to explain why.</p>
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
              { id: 'understand_process', text: 'I understand what this research involves and that the wānanga will be recorded and transcribed for research purposes' },
              { id: 'understand_recording', text: 'I understand my contributions during the wānanga may be quoted in anonymised form in the research' },
              { id: 'voluntary', text: 'I understand my participation is voluntary, consent is ongoing, and I can withdraw at any time' },
              { id: 'research_use', text: "I consent to my anonymised insights being used in Lian Passmore's and Lee Palamo's master's research at AcademyEX, and in any public resource developed from this research" },
              { id: 'age_confirm', text: 'I confirm I am 18 years or older' },
              { id: 'ready', text: 'I am ready to participate in the wānanga' },
            ].map((item) => (
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
            <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a>.
          </p>

          <button
            onClick={submitConsent}
            disabled={loading}
            className="w-full bg-ako text-white font-bold py-4 rounded hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "I Agree — Confirm Consent"}
          </button>
        </div>
      )}

      {/* STEP 3: CONFIRMATION */}
      {step === 3 && (
        <div className="space-y-8 py-6 animate-fade-in text-center">
          <h2 className="text-4xl font-bold text-ako mb-4">Ngā mihi — thank you.</h2>
          <p className="text-xl text-whenua/80 max-w-xl mx-auto">
            Your consent has been recorded. We look forward to having you in the wānanga.
          </p>

          <div className="bg-white p-6 rounded-lg border-l-4 border-ako text-left">
            <h3 className="font-bold text-whenua mb-3">What happens next</h3>
            <p className="text-whenua/80 mb-4">
              You are all set for the wānanga. The kōrero will explore themes of safety, vulnerability, and cultural considerations around conversational AI. You do not need to prepare anything — just bring yourself and your perspective.
            </p>
            <p className="text-whenua/80">
              If you have any questions before we begin, reach out anytime:{' '}
              <a href="mailto:lianpassmore@gmail.com" className="text-ako underline">lianpassmore@gmail.com</a> or{' '}
              <a href="mailto:leepalamo275@gmail.com" className="text-ako underline">leepalamo275@gmail.com</a>
            </p>
          </div>

          <div className="text-whenua/60 text-sm space-y-4 text-left">
            <p>
              <strong className="text-whenua">Want to do more?</strong> If you would also like to have a conversation with the AI agent or fill in the written form, you can do that anytime through our{' '}
              <a href="/participate" className="text-ako underline">participation page</a>.
            </p>
          </div>

          <div className="pt-4">
            <a href="/" className="text-ako font-bold hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
