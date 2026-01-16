'use client';

import { Check, CheckCheck } from 'lucide-react';
import { WhatsAppMessageStatus } from '@/types/whatsapp';

interface MessageStatusProps {
    status: WhatsAppMessageStatus;
}

export function MessageStatus({ status }: MessageStatusProps) {
    switch (status) {
        case WhatsAppMessageStatus.Sent:
            return <Check className="w-3.5 h-3.5 text-gray-400" />;
        case WhatsAppMessageStatus.Delivered:
            return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
        case WhatsAppMessageStatus.Read:
            return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
        case WhatsAppMessageStatus.Failed:
            return <span className="text-[10px] text-red-500 font-bold">!</span>;
        default:
            return null;
    }
}
