import React, { useState, useEffect, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface MessageInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
  isOnline: boolean;
  provider: string;
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, isOnline, provider }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access was denied. Please allow microphone access in your browser settings to use voice input.');
      }
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInput(transcript);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
        if (recognitionRef.current && typeof recognitionRef.current.stop === 'function') {
            recognitionRef.current.stop();
        }
    }
  }, []);

  const handleToggleListening = () => {
    if (isLoading || !recognitionRef.current || !isOnline) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isDisabled) {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      onSendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };

  const isGeminiOffline = provider === 'Gemini' && !isOnline;
  const isDisabled = isLoading || isGeminiOffline;
  
  let placeholderText = "Type your message here...";
  if (isGeminiOffline) {
    placeholderText = "You are offline. Connect to send messages to Gemini.";
  } else if (isListening) {
    placeholderText = "Listening...";
  }


  return (
    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-sm border-t border-[var(--border-primary)] p-4 sticky bottom-0">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          rows={1}
          className="flex-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-primary)] rounded-lg p-3 focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none resize-none transition-all duration-200 disabled:opacity-60"
          disabled={isDisabled}
        />
        {SpeechRecognition && (
          <button
            type="button"
            onClick={handleToggleListening}
            disabled={isDisabled}
            className={`text-white p-3 h-12 w-12 flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-[var(--bg-interactive)] hover:bg-gray-500 focus:ring-[var(--accent-primary)]'
            }`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            <MicrophoneIcon />
          </button>
        )}
        <button
          type="submit"
          disabled={isDisabled || !input.trim()}
          className="bg-[var(--accent-primary)] text-white rounded-lg p-3 h-12 w-12 flex items-center justify-center disabled:bg-[var(--bg-interactive)] disabled:cursor-not-allowed hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-blue-500"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};
