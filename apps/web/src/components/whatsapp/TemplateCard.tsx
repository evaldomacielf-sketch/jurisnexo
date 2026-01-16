'use client';

import { WhatsAppTemplate } from '@/types/whatsapp';
import { Send, Eye } from 'lucide-react';

interface TemplateCardProps {
    template: WhatsAppTemplate;
    onSend: (template: WhatsAppTemplate) => void;
}

export function TemplateCard({ template, onSend }: TemplateCardProps) {
    return (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    {template.category}
                </span>
                <span className="text-[10px] text-gray-400">{template.language}</span>
            </div>

            <h5 className="font-bold text-xs text-gray-900 dark:text-white mb-2 truncate">
                {template.name}
            </h5>

            <div className="bg-gray-50 dark:bg-gray-950 p-2 rounded text-[11px] text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 italic">
                "{template.content}"
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white text-[10px] font-bold rounded flex items-center justify-center gap-1"
                >
                    <Eye className="w-3 h-3" />
                    Preview
                </button>
                <button
                    onClick={() => onSend(template)}
                    className="flex-1 py-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1"
                >
                    <Send className="w-3 h-3" />
                    Enviar
                </button>
            </div>
        </div>
    );
}
