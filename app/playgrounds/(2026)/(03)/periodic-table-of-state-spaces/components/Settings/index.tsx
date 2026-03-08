'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';

import {
    type Params,
    type Family,
    type ViewMode,
    VIEW_MODES,
    FAMILY_LABELS,
    FAMILY_COLORS,
    DIMENSION_LABELS,
    DIMENSION_KEYS,
    DEFAULT_PROFILE,
    STATE_SPACES,
    SAMPLE_CASES,
} from '../../logic';

interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
}

const btnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs transition-colors cursor-pointer ${
        active
            ? 'bg-lime-500/20 text-lime-400 border border-lime-500'
            : 'bg-black/40 text-lime-200/60 border border-lime-500/20 hover:border-lime-500/50'
    }`;

export default function Settings({ params, onParamsChange }: SettingsProps) {
    const set = <K extends keyof Params>(key: K, value: Params[K]) =>
        onParamsChange({ ...params, [key]: value });

    const families: (Family | 'all')[] = ['all', 'geometry', 'dynamics', 'control', 'systems', 'social', 'epistemology'];

    return (
        <>
            {/* View mode */}
            <div>
                <div className="text-lime-200/70 text-sm font-medium mb-2">View</div>
                <div className="flex flex-wrap gap-1">
                    {VIEW_MODES.map((vm) => (
                        <button
                            key={vm.key}
                            onClick={() => set('viewMode', vm.key)}
                            className={btnClass(params.viewMode === vm.key)}
                        >
                            {vm.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table mode settings */}
            {params.viewMode === 'table' && (
                <div className="mt-4 space-y-3">
                    <div>
                        <div className="text-lime-200/70 text-sm font-medium mb-2">Filter by Family</div>
                        <div className="flex flex-wrap gap-1">
                            {families.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => set('familyFilter', f)}
                                    className={btnClass(params.familyFilter === f)}
                                    style={
                                        params.familyFilter === f && f !== 'all'
                                            ? {
                                                  backgroundColor: `${FAMILY_COLORS[f]}20`,
                                                  borderColor: FAMILY_COLORS[f],
                                                  color: FAMILY_COLORS[f],
                                              }
                                            : undefined
                                    }
                                >
                                    {f === 'all' ? 'All' : FAMILY_LABELS[f]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-lime-200/70 text-sm font-medium mb-2">Search</div>
                        <input
                            type="text"
                            value={params.search}
                            onChange={(e) => set('search', e.target.value)}
                            placeholder="search types..."
                            className="w-full bg-black border border-lime-500/20 text-lime-100 text-sm px-3 py-1.5 outline-none focus:border-lime-500/50 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                            style={{ backgroundColor: '#000' }}
                        />
                    </div>

                    <div className="text-lime-200/40 text-xs">
                        Showing {
                            STATE_SPACES.filter((s) => {
                                if (params.familyFilter !== 'all' && s.family !== params.familyFilter) return false;
                                if (params.search) {
                                    const q = params.search.toLowerCase();
                                    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.short.toLowerCase().includes(q) || s.tags.some((t) => t.includes(q));
                                }
                                return true;
                            }).length
                        } / {STATE_SPACES.length}
                    </div>
                </div>
            )}

            {/* Compare mode settings */}
            {params.viewMode === 'compare' && (
                <div className="mt-4 space-y-3">
                    <div className="text-lime-200/70 text-sm font-medium">
                        Selected ({params.compareIds.length}/3)
                    </div>
                    {params.compareIds.length === 0 && (
                        <div className="text-lime-200/40 text-xs">Click tiles to select up to 3 types</div>
                    )}
                    {params.compareIds.map((id) => {
                        const space = STATE_SPACES.find((s) => s.id === id);
                        if (!space) return null;
                        return (
                            <div key={id} className="flex items-center gap-2">
                                <span
                                    className="text-xs font-mono px-1.5 py-0.5 border"
                                    style={{ borderColor: FAMILY_COLORS[space.family], color: FAMILY_COLORS[space.family] }}
                                >
                                    {space.id}
                                </span>
                                <span className="text-lime-100 text-xs flex-1">{space.name}</span>
                                <button
                                    onClick={() => set('compareIds', params.compareIds.filter((i) => i !== id))}
                                    className="text-lime-200/40 hover:text-lime-400 text-xs cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                    {params.compareIds.length > 0 && (
                        <Button label="Clear" onClick={() => set('compareIds', [])} size="sm" />
                    )}
                </div>
            )}

            {/* Classify mode settings */}
            {params.viewMode === 'classify' && (
                <div className="mt-4 space-y-3">
                    <div className="text-lime-200/70 text-sm font-medium">Dimension Profile</div>
                    {DIMENSION_KEYS.map((key) => (
                        <SliderInput
                            key={key}
                            label={DIMENSION_LABELS[key].label}
                            value={params.classifyProfile[key]}
                            onChange={(v) =>
                                set('classifyProfile', { ...params.classifyProfile, [key]: v })
                            }
                            min={0}
                            max={4}
                            step={1}
                        />
                    ))}

                    <div className="mt-2">
                        <div className="text-lime-200/70 text-sm font-medium mb-2">Presets</div>
                        <div className="flex flex-wrap gap-1">
                            {SAMPLE_CASES.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() =>
                                        onParamsChange({
                                            ...params,
                                            classifyProfile: c.profile,
                                            classifyPreset: c.name,
                                        })
                                    }
                                    className={`px-2 py-1 text-[10px] cursor-pointer border transition-colors ${
                                        params.classifyPreset === c.name
                                            ? 'border-lime-500 text-lime-400 bg-lime-500/10'
                                            : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/50 hover:text-lime-400'
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        label="Reset"
                        onClick={() =>
                            onParamsChange({
                                ...params,
                                classifyProfile: DEFAULT_PROFILE,
                                classifyPreset: null,
                            })
                        }
                        size="sm"
                    />
                </div>
            )}

            {/* Ladder mode settings */}
            {params.viewMode === 'ladder' && (
                <div className="mt-4 space-y-3">
                    <div className="text-lime-200/70 text-sm font-medium">Ladder View</div>
                    <div className="text-lime-200/40 text-xs leading-relaxed">
                        Fixed → Adaptive → Endogenous → Reflexive. Each level adds a degree of self-reference to the state space.
                    </div>
                </div>
            )}
        </>
    );
}
