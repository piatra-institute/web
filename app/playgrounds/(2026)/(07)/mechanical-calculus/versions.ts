import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude fable 5',
        date: 'July 2026',
        description: 'initial implementation',
    },
];


export const changelog: ChangelogEntry[] = [
    {
        version: 'v2',
        date: 'July 2026',
        changes: [
            'The equation now lives only in the patch: the simulator integrates wheel-on-disc kinematics, adders and gear ratios, and the differential equation emerges from the wiring rather than being hard-coded in the stepper',
            'Four setup sheets: damped oscillator (unchanged behaviour, verified against the previous model to the last digit), exponential decay (one integrator, one change gear), forced oscillator (live input table), van der Pol in Lienard form (squares built by parts on discs geared to y)',
            'Operator tracking error as a fifth error source: a deterministic quasi-periodic wobble of the input-table cross-hair, a set fraction of the forcing amplitude',
            'Per-integrator scale factors as fixed multiples of the common k, written into each setup sheet the way an operator would have derived them',
            'Loop lag is now a property of one marked feedback edge per loop, matching the lumped-lag assumption instead of being applied globally',
            'Three new calibration cases: a repatched machine must draw the exponential, the forced patch must find the resonance law, and the van der Pol limit cycle must forget its initial condition',
        ],
    },
    {
        version: 'v1.1',
        date: 'July 2026',
        changes: [
            'Kinematically consistent 3D machine: every rotation is an absolute function of the simulated trace, so discs turn with x, wheels and shafts turn with the integrals they carry, shafts reverse when their variable does, and scrubbing the timeline cranks the whole drivetrain backwards',
            'Full mechanical chain modeled: motor and reduction gears, countershafts under both benches with bevel takeoffs to every disc spindle, spline output shafts, capstan torque amplifiers, differential-gear adder with change-gear clusters for the equation constants, lead screws on both carriages, and two lead screws on the plotting table',
            'Failure modes now visible in the metal: gross slip leaves the wheel standing on a turning disc, saturation parks the carriage against the rim while the shaft bank keeps turning, hunting drives the pen off the paper',
        ],
    },
    {
        version: 'v1',
        date: 'July 2026',
        changes: [
            'Wheel-and-disc integrator kinematics with an explicit scale factor: one turn of an output shaft is worth rho/k units of the integral',
            'Four mechanical error sources: microslip at the friction contact, lost motion in the gear trains, follow-up lag in the drive, and hard saturation at the rim of the disc',
            'Gross-slip threshold at kappa = 1, the wall that kept Kelvin’s 1876 proposal on paper until the torque amplifier',
            'Hunting threshold at tau = 2*zeta/(g*omega): the lag eats the damping and the machine feeds its own oscillation',
            'Scale-factor landscape showing the backlash floor and the saturation cliff that squeeze the one decision an operator actually made',
            'RK4 integration of the loop so that numerical error stays three orders of magnitude below the mechanical error under study',
        ],
    },
];
