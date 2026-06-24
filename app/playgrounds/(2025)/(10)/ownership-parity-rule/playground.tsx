'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
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

export interface ViewerRef {
    updateVisualization: (events: PurchaseEvent[], consolidated: boolean) => void;
    reset: () => void;
}

export interface PurchaseEvent {
    type: 'purchase' | 'subscription';
    ticker: string;
    label: string;
    date: Date;
    amount: number;
    months?: number;
}

export default function Playground() {
    const viewerRef = useRef<ViewerRef>(null);
    const [events, setEvents] = useState<PurchaseEvent[]>([]);
    const [consolidated, setConsolidated] = useState(true);

    useEffect(() => {
        viewerRef.current?.updateVisualization(events, consolidated);
    }, [events, consolidated]);

    const handleEventsChange = useCallback((newEvents: PurchaseEvent[], newConsolidated: boolean) => {
        setEvents(newEvents);
        setConsolidated(newConsolidated);
    }, []);

    const handleReset = useCallback(() => {
        setEvents([]);
        viewerRef.current?.reset();
    }, []);

    const calibration = buildCalibration();

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer ref={viewerRef} />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Consumer-Equity Parity Principle</h3>
                        <p className="leading-relaxed text-sm">
                            The Consumer-Equity Parity Principle (CEPP) proposes a symmetrical allocation strategy whereby
                            consumers invest an equivalent notional amount in equity securities of firms from which they
                            purchase technology products or services. This framework seeks to align consumption decisions
                            with capital allocation, enabling consumers to capture equity appreciation alongside product
                            utility. The principle transforms passive consumption into a form of distributed ownership,
                            creating informational feedback between product satisfaction and investment performance.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Asset Asymmetry in Technology Markets</h3>
                        <p className="leading-relaxed text-sm">
                            Technology hardware exhibits rapid economic depreciation, typically approaching zero residual
                            value within 3 to 7 years, while the issuing corporations frequently demonstrate compounding equity
                            returns over equivalent periods. This divergence creates a structural asymmetry: consumers bear
                            full depreciation costs while corporations retain economic surplus. Historical analysis reveals
                            substantial opportunity costs. A $499 allocation to Apple equity concurrent with the 2007 iPhone
                            launch would have appreciated by multiple orders of magnitude relative to the device&apos;s terminal
                            value of effectively zero.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Allocation Mechanics: Discrete vs. Continuous</h3>
                        <p className="leading-relaxed text-sm">
                            The CEPP framework accommodates two distinct capital deployment modalities. One-time purchases
                            correspond to discrete equity allocations executed at t₀ (purchase date), establishing a fixed
                            cost basis. Subscription-based services employ dollar-cost averaging (DCA) across the contract
                            duration, distributing capital incrementally over [t₀, tₙ] periods. This bifurcation captures
                            the dual nature of contemporary technology consumption patterns: durable goods acquisition versus
                            software-as-a-service (SaaS) expenditure streams.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Methodological Constraints</h3>
                        <p className="leading-relaxed text-sm">
                            Price series employed herein are illustrative approximations (monthly granularity,
                            split-adjusted) suitable for pedagogical demonstration but insufficient for rigorous
                            financial analysis. The simulation incorporates several idealizing assumptions: (i) frictionless
                            execution with zero transaction costs, (ii) absence of tax implications, (iii) exclusion of
                            dividend reinvestment, and (iv) perfect market liquidity. Empirical application requires
                            high-frequency price data, tax-adjusted returns, and proper treatment of corporate actions.
                            Results should be interpreted as counterfactual scenarios rather than investment recommendations.
                        </p>
                    </div>

                    <div className="border-t border-lime-500/20 pt-8">
                        <VersionSelector versions={versions} active={versions[0].id} />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                        <p className="leading-relaxed text-sm mb-4">
                            Each case computes the terminal multiple of a parity investment and checks it against an
                            independently derived target: the issuer&apos;s latest-over-purchase price ratio for one-off
                            buys, and a separate dollar-cost-averaging recomputation for the subscription. The deterministic
                            model reproduces every target exactly.
                        </p>
                        <CalibrationPanel results={calibration} outputLabel="terminal multiple" />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Assumptions</h3>
                        <AssumptionPanel assumptions={assumptions} />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model Changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="ownership parity rule"
            description="consumer-equity parity principle: investing equal amounts when purchasing tech products"
            sections={sections}
            settings={<Settings events={events} consolidated={consolidated} onEventsChange={handleEventsChange} onReset={handleReset} />}
            researchUrl="/playgrounds/ownership-parity-rule/research"
        />
    );
}
