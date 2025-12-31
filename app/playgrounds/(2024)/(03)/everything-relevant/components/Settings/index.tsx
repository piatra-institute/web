import React from 'react';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';

interface SettingsProps {
  // Core equation parameters
  couplingConstant: number;
  setCouplingConstant: (value: number) => void;
  fieldAmplitude: number;
  setFieldAmplitude: (value: number) => void;
  spacetimeCurvature: number;
  setSpacetimeCurvature: (value: number) => void;
  quantumFluctuations: number;
  setQuantumFluctuations: (value: number) => void;
  
  // Emergent phenomena
  showParticles: boolean;
  setShowParticles: (value: boolean) => void;
  showForces: boolean;
  setShowForces: (value: boolean) => void;
  showSpacetime: boolean;
  setShowSpacetime: (value: boolean) => void;
  showQuantumFoam: boolean;
  setShowQuantumFoam: (value: boolean) => void;
  
  // Symmetries and conservation laws
  timeTranslation: boolean;
  setTimeTranslation: (value: boolean) => void;
  spaceTranslation: boolean;
  setSpaceTranslation: (value: boolean) => void;
  rotation: boolean;
  setRotation: (value: boolean) => void;
  gauge: boolean;
  setGauge: (value: boolean) => void;
  
  // Observable parameters
  energyScale: number;
  setEnergyScale: (value: number) => void;
  lengthScale: number;
  setLengthScale: (value: number) => void;
  dimensionality: number;
  setDimensionality: (value: number) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  
  // Visualization
  projectionType: string;
  setProjectionType: (value: string) => void;
  colorScheme: string;
  setColorScheme: (value: string) => void;
  showEquation: boolean;
  setShowEquation: (value: boolean) => void;
  animateFields: boolean;
  setAnimateFields: (value: boolean) => void;
  
  speedMs: number;
  setSpeedMs: (value: number) => void;
  
  // Actions
  onReset: () => void;
  onExport: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  couplingConstant,
  setCouplingConstant,
  fieldAmplitude,
  setFieldAmplitude,
  spacetimeCurvature,
  setSpacetimeCurvature,
  quantumFluctuations,
  setQuantumFluctuations,
  showParticles,
  setShowParticles,
  showForces,
  setShowForces,
  showSpacetime,
  setShowSpacetime,
  showQuantumFoam,
  setShowQuantumFoam,
  timeTranslation,
  setTimeTranslation,
  spaceTranslation,
  setSpaceTranslation,
  rotation,
  setRotation,
  gauge,
  setGauge,
  energyScale,
  setEnergyScale,
  lengthScale,
  setLengthScale,
  dimensionality,
  setDimensionality,
  temperature,
  setTemperature,
  projectionType,
  setProjectionType,
  colorScheme,
  setColorScheme,
  showEquation,
  setShowEquation,
  animateFields,
  setAnimateFields,
  speedMs,
  setSpeedMs,
  onReset,
  onExport,
}) => {
  return (
    <PlaygroundSettings
      sections={[
        {
          title: 'Fundamental Parameters',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Coupling Constant (g)"
                value={couplingConstant}
                onChange={setCouplingConstant}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="Field Amplitude (φ)"
                value={fieldAmplitude}
                onChange={setFieldAmplitude}
                min={0}
                max={5}
                step={0.1}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="Spacetime Curvature (R)"
                value={spacetimeCurvature}
                onChange={setSpacetimeCurvature}
                min={0}
                max={2}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="Quantum Fluctuations (ℏ)"
                value={quantumFluctuations}
                onChange={setQuantumFluctuations}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-purple-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Emergent Phenomena',
          content: (
            <div className="space-y-2">
              <Toggle
                text="Particles"
                value={showParticles}
                toggle={() => setShowParticles(!showParticles)}
                tooltip="Show particle excitations in quantum fields"
              />
              <Toggle
                text="Forces"
                value={showForces}
                toggle={() => setShowForces(!showForces)}
                tooltip="Show force field interactions"
              />
              <Toggle
                text="Spacetime"
                value={showSpacetime}
                toggle={() => setShowSpacetime(!showSpacetime)}
                tooltip="Show spacetime curvature effects"
              />
              <Toggle
                text="Quantum Foam"
                value={showQuantumFoam}
                toggle={() => setShowQuantumFoam(!showQuantumFoam)}
                tooltip="Show quantum spacetime fluctuations"
              />
            </div>
          ),
        },
        {
          title: 'Symmetries & Conservation',
          content: (
            <div className="space-y-2">
              <Toggle
                text="Time Translation"
                value={timeTranslation}
                toggle={() => setTimeTranslation(!timeTranslation)}
                tooltip="Energy conservation via time translation symmetry"
              />
              <Toggle
                text="Space Translation"
                value={spaceTranslation}
                toggle={() => setSpaceTranslation(!spaceTranslation)}
                tooltip="Momentum conservation via spatial translation symmetry"
              />
              <Toggle
                text="Rotation"
                value={rotation}
                toggle={() => setRotation(!rotation)}
                tooltip="Angular momentum conservation via rotational symmetry"
              />
              <Toggle
                text="Gauge"
                value={gauge}
                toggle={() => setGauge(!gauge)}
                tooltip="Gauge invariance and charge conservation"
              />
            </div>
          ),
        },
        {
          title: 'Observable Parameters',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Energy Scale (GeV)"
                value={energyScale}
                onChange={setEnergyScale}
                min={0.001}
                max={1000}
                step={0.1}
                colorClass="text-red-400"
                showDecimals={true}
              />
              <SliderInput
                label="Length Scale (m)"
                value={lengthScale}
                onChange={setLengthScale}
                min={1e-18}
                max={1e-10}
                step={1e-19}
                colorClass="text-blue-400"
                showDecimals={false}
              />
              <SliderInput
                label="Dimensionality"
                value={dimensionality}
                onChange={setDimensionality}
                min={1}
                max={11}
                step={1}
                colorClass="text-orange-400"
              />
              <SliderInput
                label="Temperature (K)"
                value={temperature}
                onChange={setTemperature}
                min={0}
                max={1e12}
                step={1e9}
                colorClass="text-yellow-400"
                showDecimals={false}
              />
            </div>
          ),
        },
        {
          title: 'Visualization',
          content: (
            <div className="space-y-4">
              <Dropdown
                name="Projection"
                selected={projectionType}
                selectables={['2D', '3D', 'spacetime', 'compactified']}
                atSelect={setProjectionType}
                tooltip="How to project higher dimensions"
              />
              <Dropdown
                name="Color Scheme"
                selected={colorScheme}
                selectables={['energy', 'field-strength', 'curvature', 'symmetry']}
                atSelect={setColorScheme}
                tooltip="Visual encoding of physical quantities"
              />
              <Toggle
                text="Show Equation"
                value={showEquation}
                toggle={() => setShowEquation(!showEquation)}
                tooltip="Display the unified field equation"
              />
              <Toggle
                text="Animate Fields"
                value={animateFields}
                toggle={() => setAnimateFields(!animateFields)}
                tooltip="Show field evolution over time"
              />
            </div>
          ),
        },
        {
          title: 'Animation',
          content: (
            <SliderInput
              label="Speed"
              value={speedMs}
              onChange={setSpeedMs}
              min={10}
              max={100}
              step={5}
              colorClass="text-gray-300"
            />
          ),
        },
        {
          title: 'Actions',
          content: (
            <div className="flex gap-4">
              <Button onClick={onReset} label="Reset" />
              <Button onClick={onExport} label="Export" />
            </div>
          ),
        },
      ]}
    />
  );
};

export default Settings;