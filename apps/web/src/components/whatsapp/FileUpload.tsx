'use client';

import { Image as ImageIcon, Camera, User, FileText, Headphones } from 'lucide-react';

interface FileUploadProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

export function FileUpload({ onSelect, onClose }: FileUploadProps) {
  const options = [
    { id: 'document', icon: FileText, label: 'Documento', color: 'bg-indigo-600' },
    { id: 'camera', icon: Camera, label: 'Câmera', color: 'bg-pink-600' },
    { id: 'image', icon: ImageIcon, label: 'Galeria', color: 'bg-purple-600' },
    { id: 'audio', icon: Headphones, label: 'Áudio', color: 'bg-orange-600' },
    { id: 'contact', icon: User, label: 'Contato', color: 'bg-blue-600' },
  ];

  return (
    <div className="absolute bottom-20 left-4 z-50 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl duration-200 animate-in slide-in-from-bottom-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              onSelect(opt.id);
              onClose();
            }}
            className="group flex w-48 items-center gap-3 rounded-xl p-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div
              className={`h-10 w-10 ${opt.color} flex items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-110`}
            >
              <opt.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
