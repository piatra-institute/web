'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import VersionSelector from '@/components/VersionSelector';
import CalibrationPanel from '@/components/CalibrationPanel';
import AssumptionPanel from '@/components/AssumptionPanel';
import ModelChangelog from '@/components/ModelChangelog';
import Equation from '@/components/Equation';
import { useState, useCallback } from 'react';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { buildCalibration } from './calibration';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';



const IntroContent = () => (
    <div className="space-y-6 text-gray-300 max-w-3xl mx-auto">
        <p className="text-xl">
            In 1982, Werner Güth, Rolf Schmittberger, and Bernd Schwarze ran an experiment that challenged a basic assumption about rational economic behavior. Their &quot;Ultimatum Game&quot; revealed a stubborn fact: people will reject unfair offers even when refusal costs them, suggesting that a sense of fairness often outweighs pure self-interest.
        </p>
        <p>
            This playground recreates that experiment as an interactive tool. You feel the tension between desire for gain and resentment against unfairness, the same forces that drive real negotiations, from salary talks to trade agreements.
        </p>
        <p>
            As the Responder, you face a simple choice: accept or reject the Proposer&apos;s offer. Within that simplicity sits a hard question. How much unfairness will you tolerate, and when does resentment overcome the desire for reward? The model predicts decisions from these competing forces, letting you explore the boundary of rationality.
        </p>
    </div>
);

const calibration = buildCalibration();

export default function ResentmentAgainstDesirePlayground() {
    // Game state
    const [desire, setDesire] = useState(50);
    const [offer, setOffer] = useState<number | null>(null);
    const [gameActive, setGameActive] = useState(false);
    const [lastDecision, setLastDecision] = useState<'accept' | 'reject' | null>(null);
    const [modelPrediction, setModelPrediction] = useState<'accept' | 'reject' | null>(null);

    // Statistics
    const [stats, setStats] = useState({
        totalGames: 0,
        accepted: 0,
        rejected: 0,
        modelCorrect: 0,
        offerHistory: [] as number[],
    });

    const handleNewOffer = useCallback((newOffer: number) => {
        setOffer(newOffer);
        setGameActive(true);
        setLastDecision(null);
    }, []);

    const handleDecision = useCallback((decision: 'accept' | 'reject', prediction: 'accept' | 'reject') => {
        setLastDecision(decision);
        setModelPrediction(prediction);
        setGameActive(false);

        setStats(prev => ({
            totalGames: prev.totalGames + 1,
            accepted: prev.accepted + (decision === 'accept' ? 1 : 0),
            rejected: prev.rejected + (decision === 'reject' ? 1 : 0),
            modelCorrect: prev.modelCorrect + (decision === prediction ? 1 : 0),
            offerHistory: [...prev.offerHistory, offer || 0],
        }));
    }, [offer]);

    const resetStats = useCallback(() => {
        setStats({
            totalGames: 0,
            accepted: 0,
            rejected: 0,
            modelCorrect: 0,
            offerHistory: [],
        });
        setOffer(null);
        setGameActive(false);
        setLastDecision(null);
        setModelPrediction(null);
    }, []);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
            content: <IntroContent />,
        },
        {
            id: 'simulation',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer className="bg-black">
                    <Viewer
                        desire={desire}
                        offer={offer}
                        gameActive={gameActive}
                        lastDecision={lastDecision}
                        modelPrediction={modelPrediction}
                        onNewOffer={handleNewOffer}
                        onDecision={handleDecision}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The original experiment</h3>
                        <p className="leading-relaxed text-sm">
                            The 1982 study divided economics students at the University of Cologne into Proposers and Responders. Proposers received a sum to split; Responders could accept or reject. If rejected, both received nothing. The results defied classical theory: the even split was the most common offer, well above the self-interested minimum, and Responders frequently rejected offers they judged unfair, paying with their own money to punish a stingy proposer.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The model</h3>
                        <p className="leading-relaxed text-sm">
                            The simulation treats a decision as a contest between two scalar forces: desire for reward, set by you, and resentment at unfairness, computed from the offer. Resentment is a linear ramp in the gap below the even split, capped at the top of its range:
                        </p>
                        <div className="my-3">
                            <Equation
                                mode="block"
                                math="\text{resentment} = \min\big((5 - \text{offer})\cdot 25,\ 100\big)"
                            />
                        </div>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-3">
                            <p className="text-lime-200/80 text-sm">
                                The responder accepts when desire is at least as large as resentment, and rejects otherwise. Where the two forces meet sits the tipping point, the knife-edge where a small nudge flips the outcome.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Scientific significance</h3>
                        <p className="leading-relaxed text-sm">
                            The Ultimatum Game has been replicated thousands of times across cultures, consistently confirming that people value fairness alongside material gain. The two-force sketch here is a stripped-down cousin of inequity-aversion theory, where the resentment term stands in for the penalty on getting less than an equal share. The companion article works through the relation in detail.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Version</h3>
                        <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Calibration</h3>
                        <CalibrationPanel results={calibration} outputLabel="model rule" />
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

    const settings = (
        <Settings
            desire={desire}
            onDesireChange={setDesire}
            stats={stats}
            onResetStats={resetStats}
        />
    );

    return (
        <PlaygroundLayout
            title="Resentment Against Desire"
            subtitle="the psychology of fairness in the ultimatum game"
            description={
                <a
                    href="https://doi.org/10.1016/0167-2681(82)90011-7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                >
                    1982, Güth, Schmittberger, &amp; Schwarze, An Experimental Analysis of Ultimatum Bargaining
                </a>
            }
            sections={sections}
            settings={settings}
            researchUrl="/playgrounds/resentment-against-desire/research"
        />
    );
}
