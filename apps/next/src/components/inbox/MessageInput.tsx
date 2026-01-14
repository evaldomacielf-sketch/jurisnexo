import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
    conversationId: string;
    onTyping: () => void;
    // TODO: Implement actual send message function
    // onSendMessage: (content: string) => void; 
}

export function MessageInput({ conversationId, onTyping }: MessageInputProps) {
    const [content, setContent] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // TODO: Call onSendMessage
            setContent('');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);
        onTyping();
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma mensagem..."
                className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
                disabled={!content.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
    );
}
