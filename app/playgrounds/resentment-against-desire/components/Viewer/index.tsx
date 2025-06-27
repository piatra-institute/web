import React, { useEffect, useState, useCallback } from 'react';
import Button from '@/components/Button';
import {
    calculateResentment,
    predictDecision,
    generateOffer,
    formatOfferText,
    isAtTippingPoint,
    getOfferDescription
} from '../../logic';



interface ViewerProps {
    desire: number;
    offer: number | null;
    gameActive: boolean;
    lastDecision: 'accept' | 'reject' | null;
    modelPrediction: 'accept' | 'reject' | null;
    onNewOffer: (offer: number) => void;
    onDecision: (decision: 'accept' | 'reject', prediction: 'accept' | 'reject') => void;
}

export default function Viewer({
    desire,
    offer,
    gameActive,
    lastDecision,
    modelPrediction,
    onNewOffer,
    onDecision,
}: ViewerProps) {
    const [resentment, setResentment] = useState(0);
    const [animatedDesire, setAnimatedDesire] = useState(desire);
    const [animatedResentment, setAnimatedResentment] = useState(0);

    // Calculate resentment when offer changes
    useEffect(() => {
        if (offer !== null) {
            const newResentment = calculateResentment(offer);
            setResentment(newResentment);
        } else {
            setResentment(0);
        }
    }, [offer]);

    // Animate bars
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedDesire(desire);
        }, 50);
        return () => clearTimeout(timer);
    }, [desire]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedResentment(resentment);
        }, 100);
        return () => clearTimeout(timer);
    }, [resentment]);

    const handleNewOffer = useCallback(() => {
        const newOffer = generateOffer();
        onNewOffer(newOffer);
    }, [onNewOffer]);

    const handleDecision = useCallback((decision: 'accept' | 'reject') => {
        const prediction = predictDecision(desire, resentment);
        onDecision(decision, prediction);
    }, [desire, resentment, onDecision]);

    const currentPrediction = offer !== null ? predictDecision(desire, resentment) : null;
    const atTippingPoint = offer !== null && isAtTippingPoint(desire, resentment);

    return (
        <div className="w-full h-full bg-black flex items-center justify-center p-8">
            <div className="w-full max-w-5xl space-y-6">
                {/* Main Game Area */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Controls */}
                    <div className="bg-black border border-gray-800  p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-mono uppercase tracking-wider text-gray-400 mb-4">Controls</h3>
                            <Button
                                label="Get New Offer"
                                onClick={handleNewOffer}
                                className="w-full"
                                size="lg"
                                disabled={gameActive}
                            />
                        </div>

                        {/* Current Desire Display */}
                        <div className="bg-black border border-gray-800 p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-mono uppercase tracking-wider text-gray-600">Desire Level</span>
                                <span className="text-lg font-mono font-bold text-lime-500">{desire}%</span>
                            </div>
                            <div className="text-xs font-mono text-gray-600">
                                {desire < 33 ? 'LOW' :
                                 desire < 67 ? 'MODERATE' :
                                 'HIGH'}
                            </div>
                        </div>
                    </div>

                    {/* Offer Display */}
                    <div className="bg-black border border-gray-800 p-6 min-h-[200px] flex items-center justify-center">
                        {!offer ? (
                            <p className="text-base font-mono text-gray-500">Click &quot;Get New Offer&quot; to begin</p>
                        ) : (
                            <div className="space-y-4 text-center">
                                {/* Offer Text - Fixed Height Block */}
                                <div className="h-24 flex flex-col justify-center">
                                    <p className="text-xl font-mono font-bold text-gray-200">
                                        {formatOfferText(offer).main}
                                    </p>
                                    <p className="text-sm font-mono text-gray-500 mt-1">
                                        {formatOfferText(offer).sub}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        <span className="text-gray-600">Status:</span> <span className="font-medium text-gray-400">{getOfferDescription(offer)}</span>
                                    </p>
                                </div>

                                {/* Buttons or Result - Fixed Height Block */}
                                <div className="h-16 flex items-center justify-center">
                                    {gameActive ? (
                                        <div className="flex gap-4">
                                            <Button
                                                label="Accept"
                                                onClick={() => handleDecision('accept')}
                                                className="bg-lime-200 text-black hover:bg-lime-300"
                                            />
                                            <Button
                                                label="Reject"
                                                onClick={() => handleDecision('reject')}
                                            />
                                        </div>
                                    ) : lastDecision ? (
                                        <div className="text-center">
                                            <p className="text-base font-mono">
                                                <span className="text-gray-500">Result:</span>{' '}
                                                <span className={`font-bold ${
                                                    lastDecision === 'accept' ? 'text-lime-400' : 'text-gray-400'
                                                }`}>
                                                    {lastDecision === 'accept' ? `Accepted (${offer} coins)` : 'Rejected (0 coins)'}
                                                </span>
                                            </p>
                                            {lastDecision !== modelPrediction && (
                                                <p className="text-xs font-mono text-yellow-500 mt-1">
                                                    ⚠ Choice defied prediction
                                                </p>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visualization */}
                <div className="bg-black border border-gray-800  p-6">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-gray-400 text-center mb-6">Internal Conflict</h3>
                    <div className="space-y-6">
                        {/* Desire Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-mono uppercase text-gray-500">Desire</span>
                                <span className="text-sm font-mono text-lime-400">{desire}%</span>
                            </div>
                            <div className="w-full bg-gray-900  h-4 overflow-hidden">
                                <div
                                    className="bg-lime-500 h-4 transition-all duration-500 ease-out"
                                    style={{ width: `${animatedDesire}%` }}
                                />
                            </div>
                        </div>

                        {/* Resentment Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-mono uppercase text-gray-500">Resentment</span>
                                <span className="text-sm font-mono text-red-400">{resentment}%</span>
                            </div>
                            <div className="w-full bg-gray-900  h-4 overflow-hidden">
                                <div
                                    className="bg-red-500 h-4 transition-all duration-700 ease-out"
                                    style={{ width: `${animatedResentment}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Model Prediction */}
                <div className="bg-black border border-gray-800 min-h-[180px]  p-6 text-center">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-gray-400 mb-4">Model Prediction</h3>
                    {!offer || !gameActive ? (
                        <p className="text-sm font-mono text-gray-600">Waiting for offer...</p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-base font-mono">
                                <span className="text-gray-500">Prediction:</span>{' '}
                                <span className={`font-bold ${
                                    currentPrediction === 'accept' ? 'text-lime-400' : 'text-gray-400'
                                }`}>
                                    {currentPrediction === 'accept' ? 'ACCEPT' : 'REJECT'}
                                </span>
                            </p>
                            <p className="text-xs font-mono text-gray-600">
                                D:{desire}% {desire >= resentment ? '≥' : '<'} R:{resentment}%
                            </p>
                            {atTippingPoint && (
                                <p className="text-xs font-mono text-yellow-500 mt-3">
                                    ⚠ Tipping point
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
