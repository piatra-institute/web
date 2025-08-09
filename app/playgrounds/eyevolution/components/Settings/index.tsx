'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';

interface SettingsProps {
    // Evolution parameters
    generations: number;
    setGenerations: (value: number) => void;
    populationSize: number;
    setPopulationSize: (value: number) => void;
    mutationRate: number;
    setMutationRate: (value: number) => void;
    selectionPressure: number;
    setSelectionPressure: (value: number) => void;
    
    // Environmental parameters
    lightIntensity: number;
    setLightIntensity: (value: number) => void;
    environmentComplexity: number;
    setEnvironmentComplexity: (value: number) => void;
    predatorPresence: number;
    setPredatorPresence: (value: number) => void;
    
    // Eye type thresholds
    eyespotThreshold: number;
    setEyespotThreshold: (value: number) => void;
    pitEyeThreshold: number;
    setPitEyeThreshold: (value: number) => void;
    pinholeThreshold: number;
    setPinholeThreshold: (value: number) => void;
    lensThreshold: number;
    setLensThreshold: (value: number) => void;
    compoundThreshold: number;
    setCompoundThreshold: (value: number) => void;
    
    // Display options
    showPhylogeny: boolean;
    setShowPhylogeny: (value: boolean) => void;
    showFitnessLandscape: boolean;
    setShowFitnessLandscape: (value: boolean) => void;
    convergentEvolution: boolean;
    setConvergentEvolution: (value: boolean) => void;
    
    // Animation
    speedMs: number;
    setSpeedMs: (value: number) => void;
    
    // Actions
    onReset: () => void;
    onExport: () => void;
}

export default function Settings(props: SettingsProps) {
    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Evolution Parameters',
                    content: (
                        <>
                            <SliderInput
                                label="Generations"
                                value={props.generations}
                                onChange={props.setGenerations}
                                min={100}
                                max={1000}
                                step={50}
                            />
                            <SliderInput
                                label="Population Size"
                                value={props.populationSize}
                                onChange={props.setPopulationSize}
                                min={20}
                                max={500}
                                step={10}
                            />
                            <SliderInput
                                label="Mutation Rate"
                                value={props.mutationRate}
                                onChange={props.setMutationRate}
                                min={0.01}
                                max={0.2}
                                step={0.01}
                            />
                            <SliderInput
                                label="Selection Pressure"
                                value={props.selectionPressure}
                                onChange={props.setSelectionPressure}
                                min={0.1}
                                max={1.0}
                                step={0.1}
                            />
                        </>
                    ),
                },
                {
                    title: 'Environmental Factors',
                    content: (
                        <>
                            <SliderInput
                                label="Light Intensity"
                                value={props.lightIntensity}
                                onChange={props.setLightIntensity}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                            <SliderInput
                                label="Environment Complexity"
                                value={props.environmentComplexity}
                                onChange={props.setEnvironmentComplexity}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                            <SliderInput
                                label="Predator Presence"
                                value={props.predatorPresence}
                                onChange={props.setPredatorPresence}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                        </>
                    ),
                },
                {
                    title: 'Eye Type Thresholds',
                    content: (
                        <>
                            <SliderInput
                                label="Eyespot Threshold"
                                value={props.eyespotThreshold}
                                onChange={props.setEyespotThreshold}
                                min={0}
                                max={1}
                                step={0.05}
                            />
                            <SliderInput
                                label="Pit Eye Threshold"
                                value={props.pitEyeThreshold}
                                onChange={props.setPitEyeThreshold}
                                min={0}
                                max={1}
                                step={0.05}
                            />
                            <SliderInput
                                label="Pinhole Threshold"
                                value={props.pinholeThreshold}
                                onChange={props.setPinholeThreshold}
                                min={0}
                                max={1}
                                step={0.05}
                            />
                            <SliderInput
                                label="Lens Threshold"
                                value={props.lensThreshold}
                                onChange={props.setLensThreshold}
                                min={0}
                                max={1}
                                step={0.05}
                            />
                            <SliderInput
                                label="Compound Eye Threshold"
                                value={props.compoundThreshold}
                                onChange={props.setCompoundThreshold}
                                min={0}
                                max={1}
                                step={0.05}
                            />
                        </>
                    ),
                },
                {
                    title: 'Display Options',
                    content: (
                        <>
                            <Toggle
                                text="Show Phylogeny Tree"
                                value={props.showPhylogeny}
                                toggle={() => props.setShowPhylogeny(!props.showPhylogeny)}
                            />
                            <Toggle
                                text="Show Fitness Landscape"
                                value={props.showFitnessLandscape}
                                toggle={() => props.setShowFitnessLandscape(!props.showFitnessLandscape)}
                            />
                            <Toggle
                                text="Show Convergent Evolution"
                                value={props.convergentEvolution}
                                toggle={() => props.setConvergentEvolution(!props.convergentEvolution)}
                            />
                        </>
                    ),
                },
                {
                    title: 'Animation',
                    content: (
                        <>
                            <SliderInput
                                label="Speed (ms)"
                                value={props.speedMs}
                                onChange={props.setSpeedMs}
                                min={10}
                                max={200}
                                step={10}
                            />
                        </>
                    ),
                },
                {
                    title: 'Actions',
                    content: (
                        <>
                            <Button onClick={props.onReset} label="Reset" />
                            <Button onClick={props.onExport} label="Export" />
                        </>
                    ),
                },
            ]}
        />
    );
}