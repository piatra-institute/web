'use client';

import React, { useCallback, useMemo, useState } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import Equation from '@/components/Equation';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    DEFAULT_PARAMS,
    PRESET_DESCRIPTIONS,
    Params,
    PresetKey,
    Snapshot,
    computeMetrics,
    computeNarrative,
    computeSweep,
    presetParams,
} from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}


export default function AllometricScalingPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

    const metrics = useMemo(() => computeMetrics(params), [params]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sweep = useMemo(() => computeSweep(params.coefficient), [params.coefficient]);
    const calibration = useMemo(() => buildCalibration(), []);

    const onPreset = useCallback((key: PresetKey) => setParams(presetParams(key)), []);
    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, label: PRESET_DESCRIPTIONS[params.preset].label });
    }, [params, metrics]);
    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        metrics={metrics}
                        sweep={sweep}
                        calibration={calibration}
                        assumptions={assumptions}
                        versions={versions}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">A line whose slope is a law</h3>
                        <p className="leading-relaxed text-sm">
                            Plot resting metabolic rate against body mass for animals spanning a mouse to an elephant, put both
                            axes on a logarithmic scale, and the cloud of points collapses onto a near-straight line. The slope of
                            that line is the scaling exponent. Max Kleiber measured it in 1932 and found it close to three quarters,
                            not the two thirds a surface-to-volume argument predicts.
                        </p>
                        <div className="my-3">
                            <Equation mode="block" math="B = B_0\,M^{3/4}" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why the exponent is contested</h3>
                        <p className="leading-relaxed text-sm">
                            West, Brown and Enquist derived three quarters from the geometry of space-filling networks that deliver
                            resources to cells. Critics reply that real datasets do not pin a single universal exponent, and that
                            two thirds fits some groups better. The sweep view makes the empirical part concrete: the error minimum
                            sits closer to 3/4 than to 2/3, but it is a broad valley, not a sharp spike. The robust claim is the
                            steeper-than-2/3 slope; the exact value and its mechanism are where the debate lives.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <p className="text-lime-200/80 text-sm">
                            The calibration panel is honest about scope: predicted rates come from the three-quarter law applied to
                            each animal&apos;s mass, and they land within a few tens of percent of the measured values, not exactly
                            on them.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>

                    {sourceContext && (
                        <div className="border-t border-lime-500/20 pt-8">
                            <ResearchPromptButton context={sourceContext} />
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="allometric scaling"
            subtitle="metabolic rate, body mass, and the three-quarter-power law"
            description={
                <a
                    href="https://doi.org/10.1126/science.276.5309.122"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    West, Brown and Enquist, A general model for the origin of allometric scaling laws (1997)
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                    onPreset={onPreset}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
            researchUrl="/playgrounds/allometric-scaling/research"
        />
    );
}
