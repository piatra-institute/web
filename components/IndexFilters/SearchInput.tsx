'use client';

import React from 'react';


interface SearchInputProps {
    value: string;
    onChange: (next: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
    return (
        <div className="relative w-full">
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') onChange('');
                }}
                placeholder="search"
                aria-label="search"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full px-3 py-1.5 pr-9 text-sm border border-lime-500/30 text-lime-100 appearance-none focus:border-lime-500 focus:outline-none transition-colors [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                style={{ backgroundColor: '#000' }}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-lime-200/60 hover:text-lime-400 text-base leading-none cursor-pointer focus:outline-none focus-visible:outline-1 focus-visible:outline-lime-500"
                >
                    ×
                </button>
            )}
        </div>
    );
}
