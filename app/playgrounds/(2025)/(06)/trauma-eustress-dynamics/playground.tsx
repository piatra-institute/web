'use client';

import { useState, useCallback, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { defaultMechanisms } from './logic';
import type { MechanismData } from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

export type { MechanismData } from './logic';

const calibration = buildCalibration();

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
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What the model does</h3>
                        <p className="leading-relaxed text-sm">
                            This visualization explores how individuals respond to a stressful event
                            through different psychological and physiological mechanisms. The model
                            distinguishes between constriction (defensive narrowing) and expansion
                            (growth-oriented opening) as the two poles of a single bandwidth axis. A
                            constriction value above zero reads as distress; below zero reads as
                            eustress, the activating good stress that widens rather than narrows
                            attentional and behavioural bandwidth.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The four trajectories</h3>
                        <p className="leading-relaxed text-sm">
                            Four post-event paths branch from the event node: resilience (minimal
                            disturbance, holding near baseline), recovery (a delayed rebound that
                            first dips below baseline and returns), chronic narrowing (persistent
                            constriction), and post-traumatic growth (expansion beyond previous
                            functioning). Each trajectory&apos;s vertical position is a weighted sum of
                            four mechanism contributions, scaled by the slider weights, added to a
                            baseline offset set by the constriction value.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">How to read it honestly</h3>
                        <div className="border-l-2 border-lime-500/40 pl-4">
                            <p className="text-lime-200/80 mb-2">
                                This is a transparent linear sandbox, not a validated clinical
                                predictor. It encodes the sign and rough magnitude of well-attested
                                effects (threat appraisal and rumination push toward chronic
                                narrowing; social support and neuro-flexibility push away from it),
                                but the exact coefficients are illustrative. The calibration panel
                                below verifies only what is genuinely verifiable: that the model
                                reproduces its own stated bandwidth values and threshold structure.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-lime-500/20 pt-8">
                        <VersionSelector versions={versions} active="claude-v1" />
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="bandwidth (narrowing +, expansion -)" />

                    <AssumptionPanel assumptions={assumptions} />

                    <ModelChangelog entries={changelog} />
                </div>
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
            researchUrl="/playgrounds/trauma-eustress-dynamics/research"
        />
    );
}
