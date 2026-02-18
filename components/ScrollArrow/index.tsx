'use client';

import { useState, useEffect } from 'react';


export interface ScrollArrowProps {
    targetId?: string;
    onClick?: () => void;
    label?: string;
}

export default function ScrollArrow({
    targetId,
    onClick,
    label = 'Scroll down',
}: ScrollArrowProps) {
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 50) {
                setHasScrolled(true);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (targetId) {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <button
            className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 hover:text-white transition-colors cursor-pointer ${
                hasScrolled ? '' : 'animate-bounce'
            }`}
            onClick={handleClick}
            aria-label={label}
        >
            <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </button>
    );
}
