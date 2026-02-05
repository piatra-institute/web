'use client';

import React from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import { Context, Weights } from '../../logic';

interface SettingsProps {
  context: Context;
  onContextChange: (ctx: Context) => void;
  weights: Weights;
  onWeightsChange: (w: Weights) => void;
  axisX: keyof Context;
  onAxisXChange: (axis: keyof Context) => void;
  axisY: keyof Context;
  onAxisYChange: (axis: keyof Context) => void;
  onReset: () => void;
}

const PRESETS = {
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

const CONTEXT_OPTIONS: Array<{ key: keyof Context; label: string; hint: string }> = [
  { key: 'crowd', label: 'Crowd / obstacles', hint: 'Collision risk & social salience' },
  { key: 'distance', label: 'Distance', hint: 'Trip length (affects energy)' },
  { key: 'surfaceHard', label: 'Surface hardness', hint: 'Impact cost on joints' },
  { key: 'hurry', label: 'Hurry / schedule pressure', hint: 'Speed preference' },
  { key: 'mastery', label: 'Skill mastery', hint: 'How well you can skip' },
  { key: 'normPressure', label: 'Norm pressure', hint: 'Social expectation weight' },
  { key: 'currentArousal', label: 'Current arousal', hint: 'How amped-up now' },
  { key: 'desiredArousal', label: 'Desired arousal', hint: 'Target energy level' },
  { key: 'novelty', label: 'Novelty / learning', hint: 'New skills available' },
  { key: 'carryingLoad', label: 'Carrying load', hint: 'Stuff in hands' },
];

export default function Settings({
  context,
  onContextChange,
  weights,
  onWeightsChange,
  axisX,
  onAxisXChange,
  axisY,
  onAxisYChange,
  onReset,
}: SettingsProps) {
  return (
    <div className="space-y-6">
      {/* Context Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lime-400 font-semibold text-sm mb-3">Context (Right now)</h3>
          <div className="space-y-3">
            {CONTEXT_OPTIONS.map(({ key, label }) => (
              <SliderInput
                key={key}
                label={label}
                min={0}
                max={1}
                step={0.01}
                value={context[key]}
                onChange={(v) =>
                  onContextChange({ ...context, [key]: v })
                }
                showDecimals={true}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-lime-500/20" />

      {/* Presets */}
      <div className="space-y-2">
        <h3 className="text-lime-400 font-semibold text-sm">Quick presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => {
                onContextChange({ ...context, ...preset.context });
                onWeightsChange({ ...weights, ...preset.weights });
              }}
              className="px-3 py-2 text-xs bg-lime-500/10 border border-lime-500/30 text-lime-100 hover:bg-lime-500/20 hover:border-lime-500 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-lime-500/20" />

      {/* Weights Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lime-400 font-semibold text-sm mb-3">
            Preference Weights (how much each factor matters)
          </h3>
          <p className="text-lime-200/60 text-xs mb-4 leading-relaxed">
            Adult default: raise <span className="text-lime-100">wSocial</span>, <span className="text-lime-100">wEnergy</span>, <span className="text-lime-100">wInjury</span>; lower <span className="text-lime-100">wInfo</span>
          </p>
          <div className="space-y-3">
            <SliderInput
              label="Risk (discomfort / falls)"
              min={0}
              max={2}
              step={0.01}
              value={weights.risk}
              onChange={(v) => onWeightsChange({ ...weights, risk: v })}
              showDecimals={true}
            />
            <SliderInput
              label="Ambiguity (signal clarity)"
              min={0}
              max={2}
              step={0.01}
              value={weights.amb}
              onChange={(v) => onWeightsChange({ ...weights, amb: v })}
              showDecimals={true}
            />
            <SliderInput
              label="InfoGain (learning value)"
              min={0}
              max={2}
              step={0.01}
              value={weights.info}
              onChange={(v) => onWeightsChange({ ...weights, info: v })}
              showDecimals={true}
            />
            <SliderInput
              label="Energy (efficiency)"
              min={0}
              max={2}
              step={0.01}
              value={weights.energy}
              onChange={(v) => onWeightsChange({ ...weights, energy: v })}
              showDecimals={true}
            />
            <SliderInput
              label="Social (norms / attention)"
              min={0}
              max={2}
              step={0.01}
              value={weights.social}
              onChange={(v) => onWeightsChange({ ...weights, social: v })}
              showDecimals={true}
            />
            <SliderInput
              label="Injury (impact risk)"
              min={0}
              max={2}
              step={0.01}
              value={weights.injury}
              onChange={(v) => onWeightsChange({ ...weights, injury: v })}
              showDecimals={true}
            />
            <SliderInput
              label="Arousal (feel-good)"
              min={0}
              max={2}
              step={0.01}
              value={weights.arousal}
              onChange={(v) => onWeightsChange({ ...weights, arousal: v })}
              showDecimals={true}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-lime-500/20" />

      {/* Heatmap Axes */}
      <div className="space-y-4">
        <h3 className="text-lime-400 font-semibold text-sm">Heatmap Axes</h3>
        <div className="space-y-3">
          <div>
            <label className="text-lime-100 text-xs font-medium block mb-2">Horizontal axis</label>
            <select
              value={axisX}
              onChange={(e) => onAxisXChange(e.target.value as keyof Context)}
              className="w-full bg-black border border-lime-500/30 px-3 py-2 text-sm text-lime-100 rounded-none focus:outline-none focus:border-lime-500"
            >
              {CONTEXT_OPTIONS.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
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
              {CONTEXT_OPTIONS.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <Button label="Reset All" onClick={onReset} size="lg" className="w-40" />
    </div>
  );
}
