import React, { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

export default function AgentConversation({ firstName = '', lastName = '', participantId = '' }) {
  const [started, setStarted] = useState(false);

  const conversation = useConversation({
    onError: (error) => {
      console.error('ElevenLabs error:', error);
    },
  });

  const handleStart = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: import.meta.env.PUBLIC_ELEVENLABS_AGENT,
        dynamicVariables: {
          first_name: firstName,
          last_name: lastName,
          participant_id: participantId,
        },
      });
      setStarted(true);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  }, [conversation, firstName, lastName, participantId]);

  const handleEnd = useCallback(async () => {
    await conversation.endSession();
    setStarted(false);
  }, [conversation]);

  const statusLabel = {
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Ready',
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${
          conversation.status === 'connected' ? 'bg-ako animate-pulse' :
          conversation.status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
          'bg-marama'
        }`} />
        <span className="text-sm text-whenua/70">
          {statusLabel[conversation.status] || 'Ready'}
        </span>
      </div>

      {/* Speaking indicator */}
      {conversation.isSpeaking && (
        <p className="text-sm text-ako font-medium animate-pulse">Ray is speaking...</p>
      )}

      {/* Start / End button */}
      {!started ? (
        <button
          onClick={handleStart}
          disabled={conversation.status === 'connecting'}
          className="bg-ako text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-ako/90 transition disabled:opacity-50"
        >
          {conversation.status === 'connecting' ? 'Connecting...' : 'Start Conversation'}
        </button>
      ) : (
        <button
          onClick={handleEnd}
          className="bg-whenua text-rauhuia px-8 py-4 rounded-full font-bold text-lg hover:bg-papa transition"
        >
          End Conversation
        </button>
      )}

      <p className="text-xs text-marama max-w-sm text-center">
        Click start, then speak naturally. Ray will respond using voice.
      </p>
    </div>
  );
}
