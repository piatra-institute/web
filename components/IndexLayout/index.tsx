'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';


import Header from '@/components/Header';
import Title from '@/components/Title';
import ScrollArrow from '@/components/ScrollArrow';


const SECTIONS = ['intro', 'content'] as const;

interface IndexLayoutProps {
    title: string;
    description?: ReactNode;
    children: ReactNode;
}

export default function IndexLayout({
    title,
    description,
    children,
}: IndexLayoutProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentSection, setCurrentSection] = useState(0);
    // Track current section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const sectionIndex = Math.floor(scrollPosition / windowHeight);

            if (sectionIndex !== currentSection && sectionIndex < SECTIONS.length) {
                setCurrentSection(sectionIndex);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentSection]);

    const scrollToSection = (index: number) => {
        const sectionId = SECTIONS[index];
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            ref={containerRef}
            className="relative select-none"
            style={{ scrollSnapType: 'y mandatory' }}
        >
            {/* Section 1: Intro with logo */}
            <section
                id="intro"
                className="relative w-full min-h-screen flex items-center justify-center"
                style={{ scrollSnapAlign: 'start' }}
            >
                <div className="absolute inset-0 bg-black" />
                <div className="relative z-10 text-center px-8 py-16">
                    <div className="mb-12">
                        <Header />
                    </div>
                    <div className="mb-8 flex flex-col items-center justify-center max-w-4xl mx-auto">
                        <Title text={title} />
                        {description && (
                            <div className="max-w-150 text-center mt-4">
                                {description}
                            </div>
                        )}
                    </div>
                </div>
                <ScrollArrow
                    onClick={() => scrollToSection(1)}
                    label={`Go to ${title}`}
                />
            </section>

            {/* Section 2: Content */}
            <section
                id="content"
                className="relative w-full min-h-screen flex flex-col items-center justify-start pt-16"
                style={{ scrollSnapAlign: 'start' }}
            >
                <div className="absolute inset-0 bg-black" />
                <div className="relative z-10 w-full flex flex-col items-center">
                    {children}
                </div>
            </section>

            {/* Navigation dots */}
            <div className="fixed bottom-4 right-4 z-20 flex space-x-2">
                {SECTIONS.map((section, index) => (
                    <button
                        key={section}
                        onClick={() => scrollToSection(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            currentSection === index ? 'bg-white w-8' : 'bg-white/40'
                        }`}
                        aria-label={`Go to ${section} section`}
                    />
                ))}
            </div>
        </div>
    );
}
