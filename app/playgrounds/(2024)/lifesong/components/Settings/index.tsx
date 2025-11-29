import React from 'react';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';

interface SettingsProps {
  // Phase space parameters
  dimensions: number;
  setDimensions: (value: number) => void;
  attractorType: string;
  setAttractorType: (value: string) => void;
  timeScale: number;
  setTimeScale: (value: number) => void;
  nonlinearity: number;
  setNonlinearity: (value: number) => void;
  
  // Biological rhythms
  heartRate: number;
  setHeartRate: (value: number) => void;
  breathingRate: number;
  setBreathingRate: (value: number) => void;
  brainwaveFreq: number;
  setBrainwaveFreq: (value: number) => void;
  circadianPeriod: number;
  setCircadianPeriod: (value: number) => void;
  
  // Musical mapping
  scaleType: string;
  setScaleType: (value: string) => void;
  tempo: number;
  setTempo: (value: number) => void;
  harmonicComplexity: number;
  setHarmonicComplexity: (value: number) => void;
  timbreVariation: number;
  setTimbreVariation: (value: number) => void;
  
  // Evolutionary parameters
  fitnessFunction: string;
  setFitnessFunction: (value: string) => void;
  mutationRate: number;
  setMutationRate: (value: number) => void;
  selectionPressure: number;
  setSelectionPressure: (value: number) => void;
  
  // Visualization
  showPhaseSpace: boolean;
  setShowPhaseSpace: (value: boolean) => void;
  showRhythms: boolean;
  setShowRhythms: (value: boolean) => void;
  showSpectrum: boolean;
  setShowSpectrum: (value: boolean) => void;
  colorMode: string;
  setColorMode: (value: string) => void;
  
  // Audio
  enableAudio: boolean;
  setEnableAudio: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  speedMs: number;
  setSpeedMs: (value: number) => void;
  
  // Actions
  onReset: () => void;
  onExport: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  dimensions,
  setDimensions,
  attractorType,
  setAttractorType,
  timeScale,
  setTimeScale,
  nonlinearity,
  setNonlinearity,
  heartRate,
  setHeartRate,
  breathingRate,
  setBreathingRate,
  brainwaveFreq,
  setBrainwaveFreq,
  circadianPeriod,
  setCircadianPeriod,
  scaleType,
  setScaleType,
  tempo,
  setTempo,
  harmonicComplexity,
  setHarmonicComplexity,
  timbreVariation,
  setTimbreVariation,
  fitnessFunction,
  setFitnessFunction,
  mutationRate,
  setMutationRate,
  selectionPressure,
  setSelectionPressure,
  showPhaseSpace,
  setShowPhaseSpace,
  showRhythms,
  setShowRhythms,
  showSpectrum,
  setShowSpectrum,
  colorMode,
  setColorMode,
  enableAudio,
  setEnableAudio,
  volume,
  setVolume,
  speedMs,
  setSpeedMs,
  onReset,
  onExport,
}) => {
  return (
    <PlaygroundSettings
      sections={[
        {
          title: 'Phase Space',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Dimensions"
                value={dimensions}
                onChange={setDimensions}
                min={2}
                max={6}
                step={1}
                colorClass="text-lime-400"
              />
              <Dropdown
                name="Attractor Type"
                selected={attractorType}
                selectables={['fixed-point', 'limit-cycle', 'torus', 'strange']}
                atSelect={setAttractorType}
                tooltip="Type of attractor in phase space"
              />
              <SliderInput
                label="Time Scale"
                value={timeScale}
                onChange={setTimeScale}
                min={0.1}
                max={5}
                step={0.1}
                colorClass="text-lime-400"
                showDecimals={true}
              />
              <SliderInput
                label="Nonlinearity"
                value={nonlinearity}
                onChange={setNonlinearity}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-lime-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Biological Rhythms',
          content: (
            <div className="space-y-4">
              <SliderInput
                label="Heart Rate (BPM)"
                value={heartRate}
                onChange={setHeartRate}
                min={40}
                max={120}
                step={1}
                colorClass="text-red-400"
              />
              <SliderInput
                label="Breathing Rate (BPM)"
                value={breathingRate}
                onChange={setBreathingRate}
                min={8}
                max={30}
                step={1}
                colorClass="text-blue-400"
              />
              <SliderInput
                label="Brainwave Freq (Hz)"
                value={brainwaveFreq}
                onChange={setBrainwaveFreq}
                min={1}
                max={40}
                step={0.5}
                colorClass="text-purple-400"
                showDecimals={true}
              />
              <SliderInput
                label="Circadian Period (h)"
                value={circadianPeriod}
                onChange={setCircadianPeriod}
                min={20}
                max={28}
                step={0.1}
                colorClass="text-orange-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Musical Mapping',
          content: (
            <div className="space-y-4">
              <Dropdown
                name="Scale Type"
                selected={scaleType}
                selectables={['pentatonic', 'major', 'minor', 'chromatic', 'whole-tone']}
                atSelect={setScaleType}
                tooltip="Musical scale for pitch mapping"
              />
              <SliderInput
                label="Tempo (BPM)"
                value={tempo}
                onChange={setTempo}
                min={60}
                max={200}
                step={5}
                colorClass="text-cyan-400"
              />
              <SliderInput
                label="Harmonic Complexity"
                value={harmonicComplexity}
                onChange={setHarmonicComplexity}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-cyan-400"
                showDecimals={true}
              />
              <SliderInput
                label="Timbre Variation"
                value={timbreVariation}
                onChange={setTimbreVariation}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-cyan-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Evolution',
          content: (
            <div className="space-y-4">
              <Dropdown
                name="Fitness Function"
                selected={fitnessFunction}
                selectables={['harmony', 'complexity', 'stability', 'novelty']}
                atSelect={setFitnessFunction}
                tooltip="Evolutionary fitness criteria"
              />
              <SliderInput
                label="Mutation Rate"
                value={mutationRate}
                onChange={setMutationRate}
                min={0}
                max={0.2}
                step={0.005}
                colorClass="text-yellow-400"
                showDecimals={true}
              />
              <SliderInput
                label="Selection Pressure"
                value={selectionPressure}
                onChange={setSelectionPressure}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-yellow-400"
                showDecimals={true}
              />
            </div>
          ),
        },
        {
          title: 'Visualization',
          content: (
            <div className="space-y-2">
              <Toggle
                text="Phase Space"
                value={showPhaseSpace}
                toggle={() => setShowPhaseSpace(!showPhaseSpace)}
                tooltip="Show phase space trajectories"
              />
              <Toggle
                text="Rhythms"
                value={showRhythms}
                toggle={() => setShowRhythms(!showRhythms)}
                tooltip="Show biological rhythm patterns"
              />
              <Toggle
                text="Spectrum"
                value={showSpectrum}
                toggle={() => setShowSpectrum(!showSpectrum)}
                tooltip="Show frequency spectrum"
              />
              <Dropdown
                name="Color Mode"
                selected={colorMode}
                selectables={['frequency', 'amplitude', 'phase', 'energy']}
                atSelect={setColorMode}
                tooltip="Color mapping scheme"
              />
            </div>
          ),
        },
        {
          title: 'Audio',
          content: (
            <div className="space-y-4">
              <Toggle
                text="Enable Audio"
                value={enableAudio}
                toggle={() => setEnableAudio(!enableAudio)}
                tooltip="Enable audio synthesis"
              />
              <SliderInput
                label="Volume"
                value={volume}
                onChange={setVolume}
                min={0}
                max={1}
                step={0.01}
                colorClass="text-gray-300"
                showDecimals={true}
                disabled={!enableAudio}
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