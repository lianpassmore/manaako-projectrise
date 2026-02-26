import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ReflectionForm({ email: emailProp, firstName: firstNameProp }) {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.target);

        const { error: dbError } = await supabase
            .from('reflections')
            .insert([{
                email: emailProp || formData.get('email') || null,
                first_name: firstNameProp || formData.get('first_name') || null,
                what_shifted: formData.get('what_shifted'),
                what_holding: formData.get('what_holding'),
                what_matters_most: formData.get('what_matters_most'),
                paradox: formData.get('paradox') || null,
                what_surprised: formData.get('what_surprised') || null,
                anything_else: formData.get('anything_else') || null,
                one_word_feeling: formData.get('one_word_feeling') || null,
                submitted_at: new Date().toISOString()
            }]);

        if (dbError) {
            setError("Unable to save your reflections. Please try again.");
        } else {
            setSent(true);
        }
        setLoading(false);
    };

    if (sent) return (
        <div className="text-center py-10 space-y-4">
            <h3 className="text-2xl font-bold text-ako mb-2">Ngā mihi nui for your reflections.</h3>
            <p className="text-whenua/80 max-w-lg mx-auto">
                Your voice tonight — and your thoughts here — are shaping how AI gets built for culturally sensitive spaces. That matters.
            </p>
            <p className="text-whenua/70 max-w-lg mx-auto mt-4 text-sm">
                If anything from tonight is sitting with you and you want to kōrero further, Lian and Lee are available:
            </p>
            <p className="text-whenua/70 text-sm">
                lianpassmore@gmail.com &middot; leepalamo275@gmail.com
            </p>
            <p className="text-whenua/60 italic mt-6 text-sm">
                Mā te kōrero ka ora — through conversation, there is life.
            </p>
            <p className="text-whenua/70 mt-2 text-sm">Aroha nui, Lian + Lee</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 text-crisis p-4 rounded border border-crisis/20">
                    {error}
                </div>
            )}

            <p className="text-whenua/50 text-xs italic">
                Your responses are confidential. Names/emails are only used if you want follow-up — they won't be shared.
            </p>

            {/* SECTION 1: Your Details */}
            {emailProp ? (
                <p className="text-whenua/60 text-sm">
                    Submitting as <strong className="text-whenua">{firstNameProp || emailProp}</strong> ({emailProp})
                </p>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-whenua border-b border-kakahu/30 pb-2">Your Details</h3>

                    <div>
                        <label className="block font-bold text-whenua mb-1">Email (optional — only if you want us to follow up)</label>
                        <input type="email" name="email" className="w-full p-3 border border-kakahu rounded" placeholder="your@email.com" />
                    </div>

                    <div>
                        <label className="block font-bold text-whenua mb-1">First name (optional)</label>
                        <input type="text" name="first_name" className="w-full p-3 border border-kakahu rounded" placeholder="Your first name" />
                    </div>
                </div>
            )}

            {/* SECTION 2: Core Reflections */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-whenua border-b border-kakahu/30 pb-2">Core Reflections</h3>

                <div>
                    <label className="block font-bold text-whenua mb-1">What shifted for you tonight?</label>
                    <p className="text-whenua/60 text-sm mb-2">Think about how you felt coming in versus how you feel now. What's different? What changed?</p>
                    <textarea name="what_shifted" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
                </div>

                <div>
                    <label className="block font-bold text-whenua mb-1">What's one thing you're holding from tonight's conversation that you want to keep thinking about?</label>
                    <p className="text-whenua/60 text-sm mb-2">We covered a lot of ground. What's sitting with you? What do you want to keep exploring?</p>
                    <textarea name="what_holding" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
                </div>

                <div>
                    <label className="block font-bold text-whenua mb-1">If Lian and Lee are building AI for vulnerable spaces, what's the ONE thing you'd tell them based on tonight?</label>
                    <p className="text-whenua/60 text-sm mb-2">You've been part of a conversation most people haven't had yet. What matters most for them to remember?</p>
                    <textarea name="what_matters_most" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
                </div>
            </div>

            {/* SECTION 3: Optional — Go Deeper */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-whenua border-b border-kakahu/30 pb-2">Optional — Go Deeper</h3>
                    <p className="text-whenua/60 text-sm mt-2">Want to reflect a bit more? These questions are optional, but we'd love to hear your thoughts if you have the energy.</p>
                </div>

                <div>
                    <label className="block font-bold text-whenua mb-1">Did the paradox (protect vs share) resolve for you, or are you still holding the tension?</label>
                    <p className="text-whenua/60 text-sm mb-2">We talked about how protecting knowledge can destroy it, and sharing it can diminish it. Where did you land? Or are you still sitting with both?</p>
                    <textarea name="paradox" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
                </div>

                <div>
                    <label className="block font-bold text-whenua mb-1">What surprised you about what others said tonight?</label>
                    <p className="text-whenua/60 text-sm mb-2">You heard from people in breakouts and in the full room. What perspective hadn't you considered before?</p>
                    <textarea name="what_surprised" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
                </div>

                <div>
                    <label className="block font-bold text-whenua mb-1">Anything else sitting with you?</label>
                    <p className="text-whenua/60 text-sm mb-2">Anything we didn't ask about that you want to share?</p>
                    <textarea name="anything_else" rows="3" className="w-full p-3 border border-kakahu rounded"></textarea>
                </div>
            </div>

            {/* SECTION 4: How You're Feeling */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-whenua border-b border-kakahu/30 pb-2">How You're Feeling</h3>

                <div>
                    <label className="block font-bold text-whenua mb-1">In one word, how do you feel about AI right now?</label>
                    <input type="text" name="one_word_feeling" className="w-full p-3 border border-kakahu rounded" placeholder="One word..." />
                </div>
            </div>

            <button disabled={loading} className="bg-whenua text-rauhuia px-8 py-3 rounded font-bold hover:bg-papa transition w-full">
                {loading ? "Sending..." : "Send reflections"}
            </button>
        </form>
    );
}
