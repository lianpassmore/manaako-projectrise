import React, { useState } from 'react';

export default function CrisisModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button - Fixed to bottom right or accessible via footer */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-white border-2 border-crisis text-crisis px-4 py-2 rounded-full shadow-lg hover:bg-crisis hover:text-white transition-colors font-bold text-sm z-50 flex items-center gap-2"
      >
        <span>Need Support?</span>
        <span className="bg-crisis text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-papa/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-rauhuia max-w-lg w-full rounded-lg shadow-2xl border-t-4 border-crisis p-6 relative overflow-y-auto max-h-[90vh]">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-whenua/50 hover:text-whenua"
            >
              ✕ Close
            </button>

            <h2 className="font-serif text-2xl font-bold text-crisis mb-4">Support Resources</h2>
            
            <div className="space-y-6 text-whenua font-sans">
              <p>
                These conversations can touch on personal experiences of vulnerability, shame, or cultural harm. 
                If anything feels uncomfortable, you are welcome to stop at any time.
              </p>

              <div className="bg-white p-4 rounded border border-crisis/20">
                <h3 className="font-bold text-lg mb-2">Mental Health Support</h3>
                <p><strong className="text-ako">1737</strong> — Free call or text, anytime (24/7)</p>
                <p><strong>Lifeline</strong> — 0800 543 354</p>
              </div>

              <div className="bg-white p-4 rounded border border-crisis/20">
                <h3 className="font-bold text-lg mb-2">Domestic Violence</h3>
                <p><strong>Women's Refuge</strong> — 0800 733 843</p>
              </div>

              <div className="bg-white p-4 rounded border border-crisis/20">
                <h3 className="font-bold text-lg mb-2">Emergency</h3>
                <p className="text-crisis font-bold">111</p>
              </div>

              <p className="text-sm italic mt-4 border-t border-whenua/10 pt-4">
                Lian and Lee are also available if you want to debrief:<br/>
                <a href="mailto:lianpassmore@gmail.com" className="underline hover:text-ako">lianpassmore@gmail.com</a> or <a href="mailto:leepalamo275@gmail.com" className="underline hover:text-ako">leepalamo275@gmail.com</a>
              </p>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 bg-whenua text-rauhuia py-3 rounded font-bold hover:bg-papa transition-colors"
            >
              Return to Website
            </button>
          </div>
        </div>
      )}
    </>
  );
}