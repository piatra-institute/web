'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Viewer from './components/Viewer';
import Settings from './components/Settings';
import { baseData } from './logic';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



export default function Playground() {
    const [selectedAirport, setSelectedAirport] = useState('ATL');
    const [ramseyLambda, setRamseyLambda] = useState(0.5);
    const [networkEffect, setNetworkEffect] = useState(5);

    const viewerRef = useRef<{ exportCanvas: () => void }>(null);

    const calibration = useMemo(() => buildCalibration(), []);

    const handleReset = useCallback(() => {
        setSelectedAirport('ATL');
        setRamseyLambda(0.5);
        setNetworkEffect(5);
    }, []);

    const handleExport = useCallback(() => {
        viewerRef.current?.exportCanvas();
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        A Visual Playground for Airport Economics
                    </p>
                    <p className="text-gray-400">
                        Interactively explore the economic trade-offs between different airport pricing strategies,
                        based on the findings from the Ivaldi, Sokullu, &amp; Toru (2015) paper.
                    </p>
                </div>
            ),
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        ref={viewerRef}
                        selectedAirport={selectedAirport}
                        ramseyLambda={ramseyLambda}
                        networkEffect={networkEffect}
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
                        <h3 className="text-lime-400 font-semibold mb-3">Ramsey pricing, not Ramsey numbers</h3>
                        <p className="leading-relaxed text-sm">
                            The name is a deliberate double meaning. &ldquo;Ramsey&rdquo; here is Frank Ramsey
                            optimal-pricing theory (1927), the rule for a budget-constrained regulator, and not
                            Ramsey-number combinatorics. The &ldquo;ports&rdquo; are airports. The sandbox compares an
                            observed, regulated benchmark against a simulated, profit-maximizing privatized benchmark
                            across nine large US hub airports.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Two branches, one accounting identity</h3>
                        <p className="leading-relaxed text-sm">
                            The chart compares the <span className="text-lime-400">current model</span> (observed in the
                            paper) with a simulated <span className="text-red-400">privatized model</span>. In both
                            branches social welfare is the sum of consumer surplus and profit:
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">welfare = consumer surplus + profit</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The two sliders</h3>
                        <p className="leading-relaxed text-sm">
                            The <span className="text-lime-400">Ramsey welfare weight (lambda)</span> controls how much
                            weight goes to social welfare versus profit maximization; higher values prioritize welfare.
                            The <span className="text-lime-400">passenger network effect</span> represents the extra
                            value passengers derive as more flights are added, entering as a linear multiplier on
                            consumer surplus.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Implementation</h3>
                        <VersionSelector versions={versions} active="claude-v1" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                        <p className="leading-relaxed text-sm mb-3">
                            These checks verify the model accounting and pricing identities, each computed from the model
                            functions rather than hardcoded. They certify internal consistency, not empirical magnitude.
                        </p>
                        <CalibrationPanel results={calibration} outputLabel="identity holds" />
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

    return (
        <PlaygroundLayout
            title="Ramsey Ports"
            subtitle="welfare economics of airport pricing strategies"
            description={
                <a
                    href="https://www.tse-fr.eu/sites/default/files/TSE/documents/doc/wp/2015/wp_tse_587.pdf"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    2015, Marc Ivaldi et al., Airport Prices in a Two-Sided Market Setting
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    selectedAirport={selectedAirport}
                    ramseyLambda={ramseyLambda}
                    networkEffect={networkEffect}
                    onAirportChange={setSelectedAirport}
                    onRamseyLambdaChange={setRamseyLambda}
                    onNetworkEffectChange={setNetworkEffect}
                    onReset={handleReset}
                    onExport={handleExport}
                />
            }
            researchUrl="/playgrounds/ramsey-ports/research"
        />
    );
}