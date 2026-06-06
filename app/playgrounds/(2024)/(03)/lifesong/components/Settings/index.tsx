import React, { useState } from 'react';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import type { LifesongExportKind, LifesongExportOptions } from '../Viewer';


const EXPORT_KINDS: { kind: LifesongExportKind; label: string; hint: string }[] = [
  { kind: 'image', label: 'image', hint: 'PNG still of the lifesong' },
  { kind: 'audio', label: 'song', hint: 'WAV rendering of the current song' },
  { kind: 'video', label: 'loop', hint: 'WebM lifesong loop' },
];

const PRESETS = [
  {
    label: 'cardiac orbit',
    description: 'steady pulse, warm pentatonic motion',
    values: {
      dimensions: 3,
      attractorType: 'limit-cycle',
      timeScale: 1.2,
      nonlinearity: 0.32,
      heartRate: 72,
      breathingRate: 14,
      brainwaveFreq: 8,
      circadianPeriod: 24,
      scaleType: 'pentatonic',
      tempo: 96,
      harmonicComplexity: 0.35,
      timbreVariation: 0.2,
      fitnessFunction: 'stability',
      mutationRate: 0.02,
      selectionPressure: 0.82,
      showPhaseSpace: true,
      showRhythms: true,
      showSpectrum: true,
      colorMode: 'frequency',
      speedMs: 45,
    },
  },
  {
    label: 'neural weather',
    description: 'fast oscillations, chromatic sparks',
    values: {
      dimensions: 4,
      attractorType: 'strange',
      timeScale: 1.85,
      nonlinearity: 0.78,
      heartRate: 86,
      breathingRate: 20,
      brainwaveFreq: 32,
      circadianPeriod: 23.4,
      scaleType: 'chromatic',
      tempo: 150,
      harmonicComplexity: 0.82,
      timbreVariation: 0.88,
      fitnessFunction: 'novelty',
      mutationRate: 0.12,
      selectionPressure: 0.38,
      showPhaseSpace: true,
      showRhythms: true,
      showSpectrum: true,
      colorMode: 'energy',
      speedMs: 30,
    },
  },
  {
    label: 'circadian tide',
    description: 'slow drift, minor harmonic breathing',
    values: {
      dimensions: 3,
      attractorType: 'torus',
      timeScale: 0.62,
      nonlinearity: 0.22,
      heartRate: 58,
      breathingRate: 9,
      brainwaveFreq: 4.5,
      circadianPeriod: 25.2,
      scaleType: 'minor',
      tempo: 72,
      harmonicComplexity: 0.58,
      timbreVariation: 0.36,
      fitnessFunction: 'harmony',
      mutationRate: 0.035,
      selectionPressure: 0.64,
      showPhaseSpace: true,
      showRhythms: true,
      showSpectrum: true,
      colorMode: 'phase',
      speedMs: 70,
    },
  },
  {
    label: 'metabolic flare',
    description: 'bright unstable life, high mutation',
    values: {
      dimensions: 5,
      attractorType: 'strange',
      timeScale: 2.4,
      nonlinearity: 0.92,
      heartRate: 104,
      breathingRate: 24,
      brainwaveFreq: 18,
      circadianPeriod: 21.6,
      scaleType: 'whole-tone',
      tempo: 176,
      harmonicComplexity: 0.72,
      timbreVariation: 0.68,
      fitnessFunction: 'complexity',
      mutationRate: 0.18,
      selectionPressure: 0.46,
      showPhaseSpace: true,
      showRhythms: true,
      showSpectrum: true,
      colorMode: 'amplitude',
      speedMs: 25,
    },
  },
  {
    label: 'homeostasis',
    description: 'quiet fixed point, almost breathing',
    values: {
      dimensions: 2,
      attractorType: 'fixed-point',
      timeScale: 0.38,
      nonlinearity: 0.12,
      heartRate: 64,
      breathingRate: 11,
      brainwaveFreq: 7,
      circadianPeriod: 24.8,
      scaleType: 'major',
      tempo: 84,
      harmonicComplexity: 0.24,
      timbreVariation: 0.12,
      fitnessFunction: 'stability',
      mutationRate: 0.005,
      selectionPressure: 0.94,
      showPhaseSpace: true,
      showRhythms: true,
      showSpectrum: true,
      colorMode: 'frequency',
      speedMs: 85,
    },
  },
] as const;

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
  onExport: (options: LifesongExportOptions) => void;
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
  const [exportKind, setExportKind] = useState<LifesongExportKind>('image');
  const [includeOverlay, setIncludeOverlay] = useState(true);
  const visualExport = exportKind !== 'audio';

  const loadPreset = (preset: typeof PRESETS[number]) => {
    const { values } = preset;
    setDimensions(values.dimensions);
    setAttractorType(values.attractorType);
    setTimeScale(values.timeScale);
    setNonlinearity(values.nonlinearity);
    setHeartRate(values.heartRate);
    setBreathingRate(values.breathingRate);
    setBrainwaveFreq(values.brainwaveFreq);
    setCircadianPeriod(values.circadianPeriod);
    setScaleType(values.scaleType);
    setTempo(values.tempo);
    setHarmonicComplexity(values.harmonicComplexity);
    setTimbreVariation(values.timbreVariation);
    setFitnessFunction(values.fitnessFunction);
    setMutationRate(values.mutationRate);
    setSelectionPressure(values.selectionPressure);
    setShowPhaseSpace(values.showPhaseSpace);
    setShowRhythms(values.showRhythms);
    setShowSpectrum(values.showSpectrum);
    setColorMode(values.colorMode);
    setSpeedMs(values.speedMs);
    setEnableAudio(false);
  };

  return (
    <PlaygroundSettings
      sections={[
        {
          title: 'Presets',
          content: (
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className="border border-lime-500/20 px-3 py-2 text-left transition-colors hover:border-lime-500/50 hover:bg-lime-500/10"
                >
                  <div className="text-xs text-lime-400 font-semibold">
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-lime-200/45 mt-1">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          ),
        },
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
            <div className="space-y-4">
              <div className="border border-lime-500/20 p-3 space-y-3">
                <div className="text-xs text-lime-400 font-semibold">Export</div>
                <div className="grid grid-cols-3 gap-1">
                  {EXPORT_KINDS.map((option) => (
                    <button
                      key={option.kind}
                      type="button"
                      onClick={() => setExportKind(option.kind)}
                      className={`border px-2 py-2 text-xs transition-colors ${
                        exportKind === option.kind
                          ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                          : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                      }`}
                      title={option.hint}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-lime-200/40 leading-relaxed">
                  {EXPORT_KINDS.find(option => option.kind === exportKind)?.hint}
                </div>
                {visualExport && (
                  <Toggle
                    text="Overlay UI"
                    value={includeOverlay}
                    toggle={() => setIncludeOverlay(!includeOverlay)}
                    tooltip="Include titles, panel labels, and readouts in image/video exports"
                  />
                )}
                <Button
                  onClick={() => onExport({ kind: exportKind, includeOverlay })}
                  label={`Export ${exportKind === 'audio' ? 'song' : exportKind}`}
                  className="w-full"
                />
              </div>
              <Button onClick={onReset} label="Reset" className="w-full" />
            </div>
          ),
        },
      ]}
    />
  );
};

export default Settings;
