'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { Context, Weights, DEFAULT_CONTEXT, DEFAULT_WEIGHTS } from './logic';

export default function GaitGambitPlayground() {
  const [context, setContext] = useState<Context>(DEFAULT_CONTEXT);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [axisX, setAxisX] = useState<keyof Context>('crowd');
  const [axisY, setAxisY] = useState<keyof Context>('normPressure');

  const handleReset = useCallback(() => {
    setContext(DEFAULT_CONTEXT);
    setWeights(DEFAULT_WEIGHTS);
    setAxisX('crowd');
    setAxisY('normPressure');
  }, []);

  const sections = [
    {
      id: 'intro',
      type: 'intro' as const,
    },
    {
      id: 'canvas',
      type: 'canvas' as const,
      content: <Viewer context={context} weights={weights} axisX={axisX} axisY={axisY} />,
    },
    {
      id: 'outro',
      type: 'outro' as const,
      content: (
        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-lime-400 font-semibold mb-2">How it works</h3>
            <p className="leading-relaxed text-sm">
              The model computes expected free energy (EFE) for each policy—walk, skip, run, or stroll. Whichever has the lowest EFE is chosen. The EFE combines:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
              <li><strong>Preference satisfaction</strong> – does this movement match how you want to feel?</li>
              <li><strong>Learning value</strong> – does it teach you something about your body or world?</li>
              <li><strong>Costs</strong> – energy, injury risk, social judgment, unclear sensory feedback</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-2">Why the crossover happens</h3>
            <p className="leading-relaxed text-sm">
              Children weight novelty and learning heavily, but don't care much about efficiency or social judgment. So skipping wins—it's complex to learn, gives strong sensory feedback, and feels fun. Adults flip the weights: they prioritize energy cost and not standing out, so walking wins. The same decision logic; different priorities.
            </p>
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-2">Reading the visualizations</h3>
            <p className="leading-relaxed text-sm">
              <strong>Policy ranking:</strong> Bar chart showing G (expected free energy) for each option. Lower is better.
            </p>
            <p className="leading-relaxed text-sm mt-2">
              <strong>Crossover plot:</strong> How each policy's EFE changes as you sweep one variable. Crossing lines show where the winner flips.
            </p>
            <p className="leading-relaxed text-sm mt-2">
              <strong>Heatmap:</strong> A 2D map of policy preference. Lime=good (low EFE), dark=bad (high EFE). Pick any two variables to explore.
            </p>
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-2">The equation</h3>
            <Equation
              mode="block"
              math="G(\pi) = w_{\text{risk}} \cdot \text{Risk} + w_{\text{amb}} \cdot \text{Ambiguity} - w_{\text{info}} \cdot \text{InfoGain} + w_{\text{energy}} \cdot \text{Energy} + w_{\text{social}} \cdot \text{Social} + w_{\text{injury}} \cdot \text{Injury} + w_{\text{arousal}} \cdot \text{ArousalMismatch}"
            />
            <p className="leading-relaxed text-sm mt-3">
              Each <span className="text-lime-100">w</span> is a weight that says "how much do I care about this factor?" Increase a weight, and that cost/benefit matters more. The minus sign on InfoGain means learning reduces EFE—you pay less for policies that teach.
            </p>
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-2">Presets in settings</h3>
            <p className="leading-relaxed text-sm">
              Use the preset buttons to jump between scenarios: <strong>Child mode</strong> (curious, low social weight), <strong>Adult mode</strong> (efficient, high social weight), <strong>Arousal bump</strong> (wants to feel more energized), and <strong>Long distance</strong> (energy matters more). Watch the winner change.
            </p>
          </div>

          <div>
            <h3 className="text-lime-400 font-semibold mb-2">Experiment</h3>
            <p className="leading-relaxed text-sm">
              Start with a preset. Then gradually change one slider—say, raise <span className="text-lime-100 font-mono">crowd</span> or increase <span className="text-lime-100 font-mono">wSocial</span>. See when the policy preference flips. The crossover plot shows exactly where it happens.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PlaygroundLayout
      title="gait gambit"
      subtitle="a computational model of gait selection"
      sections={sections}
      settings={
        <Settings
          context={context}
          onContextChange={setContext}
          weights={weights}
          onWeightsChange={setWeights}
          axisX={axisX}
          onAxisXChange={setAxisX}
          axisY={axisY}
          onAxisYChange={setAxisY}
          onReset={handleReset}
        />
      }
    />
  );
}
