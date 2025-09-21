import React from 'react';
import { ThemeSelector } from './ThemeSelector';
import { ModelSelector } from './ModelSelector';

interface HeaderProps {
    theme: string;
    setTheme: (theme: string) => void;
    provider: string;
    setProvider: (provider: string) => void;
    geminiModel: string;
    setGeminiModel: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <header className="bg-[var(--bg-secondary)]/50 backdrop-blur-sm border-b border-[var(--border-primary)] p-3 shadow-lg sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex-1">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
            Multi-LLM Chat
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <ModelSelector {...props} />
            <ThemeSelector theme={props.theme} setTheme={props.setTheme} />
        </div>
      </div>
    </header>
  );
};
