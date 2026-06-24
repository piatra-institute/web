'use client';

import { useState } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';

export default function CptVariancePlayground() {
    const calibration = buildCalibration();

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
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The CPT theorem</h3>
                        <p className="leading-relaxed text-sm">
                            The CPT theorem is one of the most fundamental principles in particle physics,
                            stating that all physical processes remain invariant under the combined
                            operation of charge conjugation (C), parity inversion (P), and time reversal (T).
                            This result emerges from the structure of quantum field theory and special relativity,
                            so every local, Lorentz-invariant theory with a Hermitian Hamiltonian must respect it.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Individual breaking, combined protection</h3>
                        <p className="leading-relaxed text-sm">
                            Individual C, P, and the pair CP are all violated in the weak interaction, observed
                            in cobalt-60 beta decay and in neutral kaon decay. The combined CPT symmetry, however,
                            has never been observed to break. Any violation would overturn locality or Lorentz
                            invariance and would carry profound implications for spacetime and the
                            matter-antimatter asymmetry of the universe.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 mb-2">
                                In this toy, C, P, and T are exact involutions. CPT sends a particle to its
                                antiparticle with inverted position and unchanged momentum, and it preserves a
                                scalar invariant the calibration panel checks to zero error.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What the model captures</h3>
                        <p className="leading-relaxed text-sm">
                            The companion logic extracts the group-theoretic skeleton: the involution property of
                            each operator, the CPT composition law, a protected invariant, and the linear
                            matter-antimatter asymmetry that vanishes at exact CPT. The violation sliders are
                            illustrative controls with no direct empirical counterpart; the established physics is
                            kept apart from these toy dials in the assumptions below.
                        </p>
                    </div>

                    <VersionSelector versions={versions} active="claude-v1" />

                    <CalibrationPanel results={calibration} outputLabel="symmetry identity" />

                    <AssumptionPanel assumptions={assumptions} />

                    <ModelChangelog entries={changelog} />
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
            researchUrl="/playgrounds/cpt-variance/research"
        />
    );
}
