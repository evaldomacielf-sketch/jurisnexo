'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!mounted) return null;
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95 dark:bg-[#1a2130]">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 focus:outline-none dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined text-xl">close</span>
              <span className="sr-only">Fechar</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
