import React from 'react';
import AgentConversation from './AgentConversation';

export default function ReflectionAgent({ firstName = '', lastName = '', participantId = '', onUnavailable = null }) {
  return <AgentConversation firstName={firstName} lastName={lastName} participantId={participantId} reflectionMode={true} onUnavailable={onUnavailable} />;
}
