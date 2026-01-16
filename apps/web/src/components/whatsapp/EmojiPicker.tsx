import React from 'react';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡", "✅", "❌", "👋", "🙏", "🔥", "🎉"];

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
    return (
        <div className="p-2 grid grid-cols-4 gap-2 bg-white border border-gray-200 rounded-lg shadow-xl w-48">
            {COMMON_EMOJIS.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="text-2xl hover:bg-gray-100 p-1 rounded transition-colors"
                >
                    {emoji}
                </button>
            ))}
            <div className="col-span-4 text-xs text-center text-gray-400 pt-1 border-t mt-1">
                Emoji simples
            </div>
        </div>
    );
}
