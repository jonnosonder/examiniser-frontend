// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ReactNode,
} from 'react';

interface HoverExplainButtonProps {
  icon: ReactNode;
  explanation: string;
  onClick?: () => void;
}

const HoverExplainButton = forwardRef<HTMLButtonElement, HoverExplainButtonProps>(
  ({ icon, explanation, onClick }, ref) => {
    const [showText, setShowText] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    // Expose the button's DOM node to parent via ref
    useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

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
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex cursor-pointer w-10 h-10 items-center justify-center p-1"
          aria-label={explanation}
        >
          {icon}
        </button>
        {showText && (
          <div className="absolute shadow border border-primary bg-background rounded-lg z-10">
            <p className="flex text-primary p-1 text-xs md:text-sm whitespace-nowrap">{explanation}</p>
          </div>
        )}
      </div>
    );
  }
);

HoverExplainButton.displayName = 'HoverExplainButton';
export default HoverExplainButton;
