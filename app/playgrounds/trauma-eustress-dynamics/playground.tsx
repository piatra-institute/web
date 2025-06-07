'use client';

import { useState, useCallback, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
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

    const randomizeParameters = useCallback(() => {
        // Randomize constriction level
        setConstriction(Math.random() * 0.8 + 0.1); // 0.1 to 0.9
        
        // Randomize mechanism weights
        setMechanisms(prev => prev.map(mechanism => ({
            ...mechanism,
            weight: Math.random() * 2 + 0.1 // 0.1 to 2.1
        })));
    }, []);

    const handleAnimationUpdate = useCallback((newConstriction: number, newDirection: number) => {
        setConstriction(newConstriction);
        animationRef.current.targetConstriction = newConstriction;
        animationRef.current.direction = newDirection;
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer
                    controls={
                        <Button
                            label="Randomize"
                            onClick={randomizeParameters}
                            variant="highlight"
                        />
                    }
                >
                    <div className="w-full h-[600px] bg-black overflow-hidden">
                        <Viewer
                            constriction={constriction}
                            mechanisms={mechanisms}
                            isPlaying={isPlaying}
                            animationRef={animationRef}
                            onAnimationUpdate={handleAnimationUpdate}
                        />
                    </div>
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <>
                    <p>
                        This visualization explores how individuals respond to trauma through
                        different psychological and physiological mechanisms. The model
                        distinguishes between constriction (defensive narrowing) and expansion
                        (growth-oriented opening) as fundamental response patterns.
                    </p>
                    <p>
                        Four key mechanisms shape post-trauma trajectories: resilience
                        (maintaining stability), recovery (returning to baseline), chronic
                        narrowing (persistent constriction), and post-traumatic growth
                        (expansion beyond previous functioning levels).
                    </p>
                    <p>
                        Key concepts include: trauma response patterns, resilience theory,
                        post-traumatic growth, stress adaptation, eustress versus distress,
                        and the dynamics of psychological constriction and expansion.
                    </p>
                </>
            ),
        },
    ];

    const settings = (
        <Settings
            constriction={constriction}
            mechanisms={mechanisms}
            isPlaying={isPlaying}
            onConstrictionChange={handleConstrictionChange}
            onMechanismChange={handleMechanismChange}
            onPlayPause={handlePlayPause}
        />
    );

    return (
        <PlaygroundLayout
            title="trauma-eustress dynamics"
            subtitle="explore how constriction and expansion influence post-trauma trajectories; observe resilience, recovery, and growth pathways"
            description={
                <a
                    href="https://psycnet.apa.org/record/2006-05098-001"
                    target="_blank"
                    className="underline"
                >
                    2006, Tedeschi & Calhoun, The Foundations of Posttraumatic Growth
                </a>
            }
            sections={sections}
            settings={settings}
        />
    );
}