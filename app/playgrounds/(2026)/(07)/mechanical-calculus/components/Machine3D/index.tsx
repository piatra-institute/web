'use client';

import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { MachineSpec, Params, TracePoint, X_END } from '../../logic';
import {
    Angle,
    AxleShaft,
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


export type ModuleId =
    | 'motor'
    | 'integrator-1'
    | 'integrator-2'
    | 'adder'
    | 'spares'
    | 'shaft-bank'
    | 'input-table'
    | 'plotter';

export const MODULE_COPY: Record<ModuleId, { title: string; body: string }> = {
    'motor': {
        title: 'main drive and flywheel',
        body: 'One motor, geared down through the reduction pair, turns the countershafts running under both benches, and every disc in the machine is bevelled onto them. The flywheel takes the ripple out of that one rate, because every variable is measured against it. Turning this shaft faster is the only way to get an answer sooner, and it is also the fastest way to make the machine hunt.',
    },
    'integrator-1': {
        title: 'integrator 1: acceleration into velocity',
        body: 'The lead screw above the disc places the wheel at a distance from the centre proportional to the acceleration. The disc turns with the independent variable, the wheel accumulates the product, and its rotation leaves through the spline shaft it rides on, carrying the velocity. The two capstan drums beside it run continuously off the motor; the wheel only steers them, which is how a contact that can barely pass a fingertip of torque commands a bench full of shafting. During gross slip the disc turns and the wheel simply stands still.',
    },
    'integrator-2': {
        title: 'integrator 2: velocity into displacement',
        body: 'The same mechanism again, its lead screw turned by the first integrator’s output, so its wheel accumulates the displacement. That output shaft drives the pen and is geared back through the adder to integrator 1’s carriage. The feedback path is what makes the machine an oscillator rather than a calculator, and it is why a delay anywhere in the loop can turn the whole machine unstable.',
    },
    'adder': {
        title: 'the adder and its change gears',
        body: 'A differential gear: the spider is geometrically forced to turn with the sum of its two side gears, so addition costs one casting. The change-gear clusters on either side multiply by the constants of the equation, 2ζω on the velocity and ω² on the displacement, and the summed acceleration climbs through the ring gear to the lead screw that places integrator 1’s wheel. Re-cutting these ratios is how you pose a different equation.',
    },
    'spares': {
        title: 'the four spare integrators',
        body: 'The MIT machine had six. A second-order equation needs two, so these four idle with their carriages parked at the exact centre of the disc, integrating zero while their capstans spin. A sixth-order equation would use them all, and a problem needing seven would simply not fit: the machine’s capacity was a physical fact about how many discs were bolted to the bench.',
    },
    'shaft-bank': {
        title: 'the interconnection shafts',
        body: 'Eighteen long shafts, and the overhead runs that patch them into the units. Only three rows are alive in this setup: the drive, the velocity and the displacement; the rest wait for a harder equation. This is the program. To pose a new problem you climbed onto the bench and rebuilt the connections by hand, and the machine was then not a general-purpose computer but a physical model of that one equation.',
    },
    'input-table': {
        title: 'input function table',
        body: 'An operator turning the cranks to keep the cross-hair on a curve drawn in ink, injecting an arbitrary function into the computation by hand. It sits idle here: the equation being solved is homogeneous, so there is nothing to trace. When a problem did need it, the operator’s hand became a term in the error budget.',
    },
    'plotter': {
        title: 'output plotting table',
        body: 'Two lead screws draw the answer: the long one walks the gantry with the independent variable, and the splined rod carries the displacement to the cross screw that moves the pen. The answer arrives as a curve rather than a column of digits. The faint dashed line behind it is the exact solution: the gap between the two is everything the mechanism has cost you.',
    },
};


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

/** Where the two active integrators and the spares sit. */
const INT_1_X = -4.2;
const INT_2_X = 0;
const ADDER_X = -1.9;
const SPARE_FRONT_X = 3.4;
const SPARE_BACK_XS = [-4.2, 0, 3.4];

export default function Machine3D({
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
    const motion = useMemo<Motion>(() => ({ x: 0, v: 0, y: 0, offA: 0, offV: 0 }), []);
    motion.x = sample.x;
    motion.v = sample.velocity;
    motion.y = sample.machine;
    motion.offA = sample.offsetA;
    motion.offV = sample.offsetV;

    const { frequency: om, damping: ze } = params;

    const rd = useMemo(() => {
        const m = motion;
        return {
            /** The independent variable: discs, countershafts, plotter screw. */
            drive: (() => m.x * TWO_PI * 0.45) as Angle,
            /** Motor side of the reduction pair. */
            motor: (() => m.x * TWO_PI * 1.35) as Angle,
            /** Capstan drums, driven continuously. */
            drums: (() => m.x * TWO_PI * 1.9) as Angle,
            /** Velocity: integrator 1 wheel, spline, amplifier output, v row. */
            v: (() => m.v * TWO_PI * 2.2) as Angle,
            /** Displacement: integrator 2 wheel and everything the pen needs. */
            y: (() => m.y * TWO_PI * 2.2) as Angle,
            /** Lead screws turn with the carriage offsets, clipped at the rim. */
            screwA: (() => m.offA * 0.22) as Angle,
            screwV: (() => m.offV * 0.22) as Angle,
            /** The two multiplied terms entering the adder, and their sum. */
            sideA: (() => -2 * ze * om * m.v * 2.6) as Angle,
            sideB: (() => -(om * om) * m.y * 2.6) as Angle,
            carrier: (() => (-2 * ze * om * m.v - om * om * m.y) * 1.3) as Angle,
            still: (() => 0) as Angle,
        };
    }, [motion, om, ze]);

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

    const clipA = Math.abs(sample.offsetA) >= params.discRadius - 1e-9;
    const clipV = Math.abs(sample.offsetV) >= params.discRadius - 1e-9;

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

            {/* One motor; countershafts under both benches gear every disc to it. */}
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
                    frontXs={[INT_1_X - 0.15, INT_2_X - 0.15, SPARE_FRONT_X - 0.15]}
                    backXs={SPARE_BACK_XS.map(x => x - 0.15)}
                />
            </Selectable>

            <Selectable onSelect={() => onSelect('input-table')}>
                <InputTable selected={selected === 'input-table'} />
            </Selectable>

            {/* Integrator 1: carriage screwed to the acceleration, wheel carries velocity. */}
            <Selectable onSelect={() => onSelect('integrator-1')}>
                <Integrator
                    position={[INT_1_X, 0.9, -1.6]}
                    driveAngle={rd.drive}
                    outAngle={rd.v}
                    drumAngle={rd.drums}
                    screwAngle={rd.screwA}
                    offset={sample.offsetA / params.discRadius}
                    active
                    slipping={spec.grossSlip}
                    clipped={clipA}
                    running={running}
                    selected={selected === 'integrator-1'}
                />
            </Selectable>

            {/* Integrator 2: carriage screwed to the velocity, wheel carries displacement. */}
            <Selectable onSelect={() => onSelect('integrator-2')}>
                <Integrator
                    position={[INT_2_X, 0.9, -1.6]}
                    driveAngle={rd.drive}
                    outAngle={rd.y}
                    drumAngle={rd.drums}
                    screwAngle={rd.screwV}
                    offset={sample.offsetV / params.discRadius}
                    active
                    slipping={spec.grossSlip}
                    clipped={clipV}
                    running={running}
                    selected={selected === 'integrator-2'}
                />
            </Selectable>

            {/* The four spares, carriages parked at the disc centre. */}
            <Selectable onSelect={() => onSelect('spares')}>
                <Integrator
                    position={[SPARE_FRONT_X, 0.9, -1.6]}
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
                {SPARE_BACK_XS.map(x => (
                    <Integrator
                        key={x}
                        position={[x, 0.9, 1.6]}
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
                ))}
            </Selectable>

            {/* The adder assembly: change gears, differential, and the climb to
                integrator 1's lead screw. This is the equation in brass. */}
            <Selectable onSelect={() => onSelect('adder')}>
                {/* 2ζω on the velocity arriving from integrator 1's amplifier. */}
                <GearCluster position={[-2.46, 1.53, -1.6]} inAngle={rd.v} outAngle={rd.sideA} accent />
                <AxleShaft position={[-2.21, 1.53, -1.6]} length={0.36} axis="x" radius={0.024} angle={rd.sideA} accent />

                <DifferentialAdder position={[ADDER_X, 1.53, -1.6]} sideA={rd.sideA} sideB={rd.sideB} carrier={rd.carrier} />

                {/* ω² on the displacement arriving back from the shaft bank. */}
                <AxleShaft position={[-1.625, 1.53, -1.6]} length={0.3} axis="x" radius={0.024} angle={rd.sideB} accent />
                <GearCluster position={[-1.41, 1.53, -1.6]} inAngle={rd.sideB} outAngle={rd.y} accent />
                <AxleShaft position={[-1.195, 1.53, -1.6]} length={0.29} axis="x" radius={0.024} angle={rd.y} accent />

                {/* The sum climbs to the command shaft, which is integrator 1's screw. */}
                <SpurGear position={[ADDER_X, 1.88, -1.6]} axis="x" radius={0.21} teeth={20} angle={rd.screwA} accent />
                <AxleShaft position={[-2.69, 1.88, -1.6]} length={1.74} axis="x" radius={0.028} angle={rd.screwA} accent collars={[-0.55, 0.45]} />
            </Selectable>

            {/* The shaft bank and every overhead patch run that wires the loop. */}
            <Selectable onSelect={() => onSelect('shaft-bank')}>
                <ShaftBank driveAngle={rd.drive} vAngle={rd.v} yAngle={rd.y} selected={selected === 'shaft-bank'} />

                {/* Drive: countershaft up onto the x row. */}
                <ZElbow x={-6.5} aY={0.3} aZ={-1.6} bZ={-0.6} top={1.38} angle={rd.drive} accent />
                {/* Velocity: integrator 1's amplified output up to the v row. */}
                <ZElbow x={-2.78} aY={1.53} aZ={-1.6} bZ={-0.36} angle={rd.v} accent />
                {/* Velocity: back down into integrator 2's lead screw. */}
                <ZElbow x={0.85} aY={1.88} aZ={-1.6} bZ={-0.36} angle={rd.screwV} accent />
                <AxleShaft position={[0.76, 1.88, -1.6]} length={0.22} axis="x" radius={0.028} angle={rd.screwV} accent />
                {/* Displacement: integrator 2's output up to the y row. */}
                <ZElbow x={1.4} aY={1.53} aZ={-1.6} bZ={-0.12} angle={rd.y} accent />
                {/* Displacement: back down into the adder's change gears. */}
                <ZElbow x={-1.05} aY={1.53} aZ={-1.6} bZ={-0.12} angle={rd.y} accent />
                {/* Drive and displacement out to the plotting table, tapping the
                    screws just short of the gantry's travel. */}
                <ZElbow x={5.05} aY={1.16} aZ={-1.08} bZ={-0.6} angle={rd.drive} accent />
                <ZElbow x={5.05} aY={1.16} aZ={1.08} bZ={-0.12} angle={rd.y} accent />
            </Selectable>

            <Selectable onSelect={() => onSelect('plotter')}>
                <Plotter
                    machinePoints={machinePoints}
                    idealPoints={idealPoints}
                    penX={pen[0]}
                    penZ={pen[2]}
                    offPaper={offPaper}
                    driveAngle={rd.drive}
                    yAngle={rd.y}
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
