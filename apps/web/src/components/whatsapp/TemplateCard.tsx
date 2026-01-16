'use client';

import { WhatsAppTemplate } from '@/types/whatsapp';
import { Send, Eye } from 'lucide-react';

interface TemplateCardProps {
  template: WhatsAppTemplate;
  onSend: (template: WhatsAppTemplate) => void;
}

export function TemplateCard({ template, onSend }: TemplateCardProps) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-start justify-between">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          {template.category}
        </span>
        <span className="text-[10px] text-gray-400">{template.language}</span>
      </div>

      <h5 className="mb-2 truncate text-xs font-bold text-gray-900 dark:text-white">
        {template.name}
      </h5>

      <div className="mb-3 line-clamp-3 rounded bg-gray-50 p-2 text-[11px] italic text-gray-600 dark:bg-gray-950 dark:text-gray-400">
        &quot;{template.content}&quot;
      </div>

      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button className="flex flex-1 items-center justify-center gap-1 rounded bg-gray-100 py-1.5 text-[10px] font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
          <Eye className="h-3 w-3" />
          Preview
        </button>
        <button
          onClick={() => onSend(template)}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-[#25D366] py-1.5 text-[10px] font-bold text-white hover:bg-[#128C7E]"
        >
          <Send className="h-3 w-3" />
          Enviar
        </button>
      </div>
    </div>
  );
}
