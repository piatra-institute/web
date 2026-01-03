'use client';

import SliderInput from '@/components/SliderInput';
import Dropdown from '@/components/Dropdown';
import Toggle from '@/components/Toggle';
import Button from '@/components/Button';
import Input from '@/components/Input';
import {
    Spec,
    BuiltinType,
    GateType,
    SpecKind,
    BUILTINS,
    GATES,
    defaultSpec,
    uid,
} from '../../logic';

interface SettingsProps {
    spec: Spec;
    onSpecChange: (spec: Spec) => void;
    onSaveCandidate: () => void;
    onLoadCandidate: (spec: Spec) => void;
    onReset: () => void;
    savedCandidates: Spec[];
    onRemoveCandidate: (id: string) => void;
    onToggleOverlay: (id: string) => void;
    activeOverlayIds: string[];
    showDerivative: boolean;
    onToggleDerivative: () => void;
    xMin: number;
    xMax: number;
    samples: number;
    onXMinChange: (v: number) => void;
    onXMaxChange: (v: number) => void;
    onSamplesChange: (v: number) => void;
    invertChart: boolean;
    onToggleInvertChart: () => void;
}

export default function Settings({
    spec,
    onSpecChange,
    onSaveCandidate,
    onLoadCandidate,
    onReset,
    savedCandidates,
    onRemoveCandidate,
    onToggleOverlay,
    activeOverlayIds,
    showDerivative,
    onToggleDerivative,
    xMin,
    xMax,
    samples,
    onXMinChange,
    onXMaxChange,
    onSamplesChange,
    invertChart,
    onToggleInvertChart,
}: SettingsProps) {
    const updateSpec = (patch: Partial<Spec>) => {
        onSpecChange({ ...spec, ...patch });
    };

    const kindOptions = ['builtin', 'composer', 'expression'];

    return (
        <div className="space-y-6 text-sm">
            {/* Function Definition */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                    Function Definition
                </h3>

                <Input
                    label="Name"
                    value={spec.name}
                    onChange={(v) => updateSpec({ name: v })}
                    placeholder="candidate name"
                    compact
                    className="!w-40"
                />

                <Dropdown
                    name="Mode"
                    selected={spec.kind}
                    selectables={kindOptions}
                    atSelect={(v) => updateSpec({ kind: v as SpecKind })}
                    tooltip="Built-in: predefined activations. Composer: combine base + gate. Expression: custom formula."
                />

                {spec.kind === 'builtin' && (
                    <Dropdown
                        name="Activation"
                        selected={spec.builtinType ?? 'ReLU'}
                        selectables={BUILTINS}
                        atSelect={(v) => updateSpec({ builtinType: v as BuiltinType, name: v })}
                        tooltip="Standard activation functions used in neural networks."
                    />
                )}

                {spec.kind === 'composer' && (
                    <>
                        <Dropdown
                            name="Base"
                            selected={spec.base ?? 'ReLU'}
                            selectables={BUILTINS}
                            atSelect={(v) => updateSpec({ base: v as BuiltinType })}
                        />
                        <Dropdown
                            name="Gate"
                            selected={spec.gate ?? 'none'}
                            selectables={GATES.map((g) => g.value)}
                            atSelect={(v) => updateSpec({ gate: v as GateType })}
                            tooltip="Gate multiplies base activation output"
                        />

                        <SliderInput
                            label="Positive scaling"
                            value={spec.posScale}
                            onChange={(v) => updateSpec({ posScale: v })}
                            min={0}
                            max={2}
                            step={0.01}
                            showDecimals
                        />

                        <SliderInput
                            label="Negative scaling"
                            value={spec.negScale}
                            onChange={(v) => updateSpec({ negScale: v })}
                            min={-2}
                            max={2}
                            step={0.01}
                            showDecimals
                        />
                    </>
                )}

                {spec.kind === 'expression' && (
                    <div className="space-y-2">
                        <Input
                            label="Expression (variable: x)"
                            value={spec.expr ?? ''}
                            onChange={(v) => updateSpec({ expr: v })}
                            placeholder="e.g. relu(x) + 0.2*sigmoid(5*x)*min(0,x)"
                            fullWidth
                        />
                        <p className="text-xs text-gray-500">
                            Supported: numbers, pi, e; ops + - * / ^; funcs: abs, max, min, exp, log, sqrt, pow, sin, cos, tanh, sign, relu, sigmoid, softplus, gelu, swish(x,b), mish, step
                        </p>
                    </div>
                )}
            </div>

            {/* Parameters - shown contextually based on activation */}
            {(() => {
                const t = spec.builtinType ?? 'ReLU';

                // Define which activations use which parameters
                const usesAlpha = [
                    'LeakyReLU', 'PReLU', 'ELU', 'CELU', 'RReLU',
                    'ISRU', 'ISRLU', 'PLU', 'APL', 'PELU',
                    'SoftExponential', 'Aria2', 'SReLU', 'StarReLU', 'Snake'
                ].includes(t);

                const usesBeta = [
                    'Swish', 'PELU', 'Aria2', 'ReLUN'
                ].includes(t);

                const usesTau = [
                    'ThresholdedReLU', 'PLU', 'APL', 'SReLU',
                    'SoftShrink', 'HardShrink'
                ].includes(t);

                const usesB = ['StarReLU'].includes(t);

                // For composer mode, show gate-related params
                const isComposer = spec.kind === 'composer';

                const hasParams = spec.kind === 'builtin'
                    ? (usesAlpha || usesBeta || usesTau || usesB)
                    : isComposer;

                if (!hasParams && spec.kind === 'builtin') {
                    return (
                        <div className="text-gray-500 text-sm py-2">
                            {t} has no tunable parameters.
                        </div>
                    );
                }

                return (
                    <div className="space-y-4">
                        <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                            Parameters
                        </h3>

                        {(usesAlpha || isComposer) && (
                            <SliderInput
                                label={
                                    t === 'LeakyReLU' || t === 'PReLU' ? 'α: negative slope' :
                                    t === 'ELU' || t === 'CELU' ? 'α: saturation value' :
                                    t === 'Snake' ? 'α: frequency' :
                                    t === 'ISRU' || t === 'ISRLU' ? 'α: scaling factor' :
                                    'α (alpha)'
                                }
                                value={spec.alpha}
                                onChange={(v) => updateSpec({ alpha: v })}
                                min={-1}
                                max={2}
                                step={0.01}
                                showDecimals
                            />
                        )}

                        {(usesBeta || isComposer) && (
                            <SliderInput
                                label={
                                    t === 'Swish' ? 'β: sharpness (β=1 is SiLU)' :
                                    t === 'ReLUN' ? 'β: cap value (max output)' :
                                    'β (beta)'
                                }
                                value={spec.beta}
                                onChange={(v) => updateSpec({ beta: v })}
                                min={0}
                                max={20}
                                step={0.05}
                                showDecimals
                            />
                        )}

                        {(usesTau || isComposer) && (
                            <SliderInput
                                label={
                                    t === 'ThresholdedReLU' ? 'τ: activation threshold' :
                                    t === 'SoftShrink' || t === 'HardShrink' ? 'τ: shrinkage λ' :
                                    'τ: threshold'
                                }
                                value={spec.tau}
                                onChange={(v) => updateSpec({ tau: v })}
                                min={-5}
                                max={5}
                                step={0.01}
                                showDecimals
                            />
                        )}

                        {(usesB || isComposer) && (
                            <SliderInput
                                label={isComposer ? 'b: gate bias' : 'b: bias term'}
                                value={spec.b}
                                onChange={(v) => updateSpec({ b: v })}
                                min={-10}
                                max={10}
                                step={0.05}
                                showDecimals
                            />
                        )}

                        {isComposer && (
                            <>
                                <SliderInput
                                    label="pos scale: positive output multiplier"
                                    value={spec.posScale}
                                    onChange={(v) => updateSpec({ posScale: v })}
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    showDecimals
                                />
                                <SliderInput
                                    label="neg scale: negative output multiplier"
                                    value={spec.negScale}
                                    onChange={(v) => updateSpec({ negScale: v })}
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    showDecimals
                                />
                            </>
                        )}
                    </div>
                );
            })()}

            {/* Plot Controls */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                    Plot Controls
                </h3>

                <SliderInput
                    label="x min"
                    value={xMin}
                    onChange={onXMinChange}
                    min={-20}
                    max={0}
                    step={0.5}
                    showDecimals
                />

                <SliderInput
                    label="x max"
                    value={xMax}
                    onChange={onXMaxChange}
                    min={0}
                    max={20}
                    step={0.5}
                    showDecimals
                />

                <SliderInput
                    label="samples"
                    value={samples}
                    onChange={onSamplesChange}
                    min={50}
                    max={1500}
                    step={1}
                />

                <Toggle
                    text="Show derivative"
                    value={showDerivative}
                    toggle={onToggleDerivative}
                    tooltip="Numerical dy/dx (central difference)"
                />

                <Toggle
                    text="Invert chart colors"
                    value={invertChart}
                    toggle={onToggleInvertChart}
                    tooltip="Light background for presentations"
                />
            </div>

            {/* Actions */}
            <div className="space-y-4">
                <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                    Actions
                </h3>

                <div className="flex gap-2">
                    <Button
                        label="Save candidate"
                        onClick={onSaveCandidate}
                        size="sm"
                    />
                    <Button
                        label="Reset"
                        onClick={() => {
                            onSpecChange({ ...defaultSpec(), id: uid(), name: 'candidate' });
                            onReset();
                        }}
                        size="sm"
                    />
                </div>
            </div>

            {/* Saved Candidates */}
            {savedCandidates.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lime-400 font-semibold border-b border-lime-500/30 pb-1">
                        Saved Candidates
                    </h3>

                    <div className="space-y-2">
                        {savedCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="flex items-center justify-between gap-2 p-2 border border-gray-700 bg-black/50"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={activeOverlayIds.includes(candidate.id)}
                                        onChange={() => onToggleOverlay(candidate.id)}
                                        className="accent-lime-500"
                                    />
                                    <span className="truncate text-gray-300">{candidate.name}</span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        onClick={() => onLoadCandidate(candidate)}
                                        className="text-xs px-2 py-1 border border-lime-500 text-lime-500 hover:bg-lime-500/20 outline-none"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => onRemoveCandidate(candidate.id)}
                                        className="text-xs px-2 py-1 border border-gray-500 text-gray-400 hover:bg-gray-500/20 outline-none"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500">
                        Check candidates to overlay (max 3). Click Load to edit.
                    </p>
                </div>
            )}
        </div>
    );
}
