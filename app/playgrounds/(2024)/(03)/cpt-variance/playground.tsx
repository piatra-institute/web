'use client';

import { useState } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

export default function CptVariancePlayground() {
    // Individual symmetry violations
    const [chargeViolation, setChargeViolation] = useState(0.1);
    const [parityViolation, setParityViolation] = useState(0.2);
    const [timeViolation, setTimeViolation] = useState(0.05);
    const [cptViolation, setCptViolation] = useState(0.001);

    // Visualization toggles
    const [showIndividualTransforms, setShowIndividualTransforms] = useState(true);
    const [showCombinedTransforms, setShowCombinedTransforms] = useState(true);
    const [showKaonOscillations, setShowKaonOscillations] = useState(false);
    const [showMatterAntimatter, setShowMatterAntimatter] = useState(false);

    // Animation control
    const [animationSpeed, setAnimationSpeed] = useState(1.0);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Explore CPT symmetry and its violations in particle physics
                    </p>
                    <p className="text-gray-400">
                        Interactive visualization of charge conjugation (C), parity transformation (P),
                        and time reversal (T) symmetries. Observe how violations in these fundamental
                        symmetries affect particle interactions and the structure of physical reality.
                    </p>
                </div>
            ),
        },
        {
            id: 'symmetry',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        chargeViolation={chargeViolation}
                        parityViolation={parityViolation}
                        timeViolation={timeViolation}
                        cptViolation={cptViolation}
                        showIndividualTransforms={showIndividualTransforms}
                        showCombinedTransforms={showCombinedTransforms}
                        showKaonOscillations={showKaonOscillations}
                        showMatterAntimatter={showMatterAntimatter}
                        animationSpeed={animationSpeed}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <p>
                        The CPT theorem is one of the most fundamental principles in particle physics,
                        stating that all physical processes remain invariant under the combined
                        operation of charge conjugation (C), parity inversion (P), and time reversal (T).
                        This theorem emerges from the structure of quantum field theory and special relativity.
                    </p>
                    <p>
                        While individual C, P, and T symmetries can be violated (as observed in weak
                        interactions and CP violation in kaon decay), the combined CPT symmetry
                        has never been observed to break. Any violation would have profound implications
                        for our understanding of spacetime and matter-antimatter asymmetry.
                    </p>
                    <p>
                        This visualization explores these symmetries and their hypothetical violations,
                        showing how they might manifest in particle interactions, Feynman diagram
                        transformations, and the cosmic matter-antimatter imbalance that led to our
                        matter-dominated universe.
                    </p>
                    <p>
                        Key concepts: discrete symmetries, quantum field theory, kaon oscillations,
                        CP violation, baryogenesis, and tests of fundamental physics principles.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            chargeViolation={chargeViolation}
            setChargeViolation={setChargeViolation}
            parityViolation={parityViolation}
            setParityViolation={setParityViolation}
            timeViolation={timeViolation}
            setTimeViolation={setTimeViolation}
            cptViolation={cptViolation}
            setCptViolation={setCptViolation}
            showIndividualTransforms={showIndividualTransforms}
            setShowIndividualTransforms={setShowIndividualTransforms}
            showCombinedTransforms={showCombinedTransforms}
            setShowCombinedTransforms={setShowCombinedTransforms}
            showKaonOscillations={showKaonOscillations}
            setShowKaonOscillations={setShowKaonOscillations}
            showMatterAntimatter={showMatterAntimatter}
            setShowMatterAntimatter={setShowMatterAntimatter}
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
        />
    );

    return (
        <PlaygroundLayout
            title="CPT Variance"
            subtitle="Discrete Symmetries in Particle Physics"
            sections={sections}
            settings={settings}
        />
    );
}
