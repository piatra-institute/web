import React from 'react';
import SettingsContainer from '@/components/SettingsContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import { Metrics, CorruptionType, getQualitativeAssessment, getZoneDescription } from '../../logic';

interface SettingsProps {
  corruption: number;
  randomness: number;
  showAbout: boolean;
  metrics: Metrics;
  presets: Array<{ name: string; corruption: number; randomness: number }>;
  isAnimating: boolean;
  corruptionType: CorruptionType;
  onCorruptionChange: (value: number) => void;
  onRandomnessChange: (value: number) => void;
  onShowAboutChange: (value: boolean) => void;
  onCorruptionTypeChange: (type: CorruptionType) => void;
  onReset: () => void;
  onExport: () => void;
  onPresetSelect: (preset: { name: string; corruption: number; randomness: number }) => void;
}

export default function Settings({
  corruption,
  randomness,
  showAbout,
  metrics,
  presets,
  isAnimating,
  corruptionType,
  onCorruptionChange,
  onRandomnessChange,
  onShowAboutChange,
  onCorruptionTypeChange,
  onReset,
  onExport,
  onPresetSelect,
}: SettingsProps) {
  const qualitativeAssessment = getQualitativeAssessment(metrics.H_fair);
  const { zone, interpretation } = getZoneDescription(metrics.C, metrics.R, metrics.H_fair);
  return (
    <SettingsContainer>
      <div className="space-y-4 max-h-[500px] overflow-auto">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Corruption (C): {corruption.toFixed(2)}
          </label>
          <Input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={corruption}
            onChange={(value) => onCorruptionChange(parseFloat(value))}
            compact
          />
          <p className="text-xs text-gray-400 mt-1">
            0 = incorruptible, 1 = fully biased
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Randomness (R): {randomness.toFixed(2)}
          </label>
          <Input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={randomness}
            onChange={(value) => onRandomnessChange(parseFloat(value))}
            compact
          />
          <p className="text-xs text-gray-400 mt-1">
            0 = fully deterministic, 1 = fully random
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Corruption Type
          </label>
          <select
            value={corruptionType}
            onChange={(e) => onCorruptionTypeChange(e.target.value as CorruptionType)}
            className="w-full px-3 py-2 text-xs bg-black text-gray-200 border border-gray-600 rounded focus:outline-none focus:border-gray-500"
          >
            <option value={CorruptionType.DIRECTIONAL}>Directional Bias</option>
            <option value={CorruptionType.VARIANCE}>Increased Variance</option>
            <option value={CorruptionType.SYSTEMATIC}>Systematic Error</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {corruptionType === CorruptionType.DIRECTIONAL && "Systematic bias toward specific outcomes"}
            {corruptionType === CorruptionType.VARIANCE && "Increased unpredictability in decisions"}
            {corruptionType === CorruptionType.SYSTEMATIC && "Institutional incompetence and errors"}
          </p>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="font-semibold text-white mb-3 text-sm">Presets</h3>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onPresetSelect(preset)}
                disabled={isAnimating}
                className="w-full px-3 py-2 text-xs bg-black hover:bg-gray-900 disabled:bg-gray-900 disabled:text-gray-500 text-left text-gray-200 rounded border border-gray-600 transition-colors duration-200"
                title={`C: ${preset.corruption}, R: ${preset.randomness}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Toggle
            text="Show About"
            value={showAbout}
            toggle={() => onShowAboutChange(!showAbout)}
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="font-semibold text-white mb-3 text-sm">Metrics</h3>
          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-medium text-gray-200 mb-1">Information Theory</h4>
              <div className="space-y-1 text-gray-400">
                <p>Shannon Entropy: <span className="text-white">{metrics.H.toFixed(3)}</span> bits</p>
                <p>KL Divergence: <span className="text-white">{metrics.D.toFixed(3)}</span> bits</p>
                <p>Effective Fairness: <span className="text-white">{metrics.H_fair.toFixed(3)}</span> bits</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-200 mb-1">Core Fairness Metrics</h4>
              <div className="space-y-1 text-gray-400">
                <p>Normalized Score: <span className="text-white">{metrics.normFairness.toFixed(3)}</span></p>
                <p>Bias Impact: <span className="text-white">{metrics.biasImpact.toFixed(3)}</span></p>
                <p>Quality: <span className="text-white">{qualitativeAssessment}</span></p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-200 mb-1">Advanced Metrics</h4>
              <div className="space-y-1 text-gray-400">
                <p>Demographic Parity: <span className="text-white">{metrics.demographicParity.toFixed(3)}</span></p>
                <p>Total Variation: <span className="text-white">{metrics.totalVariation.toFixed(3)}</span></p>
                <p>Jensen-Shannon Div: <span className="text-white">{metrics.jensenShannonDivergence.toFixed(3)}</span></p>
                <p>Institutional Efficiency: <span className="text-white">{metrics.institutionalEfficiency.toFixed(3)}</span></p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-200 mb-1">Current Zone</h4>
              <p className="text-gray-400 leading-tight">{interpretation}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="font-semibold text-white mb-3 text-sm">Legend</h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <h4 className="font-medium text-gray-200">Heatmap Colors</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: 'rgb(70, 150, 70)' }}></div>
                <span className="text-gray-400">High Fairness (H* &gt; 0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: 'rgb(180, 180, 30)' }}></div>
                <span className="text-gray-400">Medium Fairness (0.3-0.7)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: 'rgb(180, 80, 30)' }}></div>
                <span className="text-gray-400">Low Fairness (H* &lt; 0.3)</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-gray-200">Marker</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffd700', border: '1px solid black' }}></div>
                <span className="text-gray-400">Current selection - Draggable</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-gray-200">Zones</h4>
              <div className="space-y-1 text-gray-400">
                <p><span className="text-cyan-400">◼</span> Ideal Fair (Low C, High R)</p>
                <p><span className="text-orange-400">◼</span> Corrupt & Unfair (High C, Low R)</p>
                <p><span className="text-gray-500">◼</span> Random Justice (Mid C, Mid R)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-700">
          <Button label="Reset" onClick={onReset} className="flex-1" />
          <Button label="Export" onClick={onExport} className="flex-1" />
        </div>
      </div>
    </SettingsContainer>
  );
}