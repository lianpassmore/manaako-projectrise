import React, { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import AnimatedOrb from './AnimatedOrb';

export default function AgentConversation({
  agentId = import.meta.env.PUBLIC_ELEVENLABS_AGENT,
  firstName = 'Friend',
  lastName = '',
  participantId = '',
}) {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);

  const conversation = useConversation({
    onError: (err) => {
      console.error('ElevenLabs error:', err);
      setError("Unable to connect to the agent. Please try refreshing the page.");
      setStarted(false);
    },
  });

  const handleStart = useCallback(async () => {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error('Mic access error:', err);
      setError("Microphone access denied. Please check your browser settings and try again.");
      return;
    }
    try {
      console.log('Starting session with agentId:', agentId);
      await conversation.startSession({
        agentId: agentId,
        dynamicVariables: {
          first_name: firstName,
          last_name: lastName,
          participant_id: participantId,
        },
      });
      setStarted(true);
    } catch (err) {
      console.error('ElevenLabs session error:', err);
      setError("Unable to connect to the agent. Please try refreshing the page.");
    }
  }, [conversation, agentId, firstName, lastName, participantId]);

  const handleEnd = useCallback(async () => {
    await conversation.endSession();
    setStarted(false);
    setMuted(false);
  }, [conversation]);

  const handleMute = useCallback(async () => {
    await conversation.setVolume({ volume: muted ? 1 : 0 });
    setMuted(!muted);
  }, [conversation, muted]);

  const isSpeaking = conversation.isSpeaking;
  const isConnected = conversation.status === 'connected';

  return (
    <div className="flex flex-col items-center gap-6 py-10">

      {/* Central Orb */}
      <div className="relative flex items-center justify-center">
        <AnimatedOrb
          state={!started ? 'idle' : isSpeaking ? 'speaking' : 'connected'}
          size={200}
          onClick={!started ? handleStart : undefined}
        />
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        {error ? (
          <p className="text-crisis font-bold animate-pulse">{error}</p>
        ) : (
          <p
            className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isSpeaking ? 'text-ako' : 'text-whenua/60'} ${!started && conversation.status !== 'connecting' ? 'cursor-pointer hover:text-ako' : ''}`}
            onClick={!started && conversation.status !== 'connecting' ? handleStart : undefined}
          >
            {conversation.status === 'connected'
              ? (isSpeaking ? 'Speaking' : 'Listening')
              : (conversation.status === 'connecting' ? 'Connecting...' : 'Tap to begin')}
          </p>
        )}
        <p className="text-[11px] text-crisis/70 font-medium max-w-xs mx-auto leading-relaxed">
          This is an AI tool, not a person. It can make mistakes, miss nuance, or get things wrong.
        </p>
      </div>

      {/* Mute + End Call buttons */}
      {started && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleMute}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all ${
              muted
                ? 'bg-crisis/10 text-crisis border border-crisis/30 hover:bg-crisis/20'
                : 'bg-kakahu/20 text-whenua border border-kakahu hover:bg-kakahu/40'
            }`}
          >
            {muted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
            {muted ? 'Unmute' : 'Mute'}
          </button>

          <button
            onClick={handleEnd}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm bg-crisis text-white hover:bg-crisis/90 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
            </svg>
            End Call
          </button>
        </div>
      )}
    </div>
  );
}
