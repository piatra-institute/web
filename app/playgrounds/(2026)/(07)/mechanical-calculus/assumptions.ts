import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'wheel-disc-kinematics',
        statement: 'A wheel of radius rho riding at offset r on a disc turning through angle Theta rotates by (1/rho) * integral(r dTheta), so a carriage positioned at r = k*V makes the output shaft accumulate the integral of V.',
        citation: 'J. Thomson, 1876, "On an integrating machine having a new kinematic principle", Proc. Royal Society; Bush, 1931, "The differential analyzer", J. Franklin Institute',
        confidence: 'established',
        falsifiability: 'A disc-and-wheel integrator whose output rotation is not proportional to the radial offset of the wheel under pure rolling.',
    },
    {
        id: 'linear-creep',
        statement: 'Below the friction limit the contact transmits torque by microslip, and the lost rotation is proportional to the transmitted torque as a fraction of that limit: kappa = T / (mu*N*rho). At kappa = 1 the contact breaks into gross slip and transmits nothing.',
        citation: 'Carter, 1926, "On the action of a locomotive driving wheel"; Kalker, 1967, rolling contact creep theory. The linear proportionality is the leading term of that theory; the constant is taken as unity.',
        confidence: 'contested',
        falsifiability: 'Measure the creep of a loaded disc-and-wheel integrator against transmitted torque. A creep curve that is flat, or strongly nonlinear, below gross slip would falsify the linearisation.',
    },
    {
        id: 'torque-amplifier',
        statement: 'The torque amplifier is modeled as an ideal multiplier: it lets the wheel command a torque G times larger than the friction contact could deliver, at the price of a follow-up lag that shrinks as 1/G.',
        citation: 'Nieman, 1927, capstan torque amplifier; Hazen, Bush et al., 1931, on cascading integrators through torque amplification',
        confidence: 'contested',
        falsifiability: 'A capstan amplifier whose output torque is not proportional to its input over the working range, or whose stiction and hysteresis dominate its follow-up lag rather than its gain.',
    },
    {
        id: 'lumped-lag',
        statement: 'The whole drive train (torque amplifier, gears, shafts, carriage servos) is lumped into a single follow-up lag, and that lag is applied to first order: the value reaching a carriage is y - tau*g*v.',
        citation: 'Standard lumped-lag linearisation in servomechanism analysis; Hazen, 1934, "Theory of servo-mechanisms", J. Franklin Institute',
        confidence: 'contested',
        falsifiability: 'A drive train whose torsional resonance falls inside the loop bandwidth would need a second-order transmission model; a pure first-order lag would then mispredict the onset of hunting.',
    },
    {
        id: 'backlash-lost-motion',
        statement: 'Gear-train backlash is modeled as a single symmetric dead band per transmission: on every reversal, the first beta of shaft rotation is swallowed before the far side begins to move.',
        citation: 'Classical play model used in mechanism and servo analysis, e.g. Tustin, 1947, on nonlinear elements in control systems',
        confidence: 'contested',
        falsifiability: 'Backlash distributed across many meshes with differing ratios does not act as one lumped dead band; a measured lost-motion curve with hysteresis loops of unequal width would falsify this.',
    },
    {
        id: 'time-scaling',
        statement: 'Machine time and problem time differ only by the drive speed S, so a lag of L real seconds is a lag of S*L units of the independent variable. Running the machine faster therefore makes every dynamic error worse in the problem’s own terms.',
        citation: 'Kinematic consequence of driving the independent-variable shaft at a constant rate; Bush, 1931, on the choice of machine speed',
        confidence: 'established',
        falsifiability: 'A drive whose lags scale with the machine speed rather than being fixed in real time; the conversion would then not apply.',
    },
    {
        id: 'constant-drive',
        statement: 'The independent variable advances at a perfectly constant rate. The flywheel is assumed to remove all speed ripple from the drive.',
        citation: 'Bush, 1931: the main drive carried a heavy flywheel precisely to regulate the independent-variable shaft',
        confidence: 'established',
        falsifiability: 'Speed ripple of the same order as the machine’s accuracy would inject an error this model does not carry; a tachometer trace of a surviving machine showing percent-level ripple would falsify it.',
    },
    {
        id: 'hard-saturation',
        statement: 'The carriage stops at the rim: the wheel offset is clipped at |k*V| <= R, and the integrator continues to run on the clipped value rather than failing outright.',
        citation: 'Mechanical travel limit of the carriage; standard hard-saturation model',
        confidence: 'established',
        falsifiability: 'A real carriage driven past its stop would jam, derail the wheel, or stall the drive rather than integrate a clipped value; this model is optimistic about what happens at the rim.',
    },
    {
        id: 'single-scale-factor',
        statement: 'Both integrators share one scale factor k. A real operator would scale each integrator separately, so this model overstates how tight the scaling problem is when the acceleration and the velocity differ greatly in magnitude.',
        citation: 'Simplification. Bush, 1931 and Hartree, 1935 both describe scaling each integrator independently as a central part of setting up a problem.',
        confidence: 'contested',
        falsifiability: 'Rescaling the two integrators independently removes the saturation cliff seen here whenever omega is far from 1, which this model attributes to the machine rather than to the choice of scaling.',
    },
    {
        id: 'neglected-errors',
        statement: 'Disc runout, wheel wear, thermal expansion, shaft windup under load, paper stretch, and the operator’s hand on the input table are all neglected. Only creep, backlash, lag and saturation are modeled.',
        citation: 'Error sources catalogued in Bush, 1931 and Hartree, 1935 but not carried here',
        confidence: 'contested',
        falsifiability: 'An error budget of a surviving machine in which the neglected terms dominate the four modeled ones would make this model’s accuracy predictions optimistic in the wrong places.',
    },
    {
        id: 'homogeneous-equation',
        statement: 'The equation being solved is homogeneous, so no function is traced by hand on the input table. Introducing a forcing term would add the operator’s curve-following error, historically of order half a percent of full scale.',
        citation: 'Bush, 1931 describes the input table and its operator; the tracing error is the machine’s one irreducibly human term',
        confidence: 'established',
        falsifiability: 'Any forced problem run on this model would underestimate the total error by omitting the tracing term.',
    },
    {
        id: 'accuracy-target',
        statement: 'Quoted accuracies for the MIT machine of a few parts in a thousand are used here only as a sanity target, never as a constraint the model is fitted to. Nothing in this model is tuned to reproduce a historical accuracy figure.',
        citation: 'Accuracy figures vary across Bush, 1931; Owens, 1986; and museum accounts, and refer to individual integrators rather than to the pointwise accuracy of a long oscillatory run.',
        confidence: 'speculative',
        falsifiability: 'A measured error budget of a restored differential analyzer, integrator by integrator, would replace this soft target with a real one and could show the model is off by an order of magnitude.',
    },
];
