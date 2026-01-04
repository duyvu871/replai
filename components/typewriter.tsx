import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface TypewriterProps {
    text: string;
    speed?: number;
    className?: string;
    onComplete?: () => void;
}

export function Typewriter({ text, speed = 10, className, onComplete }: TypewriterProps) {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                // Type in chunks of 2-3 characters for a "faster" and more stable feeling
                const nextIndex = Math.min(currentIndex + 3, text.length);
                setDisplayText(text.slice(0, nextIndex));
                setCurrentIndex(nextIndex);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

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
