'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';

import {
    Params,
    Metrics,
    Snapshot,
    SpeciesKey,
    PerturbationProfile,
    SPECIES,
    SPECIES_DESCRIPTIONS,
    PERTURBATION_PROFILES,
    speciesParams,
} from '../../logic';


interface SettingsProps {
    params: Params;
    onParamsChange: (params: Params) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

const SPECIES_KEYS: SpeciesKey[] = ['C3', 'C4', 'CAM', 'Cyanobacteria', 'RedAlgae'];

function MetricDelta({ label, current, saved, higherIsBetter = true }: {
    label: string; current: number; saved: number; higherIsBetter?: boolean;
}) {
    const delta = current - saved;
    const arrow = delta > 0.5 ? '↑' : delta < -0.5 ? '↓' : '=';
    const improved = higherIsBetter ? delta > 0.5 : delta < -0.5;
    const worsened = higherIsBetter ? delta < -0.5 : delta > 0.5;
    const color = improved ? 'text-lime-400' : worsened ? 'text-orange-400' : 'text-lime-200/40';
    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{current.toFixed(1)}</span>
            {' '}<span className={color}>{arrow} {Math.abs(delta).toFixed(1)}</span>
        </div>
    );
}

export default function Settings({
    params, onParamsChange, metrics, narrative,
    snapshot, onSaveSnapshot, onClearSnapshot,
}: SettingsProps) {
    const set = <K extends keyof Params>(key: K, value: Params[K]) =>
        onParamsChange({ ...params, [key]: value });

    const sections = [
        {
            title: 'Species',
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {SPECIES_KEYS.map(key => {
                            const active = params.species === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onParamsChange(speciesParams(key))}
                                    className={`text-left p-2 text-xs border transition-colors ${
                                        active
                                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                            : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    {SPECIES[key].label}
                                </button>
                            );
                        })}
                    </div>
                    {SPECIES_DESCRIPTIONS[params.species] && (
                        <div className="border border-lime-500/20 p-3 space-y-1">
                            <div className="text-xs text-lime-400 font-medium">
                                {SPECIES_DESCRIPTIONS[params.species].question}
                            </div>
                            <div className="text-xs text-lime-200/50 leading-relaxed">
                                {SPECIES_DESCRIPTIONS[params.species].expectation}
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Perturbation Profile',
            content: (
                <div className="grid grid-cols-2 gap-2">
                    {PERTURBATION_PROFILES.map(p => {
                        const active = params.perturbation === p;
                        return (
                            <button
                                key={p}
                                onClick={() => set('perturbation', p)}
                                className={`text-left p-2 text-xs border transition-colors ${
                                    active
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>
            ),
        },
        {
            title: 'Energy',
            content: (
                <div className="space-y-3">
                    <SliderInput label="light intensity" value={params.lightIntensity} onChange={v => set('lightIntensity', v)} min={0} max={2400} step={10} />
                    <SliderInput label="PSII wavelength (nm)" value={params.psiiWavelength} onChange={v => set('psiiWavelength', v)} min={640} max={700} step={1} />
                    <SliderInput label="PSI wavelength (nm)" value={params.psiWavelength} onChange={v => set('psiWavelength', v)} min={680} max={740} step={1} />
                    <SliderInput label="excitation balance" value={params.excitationBalance} onChange={v => set('excitationBalance', v)} min={0} max={1} step={0.01} showDecimals />
                </div>
            ),
        },
        {
            title: 'Environment',
            content: (
                <div className="space-y-3">
                    <SliderInput label="temperature (°C)" value={params.temperature} onChange={v => set('temperature', v)} min={0} max={50} step={0.5} showDecimals />
                    <SliderInput label="CO₂ (ppm)" value={params.co2} onChange={v => set('co2', v)} min={100} max={1200} step={10} />
                    <SliderInput label="water stress" value={params.waterStress} onChange={v => set('waterStress', v)} min={0} max={1} step={0.01} showDecimals />
                    <SliderInput label="nutrients" value={params.nutrients} onChange={v => set('nutrients', v)} min={0} max={1} step={0.01} showDecimals />
                </div>
            ),
        },
        {
            title: 'Protection & Repair',
            content: (
                <div className="space-y-3">
                    <SliderInput label="NPQ strength" value={params.npq} onChange={v => set('npq', v)} min={0} max={1} step={0.01} showDecimals />
                    <SliderInput label="repair turnover" value={params.repair} onChange={v => set('repair', v)} min={0} max={1} step={0.01} showDecimals />
                    <SliderInput label="cyclic e⁻ flow" value={params.cyclic} onChange={v => set('cyclic', v)} min={0} max={1} step={0.01} showDecimals />
                    <SliderInput label="stomatal control" value={params.stomatalControl} onChange={v => set('stomatalControl', v)} min={0} max={1} step={0.01} showDecimals />
                    <SliderInput label="CCM strength" value={params.ccm} onChange={v => set('ccm', v)} min={0} max={1} step={0.01} showDecimals />
                    <SliderInput label="antenna size" value={params.antenna} onChange={v => set('antenna', v)} min={0.6} max={1.4} step={0.01} showDecimals />
                    <SliderInput label="ROS buffering" value={params.rosBuffer} onChange={v => set('rosBuffer', v)} min={0} max={1} step={0.01} showDecimals />
                    <SliderInput label="damage memory" value={params.damageMemory} onChange={v => set('damageMemory', v)} min={0} max={1} step={0.01} showDecimals />
                </div>
            ),
        },
        {
            title: 'Speculative Nodes',
            content: (
                <div className="space-y-3">
                    <Toggle text="adaptive excitonic routing" value={params.adaptiveRouting} toggle={() => set('adaptiveRouting', !params.adaptiveRouting)} tooltip="Speculative fast rerouting of excitation away from overloaded subdomains" />
                    <Toggle text="dynamic thylakoid topology" value={params.dynamicTopology} toggle={() => set('dynamicTopology', !params.dynamicTopology)} tooltip="Speculative restructuring of membrane geometry to rebalance transport" />
                    <Toggle text="protonic micro-homeostasis" value={params.protonicHomeostasis} toggle={() => set('protonicHomeostasis', !params.protonicHomeostasis)} tooltip="Speculative ultrafast buffering of local proton motive fluctuations" />
                </div>
            ),
        },
        {
            title: 'Snapshot',
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Button label={snapshot ? 'update' : 'save'} onClick={onSaveSnapshot} size="xs" />
                        {snapshot && <Button label="clear" onClick={onClearSnapshot} size="xs" />}
                    </div>
                    {snapshot && (
                        <div className="border border-lime-500/20 p-2 space-y-1">
                            <div className="text-xs text-lime-200/40 mb-1">vs. {snapshot.label}</div>
                            <MetricDelta label="fixation" current={metrics.assimilation} saved={snapshot.metrics.assimilation} />
                            <MetricDelta label="ROS" current={metrics.rosIndex} saved={snapshot.metrics.rosIndex} higherIsBetter={false} />
                            <MetricDelta label="homeostasis" current={metrics.homeostasis} saved={snapshot.metrics.homeostasis} />
                            <MetricDelta label="bifurc. risk" current={metrics.bifurcationRisk} saved={snapshot.metrics.bifurcationRisk} higherIsBetter={false} />
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Interpretation',
            content: (
                <div className="border border-lime-500/20 p-3">
                    <p className="text-xs text-lime-200/70 leading-relaxed">{narrative}</p>
                </div>
            ),
        },
    ];

    return <PlaygroundSettings title="Settings" sections={sections} />;
}
