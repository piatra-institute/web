'use client';

import SliderInput from '@/components/SliderInput';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';

import {
    type Params,
    type Domain,
    type ViewMode,
    type IgneousTexture,
    type SedType,
    type GrainSize,
    type ChemComposition,
    type OrganicType,
    type Protolith,
    type Pressure,
    VIEW_MODES,
    DOMAIN_OPTIONS,
    DOMAIN_COLORS,
    TEXTURE_OPTIONS,
    SED_TYPE_OPTIONS,
    GRAIN_SIZE_OPTIONS,
    CHEM_COMPOSITION_OPTIONS,
    ORGANIC_TYPE_OPTIONS,
    PROTOLITH_OPTIONS,
    PRESSURE_OPTIONS,
    PRESETS,
    DEFAULT_PARAMS,
} from '../../logic';
import type { ClassificationResult } from '../../logic';

interface SettingsProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    result: ClassificationResult | null;
}

const btnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs transition-colors cursor-pointer ${
        active
            ? 'bg-lime-500/20 text-lime-400 border border-lime-500'
            : 'bg-black/40 text-lime-200/60 border border-lime-500/20 hover:border-lime-500/50'
    }`;

const domainBtnClass = (active: boolean, domain: Domain) => {
    const color = DOMAIN_COLORS[domain];
    return `px-3 py-1.5 text-xs transition-colors cursor-pointer border ${
        active
            ? `text-white`
            : 'text-lime-200/60 border-lime-500/20 hover:border-lime-500/50 bg-black/40'
    }`;
};

export default function Settings({ params, onParamsChange, result }: SettingsProps) {
    const set = <K extends keyof Params>(key: K, value: Params[K]) =>
        onParamsChange({ ...params, [key]: value });

    const loadPreset = (preset: typeof PRESETS[number]) => {
        onParamsChange({ ...DEFAULT_PARAMS, ...preset.params, viewMode: 'classifier' });
    };

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

            {/* Domain (classifier mode) */}
            {params.viewMode === 'classifier' && (
                <div className="mt-4">
                    <div className="text-lime-200/70 text-sm font-medium mb-2">Domain</div>
                    <div className="flex flex-wrap gap-1">
                        {DOMAIN_OPTIONS.map((d) => (
                            <button
                                key={d.key}
                                onClick={() => set('domain', d.key)}
                                className={domainBtnClass(params.domain === d.key, d.key)}
                                style={params.domain === d.key ? {
                                    backgroundColor: `${DOMAIN_COLORS[d.key]}20`,
                                    borderColor: DOMAIN_COLORS[d.key],
                                    color: DOMAIN_COLORS[d.key],
                                } : undefined}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Domain-specific parameters */}
            {params.viewMode === 'classifier' && params.domain === 'igneous' && (
                <div className="mt-4 space-y-3">
                    <div className="text-lime-200/70 text-sm font-medium">Igneous Parameters</div>
                    <SliderInput
                        label="SiO₂ %"
                        value={params.sio2}
                        onChange={(v) => set('sio2', v)}
                        min={35}
                        max={80}
                        step={1}
                    />
                    <div className="text-lime-200/50 text-[10px] mt-1">
                        {params.sio2 < 45 ? 'ultramafic' : params.sio2 < 52 ? 'mafic' : params.sio2 < 63 ? 'intermediate' : 'felsic'}
                    </div>

                    <div>
                        <div className="text-lime-200/50 text-xs mb-1">Texture</div>
                        <div className="flex flex-wrap gap-1">
                            {TEXTURE_OPTIONS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => set('texture', t.key)}
                                    className={btnClass(params.texture === t.key)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Toggle
                        text="high alkali"
                        value={params.highAlkali}
                        toggle={() => set('highAlkali', !params.highAlkali)}
                        tooltip="Alkali-rich magma favors syenite/trachyte over diorite/andesite"
                    />

                    {params.texture === 'volcanic' && (
                        <Toggle
                            text="vesicular"
                            value={params.vesicular}
                            toggle={() => set('vesicular', !params.vesicular)}
                            tooltip="Gas bubbles trapped in lava → pumice"
                        />
                    )}

                    {params.texture === 'plutonic' && (
                        <Toggle
                            text="very coarse"
                            value={params.veryCoarse}
                            toggle={() => set('veryCoarse', !params.veryCoarse)}
                            tooltip="Crystals >2 cm from volatile-rich fluids → pegmatite"
                        />
                    )}

                    {params.sio2 < 45 && params.texture !== 'volcanic' && (
                        <div className="mt-3 pt-3 border-t border-lime-500/10">
                            <div className="text-lime-200/50 text-xs mb-2">Ternary (Ol / Opx / Cpx)</div>
                            <SliderInput
                                label="Olivine"
                                value={params.ol}
                                onChange={(v) => set('ol', v)}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="Orthopyroxene"
                                value={params.opx}
                                onChange={(v) => set('opx', v)}
                                min={0} max={100} step={1}
                            />
                            <SliderInput
                                label="Clinopyroxene"
                                value={params.cpx}
                                onChange={(v) => set('cpx', v)}
                                min={0} max={100} step={1}
                            />
                        </div>
                    )}
                </div>
            )}

            {params.viewMode === 'classifier' && params.domain === 'sedimentary' && (
                <div className="mt-4 space-y-3">
                    <div className="text-lime-200/70 text-sm font-medium">Sedimentary Parameters</div>
                    <div>
                        <div className="text-lime-200/50 text-xs mb-1">Type</div>
                        <div className="flex flex-wrap gap-1">
                            {SED_TYPE_OPTIONS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => set('sedType', t.key)}
                                    className={btnClass(params.sedType === t.key)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {params.sedType === 'clastic' && (
                        <>
                            <Dropdown
                                name="grain size"
                                selected={params.grainSize}
                                selectables={GRAIN_SIZE_OPTIONS.map((g) => g.key)}
                                atSelect={(v) => set('grainSize', v as GrainSize)}
                            />
                            {params.grainSize === 'clay' && (
                                <Toggle text="fissile" value={params.fissile} toggle={() => set('fissile', !params.fissile)} tooltip="Splits into thin layers → shale vs mudstone" />
                            )}
                            {params.grainSize === 'gravel' && (
                                <>
                                    <Toggle text="rounded" value={params.rounded} toggle={() => set('rounded', !params.rounded)} tooltip="Rounded = conglomerate, angular = breccia" />
                                    <Toggle text="glacial" value={params.glacial} toggle={() => set('glacial', !params.glacial)} tooltip="Unsorted glacial deposit → tillite" />
                                </>
                            )}
                            {params.grainSize === 'sand' && (
                                <>
                                    <Toggle text="feldspathic" value={params.feldspathic} toggle={() => set('feldspathic', !params.feldspathic)} tooltip=">25% feldspar → arkose" />
                                    <Toggle text="poorly sorted" value={params.poorlySorted} toggle={() => set('poorlySorted', !params.poorlySorted)} tooltip="Mixed grain sizes with rock fragments → graywacke" />
                                </>
                            )}
                        </>
                    )}

                    {params.sedType === 'chemical' && (
                        <>
                            <Dropdown
                                name="composition"
                                selected={params.chemComposition}
                                selectables={CHEM_COMPOSITION_OPTIONS.map((c) => c.key)}
                                atSelect={(v) => set('chemComposition', v as ChemComposition)}
                            />
                            {params.chemComposition === 'carbonate' && (
                                <>
                                    <Toggle text="Mg-rich" value={params.mgRich} toggle={() => set('mgRich', !params.mgRich)} tooltip="Mg-rich carbonate → dolostone" />
                                    <Toggle text="biogenic" value={params.biogenic} toggle={() => set('biogenic', !params.biogenic)} tooltip="Coccolithophore shells → chalk" />
                                    <Toggle text="hot spring" value={params.hotSpring} toggle={() => set('hotSpring', !params.hotSpring)} tooltip="Thermal water precipitation → travertine" />
                                </>
                            )}
                            {params.chemComposition === 'evaporite' && (
                                <Toggle text="Ca-sulfate" value={params.mgRich} toggle={() => set('mgRich', !params.mgRich)} tooltip="CaSO₄ → gypsum, NaCl → rock salt" />
                            )}
                        </>
                    )}

                    {params.sedType === 'organic' && (
                        <Dropdown
                            name="organic type"
                            selected={params.organicType}
                            selectables={ORGANIC_TYPE_OPTIONS.map((o) => o.key)}
                            atSelect={(v) => set('organicType', v as OrganicType)}
                        />
                    )}
                </div>
            )}

            {params.viewMode === 'classifier' && params.domain === 'metamorphic' && (
                <div className="mt-4 space-y-3">
                    <div className="text-lime-200/70 text-sm font-medium">Metamorphic Parameters</div>
                    <Dropdown
                        name="protolith"
                        selected={params.protolith}
                        selectables={PROTOLITH_OPTIONS.map((p) => p.key)}
                        atSelect={(v) => set('protolith', v as Protolith)}
                    />
                    <SliderInput
                        label="grade"
                        value={params.grade}
                        onChange={(v) => set('grade', v)}
                        min={0} max={100} step={1}
                    />
                    <div>
                        <div className="text-lime-200/50 text-xs mb-1">Pressure</div>
                        <div className="flex flex-wrap gap-1">
                            {PRESSURE_OPTIONS.map((p) => (
                                <button
                                    key={p.key}
                                    onClick={() => set('pressure', p.key)}
                                    className={btnClass(params.pressure === p.key)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Toggle
                        text="contact metamorphism"
                        value={params.contact}
                        toggle={() => set('contact', !params.contact)}
                        tooltip="Contact (near intrusion) vs regional metamorphism"
                    />
                </div>
            )}

            {/* Atlas filter */}
            {params.viewMode === 'atlas' && (
                <div className="mt-4">
                    <div className="text-lime-200/70 text-sm font-medium mb-2">Filter</div>
                    <div className="flex flex-wrap gap-1">
                        <button
                            onClick={() => set('atlasFilter', 'all')}
                            className={btnClass(params.atlasFilter === 'all')}
                        >
                            All
                        </button>
                        {DOMAIN_OPTIONS.map((d) => (
                            <button
                                key={d.key}
                                onClick={() => set('atlasFilter', d.key)}
                                className={btnClass(params.atlasFilter === d.key)}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Presets */}
            {params.viewMode === 'classifier' && (
                <div className="mt-4">
                    <div className="text-lime-200/70 text-sm font-medium mb-2">Presets</div>
                    <div className="flex flex-wrap gap-1">
                        {PRESETS.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => loadPreset(p)}
                                className="px-2 py-1 text-[10px] cursor-pointer border border-lime-500/20 text-lime-200/50 hover:border-lime-500/50 hover:text-lime-400 transition-colors"
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Result panel (classifier mode) */}
            {params.viewMode === 'classifier' && result && (
                <div className="mt-4 border border-lime-500/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className="text-xs px-2 py-0.5 border"
                            style={{
                                borderColor: DOMAIN_COLORS[result.rock.domain],
                                color: DOMAIN_COLORS[result.rock.domain],
                            }}
                        >
                            {result.rock.domain}
                        </span>
                        <span className="text-xs text-lime-200/40">{result.rock.subdomain}</span>
                    </div>
                    <div className="text-lime-100 text-lg font-medium">{result.rock.name}</div>
                    <p className="text-lime-200/60 text-xs mt-1 leading-relaxed">{result.why}</p>
                    {result.neighbors.length > 0 && (
                        <div className="mt-2">
                            <div className="text-lime-200/40 text-[10px] mb-1">Nearby rocks</div>
                            <div className="flex flex-wrap gap-1">
                                {result.neighbors.map((n) => (
                                    <span key={n.id} className="text-[10px] px-1.5 py-0.5 border border-lime-500/20 text-lime-200/50">
                                        {n.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Reset */}
            <div className="mt-4">
                <Button label="Reset" onClick={() => onParamsChange(DEFAULT_PARAMS)} size="sm" />
            </div>
        </>
    );
}
