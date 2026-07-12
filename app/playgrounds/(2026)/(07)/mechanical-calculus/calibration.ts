import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    X_END,
    Params,
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

function round(value: number, places: number): number {
    const f = Math.pow(10, places);
    return Math.round(value * f) / f;
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
        const analytic = (2 * Math.PI) / (spec.machineOmega * Math.sqrt(1 - spec.effDamping ** 2));

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
            expected: round(-spec.effDamping * spec.machineOmega, 4),
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

    return results;
}


/** The independent variable each calibration case runs over. */
export const calibrationSpan = X_END;
