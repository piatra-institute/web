'use client';

import React, { useState, useCallback } from 'react';
import PlaygroundLayout from '@/components/PlaygroundLayout';
import Equation from '@/components/Equation';
import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { Context, Weights, DEFAULT_CONTEXT, DEFAULT_WEIGHTS, POLICY_SPECS } from './logic';

export default function GaitGambitPlayground() {
  const [context, setContext] = useState<Context>(DEFAULT_CONTEXT);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [axisX, setAxisX] = useState<keyof Context>('crowd');
  const [axisY, setAxisY] = useState<keyof Context>('normPressure');
  const [crossoverAxis, setCrossoverAxis] = useState<keyof Context>('mastery');
  const [showAllPolicies, setShowAllPolicies] = useState(true);

  const handleReset = useCallback(() => {
    setContext({ ...DEFAULT_CONTEXT });
    setWeights({ ...DEFAULT_WEIGHTS });
    setAxisX('crowd');
    setAxisY('normPressure');
    setCrossoverAxis('mastery');
    setShowAllPolicies(true);
  }, []);

  const sections = [
    {
      id: 'intro',
      type: 'intro' as const,
    },
    {
      id: 'canvas',
      type: 'canvas' as const,
      content: (
        <Viewer
          context={context}
          weights={weights}
          axisX={axisX}
          axisY={axisY}
          crossoverAxis={crossoverAxis}
          showAllPolicies={showAllPolicies}
        />
      ),
    },
    {
      id: 'outro',
      type: 'outro' as const,
      content: (
        <div className="space-y-8 text-gray-300">
          <div className="border-l-2 border-lime-500/50 pl-4">
            <h3 className="text-lime-400 font-semibold mb-3">Expected Free Energy Model</h3>
            <p className="leading-relaxed text-sm mb-3">
              Each policy <Equation math="\pi" /> (walk, skip, run, stroll) is scored by its expected free energy:
            </p>
            <Equation
              mode="block"
              math="G(\pi) = w_r \cdot \text{Risk} + w_a \cdot \text{Ambiguity} - w_i \cdot \text{InfoGain} + w_e \cdot \text{Energy} + w_s \cdot \text{Social} + w_j \cdot \text{Injury} + w_\alpha \cdot |\text{Arousal}_\text{desired} - \text{Arousal}_\text{predicted}|"
            />
            <p className="leading-relaxed text-sm mt-3">
              The policy with the lowest <Equation math="G" /> is selected. Costs (risk, energy, social penalty, injury, ambiguity, arousal mismatch) increase <Equation math="G" />; information gain decreases it, rewarding exploratory behaviour.
            </p>
          </div>

          <div className="border-l-2 border-lime-500/50 pl-4">
            <h3 className="text-lime-400 font-semibold mb-3">Policy Specifications</h3>
            <p className="leading-relaxed text-sm mb-3">
              Each gait is parametrised by six numbers that feed into the EFE terms:
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs text-lime-200/70 w-full">
                <thead>
                  <tr className="text-lime-400 border-b border-lime-500/20">
                    <th className="text-left pr-4 py-1">Spec</th>
                    <th className="text-right px-2 py-1">Walk</th>
                    <th className="text-right px-2 py-1">Skip</th>
                    <th className="text-right px-2 py-1">Run</th>
                    <th className="text-right px-2 py-1">Stroll</th>
                  </tr>
                </thead>
                <tbody>
                  {(['impact', 'signalAmp', 'energyPerDist', 'conspicuous', 'complexity', 'speed'] as const).map((key) => (
                    <tr key={key} className="border-b border-lime-500/10">
                      <td className="pr-4 py-1 text-lime-200/80">{key}</td>
                      <td className="text-right px-2 py-1 tabular-nums font-mono">{POLICY_SPECS.walk[key].toFixed(2)}</td>
                      <td className="text-right px-2 py-1 tabular-nums font-mono">{POLICY_SPECS.skip[key].toFixed(2)}</td>
                      <td className="text-right px-2 py-1 tabular-nums font-mono">{POLICY_SPECS.run[key].toFixed(2)}</td>
                      <td className="text-right px-2 py-1 tabular-nums font-mono">{POLICY_SPECS.stroll[key].toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="leading-relaxed text-sm mt-3">
              <span className="text-lime-100">impact</span> drives injury probability; <span className="text-lime-100">signalAmp</span> is proprioceptive richness (high for skip); <span className="text-lime-100">conspicuous</span> feeds the social penalty; <span className="text-lime-100">complexity</span> determines how much there is to learn.
            </p>
          </div>

          <div className="border-l-2 border-lime-500/50 pl-4">
            <h3 className="text-lime-400 font-semibold mb-3">The Child-Adult Crossover</h3>
            <p className="leading-relaxed text-sm">
              Both a child and an adult share the same EFE equation and the same four policies. The difference is the weight vector <Equation math="\mathbf{w}" />. A child operates with high <Equation math="w_i" /> (curiosity) and low <Equation math="w_s" /> (social cost), so skipping wins: it is complex, proprioceptively rich, and novel. An adult raises <Equation math="w_s" />, <Equation math="w_e" />, and <Equation math="w_j" />, which penalises skipping enough that walking takes over. Try the Child and Adult presets and sweep mastery or normPressure to watch the crossover happen.
            </p>
          </div>

          <div className="border-l-2 border-lime-500/50 pl-4">
            <h3 className="text-lime-400 font-semibold mb-3">Notes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>This is a toy model. The policy specs are hand-tuned, not fitted to biomechanical or behavioural data.</li>
              <li>All context variables and weights are normalised to [0, 1] or [0, 2]. Absolute G values are arbitrary; only the ranking matters.</li>
              <li>The radar chart shows raw component values (before weighting). The waterfall shows weighted contributions to G.</li>
              <li>Sensitivity is measured by perturbing each context parameter by ±0.05 and checking whether the winner changes.</li>
            </ul>
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
          crossoverAxis={crossoverAxis}
          onCrossoverAxisChange={setCrossoverAxis}
          showAllPolicies={showAllPolicies}
          onShowAllPoliciesToggle={() => setShowAllPolicies((v) => !v)}
          onReset={handleReset}
        />
      }
    />
  );
}
