'use client';

import { useState, useRef, ReactNode } from 'react';

interface HoverExplainButtonProps {
  icon: ReactNode;
  explanation: string;
  onClick?: () => void;
}

export default function HoverExplainButton({
  icon,
  explanation,
  onClick,
}: HoverExplainButtonProps) {
  const [showText, setShowText] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowText(true);
    }, 800);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowText(false);
  };

  return (
    <div>
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='flex cursor-pointer w-10 h-10 items-center justify-center p-1'
        aria-label={explanation}
      >
        {icon}
      </button>
      {showText && (
        <div className='absolute border-2 border-primary bg-background rounded-lg '>
            <p className='text-primary p-1 text-xs md:text-sm'>{explanation}</p>
        </div>
      )}
    </div>
  );
}
