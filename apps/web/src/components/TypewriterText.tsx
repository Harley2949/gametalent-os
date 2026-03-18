'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  cursorClassName?: string;
  showCursor?: boolean;
}

/**
 * 打字机文本组件
 *
 * 逐字显示文本，配合光标闪烁效果
 *
 * @param text - 要显示的文本
 * @param speed - 打字速度（毫秒/字符），默认 70ms
 * @param className - 文本容器的类名
 * @param cursorClassName - 光标的类名
 * @param showCursor - 是否显示光标，默认 true
 *
 * @example
 * <TypewriterText text="Hello World" speed={100} />
 */
export function TypewriterText({
  text,
  speed = 70,
  className = '',
  cursorClassName = '',
  showCursor = true,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    let timeoutId: NodeJS.Timeout;

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
        timeoutId = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
      }
    };

    // 开始打字
    timeoutId = setTimeout(typeNextChar, speed);

    // 清理函数
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text, speed]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span
          className={`inline-block w-0.5 h-1 bg-violet-600 ml-1 align-middle ${cursorClassName} ${
            isTyping ? 'animate-cursor-blink' : 'opacity-0'
          }`}
        />
      )}
    </span>
  );
}

/**
 * 完整的打字机标题组件
 * 专用于登录页面的"MiAO AI Native"标题
 */
export function TypewriterTitle() {
  return (
    <h1 className="text-7xl font-black leading-tight text-slate-900">
      <TypewriterText
        text="MiAO AI Native"
        speed={70}
        className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-flow"
        cursorClassName="bg-violet-600"
      />
    </h1>
  );
}
