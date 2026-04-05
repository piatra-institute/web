import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    Params,
    Metrics,
    Snapshot,
    PresetKey,
    PRESET_DESCRIPTIONS,
    DIMENSIONS,
    DimensionKey,
    presetParams,
} from '../../logic';


const PRESET_KEYS: PresetKey[] = ['baseline', 'platform-monopoly', 'extractive-finance', 'fossil-incumbent'];

interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: Metrics;
    narrative: string;
    snapshot: Snapshot | null;
    onSaveSnapshot: () => void;
    onClearSnapshot: () => void;
}

function MetricDelta({ label, current, saved }: { label: string; current: number; saved: number }) {
    const delta = current - saved;
    const pct = saved !== 0 ? (delta / saved) * 100 : 0;
    const arrow = delta > 0.5 ? '\u2191' : delta < -0.5 ? '\u2193' : '=';
    const color = delta > 0.5 ? 'text-orange-400' : delta < -0.5 ? 'text-lime-400' : 'text-lime-200/40';
    return (
        <div className="text-lime-200/60 text-xs font-mono">
            {label}: <span className="text-lime-400">{current.toFixed(0)}</span>
            {' '}<span className={color}>{arrow} {Math.abs(pct).toFixed(1)}%</span>
        </div>
    );
}


export default function Settings({
    params,
    onParamsChange,
    metrics,
    narrative,
    snapshot,
    onSaveSnapshot,
    onClearSnapshot,
}: SettingsProps) {
    const selectPreset = (key: PresetKey) => {
        onParamsChange(presetParams(key));
    };

    const updateSectorHarm = (sectorId: string, dimKey: DimensionKey, value: number) => {
        onParamsChange({
            ...params,
            sectors: params.sectors.map(s =>
                s.id === sectorId
                    ? { ...s, harms: { ...s.harms, [dimKey]: value } }
                    : s
            ),
        });
    };

    const updateSectorField = (sectorId: string, field: string, value: number) => {
        onParamsChange({
            ...params,
            sectors: params.sectors.map(s =>
                s.id === sectorId ? { ...s, [field]: value } : s
            ),
        });
    };

    const selectedSector = params.sectors.find(s => s.id === params.selectedSector) ?? params.sectors[0];
    const presetInfo = PRESET_DESCRIPTIONS[params.preset];

    return (
        <PlaygroundSettings
            title="Settings"
            sections={[
                {
                    title: 'scenario',
                    content: (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {PRESET_KEYS.map(key => (
                                    <button
                                        key={key}
                                        onClick={() => selectPreset(key)}
                                        className={`text-left px-3 py-2 text-xs border transition-colors ${
                                            params.preset === key
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {PRESET_DESCRIPTIONS[key].label}
                                    </button>
                                ))}
                            </div>
                            {presetInfo && (
                                <div className="border border-lime-500/20 p-3">
                                    <p className="text-xs text-lime-200/70 leading-relaxed italic">{presetInfo.question}</p>
                                    <p className="text-xs text-lime-200/50 leading-relaxed mt-1">{presetInfo.expectation}</p>
                                </div>
                            )}
                        </div>
                    ),
                },
                {
                    title: 'interpretation',
                    content: (
                        <div className="space-y-3">
                            <div className="border border-lime-500/20 p-3">
                                <p className="text-xs text-lime-200/70 leading-relaxed">{narrative}</p>
                            </div>
                            {snapshot ? (
                                <div className="space-y-2">
                                    <div className="text-xs text-lime-200/40">vs. snapshot ({snapshot.label})</div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <MetricDelta label="net" current={metrics.netTotal} saved={snapshot.metrics.netTotal} />
                                        <MetricDelta label="gross" current={metrics.grossTotal} saved={snapshot.metrics.grossTotal} />
                                        <MetricDelta label="fragility" current={metrics.fragility} saved={snapshot.metrics.fragility} />
                                        <MetricDelta label="obstruction" current={metrics.obstruction} saved={snapshot.metrics.obstruction} />
                                        <MetricDelta label="scalar" current={metrics.scalarIndex} saved={snapshot.metrics.scalarIndex} />
                                    </div>
                                    <Button label="clear snapshot" onClick={onClearSnapshot} size="xs" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="text-xs text-lime-200/60 font-mono">net: <span className="text-lime-400">{metrics.netTotal.toFixed(0)}</span></div>
                                        <div className="text-xs text-lime-200/60 font-mono">gross: <span className="text-lime-400">{metrics.grossTotal.toFixed(0)}</span></div>
                                        <div className="text-xs text-lime-200/60 font-mono">fragility: <span className="text-lime-400">{metrics.fragility.toFixed(0)}</span></div>
                                        <div className="text-xs text-lime-200/60 font-mono">obstruction: <span className="text-lime-400">{metrics.obstruction.toFixed(0)}%</span></div>
                                        <div className="text-xs text-lime-200/60 font-mono">scalar: <span className="text-lime-400">{metrics.scalarIndex.toFixed(0)}</span></div>
                                    </div>
                                    <Button label="save snapshot" onClick={onSaveSnapshot} size="xs" />
                                </div>
                            )}
                        </div>
                    ),
                },
                {
                    title: 'global controls',
                    content: (
                        <div className="space-y-4">
                            <SliderInput
                                label="actor power"
                                value={params.actorPower}
                                onChange={v => onParamsChange({ ...params, actorPower: v })}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="discount factor &beta;"
                                value={params.discount}
                                onChange={v => onParamsChange({ ...params, discount: v })}
                                min={0.5} max={1} step={0.01}
                                showDecimals
                            />
                            <SliderInput
                                label="future weight"
                                value={params.futureWeight}
                                onChange={v => onParamsChange({ ...params, futureWeight: v })}
                                min={0.5} max={2} step={0.05}
                                showDecimals
                            />
                            <SliderInput
                                label="repair capacity"
                                value={params.repairCapacity}
                                onChange={v => onParamsChange({ ...params, repairCapacity: v })}
                                min={0} max={100} step={1}
                            />
                        </div>
                    ),
                },
                {
                    title: 'moral weights',
                    content: (
                        <div className="space-y-3">
                            {DIMENSIONS.map(d => (
                                <SliderInput
                                    key={d.key}
                                    label={d.label}
                                    value={params.moralWeights[d.key as DimensionKey]}
                                    onChange={v => onParamsChange({
                                        ...params,
                                        moralWeights: { ...params.moralWeights, [d.key]: v },
                                    })}
                                    min={0.2} max={2} step={0.05}
                                    showDecimals
                                />
                            ))}
                            <div className="border border-lime-500/20 p-3">
                                <p className="text-xs text-lime-200/50 leading-relaxed">
                                    There is no neutral setting. Raise tail risk and ecological weight
                                    for intergenerational concern. Raise agency and political voice
                                    if domination matters more than income loss. Raise epistemic
                                    weight if manipulation is central to your theory of harm.
                                </p>
                            </div>
                        </div>
                    ),
                },
                {
                    title: `sector: ${selectedSector.name.toLowerCase()}`,
                    content: (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-1">
                                {params.sectors.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => onParamsChange({ ...params, selectedSector: s.id })}
                                        className={`px-2 py-1 text-xs border transition-colors ${
                                            params.selectedSector === s.id
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                            <SliderInput
                                label="population affected"
                                value={selectedSector.population}
                                onChange={v => updateSectorField(selectedSector.id, 'population', v)}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="network centrality"
                                value={selectedSector.centrality}
                                onChange={v => updateSectorField(selectedSector.id, 'centrality', v)}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="institutional leverage"
                                value={selectedSector.leverage}
                                onChange={v => updateSectorField(selectedSector.id, 'leverage', v)}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="claimed benefit"
                                value={selectedSector.benefit}
                                onChange={v => updateSectorField(selectedSector.id, 'benefit', v)}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="uncertainty"
                                value={selectedSector.uncertainty}
                                onChange={v => updateSectorField(selectedSector.id, 'uncertainty', v)}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="gluing compatibility"
                                value={selectedSector.gluing}
                                onChange={v => updateSectorField(selectedSector.id, 'gluing', v)}
                                min={0} max={100} step={1}
                            />
                            <div className="border-t border-lime-500/20 pt-3">
                                <div className="text-xs text-lime-200/40 mb-2">harm intensities</div>
                                {DIMENSIONS.map(d => (
                                    <SliderInput
                                        key={d.key}
                                        label={d.label}
                                        value={selectedSector.harms[d.key as DimensionKey]}
                                        onChange={v => updateSectorHarm(selectedSector.id, d.key as DimensionKey, v)}
                                        min={0} max={100} step={1}
                                    />
                                ))}
                            </div>
                        </div>
                    ),
                },
            ]}
        />
    );
}
