import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import ReflectionForm from './ReflectionForm';

export default function ReflectionGate() {
  const [step, setStep] = useState('identify'); // identify | write
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [participant, setParticipant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    participantId: null,
    found: false,
  });

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
      found: false,
    };

    try {
      const { data } = await supabase
        .from('participants')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (data) {
        participantData = {
          ...participantData,
          participantId: data.id,
          found: true,
        };
      }
    } catch (err) {
      console.error('Lookup error:', err);
    }

    setParticipant(participantData);
    setStep('write');
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
