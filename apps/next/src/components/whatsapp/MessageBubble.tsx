'use client';

import { format } from 'date-fns';
import { WhatsAppMessage, WhatsAppDirection } from '@/types/whatsapp';
import { MessageStatus } from './MessageStatus';
import { File, Video, Image as ImageIcon } from 'lucide-react';

interface MessageBubbleProps {
    message: WhatsAppMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isOutbound = message.direction === WhatsAppDirection.Outbound;
    const time = format(new Date(message.sentAt), 'HH:mm');

    return (
        <div className={`flex w-full ${isOutbound ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
            <div className={`max-w-[70%] px-3 py-1.5 rounded-lg shadow-sm relative group ${isOutbound
                    ? 'bg-[#dcf8c6] dark:bg-[#056162] text-gray-900 dark:text-white rounded-tr-none'
                    : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-white rounded-tl-none'
                }`}>
                {/* Media Content */}
                {message.mediaUrl && (
                    <div className="mb-2 rounded overflow-hidden">
                        {message.messageType === 'image' && (
                            <img src={message.mediaUrl} alt="Media" className="max-w-full h-auto cursor-pointer" />
                        )}
                        {message.messageType === 'video' && (
                            <div className="relative aspect-video bg-black flex items-center justify-center">
                                <Video className="w-8 h-8 text-white" />
                            </div>
                        )}
                        {message.messageType === 'document' && (
                            <div className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded">
                                <File className="w-5 h-5 text-gray-500" />
                                <span className="text-xs truncate">Documento.pdf</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Text Content */}
                <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>

                {/* Footer: Time + Status */}
                <div className="flex items-center justify-end gap-1 mt-1 -mr-1">
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">
                        {time}
                    </span>
                    {isOutbound && <MessageStatus status={message.status} />}
                </div>
            </div>
        </div>
    );
}
