'use client';

import {
    Image as ImageIcon,
    Camera,
    User,
    FileText,
    Headphones
} from 'lucide-react';

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
        <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-4 duration-200 z-50">
            <div className="grid grid-cols-1 gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => { onSelect(opt.id); onClose(); }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all group w-48"
                    >
                        <div className={`w-10 h-10 ${opt.color} rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <opt.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
