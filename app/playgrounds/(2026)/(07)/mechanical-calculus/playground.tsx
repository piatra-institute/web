'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Button from '@/components/Button';
import Equation from '@/components/Equation';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Params,
    Snapshot,
    SweepableParam,
    presetParams,
    buildPatch,
    activeParamSpecs,
    machineSpec,
    runMachine,
    computeMetrics,
    computeNarrative,
    computeSweep,
    computeSensitivity,
    computeScaleLandscape,
    ANIMATION_TOTAL_FRAMES,
    X_END,
} from './logic';
import { assumptions } from './assumptions';
import { buildCalibration } from './calibration';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function MechanicalCalculusPlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(() => presetParams('bush-1931'));
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [sweepParam, setSweepParam] = useState<SweepableParam>('torqueGain');

    const [running, setRunning] = useState(true);
    const [animTime, setAnimTime] = useState(0);
    const frameRef = useRef<number | null>(null);

    const patch = useMemo(() => buildPatch(params), [params]);
    const spec = useMemo(() => machineSpec(params), [params]);
    const run = useMemo(() => runMachine(params), [params]);
    const metrics = useMemo(() => computeMetrics(params, undefined, run), [params, run]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);
    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);
    const landscape = useMemo(() => computeScaleLandscape(params), [params]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);
    const calibrationResults = useMemo(() => buildCalibration(), []);

    // A sweep parameter can stop applying when the equation changes.
    useEffect(() => {
        if (!activeParamSpecs(params).some(s => s.key === sweepParam)) {
            setSweepParam('torqueGain');
        }
    }, [params, sweepParam]);

    const animIndex = Math.round(animTime * (run.trace.length - 1));

    // Change anything about the machine and it starts a fresh run, the way it
    // would if you rebuilt the patch and threw the drive back in.
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setAnimTime(0);
        setRunning(true);
    }, [params]);

    useEffect(() => {
        if (!running) {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
            return;
        }

        const step = () => {
            setAnimTime(prev => {
                const next = prev + 1 / ANIMATION_TOTAL_FRAMES;
                if (next >= 1) {
                    setRunning(false);
                    return 1;
                }
                return next;
            });
            frameRef.current = requestAnimationFrame(step);
        };

        frameRef.current = requestAnimationFrame(step);

        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
        };
    }, [running]);

    const saveSnapshot = useCallback(() => {
        setSnapshot({ params, metrics, trace: run.trace, label: params.preset });
    }, [params, metrics, run.trace]);

    const clearSnapshot = useCallback(() => setSnapshot(null), []);

    const toggleRun = useCallback(() => {
        if (animTime >= 1) {
            setAnimTime(0);
            setRunning(true);
        } else {
            setRunning(r => !r);
        }
    }, [animTime]);

    const controls = (
        <div className="flex items-center gap-4 flex-wrap justify-center">
            <Button
                label={running ? 'stop the drive' : animTime >= 1 ? 'run it again' : 'engage the drive'}
                onClick={toggleRun}
                size="xs"
            />
            <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={animTime}
                onChange={e => {
                    setRunning(false);
                    setAnimTime(parseFloat(e.target.value));
                }}
                className="w-48 h-1 accent-lime-500 cursor-pointer"
                aria-label="position of the independent variable"
            />
            <span className="text-xs font-mono text-lime-200/60">
                x = {(animTime * X_END).toFixed(1)} / {X_END}
            </span>
        </div>
    );

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer controls={controls}>
                    <Viewer
                        patch={patch}
                        trace={run.trace}
                        animIndex={animIndex}
                        params={params}
                        spec={spec}
                        metrics={metrics}
                        sweep={sweep}
                        landscape={landscape}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        calibrationResults={calibrationResults}
                        versions={versions}
                        snapshot={snapshot}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
                        running={running}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro',
            content: (
                <div className="space-y-8 text-gray-300">
                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The equation becomes a machine</h3>
                        <p className="leading-relaxed text-sm">
                            A digital computer simulates a differential equation: it advances a number,
                            step by step, according to a rule. Vannevar Bush&rsquo;s analyzer did something
                            else. It was assembled into a physical system whose motion obeys the equation,
                            and then it was simply switched on. The historian Larry Owens put it best: its
                            parts did not calculate the equation, they kinetically acted it out.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-4">
                            <p className="text-lime-200/80 mb-2">
                                To solve a system, build another system with the same dynamics.
                            </p>
                        </div>
                        <p className="leading-relaxed text-sm mt-4">
                            That is a beautiful idea, and it comes with a bill. If your computer is a
                            physical object, then its errors are physical too. You cannot ask for another
                            decimal place; you have to buy it, with friction, with torque, with machining
                            tolerance, and with time. This playground is that bill, itemised.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">One wheel on one disc</h3>
                        <p className="leading-relaxed text-sm">
                            Everything rests on a mechanism James Thomson described in 1876. A disc turns
                            through an angle <Equation math="\Theta" />. A small wheel rests on its face at
                            a distance <Equation math="r" /> from the centre. Because the disc&rsquo;s surface
                            moves faster the further out you go, the wheel accumulates:
                        </p>
                        <Equation mode="block" math="\theta_{\text{wheel}} = \frac{1}{\rho}\int r \, d\Theta" />
                        <p className="leading-relaxed text-sm mt-2">
                            Put a carriage on the disc that holds the wheel at{' '}
                            <Equation math="r = k\,V" />, drive the disc with the independent variable, and
                            the wheel&rsquo;s output shaft comes out carrying{' '}
                            <Equation math="\int V\,dx" />. That is a mechanical integral. Wire the output of
                            one integrator into the carriage of another, feed the last one back to the first,
                            and you have an oscillator that solves{' '}
                            <Equation math="y'' + 2\zeta\omega y' + \omega^2 y = 0" /> by moving.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why Kelvin&rsquo;s machine stayed on paper</h3>
                        <p className="leading-relaxed text-sm">
                            Lord Kelvin saw all of this in 1876 and wrote down how interconnected integrators
                            could solve differential equations. Nobody built one for fifty-five years, and the
                            reason is a single number. A friction wheel can only transmit as much torque as
                            the contact can hold:
                        </p>
                        <Equation mode="block" math="T_{\max} = \mu N \rho" />
                        <p className="leading-relaxed text-sm mt-2">
                            which is a fraction of a newton-metre. Meanwhile the next integrator&rsquo;s
                            carriage, the gear train and the pen want several times that. So the wheel does
                            not drive them. It slips. Run the <em>Kelvin, 1876</em> preset and watch: the
                            discs turn, the shafts turn, the drive hums, and the pen draws a perfectly
                            straight line. The machine is computing nothing at all.
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            What Bush, Hazen and C. W. Nieman added in 1931 was the torque amplifier: a pair
                            of counter-rotating capstans that let the wheel&rsquo;s feeble signal command a
                            powerful output without supplying the power itself. It multiplies the available
                            torque by <Equation math="G" />, and the slip that remains is
                        </p>
                        <Equation mode="block" math="\kappa = \frac{T_{\text{load}}}{G\,\mu N \rho}" />
                        <p className="leading-relaxed text-sm mt-2">
                            The whole machine hangs on driving that one number below one.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">A tenth of a percent is not a small number</h3>
                        <p className="leading-relaxed text-sm">
                            Suppose you win. With a good amplifier the creep is tiny, a hundredth of a
                            percent. But creep is not noise sprinkled on the answer; it is a systematic loss
                            on every turn of every wheel, and both integrators suffer it. The loop gain falls
                            to <Equation math="g^2" />, and the machine simply runs at the wrong frequency:
                        </p>
                        <Equation mode="block" math="\omega_{\text{machine}} = (1-\kappa)\,\omega" />
                        <p className="leading-relaxed text-sm mt-2">
                            A wrong frequency is a phase error that grows without bound. The pen starts on
                            top of the true curve and drifts steadily out of step with it, and because a
                            sinusoid is brutally sensitive to phase, a drift of one degree is already a
                            percent of pointwise error. Watch the error-accumulation panel: the gap does not
                            settle, it ratchets. This is the deep reason analog machines were used for short
                            transients and not long integrations, and it is what nobody means when they quote
                            an analyzer&rsquo;s accuracy as a single number.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Why it had to run slowly</h3>
                        <p className="leading-relaxed text-sm">
                            A run of the MIT machine took the better part of an hour. That was not because
                            the mechanism was weak. It is because the follow-up servos need real time,
                            perhaps a tenth of a second, to obey an order. Turning the independent variable
                            at <Equation math="S" /> units per second converts that fixed real-time lag into
                            a lag measured in the problem&rsquo;s own variable:
                        </p>
                        <Equation mode="block" math="\tau = S \cdot L_{\text{real}}" />
                        <p className="leading-relaxed text-sm mt-2">
                            and inside a feedback loop a lag is not a delay, it is negative damping. To first
                            order the loop&rsquo;s damping becomes
                        </p>
                        <Equation mode="block" math="\zeta_{\text{eff}} = \zeta - \frac{g\,\omega\,\tau}{2}" />
                        <p className="leading-relaxed text-sm mt-2">
                            so once <Equation math="\tau > 2\zeta / (g\omega)" /> the machine has spent all
                            the damping it had, and it starts feeding its own oscillation. Run{' '}
                            <em>run it fast</em>: the same machine that was correct to two digits at a crawl
                            now climbs off the paper. Hurrying an analog computer does not make it wrong at
                            the margins. It makes it unstable.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The scaling problem</h3>
                        <p className="leading-relaxed text-sm">
                            Before a single shaft turned, an operator spent hours choosing scale factors. It
                            is the only real decision the machine offers, and it is squeezed from both sides.
                            The gear trains have lost motion, so a variable smaller than the dead band simply
                            never arrives. The disc has an edge, so a variable larger than the rim is clipped
                            flat. Every variable has to live in between:
                        </p>
                        <Equation mode="block" math="\frac{\beta\rho}{k} \;\ll\; |V| \;\le\; \frac{R}{k}" />
                        <p className="leading-relaxed text-sm mt-2">
                            Notice that <Equation math="k" /> appears on both sides. Turning it up buys
                            resolution and spends headroom; turning it down does the reverse. The window
                            between the two walls is the machine&rsquo;s dynamic range, and it is a property
                            of the metal:{' '}
                            <Equation math="20\log_{10}\!\left(R / \rho\beta\right)" /> decibels, fixed the
                            day the gears were cut. Scaling does not widen that window. It only decides where
                            in the window your problem sits.
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            The scaling panel draws that window directly. There is a plateau, a cliff where
                            the wheel runs off the disc, and a slow decline into the lost motion. Choosing
                            <em> k</em> was choosing a spot on that curve with a slide rule and no way to check
                            your work until the pen had been moving for half an hour.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The equation is the wiring</h3>
                        <p className="leading-relaxed text-sm">
                            The simulator here contains no differential equation. Its state is the
                            accumulated rotation of each integrator wheel, and its update rule is the
                            kinematics of a wheel on a disc, a differential gear, a gear train with lost
                            motion, and a servo with lag. The equation lives entirely in the patch: which
                            shaft turns each disc, which shaft each carriage is screwed to, and which
                            change-gear ratios feed the adders. Choose a different equation in the settings
                            and you are not selecting a different formula; you are rewiring the bench.
                        </p>
                        <div className="border-l-2 border-lime-500/40 pl-4 mt-4">
                            <p className="text-lime-200/80 mb-2">
                                The patch is the program. The stepper only knows how metal moves.
                            </p>
                        </div>
                        <p className="leading-relaxed text-sm mt-4">
                            Four setup sheets ship. The damped oscillator is the classic two-integrator
                            loop. The exponential decay is the smallest possible program: one integrator and
                            one sign-reversing gear, closed on itself. The forced oscillator wires the input
                            table into the adder, and with it the operator&rsquo;s hand: the cross-hair
                            wanders a fraction of a percent off the forcing curve, and that wander is stirred
                            into the answer. The van der Pol equation is the machine at full stretch: its
                            squares are built by integrators whose discs are geared to{' '}
                            <Equation math="y" /> itself, since{' '}
                            <Equation math="\textstyle\int y\,dy = y^2/2" />, so the products are integrals
                            too. Multiplication by parts costs two more integrators and pays the creep budget
                            twice, which is why the calibration panel checks that the limit cycle still
                            forgets its initial condition.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What this model leaves out</h3>
                        <p className="leading-relaxed text-sm">
                            Four error sources are modeled: microslip, backlash, follow-up lag, and
                            saturation, plus the operator&rsquo;s tracking error when a patch uses the input
                            table. A real machine also has disc runout, wheel wear, shafts that wind up
                            under load, paper that stretches, and temperature. Each integrator runs at a
                            fixed multiple of one common scale factor, written into the setup sheet; the
                            hours an operator spent deriving those multiples are assumed already spent, and
                            re-scaling mid-run is not represented. The lag is lumped into a single
                            first-order term rather than the second-order transmission it really was.
                        </p>
                        <p className="leading-relaxed text-sm mt-2">
                            None of the constants are fitted to a historical accuracy figure. The calibration
                            panel checks the simulated mechanism against the mechanics it claims to obey: the
                            exact solution of the equation it is drawing, the characteristic roots of its own
                            loop, the travel limit of a carriage, and the invariance that makes a scale factor
                            a change of units rather than a change of machine.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Model changelog</h3>
                        <ModelChangelog entries={changelog} />
                    </div>

                    {sourceContext && (
                        <div className="border-t border-lime-500/20 pt-8">
                            <ResearchPromptButton context={sourceContext} />
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <PlaygroundLayout
            title="mechanical calculus"
            subtitle="the error budget of a machine that computes by moving"
            description={
                <a
                    href="https://worrydream.com/refs/Bush_1931_-_The_Differential_Analyzer.pdf"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    1931, Vannevar Bush, The Differential Analyzer: A New Machine for Solving Differential Equations
                </a>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                    snapshot={snapshot}
                    onSaveSnapshot={saveSnapshot}
                    onClearSnapshot={clearSnapshot}
                />
            }
            researchUrl="/playgrounds/mechanical-calculus/research"
        />
    );
}
