import React from 'react';
import { ChatMessage } from './ChatMessage';

interface ChatHistoryProps {
  messages: Array<{ text: string; isUser: boolean }>;
  thinking: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  thinking,
}) => {
  return (
    <div className="chat-messages">
      {messages.map((message, index) => (
        <ChatMessage key={index} text={message.text} isUser={message.isUser} />
      ))}
      {thinking && <div className="message ai-message thinking">思考中...</div>}
    </div>
  );
};
