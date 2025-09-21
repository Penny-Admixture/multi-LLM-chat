import React from 'react';
import type { ChatMessage } from '../types';
import { SourceCard } from './SourceCard';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-4 ${!isModel ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-teal-500' : 'bg-[var(--accent-primary)]'}`}>
        {isModel ? <BotIcon /> : <UserIcon />}
      </div>
      <div className={`flex flex-col w-full max-w-[80%] space-y-2`}>
        <div
          className={`px-4 py-3 rounded-xl ${
            isModel ? 'bg-[var(--bg-secondary)] rounded-tl-none' : 'bg-[var(--accent-primary)] text-white rounded-br-none'
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message.content || ' '}</p>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs text-[var(--text-muted)] mb-2 font-semibold uppercase">Sources:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {message.sources.map((source, index) => (
                <SourceCard key={index} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
