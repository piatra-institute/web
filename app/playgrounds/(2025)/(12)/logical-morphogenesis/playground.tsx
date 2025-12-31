'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import Equation from '@/components/Equation';
import {
    Sentence,
    SimulationParams,
    PresetId,
    DEFAULT_PARAMS,
    getSentencesForPreset,
    simulate,
} from './constants';

export default function Playground() {
    const [sentences, setSentences] = useState<Sentence[]>(getSentencesForPreset('basic'));
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [selectedPresetId, setSelectedPresetId] = useState<PresetId>('basic');
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const simulationResult = useMemo(
        () => simulate(sentences, params),
        [sentences, params]
    );

    const maxStep = simulationResult.history.length - 1;

    // Playback controls
    const play = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const stepForward = useCallback(() => {
        setCurrentStep((s) => Math.min(s + 1, maxStep));
    }, [maxStep]);

    const stepBackward = useCallback(() => {
        setCurrentStep((s) => Math.max(s - 1, 0));
    }, []);

    const reset = useCallback(() => {
        setCurrentStep(0);
        setIsPlaying(false);
    }, []);

    // Play animation
    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = setInterval(() => {
                setCurrentStep((s) => {
                    if (s >= maxStep) {
                        setIsPlaying(false);
                        return s;
                    }
                    return s + 1;
                });
            }, 100);
        } else {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
                playIntervalRef.current = null;
            }
        }
        return () => {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
            }
        };
    }, [isPlaying, maxStep]);

    // Reset step when simulation changes
    useEffect(() => {
        setCurrentStep(0);
        setIsPlaying(false);
    }, [sentences, params]);

    const handleParamsChange = (newParams: SimulationParams) => {
        setParams(newParams);
    };

    const handlePresetChange = (id: PresetId) => {
        setSelectedPresetId(id);
        if (id !== 'custom') {
            setSentences(getSentencesForPreset(id));
        }
    };

    const handleSentencesChange = (newSentences: Sentence[]) => {
        setSentences(newSentences);
        if (selectedPresetId !== 'custom') {
            setSelectedPresetId('custom');
        }
    };

    const handleReset = () => {
        setParams(DEFAULT_PARAMS);
        setSentences(getSentencesForPreset('basic'));
        setSelectedPresetId('basic');
    };

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="absolute inset-0">
                    <Viewer
                        sentences={sentences}
                        simulationResult={simulationResult}
                        currentStep={currentStep}
                        isPlaying={isPlaying}
                        onPlay={play}
                        onPause={pause}
                        onStepForward={stepForward}
                        onStepBackward={stepBackward}
                        onReset={reset}
                        onStepChange={setCurrentStep}
                        maxStep={maxStep}
                    />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Patrick Grim&apos;s Resolution</h4>
                        <p className="text-gray-300">
                            The classical liar paradox (&quot;This sentence is false&quot;) creates logical
                            contradiction. Patrick Grim proposed resolving it through <em>time semantics</em>:
                            evaluate each sentence at time{' '}
                            <Equation math="t" />
                            {' '}using truth values from time{' '}
                            <Equation math="t-1" />
                            . The liar becomes a stable oscillator:{' '}
                            <Equation math="\text{True} \to \text{False} \to \text{True} \to \ldots" />
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Sentence Types</h4>
                        <p className="text-gray-300">
                            <strong>Liar:</strong> &quot;This sentence is false.&quot; Oscillates with period 2.{' '}
                            <strong>Truth-teller:</strong> &quot;This sentence is true.&quot; Preserves initial value (fixed point).{' '}
                            <strong>Reference:</strong> &quot;X is true/false&quot; follows or negates another sentence.{' '}
                            <strong>Conditional:</strong>{' '}
                            <Equation math="X \to \text{Self}" />
                            {' '}or{' '}
                            <Equation math="\text{Self} \leftrightarrow X" />
                            {' '}creates logical dependencies.{' '}
                            <strong>Percent:</strong> Controllers that steer their sliding-window truth-average toward a target.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Emergent Dynamics</h4>
                        <p className="text-gray-300">
                            When sentences reference each other, complex patterns emerge. Mutual negation
                            (&quot;A says B is false, B says A is false&quot;) produces synchronized oscillation.
                            Ring structures create waves propagating through the network. Percent-controllers
                            generate rhythmic patterns as they balance toward their targets. These dynamics
                            mirror regulatory networks in biology.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Cycle Detection</h4>
                        <p className="text-gray-300">
                            Since each sentence takes boolean values, the system state is a binary vector.
                            With{' '}
                            <Equation math="n" />
                            {' '}sentences, there are{' '}
                            <Equation math="2^n" />
                            {' '}possible states. By the pigeonhole principle, the dynamics must eventually
                            cycle. The <em>attractor period</em> tells us the fundamental rhythm of the
                            truth-value dynamics.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">The Morphogenesis Analogy</h4>
                        <p className="text-gray-300">
                            Just as gene regulatory networks produce spatial patterns in embryonic development,
                            these sentence networks produce <em>temporal</em> patterns in truth-space. The
                            timeline grid resembles a kymograph of developmental waves. This view into the
                            &quot;latent space&quot; of logic reveals how structure emerges from self-reference—a
                            morphogenesis of meaning itself.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Metrics</h4>
                        <p className="text-gray-300">
                            <strong>Mean truth:</strong> Fraction of time the sentence is true (after burn-in).{' '}
                            <strong>Flip rate:</strong> Frequency of truth-value changes.{' '}
                            <strong>Entropy proxy:</strong>{' '}
                            <Equation math="4 \cdot \bar{p} \cdot (1-\bar{p})" />
                            {' '}measures variability (peaks at{' '}
                            <Equation math="\bar{p}=0.5" />
                            ).
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="logical morphogenesis"
            subtitle="truth-value rhythms from self-referential sentences"
            description={
                <a
                    href="https://doi.org/10.1016/0097-8493(93)90013-Y"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    1993, Grim et al., Self-reference and paradox in two and three dimensions
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    sentences={sentences}
                    params={params}
                    selectedPresetId={selectedPresetId}
                    simulationResult={simulationResult}
                    onSentencesChange={handleSentencesChange}
                    onParamsChange={handleParamsChange}
                    onPresetChange={handlePresetChange}
                    onReset={handleReset}
                />
            }
        />
    );
}
