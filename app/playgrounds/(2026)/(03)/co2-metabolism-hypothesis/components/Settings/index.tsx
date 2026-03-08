'use client';

import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';

import {
    type Params,
    type ViewMode,
    VIEW_MODES,
    normalizeRoleProbs,
    generateLambdas,
    heuristicMu,
} from '../../logic';

interface SettingsProps {
    params: Params;
    onParamsChange: (params: Params) => void;
    stats: { lambda: number; Nmid: number; prob: number; mu: number } | null;
    onRun: () => void;
    onNewWitness: () => void;
}

const btnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs transition-colors cursor-pointer ${
        active
            ? 'bg-lime-500/20 text-lime-400 border border-lime-500'
            : 'bg-black/40 text-lime-200/60 border border-lime-500/20 hover:border-lime-500/50'
    }`;

export default function Settings({
    params,
    onParamsChange,
    stats,
    onRun,
    onNewWitness,
}: SettingsProps) {
    const set = (patch: Partial<Params>) => onParamsChange({ ...params, ...patch });

    const lambdas = generateLambdas(params.lambdaCount, params.lambdaBase);

    return (
        <>
            {/* View mode */}
            <div>
                <div className="text-lime-200/70 text-sm font-medium mb-2">View</div>
                <div className="flex flex-wrap gap-1">
                    {VIEW_MODES.map((vm) => (
                        <button
                            key={vm.key}
                            onClick={() => set({ viewMode: vm.key })}
                            className={btnClass(params.viewMode === vm.key)}
                            title={vm.description}
                        >
                            {vm.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* System */}
            <div className="mt-4">
                <div className="text-lime-200/70 text-sm font-medium mb-2">System</div>
                <SliderInput
                    label="N min"
                    value={params.nMin}
                    onChange={(v) => set({ nMin: v })}
                    min={3}
                    max={200}
                    step={1}
                />
                <SliderInput
                    label="N max"
                    value={params.nMax}
                    onChange={(v) => set({ nMax: v })}
                    min={10}
                    max={400}
                    step={1}
                />
                <SliderInput
                    label="N step"
                    value={params.nStep}
                    onChange={(v) => set({ nStep: v })}
                    min={1}
                    max={20}
                    step={1}
                />
                <SliderInput
                    label="compartments (q)"
                    value={params.q}
                    onChange={(v) => set({ q: v })}
                    min={1}
                    max={12}
                    step={1}
                />
            </div>

            {/* Simulation */}
            <div className="mt-4">
                <div className="text-lime-200/70 text-sm font-medium mb-2">Simulation</div>
                <SliderInput
                    label="trials per point"
                    value={params.trials}
                    onChange={(v) => set({ trials: v })}
                    min={50}
                    max={2000}
                    step={50}
                />
                <SliderInput
                    label="seed"
                    value={params.seed}
                    onChange={(v) => set({ seed: v })}
                    min={1}
                    max={99}
                    step={1}
                />
                <div className="mt-1">
                    <Button
                        label="reroll seed"
                        onClick={() => set({ seed: Math.floor(Math.random() * 99) + 1 })}
                        size="xs"
                    />
                </div>
            </div>

            {/* Lambda */}
            <div className="mt-4">
                <div className="text-lime-200/70 text-sm font-medium mb-2">
                    Catalytic density (λ)
                </div>
                <SliderInput
                    label="λ count"
                    value={params.lambdaCount}
                    onChange={(v) => set({ lambdaCount: v })}
                    min={2}
                    max={6}
                    step={1}
                />
                <SliderInput
                    label="λ base"
                    value={params.lambdaBase}
                    onChange={(v) => set({ lambdaBase: v })}
                    min={0.05}
                    max={0.5}
                    step={0.05}
                    showDecimals
                />
                <div className="mt-1 text-[10px] text-lime-200/40">
                    λ values: {lambdas.join(', ')}
                </div>
            </div>

            {/* Role probabilities */}
            <div className="mt-4">
                <div className="text-lime-200/70 text-sm font-medium mb-2">Role probabilities</div>
                <SliderInput
                    label="p(A) activated"
                    value={params.roleProbs.pA}
                    onChange={(v) => {
                        const normed = normalizeRoleProbs(v, params.roleProbs.pC, params.roleProbs.pB);
                        set({ roleProbs: normed });
                    }}
                    min={0.05}
                    max={0.9}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="p(C) catalyst"
                    value={params.roleProbs.pC}
                    onChange={(v) => {
                        const normed = normalizeRoleProbs(params.roleProbs.pA, v, params.roleProbs.pB);
                        set({ roleProbs: normed });
                    }}
                    min={0.05}
                    max={0.9}
                    step={0.01}
                    showDecimals
                />
                <SliderInput
                    label="p(B) boundary"
                    value={params.roleProbs.pB}
                    onChange={(v) => {
                        const normed = normalizeRoleProbs(params.roleProbs.pA, params.roleProbs.pC, v);
                        set({ roleProbs: normed });
                    }}
                    min={0.05}
                    max={0.9}
                    step={0.01}
                    showDecimals
                />
                <div className="mt-1 text-[10px] text-lime-200/40">
                    normalized: {params.roleProbs.pA.toFixed(2)} + {params.roleProbs.pC.toFixed(2)} + {params.roleProbs.pB.toFixed(2)} = 1.00
                </div>
            </div>

            {/* Threshold */}
            <div className="mt-4">
                <SliderInput
                    label="target threshold"
                    value={params.targetThreshold}
                    onChange={(v) => set({ targetThreshold: v })}
                    min={0.1}
                    max={0.95}
                    step={0.05}
                    showDecimals
                />
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
                <Button label="run simulation" onClick={onRun} size="sm" />
                <Button label="new witness" onClick={onNewWitness} size="sm" />
            </div>

            {/* Stats panel */}
            {stats && (
                <div className="mt-4 border border-lime-500/20 p-3">
                    <div className="text-lime-200/70 text-[10px] uppercase tracking-wider mb-2">
                        current snapshot
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <div className="text-lime-200/50">N midpoint</div>
                            <div className="text-lime-400">{stats.Nmid}</div>
                        </div>
                        <div>
                            <div className="text-lime-200/50">λ midpoint</div>
                            <div className="text-lime-400">{stats.lambda}</div>
                        </div>
                        <div>
                            <div className="text-lime-200/50">P(H<sub>L</sub>)</div>
                            <div className="text-lime-400">{stats.prob}</div>
                        </div>
                        <div>
                            <div className="text-lime-200/50">heuristic μ</div>
                            <div className="text-lime-400">{stats.mu}</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
