'use client';

import { Check, CheckCheck } from 'lucide-react';
import { WhatsAppMessageStatus } from '@/types/whatsapp';

interface MessageStatusProps {
  status: WhatsAppMessageStatus;
}

export function MessageStatus({ status }: MessageStatusProps) {
  switch (status) {
    case WhatsAppMessageStatus.Sent:
      return <Check className="h-3.5 w-3.5 text-gray-400" />;
    case WhatsAppMessageStatus.Delivered:
      return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
    case WhatsAppMessageStatus.Read:
      return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
    case WhatsAppMessageStatus.Failed:
      return <span className="text-[10px] font-bold text-red-500">!</span>;
    default:
      return null;
  }
}
