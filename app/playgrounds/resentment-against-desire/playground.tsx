'use client';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import { useState, useCallback } from 'react';
import Settings from './components/Settings';
import Viewer from './components/Viewer';



const IntroContent = () => (
    <div className="space-y-6 text-gray-300 font-serif max-w-3xl mx-auto">
        <p className="text-xl">
            In 1982, Werner Güth, Rolf Schmittberger, and Bernd Schwarze conducted a groundbreaking experiment that challenged fundamental assumptions about rational economic behavior. Their &quot;Ultimatum Game&quot; revealed a profound truth: humans will reject unfair offers even when it costs them, suggesting that our sense of fairness often trumps pure self-interest.
        </p>
        <p>
            This playground recreates that historic experiment as an interactive psychological tool. Experience the internal tension between desire for gain and resentment against unfairness—the same forces that drive real-world negotiations, from salary discussions to international trade agreements.
        </p>
        <p>
            As the Responder, face a simple choice: accept or reject the Proposer&apos;s offer. But within this simplicity lies complexity—how much unfairness will one tolerate? When does resentment overcome desire for reward? The model predicts decisions based on these competing forces, allowing exploration of the boundaries of rationality.
        </p>
    </div>
);

const AboutContent = () => (
    <div className="space-y-6 text-gray-300 font-serif max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-200">The Original Experiment</h3>
        <p>
            The 1982 study involved 42 economics students from the University of Cologne, divided into Proposers and Responders. Proposers received 4-10 German Marks to split, while Responders could accept or reject the offer. If rejected, both received nothing. The results defied classical economic theory: Proposers offered an average of 37% of the total (with 50/50 being the most common split), and Responders frequently rejected offers they deemed unfair.
        </p>

        <h3 className="text-2xl font-bold text-gray-200">The Model</h3>
        <p>
            This simulation models decision-making as a competition between two psychological forces:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-blue-300">Desire</strong>: Motivation to gain reward, adjustable from indifference to desperation</li>
            <li><strong className="text-red-300">Resentment</strong>: Aversion to unfairness, automatically calculated based on the offer&apos;s deviation from an equal split</li>
        </ul>
        <p>
            The model predicts acceptance when desire meets or exceeds resentment. This simple rule captures the essence of the phase transition observed in human behavior—the tipping point where rational calculation gives way to principled rejection.
        </p>

        <h3 className="text-2xl font-bold text-gray-200">Scientific Significance</h3>
        <p>
            The Ultimatum Game has been replicated thousands of times across cultures, consistently confirming that humans value fairness alongside material gain. This finding has profound implications for economics, psychology, evolutionary biology, and artificial intelligence. It suggests that cooperation and fairness norms are not mere social constructs but fundamental aspects of human decision-making.
        </p>
    </div>
);

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
            content: <AboutContent />,
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
                    className="underline"
                >
                    1982, Güth, Schmittberger, & Schwarze, An Experimental Analysis of Ultimatum Bargaining
                </a>
            }
            sections={sections}
            settings={settings}
        />
    );
}
