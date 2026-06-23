'use client';

import { useState, useEffect } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';
import Settings from '@/app/playgrounds/(2025)/(04)/raupian-morphospace/components/Settings';
import Viewer from '@/app/playgrounds/(2025)/(04)/raupian-morphospace/components/Viewer';

import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



const defaultValues = {
    W: 1.4,
    D: 0.4,
    T: 0.6,
    autoRotate: false,
};

export default function RaupianMorphospacePlayground() {
    const [W, setW] = useState(defaultValues.W);     // Whorl expansion rate
    const [D, setD] = useState(defaultValues.D);     // Distance from coiling axis / Aperture radius
    const [T, setT] = useState(defaultValues.T);     // Translation rate along the coiling axis
    const [autoRotate, setAutoRotate] = useState(true);

    const calibration = buildCalibration();

    const reset = () => {
        setW(defaultValues.W);
        setD(defaultValues.D);
        setT(defaultValues.T);

        setAutoRotate(defaultValues.autoRotate);
    };

    useEffect(() => {
        setTimeout(() => {
            setAutoRotate(false);
        }, 5_000);
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'morphospace',
            type: 'canvas' as const,
            content: (
                <div className="absolute inset-0">
                    <Viewer
                        W={W}
                        D={D}
                        T={T}
                        autoRotate={autoRotate}
                        setW={setW}
                        setD={setD}
                        setT={setT}
                    />
                </div>
            ),
        },
        {
            id: 'about',
            type: 'outro' as const,
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Three numbers for a shell</h3>
                        <p className="leading-relaxed text-sm">
                            David M. Raup&apos;s model reduced the variety of mollusc shells to three geometric
                            parameters: the whorl expansion rate (W), the distance from the coiling axis (D), and the
                            translation rate along the axis (T). A shell grows by accretion along a logarithmic spiral,
                            and these three numbers fix the sweep.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Theoretical versus realized form</h3>
                        <p className="leading-relaxed text-sm">
                            Most of the W-D-T cube corresponds to shells that never evolved. Real shells cluster in a
                            few regions, leaving vast volumes of geometrically possible but biologically unseen forms.
                            That gap between the possible and the realized is the point: the empty space maps the
                            functional and developmental constraints that shape biological form.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-6">
                        <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="geometric ratio" />

                    <AssumptionPanel assumptions={assumptions} />

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            W={W}
            setW={setW}
            D={D}
            setD={setD}
            T={T}
            setT={setT}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            reset={reset}
        />
    );

    return (
        <PlaygroundLayout
            title="raupian morphospace"
            subtitle="visualizing theoretical shell morphology using david m. raup's three-parameter model; navigate forms with arrows and shift"
            description={
                <a
                    href="https://www.jstor.org/stable/1301992"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                >
                    1966, Raup, Geometric Analysis of Shell Coiling
                </a>
            }
            sections={sections}
            settings={settings}
            researchUrl="/playgrounds/raupian-morphospace/research"
        />
    );
}
