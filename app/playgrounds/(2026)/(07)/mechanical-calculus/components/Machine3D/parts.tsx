'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';


export const M = {
    frame: '#17191a',
    iron: '#2b2f30',
    steel: '#71797e',
    bright: '#9aa4ab',
    lime: '#84cc16',
    limeDeep: '#3f6212',
    warn: '#f97316',
    paper: '#0a0a0a',
};

/**
 * Live machine state. Mutated once per render by Machine3D; every rotating
 * part reads it through an Angle closure inside useFrame. Angles are absolute
 * functions of the trace, so the machine scrubs, reverses and stalls exactly
 * as the simulation says it should.
 */
export interface Motion {
    /** Independent variable x. */
    x: number;
    /** Velocity carried by integrator 1's output. */
    v: number;
    /** Displacement carried by integrator 2's output. */
    y: number;
    /** Integrator 1 carriage offset, mm (clipped at the rim). */
    offA: number;
    /** Integrator 2 carriage offset, mm (clipped at the rim). */
    offV: number;
}

export type Angle = () => number;
export type Axis = 'x' | 'y' | 'z';

const STILL: Angle = () => 0;


/** Absolute-angle spinner about one local axis. */
export function Spin({
    angle,
    axis = 'y',
    flip = false,
    position,
    rotation,
    children,
}: {
    angle: Angle;
    axis?: Axis;
    flip?: boolean;
    position?: [number, number, number];
    rotation?: [number, number, number];
    children: React.ReactNode;
}) {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => {
        if (ref.current) ref.current.rotation[axis] = flip ? -angle() : angle();
    });
    return (
        <group position={position} rotation={rotation}>
            <group ref={ref}>{children}</group>
        </group>
    );
}


export function Beam({ position, scale, color = M.frame }: {
    position: [number, number, number];
    scale: [number, number, number];
    color?: string;
}) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={scale} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
        </mesh>
    );
}


/** Aligns a local +y cylinder with the given world axis (wide end along +axis). */
const CYL_ALIGN: Record<Axis, [number, number, number]> = {
    x: [0, 0, -Math.PI / 2],
    y: [0, 0, 0],
    z: [Math.PI / 2, 0, 0],
};

function collarScale(axis: Axis, r: number): [number, number, number] {
    const t = 0.035;
    const d = r * 2.9;
    if (axis === 'x') return [t, d, d];
    if (axis === 'y') return [d, t, d];
    return [d, d, t];
}

function alongAxis(axis: Axis, u: number): [number, number, number] {
    if (axis === 'x') return [u, 0, 0];
    if (axis === 'y') return [0, u, 0];
    return [0, 0, u];
}

/**
 * A rotating rod. Collars with square flats stick out past the radius so the
 * rotation of a thin cylinder is actually visible.
 */
export function AxleShaft({
    position,
    length,
    axis = 'x',
    radius = 0.03,
    angle,
    flip = false,
    accent = false,
    collars = [],
}: {
    position: [number, number, number];
    length: number;
    axis?: Axis;
    radius?: number;
    angle?: Angle;
    flip?: boolean;
    accent?: boolean;
    collars?: number[];
}) {
    const rod = (
        <>
            <mesh rotation={CYL_ALIGN[axis]} castShadow>
                <cylinderGeometry args={[radius, radius, length, 10]} />
                <meshStandardMaterial
                    color={accent ? M.lime : M.steel}
                    emissive={accent ? M.limeDeep : '#000000'}
                    emissiveIntensity={accent ? 0.45 : 0}
                    metalness={0.85}
                    roughness={0.3}
                />
            </mesh>
            {collars.map((u, i) => (
                <mesh key={i} position={alongAxis(axis, u)} castShadow>
                    <boxGeometry args={collarScale(axis, radius)} />
                    <meshStandardMaterial color={accent ? M.limeDeep : M.iron} metalness={0.8} roughness={0.35} />
                </mesh>
            ))}
        </>
    );
    if (!angle) return <group position={position}>{rod}</group>;
    return (
        <Spin angle={angle} axis={axis} flip={flip} position={position}>
            {rod}
        </Spin>
    );
}


const GEAR_ALIGN: Record<Axis, [number, number, number]> = {
    x: [0, Math.PI / 2, 0],
    y: [-Math.PI / 2, 0, 0],
    z: [0, 0, 0],
};

/** Spur gear spinning about `axis`; teeth built in the plane normal to it. */
export function SpurGear({
    position,
    axis = 'z',
    radius = 0.14,
    teeth = 14,
    thickness = 0.06,
    angle = STILL,
    flip = false,
    accent = false,
}: {
    position: [number, number, number];
    axis?: Axis;
    radius?: number;
    teeth?: number;
    thickness?: number;
    angle?: Angle;
    flip?: boolean;
    accent?: boolean;
}) {
    const toothData = useMemo(
        () => Array.from({ length: teeth }, (_, i) => {
            const a = (i / teeth) * Math.PI * 2;
            return { a, x: Math.cos(a) * (radius + 0.024), y: Math.sin(a) * (radius + 0.024) };
        }),
        [radius, teeth],
    );
    const color = accent ? M.lime : M.steel;
    return (
        <group position={position} rotation={GEAR_ALIGN[axis]}>
            <Spin angle={angle} axis="z" flip={flip}>
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[radius, radius, thickness, 22]} />
                    <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[radius * 0.28, radius * 0.28, thickness + 0.02, 12]} />
                    <meshStandardMaterial color={M.frame} metalness={0.8} roughness={0.35} />
                </mesh>
                {toothData.map((t, i) => (
                    <mesh key={i} position={[t.x, t.y, 0]} rotation={[0, 0, t.a]}>
                        <boxGeometry args={[0.055, 0.032, thickness]} />
                        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
                    </mesh>
                ))}
            </Spin>
        </group>
    );
}


/** Bevel gear: a truncated cone with tooth marks, wide end toward the mate. */
export function BevelGear({
    position,
    axis,
    face = 1,
    radius = 0.075,
    angle = STILL,
    flip = false,
    accent = false,
}: {
    position: [number, number, number];
    axis: Axis;
    /** +1: wide end points along +axis. -1: along -axis. */
    face?: 1 | -1;
    radius?: number;
    angle?: Angle;
    flip?: boolean;
    accent?: boolean;
}) {
    const marks = useMemo(
        () => Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return { a, x: Math.cos(a) * radius * 0.72, z: Math.sin(a) * radius * 0.72 };
        }),
        [radius],
    );
    const color = accent ? M.lime : M.bright;
    return (
        <group position={position} rotation={CYL_ALIGN[axis]}>
            <Spin angle={angle} axis="y" flip={flip}>
                <group rotation={face === 1 ? [0, 0, 0] : [Math.PI, 0, 0]}>
                    <mesh castShadow>
                        <cylinderGeometry args={[radius, radius * 0.4, radius * 0.85, 18]} />
                        <meshStandardMaterial color={color} metalness={0.82} roughness={0.3} />
                    </mesh>
                    {marks.map((mk, i) => (
                        <mesh key={i} position={[mk.x, radius * 0.32, mk.z]} rotation={[0, -mk.a, 0]}>
                            <boxGeometry args={[0.03, 0.02, 0.014]} />
                            <meshStandardMaterial color={M.frame} />
                        </mesh>
                    ))}
                </group>
            </Spin>
        </group>
    );
}


/** A right-angle joint: two bevel gears meshing at a corner. */
export function BevelJoint({
    position,
    a,
    b,
    angle,
    accent = false,
    gap = 0.055,
}: {
    position: [number, number, number];
    a: Axis;
    b: Axis;
    angle: Angle;
    accent?: boolean;
    gap?: number;
}) {
    const [x, y, z] = position;
    const offA = alongAxis(a, -gap);
    const offB = alongAxis(b, gap);
    return (
        <group>
            <BevelGear position={[x + offA[0], y + offA[1], z + offA[2]]} axis={a} face={1} angle={angle} accent={accent} />
            <BevelGear position={[x + offB[0], y + offB[1], z + offB[2]]} axis={b} face={-1} angle={angle} flip accent={accent} />
        </group>
    );
}


/**
 * A lead screw: rotating threaded rod. Thread ticks live inside the spinner
 * so the helix visibly travels when the screw turns.
 */
export function LeadScrew({
    position,
    length,
    axis = 'x',
    angle,
    threadFrom,
    threadTo,
    accent = false,
}: {
    position: [number, number, number];
    length: number;
    axis?: Axis;
    angle: Angle;
    threadFrom?: number;
    threadTo?: number;
    accent?: boolean;
}) {
    const t0 = threadFrom ?? -length / 2 + 0.06;
    const t1 = threadTo ?? length / 2 - 0.06;
    const ticks = useMemo(() => {
        const n = Math.max(6, Math.floor((t1 - t0) / 0.085));
        return Array.from({ length: n }, (_, i) => ({
            u: t0 + ((i + 0.5) / n) * (t1 - t0),
            rot: i * 0.9,
        }));
    }, [t0, t1]);
    const r = 0.026;
    return (
        <Spin angle={angle} axis={axis} position={position}>
            <mesh rotation={CYL_ALIGN[axis]} castShadow>
                <cylinderGeometry args={[r, r, length, 10]} />
                <meshStandardMaterial
                    color={accent ? M.lime : M.bright}
                    emissive={accent ? M.limeDeep : '#000000'}
                    emissiveIntensity={accent ? 0.4 : 0}
                    metalness={0.85}
                    roughness={0.3}
                />
            </mesh>
            {ticks.map((tk, i) => {
                const pos = alongAxis(axis, tk.u);
                const spinRot: [number, number, number] =
                    axis === 'x' ? [tk.rot, 0, 0] : axis === 'y' ? [0, tk.rot, 0] : [0, 0, tk.rot];
                return (
                    <group key={i} position={pos} rotation={spinRot}>
                        <mesh position={axis === 'y' ? [r + 0.008, 0, 0] : [0, r + 0.008, 0]}>
                            <boxGeometry args={axis === 'x' ? [0.05, 0.022, 0.022] : axis === 'z' ? [0.022, 0.022, 0.05] : [0.022, 0.05, 0.022]} />
                            <meshStandardMaterial color={accent ? M.limeDeep : M.steel} metalness={0.8} roughness={0.35} />
                        </mesh>
                    </group>
                );
            })}
        </Spin>
    );
}


/**
 * Nieman-type torque amplifier: two capstan drums spun continuously off the
 * main drive, a knife-edge arm deflected by the feeble input shaft, and an
 * output shaft that carries the same variable with real torque behind it.
 * Local axis is x; the input shaft arrives from -x, the output leaves at +x.
 */
export function TorqueAmplifier({
    position,
    drumAngle,
    outAngle,
    active,
}: {
    position: [number, number, number];
    drumAngle: Angle;
    outAngle: Angle;
    active: boolean;
}) {
    const armAngle: Angle = () => outAngle() * 0.12;
    return (
        <group position={position}>
            {/* Knife-edge arm off the input end. */}
            <Spin angle={armAngle} axis="x" position={[-0.24, 0, 0]}>
                <mesh position={[0, 0.09, 0]} castShadow>
                    <boxGeometry args={[0.03, 0.2, 0.05]} />
                    <meshStandardMaterial color={M.iron} metalness={0.75} roughness={0.35} />
                </mesh>
            </Spin>

            {/* Counter-rotating capstan drums, running whenever the motor runs. */}
            {([-0.075, 0.105] as const).map((dx, i) => (
                <group key={dx}>
                    <Spin angle={drumAngle} axis="x" flip={i === 1} position={[dx, 0, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                            <cylinderGeometry args={[0.115, 0.115, 0.15, 20]} />
                            <meshStandardMaterial color={active ? M.bright : M.steel} metalness={0.8} roughness={0.28} />
                        </mesh>
                        <mesh position={[0, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <boxGeometry args={[0.03, 0.06, 0.03]} />
                            <meshStandardMaterial color={M.frame} />
                        </mesh>
                    </Spin>
                    {/* The friction band wrapped around each drum. */}
                    <mesh position={[dx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.125, 0.011, 6, 24]} />
                        <meshStandardMaterial color={M.frame} roughness={0.9} metalness={0.2} />
                    </mesh>
                </group>
            ))}

            {/* Bracket down to the bench. */}
            <Beam position={[0.015, -0.34, 0]} scale={[0.09, 0.55, 0.09]} />
            <Beam position={[0.015, -0.07, 0]} scale={[0.36, 0.05, 0.16]} />
        </group>
    );
}


/**
 * Differential-gear adder. Two side bevel gears carry the input terms; the
 * spider carrier is geometrically forced to turn with their mean, which is
 * the sum up to a gear ratio. The ring on the carrier hands the sum upward.
 */
export function DifferentialAdder({
    position,
    sideA,
    sideB,
    carrier,
}: {
    position: [number, number, number];
    sideA: Angle;
    sideB: Angle;
    carrier: Angle;
}) {
    return (
        <group position={position}>
            <BevelGear position={[-0.13, 0, 0]} axis="x" face={1} radius={0.1} angle={sideA} accent />
            <BevelGear position={[0.13, 0, 0]} axis="x" face={-1} radius={0.1} angle={sideB} accent />

            {/* Spider carrier: cross pin and two idle pinions, turning with the sum. */}
            <Spin angle={carrier} axis="x">
                <mesh castShadow>
                    <boxGeometry args={[0.024, 0.024, 0.26]} />
                    <meshStandardMaterial color={M.iron} metalness={0.8} roughness={0.3} />
                </mesh>
                {([-0.1, 0.1] as const).map(dz => (
                    <mesh key={dz} position={[0, 0, dz]} rotation={[dz > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.055, 0.024, 0.05, 14]} />
                        <meshStandardMaterial color={M.bright} metalness={0.82} roughness={0.3} />
                    </mesh>
                ))}
                {/* Ring gear on the carrier: the sum leaves through this. */}
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <torusGeometry args={[0.14, 0.022, 8, 26]} />
                    <meshStandardMaterial color={M.lime} emissive={M.limeDeep} emissiveIntensity={0.4} metalness={0.8} roughness={0.3} />
                </mesh>
                {Array.from({ length: 10 }, (_, i) => {
                    const a = (i / 10) * Math.PI * 2;
                    return (
                        <mesh key={i} position={[0, Math.cos(a) * 0.163, Math.sin(a) * 0.163]} rotation={[a, 0, 0]}>
                            <boxGeometry args={[0.045, 0.028, 0.02]} />
                            <meshStandardMaterial color={M.lime} metalness={0.8} roughness={0.3} />
                        </mesh>
                    );
                })}
            </Spin>

            {/* Open housing and pedestal. */}
            {([-0.24, 0.24] as const).map(dx => (
                <mesh key={dx} position={[dx, 0, 0]} castShadow>
                    <boxGeometry args={[0.03, 0.3, 0.3]} />
                    <meshStandardMaterial color={M.frame} metalness={0.7} roughness={0.4} />
                </mesh>
            ))}
            <Beam position={[0, -0.34, 0]} scale={[0.1, 0.6, 0.1]} />
        </group>
    );
}


/**
 * Multiplier gear cluster: input gear on the through axis, compound idler on
 * a layshaft below. This is where a constant coefficient of the equation
 * lives: the ratio was chosen by picking change gears.
 */
export function GearCluster({
    position,
    inAngle,
    outAngle,
    accent = false,
}: {
    position: [number, number, number];
    inAngle: Angle;
    outAngle: Angle;
    accent?: boolean;
}) {
    return (
        <group position={position}>
            <SpurGear position={[-0.07, 0, 0]} axis="x" radius={0.105} teeth={13} angle={inAngle} accent={accent} />
            <SpurGear position={[-0.07, -0.172, 0]} axis="x" radius={0.062} teeth={9} angle={inAngle} flip />
            <SpurGear position={[0.07, -0.172, 0]} axis="x" radius={0.1} teeth={12} angle={outAngle} flip />
            <SpurGear position={[0.07, 0, 0]} axis="x" radius={0.068} teeth={9} angle={outAngle} accent={accent} />
            <AxleShaft position={[0, -0.172, 0]} length={0.3} axis="x" radius={0.022} />
            <Beam position={[0, -0.31, 0]} scale={[0.08, 0.32, 0.08]} />
        </group>
    );
}


/* ---------------------------------------------------------------- *
 * The integrator: disc, carriage on a lead screw, wheel on a spline
 * shaft, torque amplifier on the way out.
 * ---------------------------------------------------------------- */

export function Integrator({
    position,
    driveAngle,
    outAngle,
    drumAngle,
    screwAngle,
    offset,
    active,
    slipping,
    clipped,
    running,
    selected,
}: {
    position: [number, number, number];
    /** Disc rotation: the independent variable. */
    driveAngle: Angle;
    /** Wheel, spline shaft and amplifier output: the accumulated integral. */
    outAngle: Angle;
    drumAngle: Angle;
    /** Lead screw: proportional to the carriage offset. */
    screwAngle: Angle;
    /** Carriage offset as a fraction of the disc radius, -1..1. */
    offset: number;
    active: boolean;
    slipping: boolean;
    clipped: boolean;
    running: boolean;
    selected: boolean;
}) {
    const cx = -0.15 + THREE.MathUtils.clamp(offset, -1, 1) * 0.4;
    const wheelColor = clipped || slipping ? M.warn : active ? M.lime : M.bright;
    const discMarks = useMemo(
        () => Array.from({ length: 3 }, (_, i) => (i / 3) * Math.PI * 2),
        [],
    );

    return (
        <group position={position}>
            {/* Bed plate. */}
            <mesh position={[0.35, 0.06, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.6, 0.12, 1.1]} />
                <meshStandardMaterial color={selected ? M.limeDeep : M.iron} metalness={0.7} roughness={0.4} />
            </mesh>

            {/* Disc spindle rising from the countershaft under the bench. */}
            <AxleShaft position={[-0.15, -0.05, 0]} length={1.1} axis="y" radius={0.028} angle={driveAngle} collars={[-0.28]} />
            <mesh position={[-0.15, -0.06, 0]}>
                <cylinderGeometry args={[0.06, 0.075, 0.16, 12]} />
                <meshStandardMaterial color={M.frame} metalness={0.75} roughness={0.35} />
            </mesh>

            {/* The disc itself. */}
            <Spin angle={driveAngle} axis="y" position={[-0.15, 0.52, 0]}>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.42, 0.42, 0.045, 40]} />
                    <meshStandardMaterial color={active ? M.bright : M.steel} metalness={0.85} roughness={0.22} />
                </mesh>
                <mesh position={[0, 0.028, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.05, 14]} />
                    <meshStandardMaterial color={M.frame} metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.026, 0]}>
                    <torusGeometry args={[0.36, 0.004, 4, 40]} />
                    <meshStandardMaterial color={M.iron} metalness={0.8} roughness={0.3} />
                </mesh>
                {discMarks.map((a, i) => (
                    <mesh key={i} position={[Math.cos(a) * 0.22, 0.026, Math.sin(a) * 0.22]} rotation={[0, -a, 0]}>
                        <boxGeometry args={[0.26, 0.006, 0.012]} />
                        <meshStandardMaterial color={i === 0 && active ? M.lime : M.frame} />
                    </mesh>
                ))}
            </Spin>

            {/* Pillars and the carriage bridge. */}
            {([-0.65, 0.65] as const).map(px => ([-0.32, 0.32] as const).map(pz => (
                <Beam key={`${px}:${pz}`} position={[px, 0.45, pz]} scale={[0.07, 0.9, 0.07]} />
            )))}
            {([-0.14, 0.14] as const).map(rz => (
                <Beam key={rz} position={[0, 0.95, rz]} scale={[1.4, 0.045, 0.045]} color={M.iron} />
            ))}

            {/* The lead screw that places the carriage: this is the input variable. */}
            <LeadScrew position={[0, 0.98, 0]} length={1.4} axis="x" angle={screwAngle} threadFrom={-0.58} threadTo={0.58} accent={active} />

            {/* Carriage: nut block, hangers, bearings around the spline shaft. */}
            <group position={[cx, 0, 0]}>
                <mesh position={[0, 0.95, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.14, 0.36]} />
                    <meshStandardMaterial color={clipped ? M.warn : M.frame} metalness={0.75} roughness={0.35} />
                </mesh>
                {([-0.07, 0.07] as const).map(hz => (
                    <mesh key={hz} position={[0, 0.77, hz]} castShadow>
                        <boxGeometry args={[0.045, 0.26, 0.028]} />
                        <meshStandardMaterial color={M.frame} metalness={0.75} roughness={0.35} />
                    </mesh>
                ))}
                {([-0.07, 0.07] as const).map(hz => (
                    <mesh key={hz} position={[0, 0.63, hz]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.048, 0.012, 6, 18]} />
                        <meshStandardMaterial color={M.iron} metalness={0.8} roughness={0.3} />
                    </mesh>
                ))}
                {/* The integrating wheel, riding the disc surface. */}
                <Spin angle={outAngle} axis="x" position={[0, 0.63, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.09, 0.09, 0.05, 20]} />
                        <meshStandardMaterial
                            color={wheelColor}
                            emissive={active ? wheelColor : '#000000'}
                            emissiveIntensity={active ? 0.35 : 0}
                            metalness={0.7}
                            roughness={0.35}
                        />
                    </mesh>
                    {([-0.05, 0.05] as const).map(dy => (
                        <mesh key={dy} position={[0, dy, 0.055]}>
                            <boxGeometry args={[0.052, 0.016, 0.016]} />
                            <meshStandardMaterial color={M.frame} />
                        </mesh>
                    ))}
                </Spin>
            </group>

            {/* Spline output shaft: the wheel slides along it, its rotation leaves through it. */}
            <AxleShaft position={[0.05, 0.63, 0]} length={1.54} axis="x" radius={0.026} angle={outAngle} accent={active} collars={[-0.62]} />

            <TorqueAmplifier position={[0.98, 0.63, 0]} drumAngle={drumAngle} outAngle={outAngle} active={running} />

            {/* Amplified output shaft. */}
            <AxleShaft position={[1.42, 0.63, 0]} length={0.5} axis="x" radius={0.03} angle={outAngle} accent={active} collars={[0.18]} />
        </group>
    );
}


/* ---------------------------------------------------------------- *
 * Main drive: motor, flywheel, reduction gears, countershafts.
 * ---------------------------------------------------------------- */

export function Motor({
    position,
    motorAngle,
    driveAngle,
    running,
    selected,
}: {
    position: [number, number, number];
    motorAngle: Angle;
    driveAngle: Angle;
    running: boolean;
    selected: boolean;
}) {
    return (
        <group position={position}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.85, 1.0]} />
                <meshStandardMaterial
                    color={selected ? M.limeDeep : M.frame}
                    emissive={running ? M.limeDeep : '#000000'}
                    emissiveIntensity={running ? 0.18 : 0}
                    metalness={0.7}
                    roughness={0.4}
                />
            </mesh>
            <mesh position={[-0.66, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.34, 0.34, 0.3, 24]} />
                <meshStandardMaterial color={M.iron} metalness={0.78} roughness={0.3} />
            </mesh>

            {/* Flywheel: smooths the one rate every variable is measured against. */}
            <Spin angle={motorAngle} axis="x" position={[-1.05, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <torusGeometry args={[0.46, 0.05, 8, 32]} />
                    <meshStandardMaterial color={M.steel} metalness={0.85} roughness={0.25} />
                </mesh>
                {Array.from({ length: 6 }, (_, i) => (
                    <mesh key={i} rotation={[(i / 6) * Math.PI * 2, 0, 0]}>
                        <boxGeometry args={[0.05, 0.04, 0.85]} />
                        <meshStandardMaterial color={M.steel} metalness={0.85} roughness={0.25} />
                    </mesh>
                ))}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.09, 0.09, 0.16, 16]} />
                    <meshStandardMaterial color={M.frame} metalness={0.8} roughness={0.3} />
                </mesh>
            </Spin>

            {/* Motor shaft, pinion, and the reduction gear down to the countershaft. */}
            <AxleShaft position={[0.72, 0, 0]} length={0.55} axis="x" radius={0.045} angle={motorAngle} accent collars={[0.1]} />
            <SpurGear position={[0.97, 0, 0]} axis="x" radius={0.11} teeth={11} angle={motorAngle} />
            <SpurGear position={[0.97, -0.32, 0]} axis="x" radius={0.21} teeth={22} angle={driveAngle} flip accent />

            <Beam position={[0, -0.52, 0]} scale={[1.3, 0.2, 1.05]} />
        </group>
    );
}


/**
 * The countershafts under both benches: one motor, every disc. Spindle
 * takeoffs are bevel pairs at each integrator position.
 */
export function CounterDrive({
    driveAngle,
    frontXs,
    backXs,
}: {
    driveAngle: Angle;
    frontXs: number[];
    backXs: number[];
}) {
    return (
        <group>
            <AxleShaft position={[-1.75, 0.3, -1.6]} length={10.7} axis="x" radius={0.032} angle={driveAngle} accent collars={[-4.2, -1.4, 1.4, 4.2]} />
            <AxleShaft position={[-1.55, 0.3, 1.6]} length={10.3} axis="x" radius={0.032} angle={driveAngle} accent collars={[-3.8, 0, 3.8]} />
            <AxleShaft position={[-6.7, 0.3, 0]} length={3.2} axis="z" radius={0.032} angle={driveAngle} collars={[-1.0, 1.0]} />
            <BevelJoint position={[-6.7, 0.3, -1.6]} a="x" b="z" angle={driveAngle} />
            <BevelJoint position={[-6.7, 0.3, 1.6]} a="z" b="x" angle={driveAngle} />
            {frontXs.map(x => (
                <BevelJoint key={`f${x}`} position={[x, 0.3, -1.6]} a="x" b="y" angle={driveAngle} />
            ))}
            {backXs.map(x => (
                <BevelJoint key={`b${x}`} position={[x, 0.3, 1.6]} a="x" b="y" angle={driveAngle} />
            ))}
        </group>
    );
}


/**
 * An overhead patch run: up from a mechanism, across the machine at gantry
 * height, down onto a shaft-bank row. Four bevel joints, three shafts.
 */
export function ZElbow({
    x,
    aY,
    aZ,
    bZ,
    bY = 1.38,
    top = 2.0,
    angle,
    accent = false,
    aAxis = 'x',
    bAxis = 'x',
}: {
    x: number;
    aY: number;
    aZ: number;
    bZ: number;
    bY?: number;
    top?: number;
    angle: Angle;
    accent?: boolean;
    aAxis?: Axis;
    bAxis?: Axis;
}) {
    const hasB = Math.abs(top - bY) > 0.03;
    return (
        <group>
            <BevelJoint position={[x, aY, aZ]} a={aAxis} b="y" angle={angle} accent={accent} />
            <AxleShaft position={[x, (aY + top) / 2, aZ]} length={top - aY} axis="y" radius={0.024} angle={angle} accent={accent} collars={[(top - aY) * 0.3]} />
            <BevelJoint position={[x, top, aZ]} a="y" b="z" angle={angle} accent={accent} />
            <AxleShaft position={[x, top, (aZ + bZ) / 2]} length={Math.abs(bZ - aZ)} axis="z" radius={0.024} angle={angle} accent={accent} collars={[Math.abs(bZ - aZ) * 0.25]} />
            {hasB ? (
                <>
                    <BevelJoint position={[x, top, bZ]} a="z" b="y" angle={angle} accent={accent} />
                    <AxleShaft position={[x, (top + bY) / 2, bZ]} length={top - bY} axis="y" radius={0.024} angle={angle} accent={accent} />
                    <BevelJoint position={[x, bY, bZ]} a="y" b={bAxis} angle={angle} accent={accent} />
                </>
            ) : (
                <BevelJoint position={[x, top, bZ]} a="z" b={bAxis} angle={angle} accent={accent} />
            )}
        </group>
    );
}


/* ---------------------------------------------------------------- *
 * Output table: two lead screws move the pen, the answer is a curve.
 * ---------------------------------------------------------------- */

export function Plotter({
    machinePoints,
    idealPoints,
    penX,
    penZ,
    offPaper,
    driveAngle,
    yAngle,
    selected,
}: {
    machinePoints: [number, number, number][];
    idealPoints: [number, number, number][];
    penX: number;
    penZ: number;
    offPaper: boolean;
    driveAngle: Angle;
    yAngle: Angle;
    selected: boolean;
}) {
    const penColor = offPaper ? M.warn : M.lime;
    return (
        <group position={[7.2, 1.0, 0]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[4.4, 0.12, 2.3]} />
                <meshStandardMaterial color={selected ? M.limeDeep : M.iron} metalness={0.6} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.07, 0]} receiveShadow>
                <boxGeometry args={[3.9, 0.02, 1.85]} />
                <meshStandardMaterial color={M.paper} roughness={0.95} />
            </mesh>

            {[-0.6, -0.3, 0.3, 0.6].map(z => (
                <Line key={z} points={[[-1.9, 0.085, z], [1.9, 0.085, z]]} color={M.limeDeep} opacity={0.35} transparent lineWidth={0.5} />
            ))}
            <Line points={[[-1.9, 0.086, 0], [1.9, 0.086, 0]]} color={M.limeDeep} lineWidth={1} />

            {idealPoints.length > 1 && (
                <Line points={idealPoints} color={M.bright} lineWidth={1} dashed dashSize={0.06} gapSize={0.05} opacity={0.5} transparent />
            )}
            {machinePoints.length > 1 && (
                <Line points={machinePoints} color={offPaper ? M.warn : M.lime} lineWidth={2.4} />
            )}

            {/* Longitudinal lead screw: the independent variable walks the gantry. */}
            <LeadScrew position={[-0.2, 0.16, -1.08]} length={4.3} axis="x" angle={driveAngle} threadFrom={-1.7} threadTo={2.1} accent />
            {/* Splined rod: carries y along the table; the gantry taps it wherever it stands. */}
            <AxleShaft position={[-0.2, 0.16, 1.08]} length={4.3} axis="x" radius={0.026} angle={yAngle} accent collars={[-1.7, 0.2, 1.7]} />

            {/* The pen gantry. */}
            <group position={[penX, 0, 0]}>
                <mesh position={[0, 0.16, -1.08]} castShadow>
                    <boxGeometry args={[0.18, 0.13, 0.15]} />
                    <meshStandardMaterial color={M.frame} metalness={0.75} roughness={0.35} />
                </mesh>
                <mesh position={[0, 0.16, 1.08]} castShadow>
                    <boxGeometry args={[0.18, 0.13, 0.15]} />
                    <meshStandardMaterial color={M.frame} metalness={0.75} roughness={0.35} />
                </mesh>
                {([-1.06, 1.06] as const).map(pz => (
                    <mesh key={pz} position={[0, 0.34, pz]} castShadow>
                        <boxGeometry args={[0.055, 0.28, 0.055]} />
                        <meshStandardMaterial color={M.frame} metalness={0.7} roughness={0.4} />
                    </mesh>
                ))}
                <Beam position={[0, 0.49, 0]} scale={[0.055, 0.055, 2.24]} />

                {/* Cross lead screw under the bridge, driven off the splined rod. */}
                <LeadScrew position={[0, 0.19, 0]} length={2.0} axis="z" angle={yAngle} threadFrom={-0.9} threadTo={0.9} accent />
                <BevelJoint position={[0, 0.19, 1.03]} a="z" b="x" angle={yAngle} gap={0.05} />

                {/* Pen carriage and pen. */}
                <group position={[0, 0, penZ]}>
                    <mesh position={[0, 0.19, 0]} castShadow>
                        <boxGeometry args={[0.11, 0.09, 0.15]} />
                        <meshStandardMaterial color={M.iron} metalness={0.75} roughness={0.35} />
                    </mesh>
                    <mesh position={[0, 0.22, 0]}>
                        <cylinderGeometry args={[0.018, 0.018, 0.3, 10]} />
                        <meshStandardMaterial color={penColor} emissive={penColor} emissiveIntensity={0.7} />
                    </mesh>
                    <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
                        <coneGeometry args={[0.026, 0.07, 10]} />
                        <meshStandardMaterial color={penColor} />
                    </mesh>
                </group>
            </group>

            {([-1.95, 1.95] as const).map(lx => ([-0.95, 0.95] as const).map(lz => (
                <Beam key={`${lx}:${lz}`} position={[lx, -0.44, lz]} scale={[0.11, 0.9, 0.11]} />
            )))}
        </group>
    );
}


/* ---------------------------------------------------------------- *
 * Input table: idle here, but fully rigged.
 * ---------------------------------------------------------------- */

export function InputTable({ selected }: { selected: boolean }) {
    const curve = useMemo(
        () => Array.from({ length: 60 }, (_, i) => {
            const x = -0.9 + (i / 59) * 1.8;
            return [x, 0.02, Math.sin(x * Math.PI * 1.6) * 0.22] as [number, number, number];
        }),
        [],
    );
    return (
        <group position={[-7.9, 1.06, 1.7]} rotation={[0.16, 0, 0]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[2.2, 0.1, 1.5]} />
                <meshStandardMaterial color={selected ? M.limeDeep : M.iron} metalness={0.6} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[1.95, 0.02, 1.25]} />
                <meshStandardMaterial color={M.paper} roughness={0.95} />
            </mesh>
            <Line points={curve} color={M.limeDeep} lineWidth={1.4} />

            {/* Cross-hair carriage on its two screws, waiting for an operator. */}
            <AxleShaft position={[0, 0.12, -0.68]} length={1.9} axis="x" radius={0.02} />
            <mesh position={[0, 0.14, 0]} castShadow>
                <boxGeometry args={[0.035, 0.09, 1.25]} />
                <meshStandardMaterial color={M.steel} metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[0.09, 0.03, 0.09]} />
                <meshStandardMaterial color={M.bright} metalness={0.7} roughness={0.35} />
            </mesh>

            {/* Hand cranks. */}
            {([-0.55, 0.55] as const).map(hx => (
                <group key={hx} position={[hx, 0.1, 0.82]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <torusGeometry args={[0.09, 0.016, 6, 20]} />
                        <meshStandardMaterial color={M.steel} metalness={0.8} roughness={0.3} />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                        <meshStandardMaterial color={M.frame} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}


/* ---------------------------------------------------------------- *
 * The interconnection shaft bank: the program.
 * ---------------------------------------------------------------- */

export function ShaftBank({
    driveAngle,
    vAngle,
    yAngle,
    selected,
}: {
    driveAngle: Angle;
    vAngle: Angle;
    yAngle: Angle;
    selected: boolean;
}) {
    const rows: { z: number; angle?: Angle }[] = [
        { z: -0.6, angle: driveAngle },
        { z: -0.36, angle: vAngle },
        { z: -0.12, angle: yAngle },
        { z: 0.12 },
        { z: 0.36 },
        { z: 0.6 },
    ];
    const radius = selected ? 0.036 : 0.028;
    return (
        <group>
            {rows.map(row => [1.02, 1.2, 1.38].map(level => (
                <AxleShaft
                    key={`${row.z}:${level}`}
                    position={[-0.6, level, row.z]}
                    length={11.9}
                    axis="x"
                    radius={radius}
                    angle={level === 1.38 ? row.angle : undefined}
                    accent={level === 1.38 && !!row.angle}
                    collars={level === 1.38 && row.angle ? [-5.2, -2.6, 0, 2.6, 5.2] : []}
                />
            )))}
        </group>
    );
}


/* ---------------------------------------------------------------- *
 * Everything that never moves.
 * ---------------------------------------------------------------- */

export const StaticFrame = React.memo(function StaticFrame() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
                <planeGeometry args={[44, 28]} />
                <meshStandardMaterial color="#050505" roughness={0.95} />
            </mesh>
            <gridHelper args={[40, 40, '#1a2e05', '#111811']} position={[0, 0.002, 0]} />

            {/* The two benches the integrators bolt to. */}
            {([-1.6, 1.6] as const).map(z => (
                <group key={z}>
                    <Beam position={[-0.85, 0.84, z]} scale={[11.7, 0.12, 1.5]} />
                    {[-6.3, -3.4, -0.4, 2.6, 4.5].map(x => (
                        <group key={x}>
                            <Beam position={[x, 0.39, z - 0.48]} scale={[0.12, 0.78, 0.12]} />
                            <Beam position={[x, 0.39, z + 0.48]} scale={[0.12, 0.78, 0.12]} />
                        </group>
                    ))}
                </group>
            ))}

            {/* Gantry posts carrying the shaft bank. */}
            {[-5.5, -2.75, 0, 2.75, 5.5].map(x => (
                <group key={x}>
                    <Beam position={[x, 0.7, -0.78]} scale={[0.08, 1.4, 0.08]} />
                    <Beam position={[x, 0.7, 0.78]} scale={[0.08, 1.4, 0.08]} />
                    <Beam position={[x, 1.44, 0]} scale={[0.08, 0.08, 1.64]} />
                    {[-0.6, -0.36, -0.12, 0.12, 0.36, 0.6].map(z => (
                        <Beam key={z} position={[x, 1.395, z]} scale={[0.1, 0.06, 0.07]} color={M.iron} />
                    ))}
                </group>
            ))}
        </group>
    );
});

