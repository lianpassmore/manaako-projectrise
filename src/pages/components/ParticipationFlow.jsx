import React, { useState, useEffect } from 'react';
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
    reo_relationship: '',
  });

  // Consent State
  const [consents, setConsents] = useState({
    understand_process: false,
    understand_recording: false,
    voluntary: false,
    research_use: false,
    age_confirm: false,
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
      // Create the participant record
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

      // Move to next step
      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError("Unable to save registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-3xl font-serif text-whenua">Your Details</h2>
          <p className="text-whenua/80">These details help us understand who is in the room. Required fields are marked with *.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-whenua mb-1">First Name *</label>
              <input type="text" name="first_name" required className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput} />
            </div>
            <div>
              <label className="block text-sm font-bold text-whenua mb-1">Last Name *</label>
              <input type="text" name="last_name" required className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-whenua mb-1">Email Address *</label>
            <input type="email" name="email" required className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput} />
            <p className="text-xs text-marama mt-1">For your wānanga invitation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-whenua mb-1">Age Range</label>
              <select name="age_range" className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput}>
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
              <label className="block text-sm font-bold text-whenua mb-1">Location</label>
              <input type="text" name="location" placeholder="e.g. Hamilton, Tai Tokerau" className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-whenua mb-1">Which best describes you?</label>
            <select name="role_context" className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput}>
              <option value="">Select...</option>
              <option value="Te reo Māori learner">Te reo Māori learner</option>
              <option value="Te reo Māori speaker/practitioner">Te reo Māori speaker/practitioner</option>
              <option value="Educator or kaiako">Educator or kaiako</option>
              <option value="Kaupapa Māori practitioner">Kaupapa Māori practitioner</option>
              <option value="Tech/AI professional">Tech/AI professional</option>
              <option value="Researcher/Academic">Researcher or academic</option>
              <option value="Community member">Community member</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-whenua mb-1">Relationship to Te Reo Māori?</label>
            <select name="reo_relationship" className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput}>
              <option value="">Select...</option>
              <option value="Fluent speaker">Fluent speaker</option>
              <option value="Confident learner">Confident learner</option>
              <option value="Early learner">Early learner</option>
              <option value="Want to learn">Want to learn but haven't started</option>
              <option value="No relationship">No relationship with te reo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-whenua mb-1">Cultural Identities</label>
            <input type="text" name="cultural_identities" placeholder="e.g. Māori, Samoan, Pākehā..." className="w-full p-3 border border-kakahu rounded bg-rauhuia/30 focus:border-ako outline-none" onChange={handleInput} />
          </div>

          <button type="submit" className="w-full bg-ako text-white font-bold py-4 rounded hover:bg-teal-700 transition-colors shadow-md">
            Next Step: Consent
          </button>
        </form>
      )}

      {/* STEP 2: CONSENT */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-3xl font-serif text-whenua">Consent</h2>
          <div className="prose prose-sm text-whenua/90 bg-white p-6 rounded border border-kakahu/30 h-64 overflow-y-auto">
            <h3 className="font-bold">What this involves</h3>
            <p>You will have a 10-15 minute voice conversation with a conversational AI agent. It uses Lian's voice and will ask you about safety, vulnerability, and cultural considerations.</p>
            
            <h3 className="font-bold mt-4">Data Processing (Two Layers)</h3>
            <p><strong>1. Our Research:</strong> We store your transcript in Supabase (Australia) for analysis by Lian and Lee. We control this.</p>
            <p><strong>2. The Tech:</strong> ElevenLabs (USA) processes your voice. By using this tool, you agree to their Terms of Service, which includes a broad license on data processed. We have opted out of AI training, but cannot revoke their standard license.</p>
            
            <h3 className="font-bold mt-4">Your Rights</h3>
            <p>Participation is voluntary. You can stop at any time. You can withdraw your research data up to two weeks after the wānanga.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-kakahu/30">
            {[
              { id: 'understand_process', text: 'I understand what this research involves and how my data will be processed by ElevenLabs.' },
              { id: 'understand_recording', text: 'I understand my conversation will be recorded and transcribed.' },
              { id: 'voluntary', text: 'I understand my participation is voluntary and I can stop at any time.' },
              { id: 'research_use', text: 'I consent to my insights being used in Lian & Lee’s master’s research.' },
              { id: 'age_confirm', text: 'I confirm I am 18 years or older.' },
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
        <div className="text-center space-y-8 py-10 animate-fade-in">
          <h2 className="text-4xl font-serif text-whenua">Before you begin</h2>
          
          <div className="max-w-xl mx-auto text-lg text-whenua/80 leading-relaxed space-y-6">
            <p>
              This kōrero may touch on things that sit close to the heart — identity, culture, vulnerability, shame.
            </p>
            <p>
              If it feels right for you, you are welcome to take a moment before you start — whether that is a karakia, a quiet breath, or simply checking in with yourself.
            </p>
            <p className="font-serif italic">
              There is no right or wrong way to enter this space.
            </p>
          </div>

          <button 
            onClick={() => setStep(4)}
            className="mt-8 bg-ako text-white font-bold px-10 py-4 rounded-full hover:bg-teal-700 transition-all shadow-lg transform hover:scale-105"
          >
            I am ready to speak
          </button>
        </div>
      )}

      {/* STEP 4: ELEVENLABS CONVERSATION */}
      {step === 4 && (
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-2xl font-serif text-whenua mb-4">Kōrero with Ray</h2>
          
          <p className="text-sm text-marama mb-8">
            Click the microphone to start. Speak naturally. When you are finished, click "End Conversation".
          </p>

          <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-lg border border-kakahu/30 p-8 shadow-inner">
            {/* 
               ELEVENLABS WIDGET
               Replace agent-id with your actual ID.
               We pass client-email and client-name if the widget supports it via attributes,
               otherwise we rely on the internal logging.
            */}
            <elevenlabs-convai 
              agent-id="YOUR_AGENT_ID_HERE"
              className="w-full max-w-sm"
            ></elevenlabs-convai>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={() => setStep(5)}
              className="text-whenua underline hover:text-ako text-sm"
            >
              I have finished the conversation →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: POST-CONVERSATION */}
      {step === 5 && (
        <div className="text-center space-y-6 py-10 animate-fade-in">
          <h2 className="text-4xl font-serif text-ako mb-4">Ngā mihi — Thank you.</h2>
          
          <p className="text-xl text-whenua/80">
            Your kōrero matters. Your thoughts have been captured.
          </p>
          
          <div className="bg-white p-6 rounded-lg border-l-4 border-ako text-left max-w-lg mx-auto mt-8">
            <h3 className="font-bold text-whenua mb-2">What happens next?</h3>
            <p className="text-whenua/80 mb-4">
              Check your email ({formData.email}) — we have sent you an invitation to the online wānanga on <strong>Thursday 26 February</strong>.
            </p>
            <p className="text-whenua/80">
              We will explore these themes together then.
            </p>
          </div>

          <a href="/" className="inline-block mt-8 text-ako font-bold hover:underline">
            Return to Home
          </a>
        </div>
      )}

    </div>
  );
}