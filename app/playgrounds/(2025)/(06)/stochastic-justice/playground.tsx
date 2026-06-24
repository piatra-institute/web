'use client';

import React, { useState, useCallback, useRef } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import Button from '@/components/Button';
import Input from '@/components/Input';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Viewer from './components/Viewer';
import { calculateMetrics, CorruptionType, getQualitativeAssessment, getZoneDescription } from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



const DEFAULT_CORRUPTION = 0.5;
const DEFAULT_RANDOMNESS = 0.5;

const PRESETS = [
    { name: 'Ideal Fair', corruption: 0.1, randomness: 0.9 },
    { name: 'Corrupt Deterministic', corruption: 0.9, randomness: 0.1 },
    { name: 'Random Justice', corruption: 0.5, randomness: 0.8 },
    { name: 'Moderate System', corruption: 0.3, randomness: 0.4 },
    { name: 'Pure Random', corruption: 0.5, randomness: 1.0 },
];

export default function StochasticJusticePlayground() {
    const [corruption, setCorruption] = useState(DEFAULT_CORRUPTION);
    const [randomness, setRandomness] = useState(DEFAULT_RANDOMNESS);
    const [showAbout, setShowAbout] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [corruptionType, setCorruptionType] = useState<CorruptionType>(CorruptionType.DIRECTIONAL);

    const viewerRef = useRef<{ exportImage: () => void }>(null);

    const metrics = calculateMetrics(corruption, randomness, corruptionType);
    const calibration = buildCalibration();

    const handleReset = useCallback(() => {
        setCorruption(DEFAULT_CORRUPTION);
        setRandomness(DEFAULT_RANDOMNESS);
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportImage();
    }, []);

    const handleMarkerDrag = useCallback((c: number, r: number) => {
        setCorruption(c);
        setRandomness(r);
    }, []);

    const animateToValues = useCallback((targetC: number, targetR: number, duration: number = 800) => {
        setIsAnimating(true);
        const startC = corruption;
        const startR = randomness;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            const easedProgress = easeOutCubic(progress);

            const currentC = startC + (targetC - startC) * easedProgress;
            const currentR = startR + (targetR - startR) * easedProgress;

            setCorruption(currentC);
            setRandomness(currentR);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        requestAnimationFrame(animate);
    }, [corruption, randomness]);

    const handlePresetSelect = useCallback((preset: typeof PRESETS[0]) => {
        animateToValues(preset.corruption, preset.randomness);
    }, [animateToValues]);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="w-full h-[600px]">
                        <Viewer
                            ref={viewerRef}
                            corruption={corruption}
                            randomness={randomness}
                            corruptionType={corruptionType}
                            onMarkerDrag={handleMarkerDrag}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The argument and the demonstration</h3>
                        <p className="leading-relaxed text-sm">
                            Stochastic Justice asks whether deliberate randomness can make an institution fairer
                            than a deterministic rule that is open to capture. The substantive idea, allocation by
                            lottery as a defence against bias, is a real and defended position in political theory.
                            The demonstration here is more modest than it looks, and the assumptions below keep the
                            two apart.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What the model actually does</h3>
                        <p className="leading-relaxed text-sm">
                            Each decision becomes a binary outcome distribution, scored against the uniform ideal by
                            Shannon entropy, KL divergence, total variation, Jensen-Shannon divergence, and
                            demographic parity. Three corruption types (directional bias, increased variance,
                            systematic error) respond differently as the randomness dial blends the biased
                            distribution toward uniform.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <p className="text-lime-200/80 mb-2">
                            For directional corruption the observed distribution is a convex blend
                            preservation * biased + (1 - preservation) * uniform with preservation = exp(-2R).
                            Increasing randomness must move the distribution toward uniform, so the headline
                            result is built into the formula rather than discovered.
                        </p>
                    </div>

                    <div>
                        <VersionSelector versions={versions} active="claude-v1" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                        <CalibrationPanel results={calibration} outputLabel="information-theory value" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                        <AssumptionPanel assumptions={assumptions} />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    const qualitativeAssessment = getQualitativeAssessment(metrics.H_fair);
    const { zone, interpretation } = getZoneDescription(metrics.C, metrics.R, metrics.H_fair);

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Controls',
                    content: (
                        <>
                            <Input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={corruption}
                                onChange={(value) => setCorruption(parseFloat(value))}
                                label={`Corruption (C): ${corruption.toFixed(2)}`}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-4">
                                0 = incorruptible, 1 = fully biased
                            </p>

                            <Input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={randomness}
                                onChange={(value) => setRandomness(parseFloat(value))}
                                label={`Randomness (R): ${randomness.toFixed(2)}`}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-4">
                                0 = fully deterministic, 1 = fully random
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Corruption Type
                                </label>
                                <select
                                    value={corruptionType}
                                    onChange={(e) => setCorruptionType(e.target.value as CorruptionType)}
                                    className="w-full px-3 py-2 text-xs bg-black text-gray-200 border border-gray-600 rounded focus:outline-none focus:border-gray-500"
                                >
                                    <option value={CorruptionType.DIRECTIONAL}>Directional Bias</option>
                                    <option value={CorruptionType.VARIANCE}>Increased Variance</option>
                                    <option value={CorruptionType.SYSTEMATIC}>Systematic Error</option>
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {corruptionType === CorruptionType.DIRECTIONAL && "Systematic bias toward specific outcomes"}
                                    {corruptionType === CorruptionType.VARIANCE && "Increased unpredictability in decisions"}
                                    {corruptionType === CorruptionType.SYSTEMATIC && "Institutional incompetence and errors"}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button label="Reset" onClick={handleReset} className="flex-1" />
                                <Button label="Export" onClick={handleExport} className="flex-1" />
                            </div>
                        </>
                    ),
                },
                {
                    title: 'Presets',
                    content: (
                        <div className="space-y-2">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => handlePresetSelect(preset)}
                                    disabled={isAnimating}
                                    className="w-full px-3 py-2 text-xs bg-black hover:bg-gray-900 disabled:bg-gray-900 disabled:text-gray-500 text-left text-gray-200 rounded border border-gray-600 transition-colors duration-200"
                                    title={`C: ${preset.corruption}, R: ${preset.randomness}`}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    ),
                },
                {
                    title: 'Metrics',
                    content: (
                        <div className="space-y-3 text-xs">
                            <div>
                                <h4 className="font-medium text-gray-200 mb-1">Information Theory</h4>
                                <div className="space-y-1 text-gray-400">
                                    <p>Shannon Entropy: <span className="text-white">{metrics.H.toFixed(3)}</span> bits</p>
                                    <p>KL Divergence: <span className="text-white">{metrics.D.toFixed(3)}</span> bits</p>
                                    <p>Effective Fairness: <span className="text-white">{metrics.H_fair.toFixed(3)}</span> bits</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-200 mb-1">Core Fairness Metrics</h4>
                                <div className="space-y-1 text-gray-400">
                                    <p>Normalized Score: <span className="text-white">{metrics.normFairness.toFixed(3)}</span></p>
                                    <p>Bias Impact: <span className="text-white">{metrics.biasImpact.toFixed(3)}</span></p>
                                    <p>Quality: <span className="text-white">{qualitativeAssessment}</span></p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-200 mb-1">Advanced Metrics</h4>
                                <div className="space-y-1 text-gray-400">
                                    <p>Demographic Parity: <span className="text-white">{metrics.demographicParity.toFixed(3)}</span></p>
                                    <p>Total Variation: <span className="text-white">{metrics.totalVariation.toFixed(3)}</span></p>
                                    <p>Jensen-Shannon Div: <span className="text-white">{metrics.jensenShannonDivergence.toFixed(3)}</span></p>
                                    <p>Institutional Efficiency: <span className="text-white">{metrics.institutionalEfficiency.toFixed(3)}</span></p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-200 mb-1">Current Zone</h4>
                                <p className="text-gray-400 leading-tight">{interpretation}</p>
                            </div>
                        </div>
                    ),
                },
                {
                    title: 'Legend',
                    content: (
                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-200">Heatmap Colors</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3" style={{ backgroundColor: 'rgb(70, 150, 70)' }}></div>
                                    <span className="text-gray-400">High Fairness (H* &gt; 0.7)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3" style={{ backgroundColor: 'rgb(180, 180, 30)' }}></div>
                                    <span className="text-gray-400">Medium Fairness (0.3-0.7)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3" style={{ backgroundColor: 'rgb(180, 80, 30)' }}></div>
                                    <span className="text-gray-400">Low Fairness (H* &lt; 0.3)</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-200">Marker</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffd700', border: '1px solid black' }}></div>
                                    <span className="text-gray-400">Current selection - Draggable</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-200">Zones</h4>
                                <div className="space-y-1 text-gray-400">
                                    <p><span className="text-cyan-400">◼</span> Ideal Fair (Low C, High R)</p>
                                    <p><span className="text-orange-400">◼</span> Corrupt & Unfair (High C, Low R)</p>
                                    <p><span className="text-gray-500">◼</span> Random Justice (Mid C, Mid R)</p>
                                </div>
                            </div>
                        </div>
                    ),
                },
                {
                    title: 'About',
                    content: (
                        <div className="space-y-4 text-xs">
                            <div>
                                <h4 className="font-semibold text-white mb-2">Core Idea</h4>
                                <p className="text-gray-400">This playground models the complex relationship between institutional corruption, procedural randomness, and fairness using scientifically grounded information theory and decision science.</p>
                            </div>
                        </div>
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="stochastic justice"
            subtitle="exploring fairness through randomness in corrupt systems; drag marker to explore regimes where randomness counteracts corruption"
            sections={sections}
            settings={settings}
            researchUrl="/playgrounds/stochastic-justice/research"
        />
    );
}
