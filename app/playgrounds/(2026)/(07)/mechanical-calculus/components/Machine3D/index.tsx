'use client';

import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import {
    AdderSpec,
    IntegratorSpec,
    MachineSpec,
    Params,
    PatchSpec,
    SLOT_POSITIONS,
    TracePoint,
    X_END,
} from '../../logic';
import {
    Angle,
    AxleShaft,
    BankRow,
    Beam,
    BevelJoint,
    CounterDrive,
    DifferentialAdder,
    GearCluster,
    InputTable,
    Integrator,
    Motion,
    Motor,
    Plotter,
    ShaftBank,
    SpurGear,
    StaticFrame,
    ZElbow,
} from './parts';


/** Module ids are patch-derived: integrator ids, adder ids, plus the fixed
 *  'motor' | 'spares' | 'shaft-bank' | 'input-table' | 'plotter'. */
export type ModuleId = string;

export interface ModuleCopy {
    title: string;
    body: string;
}

function ordinal(n: number): string {
    return `integrator ${n}`;
}

function termText(terms: AdderSpec['terms']): string {
    return terms
        .map(t => {
            const sign = t.ratio >= 0 ? '+' : '−';
            const mag = Math.abs(t.ratio);
            const shown = mag >= 10 ? mag.toFixed(1) : mag >= 1 ? mag.toFixed(2) : mag.toFixed(3);
            return `${sign} ${shown.replace(/\.?0+$/, '')}·${t.var}`;
        })
        .join(' ');
}

/** Prose for every clickable mechanism, derived from the active patch. */
export function buildModuleCopy(patch: PatchSpec, params: Params): Record<string, ModuleCopy> {
    const copy: Record<string, ModuleCopy> = {};
    const intByOut = new Map(patch.integrators.map(i => [i.out, i]));
    const spareCount = 6 - patch.integrators.length;

    patch.integrators.forEach((int, index) => {
        const n = index + 1;
        const sentences: string[] = [];

        if (int.disc === 'x') {
            sentences.push('Its disc rides the countershaft, turning with the independent variable.');
        } else {
            sentences.push(`Its disc is geared to ${int.disc} itself, down from the shaft bank: the wheel accumulates a product. This is integration by parts, done in brass, and it pays the creep budget twice.`);
        }

        const feeder = patch.adders.find(a => a.feeds === int.id);
        if (feeder) {
            sentences.push(`The lead screw above the disc is driven from the ${feeder.kind === 'gear' ? 'change gear' : 'adder'} through the command shaft, placing the wheel at ${int.carriage}.`);
        } else {
            sentences.push(`The lead screw is geared to ${int.carriage}, arriving from the shaft bank, so the wheel always sits at a distance proportional to it.`);
        }

        const consumers: string[] = [];
        if (patch.penVar === int.out) consumers.push('the pen');
        for (const a of patch.adders) {
            if (a.terms.some(t => t.var === int.out)) consumers.push(a.kind === 'gear' ? 'the change gear' : 'the adder');
        }
        for (const other of patch.integrators) {
            if (other.carriage === int.out) consumers.push(`${ordinal(patch.integrators.indexOf(other) + 1)}’s carriage`);
            if (other.disc === int.out) consumers.push(`${ordinal(patch.integrators.indexOf(other) + 1)}’s disc`);
        }
        const dest = consumers.length ? ` and drives ${Array.from(new Set(consumers)).join(', ')}` : '';
        sentences.push(`Its rotation leaves through the spline shaft it rides on, carrying ${int.out}${dest}.`);

        if (index === 0) {
            sentences.push('The two capstan drums beside it run continuously off the motor; the wheel only steers them, which is how a contact that can barely pass a fingertip of torque commands a bench full of shafting. During gross slip the disc turns and the wheel simply stands still.');
        }

        copy[int.id] = {
            title: `${ordinal(n)}: ${int.out} = ∫ ${int.carriage} d${int.disc}`,
            body: sentences.join(' '),
        };
    });

    for (const adder of patch.adders) {
        const target = patch.integrators.find(i => i.id === adder.feeds);
        const targetN = target ? patch.integrators.indexOf(target) + 1 : 0;
        const lagged = adder.terms.find(t => t.lagged);
        const body: string[] = [
            adder.kind === 'gear'
                ? `A change-gear cluster: ${adder.out} = ${termText(adder.terms)}. Multiplying by a constant costs one pair of gears, and the constant is whatever ratio you cut.`
                : `A differential gear: the spider is geometrically forced to turn with the sum of its side gears, so ${adder.out} = ${termText(adder.terms)}. The constants of the equation live here as change-gear ratios; re-cutting them poses a different equation.`,
        ];
        if (lagged) {
            body.push(`The loop’s lumped servo lag rides on the ${lagged.var} edge: what arrives is ${lagged.var} as it stood a moment ago, and at speed that stolen moment becomes stolen damping.`);
        }
        if (target) {
            body.push(`The output climbs through the ring gear to the command shaft that places ${ordinal(targetN)}’s wheel.`);
        }
        copy[adder.id] = {
            title: adder.kind === 'gear' ? `change gear: ${adder.out}` : `the adder: ${adder.out}`,
            body: body.join(' '),
        };
    }

    copy['motor'] = {
        title: 'main drive and flywheel',
        body: 'One motor, geared down through the reduction pair, turns the countershafts running under both benches, and every x-driven disc is bevelled onto them. The flywheel takes the ripple out of that one rate, because every variable is measured against it. Turning this shaft faster is the only way to get an answer sooner, and it is also the fastest way to make the machine hunt.',
    };

    copy['spares'] = spareCount > 0 ? {
        title: spareCount === 1 ? 'the spare integrator' : `the ${['zero', 'one', 'two', 'three', 'four', 'five'][spareCount] ?? spareCount} spare integrators`,
        body: `The MIT machine had six integrators; this patch uses ${patch.integrators.length}. The spare${spareCount === 1 ? ' idles' : 's idle'} with carriages parked at the exact centre of the disc, integrating zero while the capstans spin. A problem needing seven would simply not fit: the machine’s capacity was a physical fact about how many discs were bolted to the bench.`,
    } : {
        title: 'no spares left',
        body: 'This patch uses all six integrators. A harder equation would simply not fit: the machine’s capacity was a physical fact about how many discs were bolted to the bench.',
    };

    copy['shaft-bank'] = {
        title: 'the interconnection shafts',
        body: `Eighteen long shafts, and the overhead runs that patch them into the units. ${Object.keys(patch.rows).length + 1} rows are alive in this setup: the drive, ${Object.keys(patch.rows).join(', ')}; the rest wait for a harder equation. This is the program. To pose a new problem you climbed onto the bench and rebuilt these connections by hand, and the machine was then not a general-purpose computer but a physical model of that one equation.`,
    };

    copy['input-table'] = patch.inputTable ? {
        title: 'input function table: tracing the forcing',
        body: `An operator turns the cranks to keep the cross-hair on the forcing curve, injecting ${patch.inputTable.out}(x) into the adder by hand. The hand is not perfect: the cross-hair wanders ${params.trackingError.toFixed(1)}% of the curve’s amplitude, and that wander is stirred straight into the answer. The one irreducibly human term in the error budget.`,
    } : {
        title: 'input function table',
        body: 'An operator turning the cranks to keep a cross-hair on a curve drawn in ink, injecting an arbitrary function into the computation by hand. It sits idle here: this patch needs no traced input. When a problem did need it, the operator’s hand became a term in the error budget.',
    };

    copy['plotter'] = {
        title: 'output plotting table',
        body: `Two lead screws draw the answer: the long one walks the gantry with the independent variable, and the splined rod carries ${patch.penVar} to the cross screw that moves the pen. The answer arrives as a curve rather than a column of digits. The faint dashed line behind it is the exact solution: the gap between the two is everything the mechanism has cost you.`,
    };

    return copy;
}


function Selectable({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
    const click = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect();
    };
    return <group onClick={click}>{children}</group>;
}


/* ---------------------------------------------------------------- *
 * Camera.
 * ---------------------------------------------------------------- */

export type CameraPreset = 'overview' | 'integrators' | 'plotter';

const CAMERA: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
    overview: { position: [3.6, 6.0, 14.8], target: [0, 1.0, 0] },
    integrators: { position: [-2.9, 3.6, 1.9], target: [-2.9, 1.35, -1.6] },
    plotter: { position: [9.9, 3.2, 3.6], target: [7.2, 1.05, 0] },
};

function CameraRig({ preset }: { preset: CameraPreset }) {
    const camera = useThree(s => s.camera);
    const controls = useThree(s => s.controls) as { target?: THREE.Vector3; update?: () => void } | null;

    useEffect(() => {
        const want = CAMERA[preset];
        camera.position.set(...want.position);
        if (controls?.target) {
            controls.target.set(...want.target);
            controls.update?.();
        }
    }, [camera, controls, preset]);

    return null;
}


/* ---------------------------------------------------------------- *
 * The machine.
 * ---------------------------------------------------------------- */

export interface Machine3DProps {
    patch: PatchSpec;
    trace: TracePoint[];
    /** Index into the trace: where the machine currently is. */
    index: number;
    params: Params;
    spec: MachineSpec;
    running: boolean;
    preset: CameraPreset;
    selected: ModuleId;
    onSelect: (id: ModuleId) => void;
}


/** Vertical half-height of the plotting paper, in scene units. */
const PAPER_HALF = 0.82;

const TWO_PI = Math.PI * 2;

/** Shaft-bank row z positions available to the patch (index 0..4). */
const ROW_Z = [-0.36, -0.12, 0.12, 0.36, 0.6];

const ALL_SLOTS = Object.keys(SLOT_POSITIONS) as (keyof typeof SLOT_POSITIONS)[];

export default function Machine3D({
    patch,
    trace,
    index,
    params,
    spec,
    running,
    preset,
    selected,
    onSelect,
}: Machine3DProps) {
    const sample = trace[Math.min(index, trace.length - 1)] ?? trace[0];

    /**
     * Every rotation in the scene is an absolute function of this object,
     * which is refreshed from the trace on every render. Scrub the timeline
     * and the whole drivetrain turns backwards with you.
     */
    const motion = useMemo<Motion>(() => ({ x: 0, vars: {}, offsets: {} }), []);
    motion.x = sample.x;
    motion.vars = sample.vars;
    motion.offsets = sample.offsets;

    const rd = useMemo(() => {
        const m = motion;
        const varAngle = (name: string): Angle =>
            name === 'x' ? () => m.x * TWO_PI * 0.45 : () => (m.vars[name] ?? 0) * TWO_PI * 2.2;
        const termAngle = (name: string, ratio: number): Angle =>
            () => (m.vars[name] ?? 0) * ratio * 2.6;
        const screwAngle = (id: string): Angle => () => (m.offsets[id] ?? 0) * 0.22;
        return {
            drive: (() => m.x * TWO_PI * 0.45) as Angle,
            motor: (() => m.x * TWO_PI * 1.35) as Angle,
            drums: (() => m.x * TWO_PI * 1.9) as Angle,
            still: (() => 0) as Angle,
            varAngle,
            termAngle,
            screwAngle,
        };
    }, [motion]);

    // The plot is scaled so that the exact solution fills the paper. A machine
    // that hunts therefore visibly climbs off the top of the page.
    const paperScale = useMemo(() => {
        let peak = 0;
        for (const p of trace) peak = Math.max(peak, Math.abs(p.ideal));
        return PAPER_HALF / Math.max(peak, 0.2);
    }, [trace]);

    const project = useMemo(() => (p: TracePoint): [number, number, number] => [
        -1.85 + (p.x / X_END) * 3.7,
        0.1,
        THREE.MathUtils.clamp(p.machine * paperScale, -PAPER_HALF - 0.14, PAPER_HALF + 0.14),
    ], [paperScale]);

    // Downsampled so that redrawing the pen line every frame stays cheap.
    const stride = Math.max(1, Math.floor(trace.length / 340));

    const machinePoints = useMemo(() => {
        const pts: [number, number, number][] = [];
        for (let i = 0; i <= index && i < trace.length; i += stride) pts.push(project(trace[i]));
        const last = Math.min(index, trace.length - 1);
        if (last >= 0) pts.push(project(trace[last]));
        return pts;
    }, [trace, index, stride, project]);

    const idealPoints = useMemo(() => {
        const pts: [number, number, number][] = [];
        for (let i = 0; i < trace.length; i += stride) {
            const p = trace[i];
            pts.push([-1.85 + (p.x / X_END) * 3.7, 0.095, p.ideal * paperScale]);
        }
        return pts;
    }, [trace, stride, paperScale]);

    const pen = project(sample);
    const offPaper = Math.abs(sample.machine * paperScale) > PAPER_HALF;

    /* Patch-derived layout. */
    const layout = useMemo(() => {
        const intBySlot = new Map(patch.integrators.map(i => [i.slot, i]));
        const spareSlots = ALL_SLOTS.filter(s => !intBySlot.has(s));

        const xDrivenSpindles = {
            front: [] as number[],
            back: [] as number[],
        };
        for (const int of patch.integrators) {
            if (int.disc !== 'x') continue;
            const slot = SLOT_POSITIONS[int.slot];
            xDrivenSpindles[slot.bench].push(slot.x - 0.15);
        }
        for (const s of spareSlots) {
            const slot = SLOT_POSITIONS[s];
            xDrivenSpindles[slot.bench].push(slot.x - 0.15);
        }

        const rowZOf = (name: string): number | null => {
            const row = patch.rows[name];
            return row === undefined ? null : ROW_Z[row] ?? null;
        };

        /** Carriage feeds arriving from the bank (not through a command shaft). */
        const carriageFeeds = patch.integrators
            .filter(int => !patch.adders.some(a => a.feeds === int.id && a.out === int.carriage))
            .map(int => ({ int, rowZ: rowZOf(int.carriage) }))
            .filter((f): f is { int: IntegratorSpec; rowZ: number } => f.rowZ !== null);

        /** Output risers up to the bank. */
        const risers = patch.integrators
            .map(int => ({ int, rowZ: rowZOf(int.out) }))
            .filter((f): f is { int: IntegratorSpec; rowZ: number } => f.rowZ !== null);

        /** Dependent-disc spindle feeds down from the bank. */
        const discFeeds = patch.integrators
            .filter(int => int.disc !== 'x')
            .map(int => ({ int, rowZ: rowZOf(int.disc) }))
            .filter((f): f is { int: IntegratorSpec; rowZ: number } => f.rowZ !== null);

        const bankRows: BankRow[] = [
            { z: -0.6, angle: rd.drive },
            ...ROW_Z.map((z, i) => {
                const varName = Object.entries(patch.rows).find(([, row]) => row === i)?.[0];
                return { z, angle: varName ? rd.varAngle(varName) : undefined };
            }),
        ];

        return { intBySlot, spareSlots, xDrivenSpindles, carriageFeeds, risers, discFeeds, bankRows, rowZOf };
    }, [patch, rd]);

    const penRowZ = layout.rowZOf(patch.penVar) ?? -0.12;

    return (
        <Canvas
            shadows
            dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
            camera={{ position: CAMERA.overview.position, fov: 42, near: 0.1, far: 120 }}
            onPointerMissed={() => onSelect('shaft-bank')}
            style={{ background: '#000000' }}
        >
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 24, 56]} />

            <ambientLight intensity={0.9} />
            <hemisphereLight args={['#d3f99d', '#0a0f04', 0.9]} />
            <directionalLight
                position={[8, 14, 10]}
                intensity={2.8}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-16}
                shadow-camera-right={16}
                shadow-camera-top={12}
                shadow-camera-bottom={-12}
            />
            <directionalLight position={[-9, 6, -6]} intensity={0.8} color="#a3e635" />
            <pointLight position={[7.2, 3, 2]} intensity={22} distance={13} color="#84cc16" />

            <StaticFrame />

            {/* One motor; countershafts under both benches gear every x-driven disc to it. */}
            <Selectable onSelect={() => onSelect('motor')}>
                <Motor
                    position={[-7.9, 0.62, -1.6]}
                    motorAngle={rd.motor}
                    driveAngle={rd.drive}
                    running={running}
                    selected={selected === 'motor'}
                />
                <CounterDrive
                    driveAngle={rd.drive}
                    frontXs={layout.xDrivenSpindles.front}
                    backXs={layout.xDrivenSpindles.back}
                />
            </Selectable>

            <Selectable onSelect={() => onSelect('input-table')}>
                <InputTable
                    selected={selected === 'input-table'}
                    live={!!patch.inputTable}
                    crankAngle={patch.inputTable ? rd.termAngle(patch.inputTable.out, 12) : undefined}
                    cursorX={patch.inputTable
                        ? () => (motion.vars[patch.inputTable!.out] ?? 0) / Math.max(params.amplitude, 0.05)
                        : undefined}
                />
            </Selectable>
            {patch.inputTable && (
                <Selectable onSelect={() => onSelect('shaft-bank')}>
                    <AxleShaft
                        position={[-7.15, 1.12, 1.7]}
                        length={0.7}
                        axis="x"
                        radius={0.024}
                        angle={rd.varAngle(patch.inputTable.out)}
                        accent
                    />
                    <ZElbow
                        x={-6.8}
                        aY={1.12}
                        aZ={1.7}
                        bZ={layout.rowZOf(patch.inputTable.out) ?? 0.12}
                        angle={rd.varAngle(patch.inputTable.out)}
                        accent
                    />
                </Selectable>
            )}

            {/* The patched integrators, on their setup-sheet slots. */}
            {patch.integrators.map(int => {
                const slot = SLOT_POSITIONS[int.slot];
                return (
                    <Selectable key={int.id} onSelect={() => onSelect(int.id)}>
                        <Integrator
                            position={[slot.x, 0.9, slot.z]}
                            driveAngle={rd.varAngle(int.disc)}
                            outAngle={rd.varAngle(int.out)}
                            drumAngle={rd.drums}
                            screwAngle={rd.screwAngle(int.id)}
                            offset={(sample.offsets[int.id] ?? 0) / params.discRadius}
                            active
                            slipping={spec.grossSlip}
                            clipped={Math.abs(sample.offsets[int.id] ?? 0) >= params.discRadius - 1e-9}
                            running={running}
                            selected={selected === int.id}
                        />
                    </Selectable>
                );
            })}

            {/* The spares, carriages parked at the disc centre. */}
            <Selectable onSelect={() => onSelect('spares')}>
                {layout.spareSlots.map(s => {
                    const slot = SLOT_POSITIONS[s];
                    return (
                        <Integrator
                            key={s}
                            position={[slot.x, 0.9, slot.z]}
                            driveAngle={rd.drive}
                            outAngle={rd.still}
                            drumAngle={rd.drums}
                            screwAngle={rd.still}
                            offset={0}
                            active={false}
                            slipping={false}
                            clipped={false}
                            running={running}
                            selected={selected === 'spares'}
                        />
                    );
                })}
            </Selectable>

            {/* Adders and change gears, with their command shafts. */}
            {patch.adders.map(adder => {
                const benchZ = adder.bench === 'front' ? -1.6 : 1.6;
                const target = patch.integrators.find(i => i.id === adder.feeds);
                const targetSlot = target ? SLOT_POSITIONS[target.slot] : null;
                const outAngle = rd.varAngle(adder.out);
                const screwAngle = target ? rd.screwAngle(target.id) : rd.still;

                const rowTerms = adder.terms.filter(t => t.via !== 'local');
                const localTerms = adder.terms.filter(t => t.via === 'local');

                /* Command shaft toward the fed integrator's lead screw. */
                let commandShaft: React.ReactNode = null;
                if (targetSlot) {
                    const from = targetSlot.x < adder.x ? targetSlot.x + 0.64 : adder.x - 0.08;
                    const to = targetSlot.x < adder.x ? adder.x + 0.08 : targetSlot.x - 0.64;
                    commandShaft = (
                        <AxleShaft
                            position={[(from + to) / 2, 1.88, benchZ]}
                            length={Math.abs(to - from)}
                            axis="x"
                            radius={0.028}
                            angle={screwAngle}
                            accent
                            collars={[Math.abs(to - from) * 0.28, -Math.abs(to - from) * 0.28]}
                        />
                    );
                }

                return (
                    <Selectable key={adder.id} onSelect={() => onSelect(adder.id)}>
                        {/* Input stations: a change-gear cluster per term. */}
                        {localTerms.map(term => (
                            <group key={term.var}>
                                <GearCluster position={[adder.x - 0.56, 1.53, benchZ]} inAngle={rd.varAngle(term.var)} outAngle={rd.termAngle(term.var, term.ratio)} accent />
                                <AxleShaft position={[adder.x - 0.31, 1.53, benchZ]} length={0.36} axis="x" radius={0.024} angle={rd.termAngle(term.var, term.ratio)} accent />
                            </group>
                        ))}
                        {rowTerms.map((term, i) => {
                            const side = localTerms.length === 0 && i === 0 ? -1 : 1;
                            const station = side < 0 ? adder.x - 0.56 : adder.x + 0.49 + (i > 1 ? 0.62 : 0);
                            const elbowX = side < 0 ? adder.x - 0.85 : adder.x + 0.85 + (i > 1 ? 0.62 : 0);
                            const rowZ = layout.rowZOf(term.var);
                            return (
                                <group key={term.var}>
                                    <GearCluster position={[station, 1.53, benchZ]} inAngle={rd.varAngle(term.var)} outAngle={rd.termAngle(term.var, term.ratio)} accent />
                                    <AxleShaft
                                        position={[(station + elbowX) / 2 + (side < 0 ? -0.035 : 0.035), 1.53, benchZ]}
                                        length={Math.abs(elbowX - station) + 0.07}
                                        axis="x"
                                        radius={0.024}
                                        angle={rd.varAngle(term.var)}
                                        accent
                                    />
                                    {rowZ !== null && (
                                        <ZElbow x={elbowX} aY={1.53} aZ={benchZ} bZ={rowZ} angle={rd.varAngle(term.var)} accent />
                                    )}
                                </group>
                            );
                        })}

                        {/* The summing element itself. */}
                        {adder.kind === 'differential' ? (
                            <DifferentialAdder
                                position={[adder.x, 1.53, benchZ]}
                                sideA={rd.termAngle(adder.terms[0].var, adder.terms[0].ratio)}
                                sideB={adder.terms[1] ? rd.termAngle(adder.terms[1].var, adder.terms[1].ratio) : rd.still}
                                carrier={outAngle}
                            />
                        ) : (
                            <group>
                                <SpurGear position={[adder.x, 1.53, benchZ]} axis="x" radius={0.14} teeth={14} angle={outAngle} accent />
                                <AxleShaft position={[adder.x + 0.245, 1.53, benchZ]} length={0.42} axis="x" radius={0.024} angle={outAngle} accent />
                                <Beam position={[adder.x, 1.19, benchZ]} scale={[0.1, 0.6, 0.1]} />
                            </group>
                        )}

                        {/* Second differential for a third term. */}
                        {adder.kind === 'differential' && adder.terms.length > 2 && (
                            <DifferentialAdder
                                position={[adder.x + 0.31, 1.53, benchZ]}
                                sideA={rd.termAngle(adder.terms[2].var, adder.terms[2].ratio)}
                                sideB={outAngle}
                                carrier={outAngle}
                            />
                        )}

                        {/* The sum climbs to the command shaft. */}
                        <SpurGear position={[adder.x, 1.88, benchZ]} axis="x" radius={0.21} teeth={20} angle={screwAngle} accent />
                        {commandShaft}
                    </Selectable>
                );
            })}

            {/* The shaft bank and every overhead patch run that wires the loop. */}
            <Selectable onSelect={() => onSelect('shaft-bank')}>
                <ShaftBank rows={layout.bankRows} selected={selected === 'shaft-bank'} />

                {/* Drive: countershaft up onto the x row. */}
                <ZElbow x={-6.5} aY={0.3} aZ={-1.6} bZ={-0.6} top={1.38} angle={rd.drive} accent />

                {/* Output risers: integrator outputs up to their bank rows. */}
                {layout.risers.map(({ int, rowZ }) => {
                    const slot = SLOT_POSITIONS[int.slot];
                    return (
                        <ZElbow
                            key={`riser-${int.id}`}
                            x={slot.x + 1.42}
                            aY={1.53}
                            aZ={slot.z}
                            bZ={rowZ}
                            angle={rd.varAngle(int.out)}
                            accent
                        />
                    );
                })}

                {/* Carriage feeds: bank rows down into lead screws. */}
                {layout.carriageFeeds.map(({ int, rowZ }) => {
                    const slot = SLOT_POSITIONS[int.slot];
                    return (
                        <group key={`feed-${int.id}`}>
                            <ZElbow x={slot.x + 0.85} aY={1.88} aZ={slot.z} bZ={rowZ} angle={rd.screwAngle(int.id)} accent />
                            <AxleShaft position={[slot.x + 0.76, 1.88, slot.z]} length={0.22} axis="x" radius={0.028} angle={rd.screwAngle(int.id)} accent />
                        </group>
                    );
                })}

                {/* Dependent discs: a variable comes down off the bank and under
                    the bench to turn the spindle. The van der Pol move. */}
                {layout.discFeeds.map(({ int, rowZ }) => {
                    const slot = SLOT_POSITIONS[int.slot];
                    return (
                        <group key={`disc-${int.id}`}>
                            <ZElbow x={slot.x - 0.95} aY={0.3} aZ={slot.z} bZ={rowZ} angle={rd.varAngle(int.disc)} accent />
                            <AxleShaft position={[slot.x - 0.55, 0.3, slot.z]} length={0.8} axis="x" radius={0.028} angle={rd.varAngle(int.disc)} accent />
                            <BevelJoint position={[slot.x - 0.15, 0.3, slot.z]} a="x" b="y" angle={rd.varAngle(int.disc)} accent />
                        </group>
                    );
                })}

                {/* Drive and the pen variable out to the plotting table. */}
                <ZElbow x={5.05} aY={1.16} aZ={-1.08} bZ={-0.6} angle={rd.drive} accent />
                <ZElbow x={5.05} aY={1.16} aZ={1.08} bZ={penRowZ} angle={rd.varAngle(patch.penVar)} accent />
            </Selectable>

            <Selectable onSelect={() => onSelect('plotter')}>
                <Plotter
                    machinePoints={machinePoints}
                    idealPoints={idealPoints}
                    penX={pen[0]}
                    penZ={pen[2]}
                    offPaper={offPaper}
                    driveAngle={rd.drive}
                    yAngle={rd.varAngle(patch.penVar)}
                    selected={selected === 'plotter'}
                />
            </Selectable>

            <OrbitControls
                makeDefault
                target={CAMERA.overview.target}
                minDistance={4}
                maxDistance={40}
                maxPolarAngle={Math.PI / 2.05}
                enableDamping
                dampingFactor={0.09}
            />
            <CameraRig preset={preset} />
        </Canvas>
    );
}
