import React from 'react';
import SettingsContainer from '@/components/SettingsContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import { Metrics, getQualitativeAssessment, getZoneDescription } from '../../logic';

interface SettingsProps {
  corruption: number;
  randomness: number;
  showAbout: boolean;
  metrics: Metrics;
  onCorruptionChange: (value: number) => void;
  onRandomnessChange: (value: number) => void;
  onShowAboutChange: (value: boolean) => void;
  onReset: () => void;
  onExport: () => void;
}

export default function Settings({
  corruption,
  randomness,
  showAbout,
  metrics,
  onCorruptionChange,
  onRandomnessChange,
  onShowAboutChange,
  onReset,
  onExport,
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
          />
          <p className="text-xs text-gray-400 mt-1">
            0 = fully deterministic, 1 = fully random
          </p>
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
              <h4 className="font-medium text-gray-200 mb-1">Fairness Assessment</h4>
              <div className="space-y-1 text-gray-400">
                <p>Normalized Score: <span className="text-white">{metrics.normFairness.toFixed(3)}</span></p>
                <p>Bias Impact: <span className="text-white">{metrics.biasImpact.toFixed(3)}</span></p>
                <p>Quality: <span className="text-white">{qualitativeAssessment}</span></p>
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
                <div className="w-3 h-3" style={{ backgroundColor: 'rgba(89, 161, 79, 1)' }}></div>
                <span className="text-gray-400">Higher Fairness Entropy (H*)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: 'rgba(89, 161, 79, 0.3)' }}></div>
                <span className="text-gray-400">Lower Fairness Entropy (H*)</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-gray-200">Marker</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffeb3b', border: '1px solid black' }}></div>
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