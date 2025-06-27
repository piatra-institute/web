import React from 'react';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';



interface SettingsProps {
    desire: number;
    onDesireChange: (value: number) => void;
    stats: {
        totalGames: number;
        accepted: number;
        rejected: number;
        modelCorrect: number;
        offerHistory: number[];
    };
    onResetStats: () => void;
}

export default function Settings({ desire, onDesireChange, stats, onResetStats }: SettingsProps) {
    const acceptanceRate = stats.totalGames > 0 ? (stats.accepted / stats.totalGames * 100).toFixed(1) : '0.0';
    const modelAccuracy = stats.totalGames > 0 ? (stats.modelCorrect / stats.totalGames * 100).toFixed(1) : '0.0';
    const averageOffer = stats.offerHistory.length > 0
        ? (stats.offerHistory.reduce((a, b) => a + b, 0) / stats.offerHistory.length).toFixed(2)
        : '0.00';

    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Desire Level',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Desire for Reward (%)"
                                value={desire}
                                onChange={onDesireChange}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Indifferent</span>
                                <span>Moderate</span>
                                <span>Desperate</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                Adjust the desire for coins. Higher desire means more likely to accept unfair offers.
                            </p>
                        </div>
                    ),
                },
                {
                    title: 'Game Statistics',
                    content: (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-400">Games Played:</span>
                                    <div className="text-white font-medium">{stats.totalGames}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Acceptance Rate:</span>
                                    <div className="text-white font-medium">{acceptanceRate}%</div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Model Accuracy:</span>
                                    <div className="text-white font-medium">{modelAccuracy}%</div>
                                </div>
                                <div>
                                    <span className="text-gray-400">Average Offer:</span>
                                    <div className="text-white font-medium">{averageOffer} coins</div>
                                </div>
                            </div>
                            <div className="pt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-400">Accepted:</span>
                                    <span className="text-white">{stats.accepted}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-400">Rejected:</span>
                                    <span className="text-white">{stats.rejected}</span>
                                </div>
                            </div>
                            <Button
                                label="Reset Statistics"
                                onClick={onResetStats}
                                className="w-full mt-3"
                                size="sm"
                            />
                        </div>
                    ),
                },
                {
                    title: 'About the Model',
                    content: (
                        <div className="space-y-3 text-xs text-gray-400">
                            <p>
                                The model predicts decisions based on two competing forces:
                            </p>
                            <ul className="space-y-1 ml-4">
                                <li>• <span className="text-blue-300">Desire</span>: Motivation for reward (adjustable)</li>
                                <li>• <span className="text-red-300">Resentment</span>: Aversion to unfairness (automatic)</li>
                            </ul>
                            <p>
                                Resentment = (5 - offer) × 25
                            </p>
                            <p>
                                Accept when: Desire ≥ Resentment
                            </p>
                            <p className="pt-2">
                                The Proposer&apos;s offers are biased toward unfairness to better explore the decision boundary.
                            </p>
                        </div>
                    ),
                },
            ]}
        />
    );
}
