'use client';

import React from 'react';

import {
    AdderSpec,
    EQUATIONS,
    IntegratorSpec,
    MachineSpec,
    Metrics,
    Params,
    PatchSpec,
} from '../../logic';


interface PatchDiagramProps {
    patch: PatchSpec;
    params: Params;
    spec: MachineSpec;
    metrics: Metrics;
}

const LIME = '#84cc16';
const DIM = '#3f6212';
const WARN = '#f97316';
const TEXT = '#d9f99d';
const MUTED = '#65a30d';


function fmtRatio(ratio: number): string {
    const sign = ratio >= 0 ? '+' : '−';
    const mag = Math.abs(ratio);
    const digits = mag >= 10 ? 1 : mag >= 1 ? 2 : 3;
    return `${sign}${mag.toFixed(digits).replace(/\.?0+$/, '') || '0'}`;
}


/** A place where the mechanism departs from the mathematics. */
function Fault({
    x,
    y,
    label,
    value,
    hot,
}: {
    x: number;
    y: number;
    label: string;
    value: string;
    hot: boolean;
}) {
    const stroke = hot ? WARN : DIM;
    return (
        <g>
            <circle cx={x} cy={y} r={5} fill={hot ? WARN : '#000'} stroke={stroke} strokeWidth={1.5} />
            <text x={x} y={y - 12} textAnchor="middle" fontSize={9} fill={hot ? WARN : MUTED} fontFamily="monospace">
                {label}
            </text>
            <text x={x} y={y + 20} textAnchor="middle" fontSize={9} fill={hot ? WARN : MUTED} fontFamily="monospace">
                {value}
            </text>
        </g>
    );
}


function UnitBox({
    x,
    y,
    w,
    h,
    title,
    sub,
    dead,
    accent,
}: {
    x: number;
    y: number;
    w: number;
    h: number;
    title: string;
    sub: string;
    dead: boolean;
    accent?: boolean;
}) {
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={dead ? '#1c0f05' : '#0d1405'}
                stroke={dead ? WARN : accent ? LIME : DIM}
                strokeWidth={1.5}
            />
            <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize={11} fill={dead ? WARN : TEXT} fontFamily="monospace">
                {title}
            </text>
            <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize={10} fill={dead ? WARN : MUTED} fontFamily="monospace">
                {sub}
            </text>
        </g>
    );
}


function integralText(int: IntegratorSpec): string {
    return `∫ ${int.carriage} d${int.disc} = ${int.out}`;
}


export default function PatchDiagram({ patch, params, spec, metrics }: PatchDiagramProps) {
    const slipping = metrics.grossSlip;
    const hunting = metrics.regime === 'hunting';
    const clipping = metrics.clipPct > 1;
    const backlashHot = metrics.regime === 'backlash-limited';
    const creepHot = metrics.regime === 'creep-limited' || slipping;
    const lagHot = hunting || metrics.regime === 'lag-limited';

    const wire = slipping ? WARN : LIME;
    const fb = hunting ? WARN : LIME;

    /* The spine: the chain of integrators the pen hangs off, walked backwards
     * from the pen variable, headed by the adder that commands it. */
    const intByOut = new Map(patch.integrators.map(i => [i.out, i]));
    const adderByOut = new Map(patch.adders.map(a => [a.out, a]));

    const spine: IntegratorSpec[] = [];
    const onSpine = new Set<string>();
    let cursor = intByOut.get(patch.penVar);
    while (cursor && !onSpine.has(cursor.id)) {
        onSpine.add(cursor.id);
        spine.unshift(cursor);
        cursor = intByOut.get(cursor.carriage);
    }
    const head: AdderSpec | null = spine.length ? adderByOut.get(spine[0].carriage) ?? null : null;

    const offSpine = patch.integrators.filter(i => !onSpine.has(i.id));
    const extraAdders = patch.adders.filter(a => a !== head);
    const hasBand = offSpine.length > 0 || extraAdders.length > 0;

    /* Spine geometry. */
    const junctionX = 92;
    const junctionY = 100;
    const penX = 720;
    const spineStart = 170;
    const spineEnd = penX - 60;
    const boxW = 132;
    const gap = spine.length > 0 ? (spineEnd - spineStart - spine.length * boxW) / spine.length : 0;
    const boxX = (i: number) => spineStart + gap / 2 + i * (boxW + gap);

    const feedbackY = hasBand ? 168 : 196;
    const bandY = 216;
    const height = hasBand ? 330 : 250;

    /* The four canonical faults, placed on representative spine edges. */
    const rimValue = `${(params.scaleFactor * spec.peakIntegrand).toFixed(0)} / ${params.discRadius} mm`;
    const lagValue = metrics.lagCritical === null
        ? `τ ${metrics.lag.toFixed(3)}`
        : `τ ${metrics.lag.toFixed(3)} / ${Number.isFinite(metrics.lagCritical) ? metrics.lagCritical.toFixed(3) : '∞'}`;

    /* Band geometry. */
    const bandUnits: { title: string; sub: string; accent: boolean }[] = [];
    for (const int of offSpine) {
        bandUnits.push({
            title: int.id.replace('int-', 'integrator '),
            sub: integralText(int),
            accent: int.disc !== 'x',
        });
    }
    for (const adder of extraAdders) {
        bandUnits.push({
            title: adder.kind === 'gear' ? 'change gear' : 'adder',
            sub: `${adder.out} = ${adder.terms.map(t => `${fmtRatio(t.ratio)}·${t.var}`).join(' ')}`,
            accent: false,
        });
    }
    const bandW = 190;
    const bandGap = bandUnits.length > 0 ? (900 - 60 - bandUnits.length * bandW) / (bandUnits.length + 1) : 0;

    return (
        <div className="border border-lime-500/20 p-4">
            <div className="text-xs text-lime-200/60 font-mono uppercase tracking-wide mb-3">
                the patch &middot; {EQUATIONS[patch.equation].label} &middot; the program the machine is wired into
            </div>

            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 900 ${height}`} className="w-full min-w-[720px]" role="img" aria-label={`Block diagram of the ${EQUATIONS[patch.equation].label} patch and its error sources`}>
                    {/* The commanding junction: adder or change gear. */}
                    <circle cx={junctionX} cy={junctionY} r={20} fill="#0d1405" stroke={LIME} strokeWidth={1.5} />
                    <text x={junctionX} y={junctionY + 5} textAnchor="middle" fontSize={14} fill={TEXT} fontFamily="monospace">
                        {head?.kind === 'gear' ? '×' : '+'}
                    </text>
                    <text x={junctionX} y={junctionY - 46} textAnchor="middle" fontSize={9} fill={MUTED} fontFamily="monospace">
                        {head ? (head.kind === 'gear' ? 'change gear' : 'the adder') : 'carriage'}
                    </text>

                    {/* The terms arriving at the junction: the equation's constants,
                        living as gear ratios. */}
                    {head && head.terms.map((term, i) => (
                        <text
                            key={term.var}
                            x={junctionX}
                            y={junctionY - 30 + i * 11}
                            textAnchor="middle"
                            fontSize={9}
                            fill={term.lagged && lagHot ? WARN : MUTED}
                            fontFamily="monospace"
                        >
                            {fmtRatio(term.ratio)}·{term.var}{term.lagged ? ' (τ)' : ''}
                        </text>
                    ))}

                    {/* Junction output into the first integrator, with the rim fault. */}
                    {spine.length > 0 && (
                        <g>
                            <line x1={junctionX + 20} y1={junctionY} x2={boxX(0) - 4} y2={junctionY} stroke={wire} strokeWidth={1.5} />
                            <polygon points={`${boxX(0) - 4},${junctionY} ${boxX(0) - 12},${junctionY - 4} ${boxX(0) - 12},${junctionY + 4}`} fill={wire} />
                            <Fault x={(junctionX + 20 + boxX(0)) / 2} y={junctionY} label="rim" value={rimValue} hot={clipping} />
                        </g>
                    )}

                    {/* The spine integrators and the edges between them. */}
                    {spine.map((int, i) => (
                        <g key={int.id}>
                            <UnitBox
                                x={boxX(i)}
                                y={junctionY - 28}
                                w={boxW}
                                h={56}
                                title={int.id.replace('int-', 'integrator ')}
                                sub={integralText(int)}
                                dead={slipping}
                            />
                            {i < spine.length - 1 && (
                                <g>
                                    <line x1={boxX(i) + boxW} y1={junctionY} x2={boxX(i + 1) - 4} y2={junctionY} stroke={wire} strokeWidth={1.5} />
                                    <polygon points={`${boxX(i + 1) - 4},${junctionY} ${boxX(i + 1) - 12},${junctionY - 4} ${boxX(i + 1) - 12},${junctionY + 4}`} fill={wire} />
                                    {i === 0 && (
                                        <Fault x={(boxX(i) + boxW + boxX(i + 1)) / 2} y={junctionY} label="play" value={`${params.backlash.toFixed(0)}′`} hot={backlashHot} />
                                    )}
                                </g>
                            )}
                        </g>
                    ))}

                    {/* Out to the pen, with the creep fault. */}
                    {spine.length > 0 && (
                        <g>
                            <line x1={boxX(spine.length - 1) + boxW} y1={junctionY} x2={penX - 4} y2={junctionY} stroke={wire} strokeWidth={1.5} />
                            <polygon points={`${penX - 4},${junctionY} ${penX - 12},${junctionY - 4} ${penX - 12},${junctionY + 4}`} fill={wire} />
                            <Fault
                                x={(boxX(spine.length - 1) + boxW + penX) / 2}
                                y={junctionY}
                                label={spine.length === 1 ? 'play + creep' : 'creep'}
                                value={`${metrics.creepPct.toFixed(3)}%`}
                                hot={creepHot || (spine.length === 1 && backlashHot)}
                            />
                        </g>
                    )}

                    <rect x={penX} y={junctionY - 28} width={110} height={56} fill="#0d1405" stroke={LIME} strokeWidth={1.5} />
                    <text x={penX + 55} y={junctionY - 5} textAnchor="middle" fontSize={11} fill={TEXT} fontFamily="monospace">pen</text>
                    <text x={penX + 55} y={junctionY + 12} textAnchor="middle" fontSize={10} fill={MUTED} fontFamily="monospace">
                        {patch.penVar}(x)
                    </text>

                    {/* Feedback: the pen variable back to the junction, through the lag. */}
                    <line x1={penX + 55} y1={junctionY + 28} x2={penX + 55} y2={feedbackY} stroke={fb} strokeWidth={1.5} />
                    <line x1={penX + 55} y1={feedbackY} x2={junctionX} y2={feedbackY} stroke={fb} strokeWidth={1.5} />
                    <line x1={junctionX} y1={feedbackY} x2={junctionX} y2={junctionY + 24} stroke={fb} strokeWidth={1.5} />
                    <polygon points={`${junctionX},${junctionY + 20} ${junctionX - 4},${junctionY + 30} ${junctionX + 4},${junctionY + 30}`} fill={fb} />
                    <Fault x={434} y={feedbackY} label="lag" value={lagValue} hot={lagHot} />

                    {/* The input table, when the patch uses it. */}
                    {patch.inputTable && (
                        <g>
                            <rect x={junctionX - 60} y={14} width={120} height={34} fill="#0d1405" stroke={LIME} strokeWidth={1.2} />
                            <text x={junctionX} y={28} textAnchor="middle" fontSize={9} fill={TEXT} fontFamily="monospace">
                                input table
                            </text>
                            <text x={junctionX} y={41} textAnchor="middle" fontSize={9} fill={MUTED} fontFamily="monospace">
                                {patch.inputTable.out}(x), operator {params.trackingError.toFixed(1)}%
                            </text>
                            <line x1={junctionX} y1={48} x2={junctionX} y2={junctionY - 24} stroke={wire} strokeWidth={1} strokeDasharray="4 3" />
                        </g>
                    )}

                    {/* The velocity tap, when the adder listens to a mid-spine variable. */}
                    {head && spine.length > 1 && head.terms.some(t => t.var === spine[0].out) && (
                        <g>
                            <line x1={boxX(0) + boxW + 18} y1={junctionY - 28} x2={boxX(0) + boxW + 18} y2={44} stroke={wire} strokeWidth={1} strokeDasharray="4 3" />
                            <line x1={boxX(0) + boxW + 18} y1={44} x2={junctionX} y2={44} stroke={wire} strokeWidth={1} strokeDasharray="4 3" />
                            <line x1={junctionX} y1={44} x2={junctionX} y2={junctionY - 24} stroke={wire} strokeWidth={1} strokeDasharray="4 3" />
                            <polygon points={`${junctionX},${junctionY - 20} ${junctionX - 4},${junctionY - 30} ${junctionX + 4},${junctionY - 30}`} fill={wire} />
                            <text x={(boxX(0) + boxW + junctionX) / 2} y={38} textAnchor="middle" fontSize={9} fill={MUTED} fontFamily="monospace">
                                tap: {spine[0].out}
                            </text>
                        </g>
                    )}

                    {/* The lower band: product-builders and their change gears. */}
                    {bandUnits.map((unit, i) => {
                        const x = 30 + bandGap + i * (bandW + bandGap);
                        return (
                            <g key={i}>
                                <UnitBox x={x} y={bandY} w={bandW} h={52} title={unit.title} sub={unit.sub} dead={slipping} accent={unit.accent} />
                                {unit.accent && (
                                    <text x={x + bandW / 2} y={bandY + 64} textAnchor="middle" fontSize={8.5} fill={MUTED} fontFamily="monospace">
                                        disc geared to a variable, not to x
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    {hasBand && (
                        <text x={30} y={bandY - 10} fontSize={9} fill={MUTED} fontFamily="monospace">
                            off the spine: products built by parts, fed to and from the adder by shaft
                        </text>
                    )}

                    <text x={450} y={height - 18} textAnchor="middle" fontSize={9} fill={hunting || slipping ? WARN : MUTED} fontFamily="monospace">
                        {slipping
                            ? 'the contact has broken loose: nothing reaches the shafts'
                            : hunting
                                ? 'the lag has eaten the damping: the loop drives itself'
                                : 'the loop holds'}
                    </text>
                </svg>
            </div>
        </div>
    );
}
