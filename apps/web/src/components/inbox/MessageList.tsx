import type { Message } from '@/types/inbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Nenhuma mensagem ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUser = message.sender_type === 'user';
        return (
          <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
            >
              {message.message_type === 'text' && <p>{message.content}</p>}
              {message.message_type === 'image' && (
                <img
                  src={message.media_url}
                  alt="Imagem enviada"
                  className="max-w-full rounded-md"
                />
              )}
              <div
                className={`mt-1 text-xs ${
                  isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
                }`}
              >
                {format(new Date(message.sent_at), 'HH:mm', { locale: ptBR })}
                {isUser && <span className="ml-1">{message.is_read ? '✓✓' : '✓'}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
