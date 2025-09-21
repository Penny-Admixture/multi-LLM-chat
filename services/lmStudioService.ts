import type { ChatMessage } from '../types';

// This interface is a subset of the @google/genai Chat object to ensure compatibility
interface LocalChat {
    sendMessageStream(params: { message: string }): Promise<AsyncIterable<{ text: string; candidates: any[] }>>;
    getHistory(): Promise<ChatMessage[]>;
}

export const createChatSession = (initialHistory: ChatMessage[]): LocalChat => {
    let history: ChatMessage[] = [...initialHistory];
    const LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions";

    return {
        getHistory: async () => {
            return history;
        },
        // FIX: Changed from an async generator to an async function that returns the result of an async generator.
        // This ensures the return type is `Promise<AsyncIterable<...>>` to match the `LocalChat` interface,
        // which is required for compatibility with the Gemini API's chat session.
        sendMessageStream: async (params: { message: string }): Promise<AsyncIterable<{ text: string; candidates: any[] }>> => {
            async function* streamGenerator(): AsyncGenerator<{ text: string; candidates: any[] }> {
                const userMessage: ChatMessage = { role: 'user', content: params.message };
                history.push(userMessage);

                let accumulatedContent = '';

                try {
                    const response = await fetch(LM_STUDIO_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: history.map(({sources, ...rest}) => rest), // LM Studio doesn't know about `sources`
                            temperature: 0.7,
                            stream: true,
                        }),
                    });
                    
                    if (!response.ok || !response.body) {
                        throw new Error(`LM Studio request failed: ${response.statusText}`);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || ''; // Keep the last, possibly incomplete line

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.substring(6);
                                if (data.trim() === '[DONE]') {
                                    history.push({ role: 'model', content: accumulatedContent });
                                    return;
                                }
                                try {
                                    const chunk = JSON.parse(data);
                                    const content = chunk.choices[0]?.delta?.content || '';
                                    if (content) {
                                        accumulatedContent += content;
                                        yield { text: content, candidates: [] };
                                    }
                                } catch (e) {
                                    console.error('Error parsing LM Studio stream chunk:', e, 'Data:', data);
                                }
                            }
                        }
                    }
                     history.push({ role: 'model', content: accumulatedContent });

                } catch (error) {
                    console.error("Error contacting LM Studio:", error);
                    const errorMessage = error instanceof Error ? error.message : "Could not connect to LM Studio server.";
                    yield { text: `Error: ${errorMessage}`, candidates: [] };
                }
            }
            return streamGenerator();
        }
    };
};
