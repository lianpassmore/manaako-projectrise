import React, { useState } from 'react';
import AgentConversation from './AgentConversation';

export default function ReflectionAgent() {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);

  if (started) {
    return <AgentConversation firstName={name} />;
  }

  return (
    <div className="space-y-3">
      <label className="block font-bold text-whenua text-sm">Your first name (so Ray knows who you are)</label>
      <div className="flex gap-3 justify-center items-center max-w-sm mx-auto">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name"
          className="flex-1 p-3 border border-kakahu rounded text-sm"
        />
        <button
          onClick={() => name.trim() && setStarted(true)}
          className="bg-whenua text-rauhuia px-5 py-3 rounded font-bold hover:bg-papa transition text-sm"
        >
          Start
        </button>
      </div>
    </div>
  );
}
