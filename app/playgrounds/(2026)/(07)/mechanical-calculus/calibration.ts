import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    X_END,
    Params,
    MachineRun,
    presetParams,
    machineSpec,
    runMachine,
    idealY,
    findCriticalSpeed,
    peakWheelOffset,
} from './logic';


/**
 * Every `expected` here is either a closed-form root of the machine's own
 * linearised loop, an exact solution of the equation the machine is trying to
 * draw, or the same model called with different arguments to test an invariance.
 * None of them is an external empirical measurement, so this is a reproduction,
 * not a validation: it confirms that the simulated mechanism obeys the
 * mechanics it claims to obey. See CLAUDE.md.
 */
export const calibrationMeta = { kind: 'reproduction' as const };


const BUSH: Params = presetParams('bush-1931');

/** A machine so good that only the mathematics is left. */
const NEAR_PERFECT: Pick<Params, 'torqueGain' | 'backlash' | 'discRadius' | 'machineSpeed'> = {
    torqueGain: 1e9,
    backlash: 0,
    discRadius: 400,
    machineSpeed: 0.0001,
};

function round(value: number, places: number): number {
    const f = Math.pow(10, places);
    return Math.round(value * f) / f;
}

/** Peak |pen| over the last stretch of the run: the settled amplitude. */
function tailAmplitude(run: MachineRun, fraction: number = 0.3): number {
    let peak = 0;
    for (let i = Math.floor(run.trace.length * (1 - fraction)); i < run.trace.length; i++) {
        peak = Math.max(peak, Math.abs(run.trace[i].machine));
    }
    return peak;
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. In the limit of a perfect machine the pen draws the exact solution.
    //    Unbounded torque amplification kills creep, a disc far larger than the
    //    problem needs kills saturation, cut-to-perfection gears kill backlash,
    //    and a crawling drive kills the lag. What is left should be calculus.
    {
        const perfect: Params = {
            ...BUSH,
            torqueGain: 1e9,
            backlash: 0,
            discRadius: 400,
            machineSpeed: 0.0001,
        };
        const run = runMachine(perfect);
        const atSix = run.trace[Math.round(6 / (run.trace[1].x - run.trace[0].x))];

        results.push({
            name: 'perfect machine draws the exact curve',
            description: 'with unbounded torque amplification, no backlash, a disc that never saturates and the drive at a crawl, the pen should trace the analytic solution of the damped oscillator.',
            predicted: round(atSix.machine, 5),
            expected: round(idealY(6, BUSH.frequency, BUSH.damping), 5),
            source: 'exact solution y(x) = exp(-zeta*omega*x) * (cos(wd*x) + (zeta*omega/wd)*sin(wd*x)), evaluated at x = 6',
        });
    }

    // 2. Creep is a frequency error. Both integrators lose the same fraction
    //    kappa of every turn, so the loop gain is g^2 and the machine runs at
    //    g*omega rather than omega. The period should lengthen accordingly.
    {
        const creeping: Params = { ...BUSH, torqueGain: 300, backlash: 0 };
        const spec = machineSpec(creeping);
        const run = runMachine(creeping);
        const analytic = (2 * Math.PI) / ((spec.machineOmega ?? 0) * Math.sqrt(1 - (spec.effDamping ?? 0) ** 2));

        results.push({
            name: 'creep lengthens the period',
            description: 'a weak amplifier lets each integrator slip. The period measured from the machine’s own zero crossings should match the period of a loop whose gain has been reduced to g squared.',
            predicted: round(run.period, 4),
            expected: round(analytic, 4),
            source: 'characteristic root of the linearised loop: omega_machine = g*omega, so T = 2*pi / (g*omega*sqrt(1 - zeta_eff^2))',
        });
    }

    // 3. Servo lag steals damping. The envelope fitted through the machine's own
    //    peaks should decay at exactly the rate the linearised loop predicts.
    {
        const laggy: Params = { ...BUSH, machineSpeed: 0.25, backlash: 0 };
        const spec = machineSpec(laggy);
        const run = runMachine(laggy);

        results.push({
            name: 'lag steals damping',
            description: 'running the drive twenty-five times faster than the MIT machine turns a fixed real-time lag into a large problem-time lag, which eats a third of the damping. The measured envelope should decay that much more slowly.',
            predicted: round(run.envelopeRate, 4),
            expected: round(-(spec.effDamping ?? 0) * (spec.machineOmega ?? 0), 4),
            source: 'zeta_eff = zeta - g*omega*tau/2, so the envelope decays as exp(-zeta_eff * omega_machine * x)',
        });
    }

    // 4. The hunting threshold. Bisecting the simulated envelope rate for the
    //    speed at which it stops decaying should land on the speed at which the
    //    lag has eaten all of the damping.
    {
        const light: Params = { ...BUSH, damping: 0.02, backlash: 0 };
        const spec = machineSpec(light);
        const analytic = (2 * light.damping) / (spec.gain * light.frequency * spec.lagReal);

        results.push({
            name: 'the speed at which the machine hunts',
            description: 'push the drive faster and faster and find, by bisection on the simulated trace, the speed at which the oscillation stops dying and starts growing.',
            predicted: round(findCriticalSpeed(light), 4),
            expected: round(analytic, 4),
            source: 'zeta_eff = 0 when tau = 2*zeta/(g*omega), and tau = S*lag_real, so S* = 2*zeta / (g*omega*lag_real)',
        });
    }

    // 5. The machine computes shaft rotations, not numbers. Halving the scale
    //    factor while doubling the problem's amplitude leaves every wheel, gear
    //    and stop doing exactly what it did before, so the relative error must
    //    not move. This is the invariance the whole practice of scaling rests on.
    {
        const halved: Params = { ...BUSH, scaleFactor: BUSH.scaleFactor / 2 };

        results.push({
            name: 'scaling invariance',
            description: 'double the amplitude of the problem and halve the scale factor. The carriages travel exactly as far as before, the lost motion is the same fraction of the signal, and the load on the wheels is unchanged, so the machine must be exactly as accurate.',
            predicted: round(runMachine(BUSH, 1).relError, 6),
            expected: round(runMachine(halved, 2).relError, 6),
            source: 'invariance of the mechanism under (y0, k) -> (2*y0, k/2): a scale factor is a change of units, not a change of machine',
        });
    }

    // 6. The wheel cannot leave the disc. An over-scaled patch asks the carriage
    //    for more millimetres than the disc has radius, and the stop must hold it
    //    exactly at the rim.
    {
        const overScaled: Params = { ...BUSH, scaleFactor: 150 };

        results.push({
            name: 'the wheel stops at the rim',
            description: 'an over-scaled patch asks for a wheel offset of about 216 mm on a disc of radius 120 mm. However hard the carriage pulls, the furthest the wheel can be carried is the edge of the disc.',
            predicted: round(peakWheelOffset(runMachine(overScaled)), 3),
            expected: 120,
            source: 'mechanical travel limit: the carriage stop is at the disc radius, R = 120 mm',
        });
    }

    // 7. A different patch is a different equation. Rewire the bench into
    //    y' = -lambda*y and a near-perfect machine must draw the exponential:
    //    nothing in the simulator knows this equation, only the patch does.
    {
        const decay: Params = { ...BUSH, ...NEAR_PERFECT, equation: 'exponential-decay', lambda: 0.3 };
        const run = runMachine(decay);
        const dx = run.trace[1].x - run.trace[0].x;
        const at3 = run.trace[Math.round(3 / dx)];

        results.push({
            name: 'a repatched machine draws the exponential',
            description: 'rewire the bench into the one-integrator decay patch. With a near-perfect mechanism the pen must trace exp(-lambda*x), although the stepper contains no decay equation, only the wiring.',
            predicted: round(at3.machine, 5),
            expected: round(Math.exp(-0.3 * 3), 5),
            source: 'exact solution y(x) = exp(-lambda*x) of the equation the patch is wired into, evaluated at x = 3',
        });
    }

    // 8. The forced patch obeys the forced oscillator's resonance law. Heavy
    //    damping kills the transient inside the run; the settled amplitude of
    //    the pen must match the standard steady-state formula.
    {
        const om = 1.2;
        const ze = 0.25;
        const A = 0.5;
        const Om = 0.7;
        const forced: Params = {
            ...BUSH, ...NEAR_PERFECT,
            equation: 'forced-oscillator',
            frequency: om, damping: ze,
            amplitude: A, forceFrequency: Om, trackingError: 0,
        };
        const run = runMachine(forced);

        results.push({
            name: 'the forced patch finds the resonance law',
            description: 'wire the input table into the loop and force it at Omega. Once the transient dies, the settled amplitude of the pen must match A over the square root of (omega^2 - Omega^2)^2 + (2*zeta*omega*Omega)^2.',
            predicted: round(tailAmplitude(run), 4),
            expected: round(A / Math.sqrt((om * om - Om * Om) ** 2 + (2 * ze * om * Om) ** 2), 4),
            source: 'steady-state amplitude of the driven damped oscillator, transient removed by zeta = 0.25',
            tolerance: 0.02,
        });
    }

    // 9. The van der Pol patch has an attractor, and the machine must forget
    //    where it started. Two runs from wildly different initial wheel
    //    positions must settle onto the same limit cycle.
    {
        const vdp: Params = { ...BUSH, ...NEAR_PERFECT, equation: 'van-der-pol', mu: 1.0 };

        results.push({
            name: 'the limit cycle forgets its initial condition',
            description: 'the van der Pol patch builds its squares by parts, with two integrators riding discs geared to y itself. Started from y0 = 0.5 and from y0 = 3.0, the settled amplitude must be the same: the attractor belongs to the wiring, not to the starting position.',
            predicted: round(tailAmplitude(runMachine(vdp, 0.5)), 3),
            expected: round(tailAmplitude(runMachine(vdp, 3.0)), 3),
            source: 'invariance of the settled cycle under the initial condition: same model, different starting wheel positions',
        });
    }

    return results;
}


/** The independent variable each calibration case runs over. */
export const calibrationSpan = X_END;
