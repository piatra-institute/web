/**
 * Mechanical calculus: an error model of a wheel-and-disc differential analyzer.
 *
 * The machine is programmed by a patch (logic/patch.ts): which shaft turns each
 * disc, which shaft each carriage is screwed to, and which change-gear ratios
 * feed the adders. The simulator (logic/engine.ts) integrates only the
 * mechanism's kinematics; the differential equation being solved appears
 * nowhere in the stepper. It emerges from the wiring, exactly as it did on the
 * bench. Four setup sheets ship: the damped oscillator, an exponential decay,
 * a forced oscillator with a live input table, and the van der Pol equation
 * with its squares built by parts.
 *
 * Wheel-and-disc kinematics. A disc turning through angle Theta drags a wheel
 * of radius rho sitting at radial offset r, so the wheel turns through
 *
 *     theta_wheel = (1 / rho) * integral( r dTheta ).
 *
 * With Theta = 2*pi*x (one disc turn per unit of the independent variable) and
 * the carriage placing the wheel at r = k*V (k in mm per unit of the integrand),
 * the output shaft accumulates (k / rho) * integral(V dx) turns. So one turn of
 * an output shaft is worth rho/k units of the integral: the scale factor k is
 * the whole of "programming" this machine, together with the patch.
 *
 * Four physical error sources act on that ideal relation:
 *
 *   creep      the friction contact transmits torque by microslip, so the wheel
 *              under-rotates by kappa = T_load / (G * mu * N * rho). Past
 *              kappa = 1 the contact breaks into gross slip and transmits
 *              nothing. The torque amplifier gain G is what buys headroom here.
 *   backlash   the gear train between an output shaft and the next carriage has
 *              lost motion, so every reversal of the transmitted variable is
 *              swallowed. In represented units the dead band is beta*rho/k.
 *   lag        the follow-up servos take real time to null an error. Running the
 *              independent variable at S units per real second turns a real-time
 *              lag into a lag of tau = S * lag_real in the problem's own units.
 *              Each loop's lag is lumped onto one marked feedback edge and
 *              applied to first order. In a feedback loop that lag eats damping,
 *              zeta_eff = zeta - g*omega*tau/2, and once it has eaten all of it
 *              the machine oscillates on its own.
 *   saturation the wheel cannot leave the disc, so |k*V| <= R.
 *
 * The loop is integrated with RK4 so that numerical error stays several orders
 * of magnitude below the mechanical error being studied. Backlash is the one
 * element with memory: the held value is frozen across a step and taken up at
 * the end of it.
 */

import {
    CoeffSpec,
    EquationCoeffs,
    EquationKey,
    EQUATIONS,
    EQUATION_KEYS,
    PatchSpec,
    SLOT_POSITIONS,
    X_END,
    buildPatchFor,
    idealY,
    idealV,
} from './patch';
import {
    MachineRun,
    Mechanism,
    TracePoint,
    idealRun,
    idealSeries,
    idealEnvelopeRate,
    measurePeriod,
    measureEnvelopeRate,
    runPatch,
} from './engine';

export { X_END, idealY, idealV, EQUATIONS, EQUATION_KEYS, SLOT_POSITIONS, buildPatchFor };
export { measurePeriod, measureEnvelopeRate };
export type { EquationKey, EquationCoeffs, CoeffSpec, PatchSpec };
export type { MachineRun, TracePoint, Mechanism };
export type {
    AdderSpec,
    AdderTerm,
    IntegratorSpec,
    InputTableSpec,
    SlotId,
} from './patch';


export type PresetKey =
    | 'kelvin-1876'
    | 'construction-set'
    | 'bush-1931'
    | 'run-it-fast'
    | 'mis-scaled';

export interface Params extends EquationCoeffs {
    /** Which setup sheet the machine is wired to. */
    equation: EquationKey;

    /** omega: the oscillator's natural frequency, radians per unit of x. */
    frequency: number;
    /** zeta: the oscillator's damping ratio. */
    damping: number;
    /** lambda: the decay equation's rate constant. */
    lambda: number;
    /** mu: the van der Pol nonlinearity. */
    mu: number;
    /** A: forcing amplitude on the input table. */
    amplitude: number;
    /** Omega: forcing frequency on the input table. */
    forceFrequency: number;
    /** Operator curve-following error, percent of the forcing amplitude. */
    trackingError: number;

    /** G: torque amplifier gain. 1 means no amplifier at all. */
    torqueGain: number;
    /** mu: friction coefficient at the wheel-disc contact. */
    friction: number;
    /** N: normal force pressing the wheel onto the disc, newtons. */
    wheelLoad: number;
    /** rho: integrating wheel radius, mm. */
    wheelRadius: number;
    /** R: disc radius, mm. The wheel cannot be carried past it. */
    discRadius: number;
    /** beta: gear-train lost motion, arcminutes of shaft rotation. */
    backlash: number;
    /** S: how fast the drive turns the independent variable, x-units per real second. */
    machineSpeed: number;
    /** k: common scale factor, mm of wheel offset per unit of the integrand.
     *  Each integrator uses relScale_i * k, per its setup sheet. */
    scaleFactor: number;

    preset: PresetKey;
}


/** Integration step for the displayed run. */
const DT = 0.005;
/** Coarser step for sweeps, landscapes and tornado bars. */
const DT_SWEEP = 0.02;

/** Static load torque on an integrator output shaft, N*m (bearings, gears, pen). */
const T_STATIC = 0.12;
/** Extra load per mm-per-x-unit of carriage slew rate, N*m. */
const C_CARRIAGE = 0.0008;
/** Follow-up lag of the torque amplifier at unit gain, real seconds. */
const C_SERVO = 400;
/** Fixed drive-train follow-up lag, real seconds. */
const T_GEAR = 0.08;

const TURNS_PER_ARCMIN = 1 / 21600;
/** Delay is clamped so the history buffer stays bounded. */
const MAX_LAG = 4;

export const ANIMATION_TOTAL_FRAMES = 260;


export const DEFAULT_PARAMS: Params = {
    equation: 'damped-oscillator',
    frequency: 1.2,
    damping: 0.05,
    lambda: 0.2,
    mu: 1.0,
    amplitude: 0.5,
    forceFrequency: 0.8,
    trackingError: 0.5,
    torqueGain: 12000,
    friction: 0.28,
    wheelLoad: 25,
    wheelRadius: 20,
    discRadius: 120,
    backlash: 4,
    machineSpeed: 0.01,
    scaleFactor: 60,
    preset: 'bush-1931',
};


export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'kelvin-1876': {
        label: 'Kelvin, 1876',
        question: 'Kelvin described this machine on paper. Why did nobody build it?',
        expectation: 'Without a torque amplifier the wheel cannot drive the next carriage. It slips. The discs turn and the pen draws a straight line.',
    },
    'construction-set': {
        label: 'construction set',
        question: 'Can you build a differential analyzer out of toy parts?',
        expectation: 'Yes, and it computes. Sloppy gears and small discs hold it to roughly one decimal digit of truth.',
    },
    'bush-1931': {
        label: 'Bush, 1931',
        question: 'What does the MIT machine actually deliver?',
        expectation: 'Two useful digits. The integrators are far better than that; phase error accumulating over six cycles eats the rest.',
    },
    'run-it-fast': {
        label: 'run it fast',
        question: 'The run takes fifty minutes. Can we hurry it along?',
        expectation: 'No. Speed converts the servos’ real-time lag into problem-time lag, the lag eats the damping, and the machine hunts.',
    },
    'mis-scaled': {
        label: 'mis-scaled',
        question: 'What if the scale factor is chosen badly?',
        expectation: 'The carriage asks for more millimetres than the disc has radius. The wheel rides off the rim and the peaks are clipped flat.',
    },
};


export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'kelvin-1876':
            return {
                ...DEFAULT_PARAMS,
                frequency: 1.2, damping: 0.05,
                torqueGain: 1, friction: 0.28, wheelLoad: 25, wheelRadius: 20,
                discRadius: 120, backlash: 4, machineSpeed: 0.01, scaleFactor: 60,
                preset: key,
            };
        case 'construction-set':
            return {
                ...DEFAULT_PARAMS,
                frequency: 1.2, damping: 0.05,
                torqueGain: 5000, friction: 0.15, wheelLoad: 8, wheelRadius: 15,
                discRadius: 60, backlash: 90, machineSpeed: 0.03, scaleFactor: 35,
                preset: key,
            };
        case 'bush-1931':
            return { ...DEFAULT_PARAMS, preset: key };
        case 'run-it-fast':
            return {
                ...DEFAULT_PARAMS,
                frequency: 1.3, damping: 0.01,
                torqueGain: 12000, friction: 0.28, wheelLoad: 25, wheelRadius: 20,
                discRadius: 120, backlash: 4, machineSpeed: 0.6, scaleFactor: 60,
                preset: key,
            };
        case 'mis-scaled':
            return {
                ...DEFAULT_PARAMS,
                frequency: 1.2, damping: 0.05,
                torqueGain: 12000, friction: 0.28, wheelLoad: 25, wheelRadius: 20,
                discRadius: 120, backlash: 4, machineSpeed: 0.01, scaleFactor: 150,
                preset: key,
            };
    }
}


/**
 * The preset stories are told on the damped oscillator. Selecting one there
 * restores it exactly; on any other equation only the machine's condition
 * carries over, and the equation keeps its coefficients.
 */
export function applyPreset(key: PresetKey, current: Params): Params {
    const preset = presetParams(key);
    if (current.equation === 'damped-oscillator') return preset;
    return {
        ...current,
        torqueGain: preset.torqueGain,
        friction: preset.friction,
        wheelLoad: preset.wheelLoad,
        wheelRadius: preset.wheelRadius,
        discRadius: preset.discRadius,
        backlash: preset.backlash,
        machineSpeed: preset.machineSpeed,
        scaleFactor: preset.scaleFactor,
        preset: key,
    };
}


/** The active patch: the machine's program, derived from the parameters. */
export function buildPatch(params: Params): PatchSpec {
    return buildPatchFor(params.equation, params);
}


/* ---------------------------------------------------------------- *
 * The machine's mechanical budget.
 * ---------------------------------------------------------------- */

export interface MachineSpec {
    /** mu * N * rho: the most torque the friction contact can pass, N*m. */
    frictionLimit: number;
    /** What the downstream carriage, gears and pen demand, N*m. */
    loadTorque: number;
    /** kappa: microslip as a fraction of the friction limit. */
    creep: number;
    /** kappa >= 1: the contact has broken loose and transmits nothing. */
    grossSlip: boolean;
    /** g = 1 - kappa: the fraction of the ideal rotation that survives. */
    gain: number;
    /** Follow-up lag of the drive train, real seconds. */
    lagReal: number;
    /** tau: the same lag expressed in units of the independent variable. */
    lag: number;
    /** The lag at which the loop's effective damping reaches zero.
     *  Null when the equation has no linearised loop to analyse. */
    lagCritical: number | null;
    stable: boolean;
    /** Gear-train lost motion at the pen's integrator, in represented units. */
    deadBand: number;
    /** R / k at the pen's integrator: the largest integrand it can represent. */
    ceiling: number;
    /** The largest integrand the patch actually demands, in common-k units. */
    peakIntegrand: number;
    /** Ratio of the two, in decibels. Negative means the wheel leaves the disc. */
    headroomDb: number;
    /** 20 log10(R / (rho * beta)): the mechanism's intrinsic resolution span. */
    dynamicRangeDb: number;
    /** zeta_eff = zeta - g*omega*tau/2. Null for equations without a zeta. */
    effDamping: number | null;
    /** g * omega: the frequency the machine actually runs at. Null likewise. */
    machineOmega: number | null;
    /** How long one run takes on the real machine, minutes. */
    runtimeMinutes: number;
}


/** Peak carriage demand per integrator, in the represented variable's units. */
function patchPeaks(
    params: Params,
    y0: number,
): { integrands: Record<string, number>; slew: number } {
    const eq = EQUATIONS[params.equation];
    if (eq.peaks) return eq.peaks(params, y0);

    // No closed form: measure the ideal run on the coarse grid.
    const spec = buildPatch(params);
    const run = idealRun(params.equation, params, y0, DT_SWEEP);
    const integrands: Record<string, number> = {};
    let slew = 0;

    for (const int of spec.integrators) {
        let peak = 0;
        let peakSlew = 0;
        const trace = run.trace;
        for (let i = 0; i < trace.length; i++) {
            const c = Math.abs(trace[i].vars[int.carriage] ?? 0);
            peak = Math.max(peak, c);
            if (i > 0) {
                const prev = trace[i - 1].vars[int.carriage] ?? 0;
                const here = trace[i].vars[int.carriage] ?? 0;
                peakSlew = Math.max(peakSlew, Math.abs(here - prev) / DT_SWEEP);
            }
        }
        integrands[int.id] = peak;
        slew = Math.max(slew, int.relScale * peakSlew);
    }

    return { integrands, slew };
}


export function machineSpec(params: Params, y0?: number): MachineSpec {
    const eq = EQUATIONS[params.equation];
    const y = y0 ?? eq.defaultY0;
    const rhoM = params.wheelRadius / 1000;
    const spec = buildPatch(params);

    const peaks = patchPeaks(params, y);

    const frictionLimit = params.friction * params.wheelLoad * rhoM;
    const carriageSlew = params.scaleFactor * peaks.slew;
    const loadTorque = T_STATIC + C_CARRIAGE * carriageSlew;

    const creep = loadTorque / Math.max(params.torqueGain * frictionLimit, 1e-12);
    const grossSlip = creep >= 1;
    const gain = Math.max(0, 1 - creep);

    const lagReal = C_SERVO / params.torqueGain + T_GEAR;
    const lag = Math.min(params.machineSpeed * lagReal, MAX_LAG);

    const linear = eq.linear ?? null;
    const omega = linear ? linear.omega(params) : null;
    const zeta = linear ? linear.zeta(params) : null;

    const lagCritical = linear && omega !== null && zeta !== null
        ? (gain > 0 ? (2 * zeta) / (gain * omega) : Infinity)
        : null;
    const effDamping = linear && omega !== null && zeta !== null
        ? zeta - (gain * omega * lag) / 2
        : null;
    const machineOmega = omega !== null ? gain * omega : null;

    const backlashTurns = params.backlash * TURNS_PER_ARCMIN;
    const penInt = spec.integrators.find(i => i.out === spec.penVar) ?? spec.integrators[0];
    const deadBand = (backlashTurns * params.wheelRadius) / (penInt.relScale * params.scaleFactor);

    // The tightest integrator: peak demand as a multiple of the common k.
    let peakIntegrand = 1e-9;
    for (const int of spec.integrators) {
        peakIntegrand = Math.max(peakIntegrand, int.relScale * (peaks.integrands[int.id] ?? 0));
    }
    const ceiling = params.discRadius / params.scaleFactor;
    const headroomDb = 20 * Math.log10(ceiling / peakIntegrand);

    const resolutionSpan = params.discRadius / (params.wheelRadius * Math.max(backlashTurns, 1e-7));
    const dynamicRangeDb = Math.min(20 * Math.log10(resolutionSpan), 160);

    return {
        frictionLimit,
        loadTorque,
        creep,
        grossSlip,
        gain,
        lagReal,
        lag,
        lagCritical,
        stable: lagCritical === null ? gain > 0 : gain > 0 && lag < lagCritical,
        deadBand,
        ceiling,
        peakIntegrand,
        headroomDb,
        dynamicRangeDb,
        effDamping,
        machineOmega,
        runtimeMinutes: X_END / params.machineSpeed / 60,
    };
}


/* ---------------------------------------------------------------- *
 * Running the machine.
 * ---------------------------------------------------------------- */

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    trace: TracePoint[];
    label: string;
}


export function runMachine(params: Params, y0?: number, dt: number = DT): MachineRun {
    const eq = EQUATIONS[params.equation];
    const y = y0 ?? eq.defaultY0;
    const spec = machineSpec(params, y);
    const patch = buildPatch(params);

    const backlashTurns = params.backlash * TURNS_PER_ARCMIN;
    const deadBands: Record<string, number> = {};
    const scales: Record<string, number> = {};
    for (const int of patch.integrators) {
        const k = int.relScale * params.scaleFactor;
        scales[int.id] = k;
        deadBands[int.out] = (backlashTurns * params.wheelRadius) / k;
    }

    const mech: Mechanism = {
        g: spec.gain,
        lag: spec.lag,
        R: params.discRadius,
        deadBands,
        scales,
    };

    const ideal = idealSeries(params.equation, params, y, dt);
    return runPatch(patch, params, mech, y, dt, (_x, n) => ideal[n] ?? 0);
}


/** The largest distance a wheel is carried from the centre of its disc, mm. */
export function peakWheelOffset(run: MachineRun): number {
    let peak = 0;
    for (const p of run.trace) {
        for (const off of Object.values(p.offsets)) {
            peak = Math.max(peak, Math.abs(off));
        }
    }
    return peak;
}


/**
 * Machine speed at which the loop's effective damping reaches zero, located by
 * bisecting the simulated envelope rate rather than by using the analytic law.
 */
export function findCriticalSpeed(params: Params): number {
    let lo = 0.001;
    let hi = 2.0;
    const growsAt = (s: number) => runMachine({ ...params, machineSpeed: s }, 1, DT_SWEEP).envelopeRate > 0;

    if (growsAt(lo)) return lo;
    if (!growsAt(hi)) return hi;

    for (let i = 0; i < 24; i++) {
        const mid = 0.5 * (lo + hi);
        if (growsAt(mid)) hi = mid;
        else lo = mid;
    }
    return 0.5 * (lo + hi);
}


/* ---------------------------------------------------------------- *
 * Metrics, narrative, sweeps.
 * ---------------------------------------------------------------- */

export type Regime =
    | 'gross slip'
    | 'hunting'
    | 'saturated'
    | 'backlash-limited'
    | 'creep-limited'
    | 'lag-limited';

export interface Metrics {
    equation: EquationKey;
    relError: number;
    usefulDigits: number;
    creepPct: number;
    /** Degrees of phase (or log-amplitude drift) the machine loses per run. */
    phaseDrift: number;
    clipPct: number;
    lag: number;
    lagCritical: number | null;
    effDamping: number | null;
    dynamicRangeDb: number;
    headroomDb: number;
    runtimeMinutes: number;
    period: number;
    envelopeRate: number;
    stable: boolean;
    grossSlip: boolean;
    regime: Regime;
    interpretation: string;
}


/** Which of the four error sources is currently doing the most damage. */
function classify(
    params: Params,
    spec: MachineSpec,
    run: MachineRun,
    idealEnv: number,
): Regime {
    const eq = EQUATIONS[params.equation];

    if (spec.grossSlip) return 'gross slip';

    if (eq.linear) {
        if (!spec.stable || run.envelopeRate > 0) return 'hunting';
    } else if (run.diverged || run.envelopeRate > idealEnv + 0.02) {
        return 'hunting';
    }

    if (run.clipFraction > 0.01) return 'saturated';

    const rate = eq.rateScale(params, run.period);
    const phaseCost = spec.creep * rate * X_END;
    const lagCost = ((spec.gain * rate * spec.lag) / 2) * rate * X_END;
    const backlashCost = spec.deadBand * 20;

    if (backlashCost >= phaseCost && backlashCost >= lagCost) return 'backlash-limited';
    if (lagCost >= phaseCost) return 'lag-limited';
    return 'creep-limited';
}


export function computeMetrics(params: Params, dt: number = DT, precomputedRun?: MachineRun): Metrics {
    const eq = EQUATIONS[params.equation];
    const spec = machineSpec(params);
    const run = precomputedRun ?? runMachine(params, undefined, dt);

    const ideal = idealSeries(params.equation, params, eq.defaultY0, dt);
    const idealEnv = idealEnvelopeRate(ideal, dt);

    const regime = classify(params, spec, run, idealEnv);

    const rate = eq.rateScale(params, run.period);
    const phaseDrift = spec.creep * rate * X_END * (180 / Math.PI);

    const interpretation = {
        'gross slip': 'The contact has broken loose. The machine turns and computes nothing.',
        'hunting': 'The loop lag exceeds the damping it has to spend. The oscillation grows on its own.',
        'saturated': 'A carriage is being held against its stop. The peaks of the solution are being cut off.',
        'backlash-limited': 'Lost motion in the gear trains now costs more than slip does. A better amplifier will not help.',
        'creep-limited': 'Microslip at the friction contact sets the accuracy. More torque amplification buys more digits.',
        'lag-limited': 'The follow-up servos are the bottleneck. Slowing the machine down would buy accuracy.',
    }[regime];

    return {
        equation: params.equation,
        relError: run.relError,
        usefulDigits: run.usefulDigits,
        creepPct: spec.creep * 100,
        phaseDrift,
        clipPct: run.clipFraction * 100,
        lag: spec.lag,
        lagCritical: spec.lagCritical,
        effDamping: spec.effDamping,
        dynamicRangeDb: spec.dynamicRangeDb,
        headroomDb: spec.headroomDb,
        runtimeMinutes: spec.runtimeMinutes,
        period: run.period,
        envelopeRate: run.envelopeRate,
        stable: spec.stable,
        grossSlip: spec.grossSlip,
        regime,
        interpretation,
    };
}


export function computeNarrative(metrics: Metrics, params: Params): string {
    const spec = machineSpec(params);
    const eq = EQUATIONS[params.equation];

    if (metrics.grossSlip) {
        return `The carriage, gears and pen demand ${spec.loadTorque.toFixed(2)} N·m, and the wheel-disc contact can pass only ${(spec.frictionLimit * params.torqueGain).toFixed(2)} N·m. The wheel spins on the disc without gripping it. This is exactly the wall Kelvin hit in 1876, and it is what Nieman’s torque amplifier climbed over.`;
    }

    if (!metrics.stable || metrics.regime === 'hunting') {
        const budget = metrics.lagCritical !== null && Number.isFinite(metrics.lagCritical)
            ? ` The loop can only afford ${metrics.lagCritical.toFixed(3)}.`
            : '';
        const damping = metrics.effDamping !== null
            ? ` Effective damping has gone negative (${metrics.effDamping.toFixed(3)}), so the machine feeds its own oscillation and the pen climbs off the paper.`
            : ' The lag feeds the loop faster than the patch can dissipate it, and the pen climbs off the paper.';
        return `The drive train needs ${spec.lagReal.toFixed(2)} s to follow an order, and at ${params.machineSpeed.toFixed(2)} x-units per second that is a lag of ${metrics.lag.toFixed(3)} x-units.${budget}${damping}`;
    }

    const parts: string[] = [];

    if (metrics.clipPct > 1) {
        parts.push(`The carriage is asking for ±${(spec.peakIntegrand * params.scaleFactor).toFixed(0)} mm on a disc of radius ${params.discRadius} mm, so a wheel rides its stop for ${metrics.clipPct.toFixed(0)}% of the run and the peaks come out flat.`);
    }

    if (params.equation === 'exponential-decay') {
        parts.push(`Each integrator loses ${metrics.creepPct.toFixed(3)}% to microslip. Here that is a rate error: the machine decays at ${(spec.gain * params.lambda).toFixed(4)} instead of ${params.lambda.toFixed(4)}, so the drawn tail is systematically fat.`);
    } else {
        parts.push(`Each integrator loses ${metrics.creepPct.toFixed(3)}% to microslip. That sounds like nothing, but it is a frequency error, and by the end of ${X_END} x-units the pen is ${Math.abs(metrics.phaseDrift).toFixed(1)}° out of phase with the truth.`);
    }

    if (params.equation === 'van-der-pol') {
        parts.push(`The squares in this patch are built by integrators whose discs are geared to y itself, so every product pays the creep twice: the nonlinear terms are softer than the mathematics wants them.`);
    }

    if (params.equation === 'forced-oscillator' && params.trackingError > 0) {
        parts.push(`The forcing arrives through an operator's hand: the cross-hair wanders ${params.trackingError.toFixed(1)}% of the curve's amplitude, and that wander is stirred straight into the answer.`);
    }

    if (eq.linear && metrics.effDamping !== null && params.damping - metrics.effDamping > 0.1 * params.damping) {
        const stolen = ((params.damping - metrics.effDamping) / params.damping) * 100;
        parts.push(`Servo lag has quietly taken ${stolen.toFixed(0)}% of the damping, so the machine’s oscillation dies more slowly than the real one.`);
    }

    parts.push(`Overall the pen is ${(metrics.relError * 100).toFixed(2)}% away from the exact solution: ${metrics.usefulDigits.toFixed(1)} decimal digits of truth, bought with ${metrics.runtimeMinutes.toFixed(0)} minutes of turning.`);

    return parts.join(' ');
}


export type SweepableParam = keyof Omit<Params, 'preset' | 'equation'>;

export interface ParamSpec {
    key: SweepableParam;
    label: string;
    min: number;
    max: number;
    step: number;
    /** Sweep and plot this one on a logarithmic axis. */
    log?: boolean;
    unit?: string;
    /** Restrict to these equations; absent means the spec always applies. */
    appliesTo?: EquationKey[];
}

export const PARAM_SPECS: ParamSpec[] = [
    { key: 'torqueGain', label: 'torque gain', min: 1, max: 100000, step: 1, log: true, unit: '×' },
    { key: 'machineSpeed', label: 'machine speed', min: 0.005, max: 0.6, step: 0.005, unit: ' x/s' },
    { key: 'scaleFactor', label: 'scale factor', min: 10, max: 400, step: 1, unit: ' mm/unit' },
    { key: 'backlash', label: 'backlash', min: 0, max: 120, step: 1, unit: '′' },
    { key: 'discRadius', label: 'disc radius', min: 40, max: 250, step: 1, unit: ' mm' },
    { key: 'wheelRadius', label: 'wheel radius', min: 5, max: 40, step: 1, unit: ' mm' },
    { key: 'friction', label: 'friction', min: 0.05, max: 0.6, step: 0.01 },
    { key: 'wheelLoad', label: 'wheel load', min: 2, max: 60, step: 1, unit: ' N' },
    { key: 'frequency', label: 'frequency', min: 0.5, max: 2.5, step: 0.05, appliesTo: ['damped-oscillator', 'forced-oscillator'] },
    { key: 'damping', label: 'damping', min: 0.005, max: 0.3, step: 0.005, appliesTo: ['damped-oscillator', 'forced-oscillator'] },
    { key: 'lambda', label: 'decay rate', min: 0.05, max: 1.2, step: 0.01, appliesTo: ['exponential-decay'] },
    { key: 'mu', label: 'nonlinearity', min: 0.2, max: 2.5, step: 0.05, appliesTo: ['van-der-pol'] },
    { key: 'amplitude', label: 'forcing amplitude', min: 0.1, max: 1.5, step: 0.05, appliesTo: ['forced-oscillator'] },
    { key: 'forceFrequency', label: 'forcing frequency', min: 0.2, max: 2.5, step: 0.05, appliesTo: ['forced-oscillator'] },
    { key: 'trackingError', label: 'operator error', min: 0, max: 2, step: 0.1, unit: ' %', appliesTo: ['forced-oscillator'] },
];


/** The parameter specs that make sense for the current equation. */
export function activeParamSpecs(params: Params): ParamSpec[] {
    return PARAM_SPECS.filter(s => !s.appliesTo || s.appliesTo.includes(params.equation));
}


export interface SweepDatum {
    sweepValue: number;
    usefulDigits: number;
    creepPct: number;
    clipPct: number;
}

export function computeSweep(params: Params, sweepKey: SweepableParam = 'torqueGain'): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey);
    if (!spec) return [];

    const steps = 41;
    const data: SweepDatum[] = [];

    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const v = spec.log
            ? spec.min * Math.pow(spec.max / spec.min, t)
            : spec.min + (spec.max - spec.min) * t;
        const m = computeMetrics({ ...params, [sweepKey]: v }, DT_SWEEP);
        data.push({
            sweepValue: v,
            usefulDigits: m.usefulDigits,
            creepPct: Math.min(m.creepPct, 100),
            clipPct: m.clipPct,
        });
    }

    return data;
}


export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    return activeParamSpecs(params).map(spec => {
        const atMin = computeMetrics({ ...params, [spec.key]: spec.min }, DT_SWEEP).usefulDigits;
        const atMax = computeMetrics({ ...params, [spec.key]: spec.max }, DT_SWEEP).usefulDigits;
        return {
            label: spec.label,
            low: Math.min(atMin, atMax),
            high: Math.max(atMin, atMax),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}


/* ---------------------------------------------------------------- *
 * The scaling problem: the one decision an operator actually made.
 * ---------------------------------------------------------------- */

export interface ScaleDatum {
    scaleFactor: number;
    usefulDigits: number;
    /** How far the signal sits above the gear train's lost motion, in dB. */
    resolutionDb: number;
    /** How far the signal sits below the rim of the disc, in dB. */
    headroomDb: number;
}

export interface ScaleLandscape {
    points: ScaleDatum[];
    /** The scale factor at which the wheel first reaches the rim. */
    kSaturation: number;
    /** The scale factor that maximises useful digits. */
    kOptimum: number;
    current: number;
}

export function computeScaleLandscape(params: Params): ScaleLandscape {
    const points: ScaleDatum[] = [];
    const steps = 44;
    const kMin = 8;
    const kMax = 500;

    let best = -1;
    let kOptimum = params.scaleFactor;

    for (let i = 0; i < steps; i++) {
        const k = kMin * Math.pow(kMax / kMin, i / (steps - 1));
        const trial = { ...params, scaleFactor: k };
        const spec = machineSpec(trial);
        const digits = computeMetrics(trial, DT_SWEEP).usefulDigits;

        points.push({
            scaleFactor: k,
            usefulDigits: digits,
            resolutionDb: 20 * Math.log10(spec.peakIntegrand / Math.max(spec.deadBand, 1e-9)),
            headroomDb: spec.headroomDb,
        });

        if (digits > best) {
            best = digits;
            kOptimum = k;
        }
    }

    const baseSpec = machineSpec(params);
    return {
        points,
        kSaturation: params.discRadius / baseSpec.peakIntegrand,
        kOptimum,
        current: params.scaleFactor,
    };
}


/** Torque amplifier gains span five decades, so show them the way an engineer would. */
export function formatGain(g: number): string {
    if (g >= 10000) return `${(g / 1000).toFixed(0)}k`;
    if (g >= 1000) return `${(g / 1000).toFixed(1)}k`;
    return g.toFixed(0);
}
