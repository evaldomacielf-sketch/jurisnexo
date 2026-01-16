import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex w-16 items-center gap-1 rounded-lg rounded-tl-none bg-white px-4 py-3 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
      </div>
    </div>
  );
}
