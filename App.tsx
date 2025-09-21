import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { startChat as startGeminiChat } from './services/geminiService';
import { createChatSession as startLmStudioChat } from './services/lmStudioService';
import type { ChatMessage } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Define a common type for the chat session object
type ChatSession = Chat | ReturnType<typeof startLmStudioChat>;

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<string>('chat-theme', 'default-dark');
  const [provider, setProvider] = useLocalStorage<string>('chat-provider', 'Gemini');
  const [geminiModel, setGeminiModel] = useLocalStorage<string>('chat-gemini-model', 'gemini-2.5-flash');

  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`chat-history-${provider}-${geminiModel}`, []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<ChatSession | null>(null);
  const isOnline = useOnlineStatus();

  // Apply theme to the document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);
  
  // Effect to initialize or reset chat session when provider or model changes
  useEffect(() => {
    setError(null);
    const historyKey = `chat-history-${provider}-${geminiModel}`;
    const storedMessages = localStorage.getItem(historyKey);
    const initialMessages = storedMessages ? JSON.parse(storedMessages) : [];

    setMessages(initialMessages); 

    try {
        if (provider === 'Gemini') {
            chatRef.current = startGeminiChat(geminiModel);
            if (initialMessages.length === 0) {
              setMessages([{ role: 'model', content: "Hello! I'm Gemini. How can I assist you today?" }]);
            }
        } else if (provider === 'LM Studio') {
            chatRef.current = startLmStudioChat(initialMessages);
            if (initialMessages.length === 0) {
              setMessages([{ role: 'model', content: "Hello! I'm connected to LM Studio. How can I assist you today?" }]);
            }
        }
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Initialization Error: ${errorMessage}`);
        setMessages([{ role: 'model', content: `Sorry, I couldn't initialize the chat session: ${errorMessage}` }]);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, geminiModel]);


  const handleSendMessage = async (userInput: string) => {
    if (isLoading || !userInput.trim()) return;
    if (!isOnline && provider === 'Gemini') {
        setError("You are offline. Cannot connect to Gemini.");
        return;
    }


    setIsLoading(true);
    setError(null);
    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    try {
        if (!chatRef.current) {
            throw new Error("Chat session not initialized.");
        }
        
        const stream = await chatRef.current.sendMessageStream({ message: userInput });

        let modelResponseText = '';
        let finalResponse: any = null;

        setMessages(prevMessages => [...prevMessages, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            modelResponseText += chunk.text;
            finalResponse = chunk;
            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content = modelResponseText;
                return newMessages;
            });
        }
        
        if (provider === 'Gemini') {
            const groundingMetadata = finalResponse?.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
                const sources = groundingMetadata.groundingChunks
                  .map((chunk: any) => chunk.web)
                  .filter((web: any) => web && web.uri && web.title);
    
                 if (sources.length > 0) {
                     setMessages(prevMessages => {
                        const newMessages = [...prevMessages];
                        const lastMessage = newMessages[newMessages.length - 1];
                        lastMessage.sources = sources;
                        return newMessages;
                    });
                 }
            }
        }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}`);
      setMessages(prevMessages => [...prevMessages, { role: 'model', content: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header 
        theme={theme} 
        setTheme={setTheme}
        provider={provider}
        setProvider={setProvider}
        geminiModel={geminiModel}
        setGeminiModel={setGeminiModel}
      />
      <ChatWindow messages={messages} isLoading={isLoading} />
      {error && <div className="text-red-500 text-center py-2">{error}</div>}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} isOnline={isOnline} provider={provider} />
    </div>
  );
};

export default App;
