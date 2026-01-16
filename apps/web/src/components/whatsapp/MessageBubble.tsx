import React from 'react';
import { WhatsAppMessage } from '@/types/whatsapp';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline'; // Using Check for Sent/Delivered/Read

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction.toLowerCase() === 'outbound';

  // Format time
  const time = new Date(message.timestamp || message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Status Icon Logic
  const renderStatus = () => {
    if (!isOutbound) return null;
    const s = (message.status || '').toLowerCase();
    if (s === 'read')
      return (
        <div className="flex">
          <CheckIcon className="h-3 w-3 text-blue-500" />
          <CheckIcon className="-ml-1 h-3 w-3 text-blue-500" />
        </div>
      ); // Blue double check
    if (s === 'delivered')
      return (
        <div className="flex">
          <CheckIcon className="h-3 w-3 text-gray-500" />
          <CheckIcon className="-ml-1 h-3 w-3 text-gray-500" />
        </div>
      ); // Gray double check
    if (s === 'sent') return <CheckIcon className="h-3 w-3 text-gray-500" />; // Gray check
    return <ClockIcon className="h-3 w-3 text-gray-400" />; // Pending/Sending
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm ${
          isOutbound
            ? 'rounded-tr-none bg-[#d9fdd3] text-gray-900'
            : 'rounded-tl-none bg-white text-gray-900'
        }`}
      >
        {/* Media Handling Stub */}
        {message.mediaUrl && (
          <div className="mb-2">
            {message.mediaType === 'image' ? (
              <img src={message.mediaUrl} alt="Media" className="max-w-full rounded" />
            ) : (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded bg-blue-50 p-2 text-blue-600"
              >
                <span>📎 Arquivo</span>
              </a>
            )}
          </div>
        )}

        <p className="whitespace-pre-wrap">{message.content}</p>

        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[10px] text-gray-500">{time}</span>
          {isOutbound && renderStatus()}
        </div>
      </div>
    </div>
  );
}
