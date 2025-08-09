'use client';

import Button from '@/components/Button';
import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';

export default function Settings(props: {

    tuition: number;
    setTuition: (value: number) => void;
    marketing: number;
    setMarketing: (value: number) => void;
    prestige: number;
    setPrestige: (value: number) => void;
    gradeLeniency: number;
    setGradeLeniency: (value: number) => void;
    qualityInvest: number;
    setQualityInvest: (value: number) => void;
    observedQuality: number;
    setObservedQuality: (value: number) => void;
    powerAsymmetry: number;
    setPowerAsymmetry: (value: number) => void;
    identityInternalization: number;
    setIdentityInternalization: (value: number) => void;
    socialComparison: number;
    setSocialComparison: (value: number) => void;
    simulationHorizon: number;
    setSimulationHorizon: (value: number) => void;
    initialReputation: number;
    setInitialReputation: (value: number) => void;
    aidShock: boolean;
    setAidShock: (value: boolean) => void;
    rankingDrop: boolean;
    setRankingDrop: (value: boolean) => void;
    gradeAudit: boolean;
    setGradeAudit: (value: boolean) => void;
    qualityProgram: boolean;
    setQualityProgram: (value: boolean) => void;
    onReset: () => void;
    onExport: () => void;
}) {
    return (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Institutional Factors',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Tuition ($/year)"
                                value={props.tuition}
                                onChange={props.setTuition}
                                min={0}
                                max={100000}
                                step={1000}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Annual tuition fee that drives expectations
                            </p>
                            
                            <SliderInput
                                label="Marketing Intensity"
                                value={props.marketing}
                                onChange={props.setMarketing}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                How aggressively the institution promotes value
                            </p>
                            
                            <SliderInput
                                label="Prestige Signaling"
                                value={props.prestige}
                                onChange={props.setPrestige}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Perceived status and ranking signals
                            </p>
                            
                            <SliderInput
                                label="Grade Leniency"
                                value={props.gradeLeniency}
                                onChange={props.setGradeLeniency}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Grade inflation artificially raises observed quality
                            </p>
                            
                            <SliderInput
                                label="Quality Investment"
                                value={props.qualityInvest}
                                onChange={props.setQualityInvest}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Investment in true educational quality
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Student Experience',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Observed Quality"
                                value={props.observedQuality}
                                onChange={props.setObservedQuality}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                What students perceive as educational quality
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Psychological Factors',
                    content: (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-400 mb-2">
                                λ = σ(θ₀ + θ₁·Power + θ₂·Identity + θ₃·Social)
                            </p>
                            
                            <SliderInput
                                label="Power Asymmetry"
                                value={props.powerAsymmetry}
                                onChange={props.setPowerAsymmetry}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Dependence on faculty for grades/references
                            </p>
                            
                            <SliderInput
                                label="Identity Internalization"
                                value={props.identityInternalization}
                                onChange={props.setIdentityInternalization}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                How much self-worth is tied to the institution
                            </p>
                            
                            <SliderInput
                                label="Social Comparison"
                                value={props.socialComparison}
                                onChange={props.setSocialComparison}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Pressure from high-achieving peer environment
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Simulation Parameters',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="Time Horizon (terms)"
                                value={props.simulationHorizon}
                                onChange={props.setSimulationHorizon}
                                min={4}
                                max={32}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2 mb-2">
                                Number of academic terms to simulate
                            </p>
                            
                            <SliderInput
                                label="Initial Reputation"
                                value={props.initialReputation}
                                onChange={props.setInitialReputation}
                                min={0}
                                max={100}
                                step={1}
                            />
                            <p className="text-xs text-gray-400 -mt-2">
                                Starting institutional reputation
                            </p>
                        </div>
                    )
                },
                {
                    title: 'Scenarios & Shocks',
                    content: (
                        <div className="space-y-4">
                            <Toggle
                                text="Aid Shock (t=4, -20% tuition)"
                                value={props.aidShock}
                                toggle={() => props.setAidShock(!props.aidShock)}
                            />
                            <Toggle
                                text="Ranking Drop (t=6, -20 prestige)"
                                value={props.rankingDrop}
                                toggle={() => props.setRankingDrop(!props.rankingDrop)}
                            />
                            <Toggle
                                text="Grade Audit Penalties"
                                value={props.gradeAudit}
                                toggle={() => props.setGradeAudit(!props.gradeAudit)}
                            />
                            <Toggle
                                text="Quality Program (t=5, +15 quality)"
                                value={props.qualityProgram}
                                toggle={() => props.setQualityProgram(!props.qualityProgram)}
                            />
                        </div>
                    )
                },
                {
                    title: 'Actions',
                    content: (
                        <div className="space-y-3">
                            <Button
                                label="Reset to Defaults"
                                onClick={props.onReset}
                                className="w-full"
                                size="sm"
                            />
                            <Button
                                label="Export Data"
                                onClick={props.onExport}
                                className="w-full"
                                size="sm"
                            />
                        </div>
                    )
                }
            ]}
        />
    );
}