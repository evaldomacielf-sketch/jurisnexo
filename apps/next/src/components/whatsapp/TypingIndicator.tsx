'use client';

export function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">digitando</span>
            <div className="flex gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
        </div>
    );
}
