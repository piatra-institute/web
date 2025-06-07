'use client';

import {
    useEffect,
    useState,
} from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';

import Board from './components/Board';



export default function FracqunxPlayground() {
    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Interactive Galton board exploring probability, statistics, and emergence
                    </p>
                    <p className="text-gray-400">
                        Drop beads through a lattice of pegs to observe how individual random 
                        events combine to create predictable statistical patterns and emergent 
                        distributions.
                    </p>
                </div>
            ),
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <div className="relative w-full h-full">
                    <Board toggleTitle={() => {}} />
                </div>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                        <p>
                            The Fracqunx (a play on &quot;quincunx,&quot; the formal name for a Galton board) 
                            demonstrates fundamental principles of probability and statistics through 
                            physical simulation. As beads fall through randomly positioned pegs, 
                            they follow the laws of chance at the microscopic level.
                        </p>
                        <p>
                            Despite the randomness of individual bead paths, the collective behavior 
                            creates predictable patterns - typically forming a bell curve or normal 
                            distribution. This emergent behavior illustrates the central limit theorem 
                            and shows how deterministic physical laws and random events interact.
                        </p>
                        <p>
                            Key concepts include: central limit theorem, normal distribution, 
                            emergent statistical behavior, probability visualization, and the 
                            relationship between microscopic randomness and macroscopic order.
                        </p>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="Fracqunx"
            subtitle="Interactive Galton Board Probability Explorer"
            sections={sections}
        />
    );
}
