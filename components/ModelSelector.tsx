import React from 'react';

interface ModelSelectorProps {
    provider: string;
    setProvider: (provider: string) => void;
    geminiModel: string;
    setGeminiModel: (model: string) => void;
}

const providers = ['Gemini', 'LM Studio'];
const geminiModels = ['gemini-2.5-flash'];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ provider, setProvider, geminiModel, setGeminiModel }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-1 px-2 text-sm appearance-none focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-primary)]"
                    aria-label="Select model provider"
                >
                    {providers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            {provider === 'Gemini' && (
                 <div className="relative">
                    <select
                        value={geminiModel}
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md py-1 px-2 text-sm appearance-none focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-primary)]"
                        aria-label="Select Gemini model"
                    >
                        {geminiModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
};
