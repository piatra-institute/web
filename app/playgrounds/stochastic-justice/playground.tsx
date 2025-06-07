'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
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

  const sections = [
    {
      id: 'intro',
      type: 'intro' as const,
    },
    {
      id: 'simulation',
      type: 'canvas' as const,
      content: (
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
          {showAbout && (
            <div className="absolute top-32 left-8 right-8 max-w-4xl bg-black/90 backdrop-blur-sm p-6 text-gray-300 text-sm overflow-y-auto max-h-[calc(100vh-200px)] border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">About: Conceptual Framework & Mechanics</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Core Idea</h4>
                  <p>This playground models the complex relationship between institutional corruption, procedural randomness, and fairness using scientifically grounded information theory and decision science.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'about',
      type: 'outro' as const,
      content: (
        <>
          <p>
            Stochastic Justice explores when randomness can serve as a better proxy
            for fairness than biased deterministic rules. Using information theory
            and decision science, this playground models the complex relationship
            between institutional corruption and procedural randomness.
          </p>
          <p>
            The visualization shows how different types of corruption (directional bias,
            increased variance, systematic error) respond differently to randomness.
            In some corrupt systems, strategic randomness can counteract bias more
            effectively than deterministic reforms.
          </p>
          <p>
            Key concepts include: information theory, institutional corruption,
            procedural fairness, decision science, entropy measures, and the
            trade-offs between fairness and efficiency in governance systems.
          </p>
        </>
      ),
    },
  ];

  const settings = (
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
  );

  return (
    <PlaygroundLayout
      title="stochastic justice"
      subtitle="exploring fairness through randomness in corrupt systems; drag marker to explore regimes where randomness counteracts corruption"
      sections={sections}
      settings={settings}
    />
  );
}