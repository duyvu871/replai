import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface TypewriterProps {
    text: string;
    speed?: number;
    className?: string;
    onComplete?: () => void;
    animate?: boolean;
}

export function Typewriter({ text, speed = 10, className, onComplete, animate = true }: TypewriterProps) {
    const [displayText, setDisplayText] = useState(animate ? '' : text);
    const [currentIndex, setCurrentIndex] = useState(animate ? 0 : text.length);

    useEffect(() => {
        if (!animate) {
            setDisplayText(text);
            setCurrentIndex(text.length);
            return;
        }

        // Reset if text changes while animate is true
        if (currentIndex > text.length || (currentIndex === text.length && displayText !== text)) {
            setDisplayText('');
            setCurrentIndex(0);
        }
    }, [text, animate]);

    useEffect(() => {
        if (!animate) return;

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                const nextIndex = Math.min(currentIndex + 3, text.length);
                setDisplayText(text.slice(0, nextIndex));
                setCurrentIndex(nextIndex);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete, animate]);

    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayText}
            </ReactMarkdown>
            {currentIndex < text.length && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
            )}
        </div>
    );
}
