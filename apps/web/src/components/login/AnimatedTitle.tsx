'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedTitleProps {
  text: string;
  typingSpeed?: number;
  onComplete?: () => void;
}

export function AnimatedTitle({ text, typingSpeed = 100, onComplete }: AnimatedTitleProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [text, typingSpeed, onComplete]);

  return (
    <h1
      className={`
        text-6xl md:text-7xl font-bold
        bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600
        bg-[length:200%_auto]
        bg-clip-text text-transparent
        animate-gradient-flow
        transition-all duration-300
        ${isComplete ? 'hover:scale-105 hover:drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] cursor-pointer' : ''}
      `}
    >
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-1em bg-blue-600 ml-1 animate-pulse align-middle"></span>
      )}
    </h1>
  );
}
