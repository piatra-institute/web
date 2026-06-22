'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import AssumptionPanel from '@/components/AssumptionPanel';
import CalibrationPanel from '@/components/CalibrationPanel';
import VersionSelector from '@/components/VersionSelector';
import ModelChangelog from '@/components/ModelChangelog';
import Equation from '@/components/Equation';

import Board from './components/Board';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


export default function FracqunxPlayground() {
    const calibration = buildCalibration();

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
                        Drop beads through a lattice of pegs to watch how individual random events
                        combine into a predictable statistical pattern.
                    </p>
                </div>
            ),
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <div className="relative w-full h-full">
                        <Board toggleTitle={() => {}} />
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
                        <h3 className="text-lime-400 font-semibold mb-3">From random bounces to a bell curve</h3>
                        <p className="leading-relaxed text-sm">
                            The fracqunx is a play on quincunx, the formal name for Francis Galton&apos;s bean machine.
                            A bead falling through n rows of pegs makes n independent left-or-right choices, so the bin
                            it lands in follows a binomial distribution. Drop enough beads and the histogram fills into a
                            bell curve: the central limit theorem made physical.
                        </p>
                        <div className="my-3">
                            <Equation
                                mode="block"
                                math="P(k) = \binom{n}{k} p^{k}(1-p)^{n-k} \;\xrightarrow{\;n\to\infty\;}\; \mathcal{N}\!\left(np,\; np(1-p)\right)"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Where this board departs from the ideal</h3>
                        <p className="leading-relaxed text-sm">
                            The clean binomial assumes identical, unbiased pegs and independent bounces. This board lets
                            you move pegs, bias them, and draw a target curve the pegs adapt toward, so it is a sandbox for
                            departures from the ideal quincunx as much as a demonstration of it. The calibration panel
                            checks the underlying probability model; the assumptions panel marks where the physical
                            simulation and the idealized process part ways.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-6">
                        <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="bin statistic" />

                    <AssumptionPanel assumptions={assumptions} />

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="fracqunx"
            subtitle="interactive Galton board: probability, the binomial, and the central limit theorem"
            sections={sections}
            researchUrl="/playgrounds/fracqunx/research"
        />
    );
}
