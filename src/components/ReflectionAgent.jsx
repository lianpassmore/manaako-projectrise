import React from 'react';
import AgentConversation from './AgentConversation';

export default function ReflectionAgent({ firstName = '', lastName = '', participantId = '' }) {
  return <AgentConversation firstName={firstName} lastName={lastName} participantId={participantId} />;
}
