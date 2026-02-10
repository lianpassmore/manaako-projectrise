import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ReflectionForm() {
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
                email: formData.get('email'),
                shift_experience: formData.get('shift'),
                private_vs_public: formData.get('private_public'),
                feeling_right_wrong: formData.get('feelings'),
                use_again: formData.get('use_again'),
                recommend: formData.get('recommend'),
                other_thoughts: formData.get('other'),
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
        <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-ako mb-4">Ngā mihi nui.</h3>
            <p>Your reflections have been safely received.</p>
            <p className="mt-4">We will send the summary insights to you soon.</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-crisis p-4 rounded border border-crisis/20">
                    {error}
                </div>
            )}

            <div>
                <label className="block font-bold text-whenua mb-2">Your Email (so we can link this to your registration)</label>
                <input type="email" name="email" required className="w-full p-3 border border-kakahu rounded" placeholder="The one you used to register" />
            </div>

            <div>
                <label className="block font-bold text-whenua mb-2">Did anything shift for you between the private AI conversation and the group wānanga?</label>
                <textarea name="shift" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
            </div>

            <div>
                <label className="block font-bold text-whenua mb-2">Was there anything you shared with the AI that you would not have said in the room — or something that came up in the room that you would not have told the AI?</label>
                <textarea name="private_public" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
            </div>

            <div>
                <label className="block font-bold text-whenua mb-2">Having experienced both, what feels right about conversational AI in vulnerable spaces — and what does not?</label>
                <textarea name="feelings" rows="4" className="w-full p-3 border border-kakahu rounded"></textarea>
            </div>

            <div>
                <label className="block font-bold text-whenua mb-2">Would you use something like this again?</label>
                <div className="flex gap-4">
                    {['Yes', 'No', 'Maybe'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="use_again" value={opt} className="w-4 h-4 text-ako focus:ring-ako" />
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
                            <input type="radio" name="recommend" value={opt} className="w-4 h-4 text-ako focus:ring-ako" />
                            <span className="text-whenua">{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block font-bold text-whenua mb-2">Anything else you want us to know?</label>
                <textarea name="other" rows="3" className="w-full p-3 border border-kakahu rounded"></textarea>
            </div>

            <button disabled={loading} className="bg-whenua text-rauhuia px-8 py-3 rounded font-bold hover:bg-papa transition w-full">
                {loading ? "Sending..." : "Submit Reflections"}
            </button>
        </form>
    );
}
