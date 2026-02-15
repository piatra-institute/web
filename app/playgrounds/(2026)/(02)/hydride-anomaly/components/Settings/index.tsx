'use client';

import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';

import {
    type Property,
    type Unit,
    type FamilyId,
    type XAxis,
    type ViewMode,
    PROPERTIES,
    FAMILIES,
    X_AXES,
    VIEW_MODES,
    HYDRIDE_FAMILIES,
    SUBSTANCES,
} from '../../logic';

interface SettingsProps {
    viewMode: ViewMode;
    onViewModeChange: (m: ViewMode) => void;
    property: Property;
    onPropertyChange: (p: Property) => void;
    xAxis: XAxis;
    onXAxisChange: (x: XAxis) => void;
    unit: Unit;
    onUnitChange: (u: Unit) => void;
    enabledFamilies: Set<FamilyId>;
    onToggleFamily: (id: FamilyId) => void;
    onSetFamilies: (ids: FamilyId[]) => void;
    ambientC: number;
    onAmbientCChange: (t: number) => void;
    showTrendLines: boolean;
    onShowTrendLinesChange: () => void;
    pinnedCount: number;
    onClearPins: () => void;
    onReset: () => void;
}

const btnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs transition-colors cursor-pointer ${
        active
            ? 'bg-lime-500/20 text-lime-400 border border-lime-500'
            : 'bg-black/40 text-lime-200/60 border border-lime-500/20 hover:border-lime-500/50'
    }`;

export default function Settings({
    viewMode,
    onViewModeChange,
    property,
    onPropertyChange,
    xAxis,
    onXAxisChange,
    unit,
    onUnitChange,
    enabledFamilies,
    onToggleFamily,
    onSetFamilies,
    ambientC,
    onAmbientCChange,
    showTrendLines,
    onShowTrendLinesChange,
    pinnedCount,
    onClearPins,
    onReset,
}: SettingsProps) {
    const substanceCount = SUBSTANCES.filter((s) => enabledFamilies.has(s.familyId)).length;

    return (
        <>
            {/* View mode */}
            <div>
                <div className="text-lime-200/70 text-sm font-medium mb-2">View</div>
                <div className="flex flex-wrap gap-1">
                    {VIEW_MODES.map((vm) => (
                        <button
                            key={vm.key}
                            onClick={() => onViewModeChange(vm.key)}
                            className={btnClass(viewMode === vm.key)}
                            title={vm.description}
                        >
                            {vm.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Property selector */}
            <div className="mt-4">
                <div className="text-lime-200/70 text-sm font-medium mb-2">Property</div>
                <div className="flex flex-wrap gap-1">
                    {PROPERTIES.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => onPropertyChange(p.key)}
                            className={btnClass(property === p.key)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* X-axis selector (only for series view) */}
            {viewMode === 'series' && (
                <div className="mt-4">
                    <div className="text-lime-200/70 text-sm font-medium mb-2">X-axis</div>
                    <div className="flex gap-1">
                        {X_AXES.map((ax) => (
                            <button
                                key={ax.key}
                                onClick={() => onXAxisChange(ax.key)}
                                className={btnClass(xAxis === ax.key)}
                            >
                                {ax.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Unit toggle */}
            <div className="mt-4">
                <Toggle
                    text="Kelvin"
                    value={unit === 'K'}
                    toggle={() => onUnitChange(unit === 'K' ? 'C' : 'K')}
                    tooltip="Switch between Celsius and Kelvin for temperature properties"
                />
            </div>

            {/* Family toggles */}
            <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-lime-200/70 text-sm font-medium">
                        Families
                        <span className="text-lime-200/40 ml-2 text-xs">{substanceCount} substances</span>
                    </div>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-1 mb-3">
                    <button
                        onClick={() => onSetFamilies(HYDRIDE_FAMILIES)}
                        className="px-2 py-1 text-[10px] cursor-pointer border border-lime-500/20 text-lime-200/50 hover:border-lime-500/50 hover:text-lime-400 transition-colors"
                    >
                        Kurian hydrides
                    </button>
                    <button
                        onClick={() => onSetFamilies(FAMILIES.map((f) => f.id))}
                        className="px-2 py-1 text-[10px] cursor-pointer border border-lime-500/20 text-lime-200/50 hover:border-lime-500/50 hover:text-lime-400 transition-colors"
                    >
                        All families
                    </button>
                    <button
                        onClick={() => onSetFamilies([...HYDRIDE_FAMILIES, 'nobleGas'])}
                        className="px-2 py-1 text-[10px] cursor-pointer border border-lime-500/20 text-lime-200/50 hover:border-lime-500/50 hover:text-lime-400 transition-colors"
                    >
                        Hydrides + noble
                    </button>
                </div>

                {FAMILIES.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 mb-1.5">
                        <button
                            onClick={() => onToggleFamily(f.id)}
                            className={`w-4 h-4 border flex-shrink-0 cursor-pointer ${
                                enabledFamilies.has(f.id)
                                    ? 'border-lime-500'
                                    : 'border-lime-500/30'
                            }`}
                            style={{
                                backgroundColor: enabledFamilies.has(f.id) ? f.color : 'transparent',
                            }}
                        />
                        <span className={`text-xs ${
                            enabledFamilies.has(f.id) ? 'text-lime-100' : 'text-lime-200/40'
                        }`}>
                            {f.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Trend lines toggle */}
            {(viewMode === 'series' || viewMode === 'outlier') && (
                <Toggle
                    text="trend lines"
                    value={showTrendLines}
                    toggle={onShowTrendLinesChange}
                    tooltip="Show linear extrapolation from periods 3-5 to period 2"
                />
            )}

            {/* Ambient temperature */}
            <div className="mt-2">
                <div className="text-lime-200/70 text-sm font-medium mb-2">Phase lens</div>
                <SliderInput
                    label="Ambient temperature (°C)"
                    value={ambientC}
                    onChange={onAmbientCChange}
                    min={-280}
                    max={200}
                    step={5}
                />
            </div>

            {/* Pinned */}
            {pinnedCount > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lime-200/70 text-sm">
                            Pinned: <span className="text-lime-400">{pinnedCount}</span>
                        </span>
                        <button
                            onClick={onClearPins}
                            className="text-[10px] text-lime-200/50 cursor-pointer hover:text-lime-400 transition-colors border border-lime-500/20 px-2 py-0.5"
                        >
                            clear pins
                        </button>
                    </div>
                </div>
            )}

            {/* Reset */}
            <div className="mt-4">
                <Button label="Reset all" onClick={onReset} size="sm" />
            </div>
        </>
    );
}
