import React from 'react';
import { ChatMessage } from '../types';
import { PRIMARY_COLOR, TEAM_NAME, THEME_WHITE } from '../constants';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow ${
          isUser
            ? `bg-[${PRIMARY_COLOR}] text-[${THEME_WHITE}] rounded-br-none`
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-white/80 text-right' : 'text-gray-500 text-left'}`}>
          {isUser ? 'You' : `${TEAM_NAME} Bot`} - {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessageBubble;