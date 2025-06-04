'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Title from '@/components/Title';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { calculateMetrics, CorruptionType } from './logic';

const DEFAULT_CORRUPTION = 0.5;
const DEFAULT_RANDOMNESS = 0.5;

const PRESETS = [
  { name: 'Ideal Fair', corruption: 0.1, randomness: 0.9 },
  { name: 'Corrupt Deterministic', corruption: 0.9, randomness: 0.1 },
  { name: 'Random Justice', corruption: 0.5, randomness: 0.8 },
  { name: 'Moderate System', corruption: 0.3, randomness: 0.4 },
  { name: 'Pure Random', corruption: 0.5, randomness: 1.0 },
];

export default function StochasticJusticePlayground() {
  const [corruption, setCorruption] = useState(DEFAULT_CORRUPTION);
  const [randomness, setRandomness] = useState(DEFAULT_RANDOMNESS);
  const [showAbout, setShowAbout] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [corruptionType, setCorruptionType] = useState<CorruptionType>(CorruptionType.DIRECTIONAL);

  const viewerRef = useRef<{ exportImage: () => void }>(null);

  const metrics = calculateMetrics(corruption, randomness, corruptionType);

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

  const animateToValues = useCallback((targetC: number, targetR: number, duration: number = 800) => {
    setIsAnimating(true);
    const startC = corruption;
    const startR = randomness;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      const currentC = startC + (targetC - startC) * easedProgress;
      const currentR = startR + (targetR - startR) * easedProgress;
      
      setCorruption(currentC);
      setRandomness(currentR);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [corruption, randomness]);

  const handlePresetSelect = useCallback((preset: typeof PRESETS[0]) => {
    animateToValues(preset.corruption, preset.randomness);
  }, [animateToValues]);

  return (
    <div className="h-screen w-screen relative bg-black">
      <div className="absolute inset-0">
        <Viewer
          ref={viewerRef}
          corruption={corruption}
          randomness={randomness}
          corruptionType={corruptionType}
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
        presets={PRESETS}
        isAnimating={isAnimating}
        corruptionType={corruptionType}
        onCorruptionChange={setCorruption}
        onRandomnessChange={setRandomness}
        onShowAboutChange={setShowAbout}
        onCorruptionTypeChange={setCorruptionType}
        onReset={handleReset}
        onExport={handleExport}
        onPresetSelect={handlePresetSelect}
      />

      {showAbout && (
        <div className="absolute top-32 left-8 right-8 max-w-4xl bg-black/90 backdrop-blur-sm p-6 text-gray-300 text-sm overflow-y-auto max-h-[calc(100vh-200px)] border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">About: Conceptual Framework & Mechanics</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Core Idea</h4>
              <p>This playground models the complex relationship between institutional corruption, procedural randomness, and fairness using scientifically grounded information theory and decision science. It investigates when randomness may serve as a better proxy for fairness than biased deterministic rules — especially in corrupt systems.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Variables & Corruption Types</h4>
              <dl className="space-y-2">
                <dt className="font-medium">C — Institutional Corruption Coefficient</dt>
                <dd className="ml-4">Degree to which institutions deviate from impartiality (0 = incorruptible, 1 = fully compromised)</dd>
                <dt className="font-medium">R — Decision Process Stochasticity</dt>
                <dd className="ml-4">Degree of procedural randomness in outcomes (0 = fully deterministic, 1 = fully random)</dd>
                <dt className="font-medium">Corruption Types</dt>
                <dd className="ml-4">
                  <strong>Directional Bias:</strong> Systematic preference for specific outcomes (classic corruption)<br/>
                  <strong>Increased Variance:</strong> Corruption manifests as unpredictability and inconsistency<br/>
                  <strong>Systematic Error:</strong> Institutional incompetence leading to persistent mistakes
                </dd>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Enhanced Mathematical Framework</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Improved Fairness Metrics:</strong> Multiple complementary measures including demographic parity, total variation distance, and Jensen-Shannon divergence</li>
                <li><strong>Realistic Corruption Models:</strong> Three distinct types modeling different real-world institutional failures</li>
                <li><strong>Non-linear Randomness:</strong> Exponential decay model preserves bias structure while adding appropriate uncertainty</li>
                <li><strong>Institutional Efficiency:</strong> New metric capturing the trade-off between fairness and operational effectiveness</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Visual Representation</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>2D Heatmap (C vs R) shows Effective Fairness Entropy, dynamically updated based on corruption type</li>
                <li>Enhanced Color Gradient: Red (low fairness) → Orange → Yellow → Green (high fairness)</li>
                <li>Interactive Zones: Hover effects highlight Ideal Fair, Corrupt & Unfair, and Random Justice regimes</li>
                <li>Draggable Marker: Yellow dot for exploring specific (C, R) combinations with detailed tooltips</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Scientific Insights</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Corruption Type Matters:</strong> Different types of institutional failure require different remedies</li>
                <li><strong>Randomness as Medicine:</strong> Strategic randomness can counteract systematic bias without destroying institutional function</li>
                <li><strong>Non-linear Effects:</strong> Small changes in corruption or randomness can have disproportionate impacts on fairness</li>
                <li><strong>Efficiency Trade-offs:</strong> Perfect fairness may conflict with institutional efficiency — optimal systems balance both</li>
                <li><strong>Context Dependency:</strong> The same C,R combination produces different outcomes under different corruption models</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}