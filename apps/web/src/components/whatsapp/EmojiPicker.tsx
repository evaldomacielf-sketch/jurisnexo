import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '✅', '❌', '👋', '🙏', '🔥', '🎉'];

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <div className="grid w-48 grid-cols-4 gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="rounded p-1 text-2xl transition-colors hover:bg-gray-100"
        >
          {emoji}
        </button>
      ))}
      <div className="col-span-4 mt-1 border-t pt-1 text-center text-xs text-gray-400">
        Emoji simples
      </div>
    </div>
  );
}
