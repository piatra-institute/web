'use client';

import {
    useRef,
    useState,
    useEffect,
    ReactNode,
} from 'react';

import {
    settingsIcon,
    closeIcon,
} from '@/data/icons';

import {
    focusStyle,
} from '@/data/styles';

import {
    defocus,
} from '@/logic/utilities';

import Header from '@/components/Header';


export interface PlaygroundSection {
    id: string;
    type: 'intro' | 'canvas' | 'outro';
    content?: ReactNode;
    className?: string;
}

export interface PlaygroundLayoutProps {
    title: string;
    subtitle?: string;
    description?: ReactNode;
    sections: PlaygroundSection[];
    settings?: ReactNode;
    onSettingsToggle?: (isOpen: boolean) => void;
    className?: string;
}

export default function PlaygroundLayout({
    title,
    subtitle,
    description,
    sections,
    settings,
    onSettingsToggle,
    className = '',
}: PlaygroundLayoutProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [currentSection, setCurrentSection] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSettingsToggle = () => {
        const newState = !showSettings;
        setShowSettings(newState);
        onSettingsToggle?.(newState);
        defocus();
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Close settings with Escape
            if (e.key === 'Escape' && showSettings) {
                setShowSettings(false);
                onSettingsToggle?.(false);
            }

            // Toggle settings with 's' key (not when typing in inputs)
            if (e.key === 's' &&
                !e.ctrlKey && !e.metaKey && !e.altKey &&
                e.target instanceof Element &&
                !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                e.preventDefault();
                const newState = !showSettings;
                setShowSettings(newState);
                onSettingsToggle?.(newState);
                defocus();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showSettings, onSettingsToggle]);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;

            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const sectionIndex = Math.floor(scrollPosition / windowHeight);

            if (sectionIndex !== currentSection && sectionIndex < sections.length) {
                setCurrentSection(sectionIndex);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentSection, sections.length]);

    const renderSection = (section: PlaygroundSection, index: number) => {
        const baseClassName = 'relative w-full min-h-screen flex items-center justify-center';
        const sectionClassName = `${baseClassName} ${section.className || ''}`;

        switch (section.type) {
            case 'intro':
                return (
                    <section
                        key={section.id}
                        id={section.id}
                        className={sectionClassName}
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <div className="absolute inset-0 bg-black" />
                        <div className="relative z-10 text-center px-8 py-16">
                            <div className="mb-12">
                                <Header />
                            </div>
                            <div className="mb-8 flex flex-col items-center justify-center max-w-4xl mx-auto">
                                <h1 className="font-serif text-xl font-normal tracking-wide uppercase mb-8">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <div className="font-serif max-w-[600px] text-base leading-relaxed mb-6">
                                        {subtitle}
                                    </div>
                                )}
                                {description && (
                                    <div className="font-serif text-sm leading-relaxed">
                                        based on {description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:text-white transition-colors cursor-pointer"
                            onClick={() => {
                                const canvasSection = sections.find(s => s.type === 'canvas');
                                if (canvasSection) {
                                    document.getElementById(canvasSection.id)?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            aria-label="Go to playground"
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
                                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                        </button>
                    </section>
                );

            case 'canvas':
                return (
                    <section
                        key={section.id}
                        id={section.id}
                        className={`${sectionClassName} bg-black`}
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        {settings && !showSettings && (
                            <button
                                onClick={handleSettingsToggle}
                                className={`fixed z-30 top-1/2 left-4 transform -translate-y-1/2 p-2 ${focusStyle}`}
                                aria-label="Open Settings"
                            >
                                {settingsIcon}
                            </button>
                        )}
                        {section.content}
                    </section>
                );

            case 'outro':
                return (
                    <section
                        key={section.id}
                        id={section.id}
                        className={sectionClassName}
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <div className="absolute inset-0 bg-black" />
                        <div className="relative z-10 px-8 max-w-4xl text-center">
                            <div className="text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                                {section.content}
                            </div>
                        </div>
                    </section>
                );

            default:
                return null;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            style={{ scrollSnapType: 'y mandatory' }}
        >
            {sections.map((section, index) => renderSection(section, index))}

            {settings && showSettings && (
                <div className="fixed z-40 top-0 right-0 md:right-auto left-0 bottom-0 w-full md:w-[550px] backdrop-blur-md bg-white/20 overflow-y-auto">
                    <div className="p-4">
                        <button
                            className={`fixed z-50 top-3 left-2 p-2 text-white cursor-pointer font-bold text-xl ${focusStyle}`}
                            onClick={handleSettingsToggle}
                            aria-label="Close Settings"
                        >
                            {closeIcon}
                        </button>
                        <div className="mt-12">
                            {settings}
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-4 right-4 z-20 flex space-x-2">
                {sections.map((section, index) => (
                    <button
                        key={section.id}
                        onClick={() => {
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${currentSection === index ? 'bg-white w-8' : 'bg-white/40'
                            }`}
                        aria-label={`Go to section ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

