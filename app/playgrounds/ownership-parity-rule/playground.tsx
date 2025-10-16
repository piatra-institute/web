'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import Settings from './components/Settings';
import Viewer from './components/Viewer';

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

    const sections: PlaygroundSection[] = [
        {
            id: 'intro',
            type: 'intro',
        },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <div className="w-full h-full flex items-center justify-center p-8">
                    <Viewer ref={viewerRef} />
                </div>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-6">
                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Consumer-Equity Parity Principle</h4>
                        <p className="text-gray-300">
                            The Consumer-Equity Parity Principle (CEPP) proposes a symmetrical allocation strategy whereby
                            consumers invest an equivalent notional amount in equity securities of firms from which they
                            purchase technology products or services. This framework seeks to align consumption decisions
                            with capital allocation, enabling consumers to capture equity appreciation alongside product
                            utility. The principle transforms passive consumption into a form of distributed ownership,
                            creating informational feedback between product satisfaction and investment performance.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Asset Asymmetry in Technology Markets</h4>
                        <p className="text-gray-300">
                            Technology hardware exhibits rapid economic depreciation, typically approaching zero residual
                            value within 3-7 years, while the issuing corporations frequently demonstrate compounding equity
                            returns over equivalent periods. This divergence creates a structural asymmetry: consumers bear
                            full depreciation costs while corporations retain economic surplus. Historical analysis reveals
                            substantial opportunity costs—$499 allocated to Apple equity concurrent with the 2007 iPhone
                            launch would have appreciated by multiple orders of magnitude relative to the device&apos;s terminal
                            value of effectively zero.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Allocation Mechanics: Discrete vs. Continuous</h4>
                        <p className="text-gray-300">
                            The CEPP framework accommodates two distinct capital deployment modalities. One-time purchases
                            correspond to discrete equity allocations executed at t₀ (purchase date), establishing a fixed
                            cost basis. Subscription-based services employ dollar-cost averaging (DCA) across the contract
                            duration, distributing capital incrementally over [t₀, tₙ] periods. This bifurcation captures
                            the dual nature of contemporary technology consumption patterns: durable goods acquisition versus
                            software-as-a-service (SaaS) expenditure streams.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/50 pl-4">
                        <h4 className="text-lime-400 font-semibold mb-2">Methodological Constraints</h4>
                        <p className="text-gray-300">
                            Price series employed herein are illustrative approximations (annual granularity,
                            split-adjusted) suitable for pedagogical demonstration but insufficient for rigorous
                            financial analysis. The simulation incorporates several idealizing assumptions: (i) frictionless
                            execution with zero transaction costs, (ii) absence of tax implications, (iii) exclusion of
                            dividend reinvestment, and (iv) perfect market liquidity. Empirical application requires
                            high-frequency price data, tax-adjusted returns, and proper treatment of corporate actions.
                            Results should be interpreted as counterfactual scenarios rather than investment recommendations.
                        </p>
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
        />
    );
}
