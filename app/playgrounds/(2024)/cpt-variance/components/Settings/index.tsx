import React from 'react';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import PlaygroundSettings from '@/components/PlaygroundSettings';

interface SettingsProps {
  chargeViolation: number;
  setChargeViolation: (value: number) => void;
  parityViolation: number;
  setParityViolation: (value: number) => void;
  timeViolation: number;
  setTimeViolation: (value: number) => void;
  cptViolation: number;
  setCptViolation: (value: number) => void;
  showIndividualTransforms: boolean;
  setShowIndividualTransforms: (value: boolean) => void;
  showCombinedTransforms: boolean;
  setShowCombinedTransforms: (value: boolean) => void;
  showKaonOscillations: boolean;
  setShowKaonOscillations: (value: boolean) => void;
  showMatterAntimatter: boolean;
  setShowMatterAntimatter: (value: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
}

const Settings: React.FC<SettingsProps> = ({
  chargeViolation,
  setChargeViolation,
  parityViolation,
  setParityViolation,
  timeViolation,
  setTimeViolation,
  cptViolation,
  setCptViolation,
  showIndividualTransforms,
  setShowIndividualTransforms,
  showCombinedTransforms,
  setShowCombinedTransforms,
  showKaonOscillations,
  setShowKaonOscillations,
  showMatterAntimatter,
  setShowMatterAntimatter,
  animationSpeed,
  setAnimationSpeed,
}) => {
  return (
    <PlaygroundSettings
      sections={[
        {
          title: 'Symmetry Violations',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="C (Charge Conjugation)"
                value={chargeViolation}
                onChange={setChargeViolation}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="P (Parity Inversion)"
                value={parityViolation}
                onChange={setParityViolation}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="T (Time Reversal)"
                value={timeViolation}
                onChange={setTimeViolation}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="CPT Violation"
                value={cptViolation}
                onChange={setCptViolation}
                min={0}
                max={0.1}
                step={0.001}
                colorClass="text-red-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Visualizations',
          content: (
            <div className="space-y-2">
              <Toggle
                text="Individual C, P, T"
                value={showIndividualTransforms}
                toggle={() => setShowIndividualTransforms(!showIndividualTransforms)}
                tooltip="Show individual charge, parity, and time transformations"
              />
              <Toggle
                text="Combined CP, CT, PT"
                value={showCombinedTransforms}
                toggle={() => setShowCombinedTransforms(!showCombinedTransforms)}
                tooltip="Show combined symmetry operations"
              />
              <Toggle
                text="Kaon Oscillations"
                value={showKaonOscillations}
                toggle={() => setShowKaonOscillations(!showKaonOscillations)}
                tooltip="Visualize CP violation in kaon decay"
              />
              <Toggle
                text="Matter-Antimatter"
                value={showMatterAntimatter}
                toggle={() => setShowMatterAntimatter(!showMatterAntimatter)}
                tooltip="Show matter-antimatter asymmetry effects"
              />
            </div>
          ),
        },
        {
          title: 'Animation',
          content: (
            <SliderInput
              label="Speed"
              value={animationSpeed}
              onChange={setAnimationSpeed}
              min={0.1}
              max={3}
              step={0.1}
              colorClass="text-gray-300"
              showDecimals={true}
            />
          ),
        },
      ]}
    />
  );
};

export default Settings;