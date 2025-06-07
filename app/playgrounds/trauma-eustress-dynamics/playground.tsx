'use client';

import { useState, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Legend from './components/Legend';

export interface MechanismData {
    name: string;
    color: string;
    inf: {
        res: number;
        rec: number;
        chronic: number;
        growth: number;
    };
    weight: number;
}

const defaultMechanisms: MechanismData[] = [
    { name: 'Appraisal', color: '#ff5252', inf: { res: -0.10, rec: 0, chronic: 0.15, growth: -0.10 }, weight: 1 },
    { name: 'Rumination', color: '#ffb300', inf: { res: 0, rec: 0.08, chronic: 0.20, growth: 0 }, weight: 1 },
    { name: 'Social', color: '#64b5f6', inf: { res: -0.13, rec: -0.08, chronic: 0, growth: 0 }, weight: 1 },
    { name: 'NeuroFlex', color: '#4db6ac', inf: { res: 0, rec: 0, chronic: 0, growth: -0.18 }, weight: 1 }
];

export default function TraumaEustressDynamicsPlayground() {
    const [constriction, setConstriction] = useState(0.30);
    const [mechanisms, setMechanisms] = useState<MechanismData[]>(defaultMechanisms);
    const [isPlaying, setIsPlaying] = useState(false);
    const animationRef = useRef<{ direction: number; targetConstriction: number }>({
        direction: 1,
        targetConstriction: 0.30
    });

    const handleConstrictionChange = useCallback((value: number) => {
        setConstriction(value);
        animationRef.current.targetConstriction = value;
    }, []);

    const handleMechanismChange = useCallback((index: number, weight: number) => {
        setMechanisms(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], weight };
            return updated;
        });
    }, []);

    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleAnimationUpdate = useCallback((newConstriction: number, newDirection: number) => {
        setConstriction(newConstriction);
        animationRef.current.targetConstriction = newConstriction;
        animationRef.current.direction = newDirection;
    }, []);

    return (
        <div className="relative h-screen bg-black overflow-hidden">
            <div className="absolute inset-0">
                <Viewer
                    constriction={constriction}
                    mechanisms={mechanisms}
                    isPlaying={isPlaying}
                    animationRef={animationRef}
                    onAnimationUpdate={handleAnimationUpdate}
                />
            </div>

            <div className="absolute top-0 left-0 z-10 p-6">
                <Header />
                <Title text="Trauma-Eustress Dynamics" />
                <div className="mt-2 text-sm text-gray-400 text-center max-w-2xl">
                    Explore how constriction and expansion influence post-trauma trajectories
                    through resilience, recovery, chronic narrowing, and growth pathways.
                </div>
            </div>

            <Settings
                constriction={constriction}
                mechanisms={mechanisms}
                isPlaying={isPlaying}
                onConstrictionChange={handleConstrictionChange}
                onMechanismChange={handleMechanismChange}
                onPlayPause={handlePlayPause}
            />

            <Legend
                constriction={constriction}
                mechanisms={mechanisms}
            />
        </div>
    );
}