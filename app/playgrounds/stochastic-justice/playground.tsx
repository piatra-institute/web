'use client';

import React, { useState, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { calculateMetrics } from './logic';

const DEFAULT_CORRUPTION = 0.5;
const DEFAULT_RANDOMNESS = 0.5;

export default function StochasticJusticePlayground() {
  const [corruption, setCorruption] = useState(DEFAULT_CORRUPTION);
  const [randomness, setRandomness] = useState(DEFAULT_RANDOMNESS);
  const [showAbout, setShowAbout] = useState(false);

  const viewerRef = useRef<{ exportImage: () => void }>(null);

  const metrics = calculateMetrics(corruption, randomness);

  const handleReset = useCallback(() => {
    setCorruption(DEFAULT_CORRUPTION);
    setRandomness(DEFAULT_RANDOMNESS);
  }, []);

  const handleExport = useCallback(() => {
    viewerRef.current?.exportImage();
  }, []);

  const handleMarkerDrag = useCallback((c: number, r: number) => {
    setCorruption(c);
    setRandomness(r);
  }, []);

  return (
    <div className="h-screen w-screen relative bg-black">
      <div className="absolute inset-0">
        <Viewer
          ref={viewerRef}
          corruption={corruption}
          randomness={randomness}
          onMarkerDrag={handleMarkerDrag}
        />
      </div>

      <div className="absolute top-0 left-0 z-10 p-6 pointer-events-none">
        <Header />
        <Title text="Stochastic Justice Playground" />

        <div className="max-w-xl text-white/80 mt-2 text-sm text-center">
          exploring fairness through randomness in corrupt systems
          <br />
          using information theory to model institutional bias
          <br />
          <br />
          drag the yellow marker to explore different regimes
          <br />
          observe how randomness can counteract corruption
        </div>
      </div>

      <Settings
        corruption={corruption}
        randomness={randomness}
        showAbout={showAbout}
        metrics={metrics}
        onCorruptionChange={setCorruption}
        onRandomnessChange={setRandomness}
        onShowAboutChange={setShowAbout}
        onReset={handleReset}
        onExport={handleExport}
      />

      {showAbout && (
        <div className="absolute top-32 left-8 right-8 max-w-4xl bg-black/90 backdrop-blur-sm p-6 text-gray-300 text-sm overflow-y-auto max-h-[calc(100vh-200px)] border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">About: Conceptual Framework & Mechanics</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Core Idea</h4>
              <p>The playground models the relationship between institutional corruption, procedural randomness, and fairness using information theory. It investigates when randomness may serve as a better proxy for fairness than biased deterministic rules — especially in corrupt systems.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Variables</h4>
              <dl className="space-y-2">
                <dt className="font-medium">C — Institutional Corruption Coefficient</dt>
                <dd className="ml-4">Degree to which institutions deviate from impartiality (0 = incorruptible, 1 = fully biased)</dd>
                <dt className="font-medium">R — Decision Process Stochasticity</dt>
                <dd className="ml-4">Degree of procedural randomness in outcomes (0 = fully deterministic, 1 = fully random)</dd>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Visual Representation</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>2D Heatmap (C vs R) shows computed Effective Fairness Entropy H* = H(P) - D_KL(P || Q)</li>
                <li>Color: Bright green = high fairness entropy, darker = lower fairness</li>
                <li>Marker: Draggable yellow dot to inspect specific (C, R) combinations</li>
                <li>Zones: Ideal Fair, Corrupt Zone, Random Justice</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Interpretive Insight</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>In high corruption, low randomness, outcomes are biased and predictable, leading to low fairness entropy.</li>
                <li>In high randomness, even if corruption is present, random allocation may restore fairness (by washing out bias).</li>
                <li>Counterintuitively, a random process can be fairer than a structured but corrupt one — this is central to the model&apos;s exploration.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}