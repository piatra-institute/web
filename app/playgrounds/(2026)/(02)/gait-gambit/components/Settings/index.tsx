'use client';

import React from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import {
  Context,
  Weights,
  CONTEXT_GROUPS,
  CONTEXT_KEYS,
  DEFAULT_CONTEXT,
  DEFAULT_WEIGHTS,
} from '../../logic';

interface SettingsProps {
  context: Context;
  onContextChange: (ctx: Context) => void;
  weights: Weights;
  onWeightsChange: (w: Weights) => void;
  axisX: keyof Context;
  onAxisXChange: (axis: keyof Context) => void;
  axisY: keyof Context;
  onAxisYChange: (axis: keyof Context) => void;
  crossoverAxis: keyof Context;
  onCrossoverAxisChange: (axis: keyof Context) => void;
  showAllPolicies: boolean;
  onShowAllPoliciesToggle: () => void;
  onReset: () => void;
}

const PRESETS: Record<string, {
  context: Partial<Context>;
  weights: Partial<Weights>;
  label: string;
}> = {
  defaults: {
    context: { ...DEFAULT_CONTEXT },
    weights: { ...DEFAULT_WEIGHTS },
    label: 'Reset defaults',
  },
  childMode: {
    context: { novelty: 0.8, mastery: 0.3 },
    weights: { social: 0.2, energy: 0.3 },
    label: 'Child mode',
  },
  adultMode: {
    context: { normPressure: 0.9 },
    weights: { social: 1.8, energy: 1.5, injury: 1.5 },
    label: 'Adult mode',
  },
  arousalBump: {
    context: { desiredArousal: 0.9 },
    weights: { arousal: 1.5 },
    label: 'Arousal bump',
  },
  longDistance: {
    context: { distance: 0.9 },
    weights: { energy: 1.8 },
    label: 'Long distance',
  },
};

export default function Settings({
  context,
  onContextChange,
  weights,
  onWeightsChange,
  axisX,
  onAxisXChange,
  axisY,
  onAxisYChange,
  crossoverAxis,
  onCrossoverAxisChange,
  showAllPolicies,
  onShowAllPoliciesToggle,
  onReset,
}: SettingsProps) {
  return (
    <div className="space-y-6">
      {/* Context Sliders — grouped */}
      {CONTEXT_GROUPS.map((group) => (
        <div key={group.label} className="space-y-3">
          <h3 className="text-lime-400 font-semibold text-sm">{group.label}</h3>
          {group.keys.map(({ key, label }) => (
            <SliderInput
              key={key}
              label={label}
              min={0}
              max={1}
              step={0.01}
              value={context[key]}
              onChange={(v) => onContextChange({ ...context, [key]: v })}
              showDecimals={true}
            />
          ))}
        </div>
      ))}

      <div className="border-t border-lime-500/20" />

      {/* Presets */}
      <div className="space-y-2">
        <h3 className="text-lime-400 font-semibold text-sm">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'defaults') {
                  onReset();
                } else {
                  onContextChange({ ...context, ...preset.context });
                  onWeightsChange({ ...weights, ...preset.weights });
                }
              }}
              className="px-3 py-2 text-xs bg-lime-500/10 border border-lime-500/30 text-lime-100 hover:bg-lime-500/20 hover:border-lime-500 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-lime-500/20" />

      {/* Weights */}
      <div className="space-y-3">
        <h3 className="text-lime-400 font-semibold text-sm">
          Preference Weights
        </h3>
        <p className="text-lime-200/60 text-xs leading-relaxed">
          How much each EFE term matters. Adult: raise <span className="text-lime-100">social</span>, <span className="text-lime-100">energy</span>, <span className="text-lime-100">injury</span>.
        </p>
        <SliderInput
          label="Risk"
          min={0} max={2} step={0.01}
          value={weights.risk}
          onChange={(v) => onWeightsChange({ ...weights, risk: v })}
          showDecimals={true}
        />
        <SliderInput
          label="Ambiguity"
          min={0} max={2} step={0.01}
          value={weights.amb}
          onChange={(v) => onWeightsChange({ ...weights, amb: v })}
          showDecimals={true}
        />
        <SliderInput
          label="InfoGain"
          min={0} max={2} step={0.01}
          value={weights.info}
          onChange={(v) => onWeightsChange({ ...weights, info: v })}
          showDecimals={true}
        />
        <SliderInput
          label="Energy"
          min={0} max={2} step={0.01}
          value={weights.energy}
          onChange={(v) => onWeightsChange({ ...weights, energy: v })}
          showDecimals={true}
        />
        <SliderInput
          label="Social"
          min={0} max={2} step={0.01}
          value={weights.social}
          onChange={(v) => onWeightsChange({ ...weights, social: v })}
          showDecimals={true}
        />
        <SliderInput
          label="Injury"
          min={0} max={2} step={0.01}
          value={weights.injury}
          onChange={(v) => onWeightsChange({ ...weights, injury: v })}
          showDecimals={true}
        />
        <SliderInput
          label="Arousal"
          min={0} max={2} step={0.01}
          value={weights.arousal}
          onChange={(v) => onWeightsChange({ ...weights, arousal: v })}
          showDecimals={true}
        />
      </div>

      <div className="border-t border-lime-500/20" />

      {/* Heatmap Axes */}
      <div className="space-y-3">
        <h3 className="text-lime-400 font-semibold text-sm">Heatmap Axes</h3>
        <div>
          <label className="text-lime-100 text-xs font-medium block mb-2">Horizontal axis</label>
          <select
            value={axisX}
            onChange={(e) => onAxisXChange(e.target.value as keyof Context)}
            className="w-full bg-black border border-lime-500/30 px-3 py-2 text-sm text-lime-100 rounded-none focus:outline-none focus:border-lime-500"
          >
            {CONTEXT_KEYS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-lime-100 text-xs font-medium block mb-2">Vertical axis</label>
          <select
            value={axisY}
            onChange={(e) => onAxisYChange(e.target.value as keyof Context)}
            className="w-full bg-black border border-lime-500/30 px-3 py-2 text-sm text-lime-100 rounded-none focus:outline-none focus:border-lime-500"
          >
            {CONTEXT_KEYS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-lime-500/20" />

      {/* Crossover Plot Controls */}
      <div className="space-y-3">
        <h3 className="text-lime-400 font-semibold text-sm">Crossover Plot</h3>
        <div>
          <label className="text-lime-100 text-xs font-medium block mb-2">Sweep axis</label>
          <select
            value={crossoverAxis}
            onChange={(e) => onCrossoverAxisChange(e.target.value as keyof Context)}
            className="w-full bg-black border border-lime-500/30 px-3 py-2 text-sm text-lime-100 rounded-none focus:outline-none focus:border-lime-500"
          >
            {CONTEXT_KEYS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <Toggle
          text="Show all policies"
          value={showAllPolicies}
          toggle={onShowAllPoliciesToggle}
          tooltip="Show all 4 policies on the crossover plot, or only the top 2 at each point"
        />
      </div>

      <div className="border-t border-lime-500/20" />

      <Button label="Reset All" onClick={onReset} size="lg" className="w-40" />
    </div>
  );
}
