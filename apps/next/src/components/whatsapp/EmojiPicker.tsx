'use client';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
    const commonEmojis = ['😊', '😂', '👍', '🙏', '❤️', '👏', '🔥', '🤔', '👀', '✨', '✅', '⚖️', '📄', '🤝', '🚀'];

    return (
        <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-4 duration-200 z-50 w-72">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Frequentes</h4>
            <div className="grid grid-cols-5 gap-2">
                {commonEmojis.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-90"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-400 text-center font-medium italic">Seletor completo em breve...</p>
            </div>
        </div>
    );
}
