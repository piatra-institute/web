# Mechanical Calculus

## Overview

There is a photograph, taken at MIT some time around 1931, of a machine that fills a room. Two long benches face each other across a floor of bare boards. Between them run banks of steel shafts, eighteen of them, threaded through bearing blocks like the driveshafts of some impossible car. Six polished discs lie flat on the benches with small wheels resting on their faces. At one end there is a motor and a flywheel. At the other there is a drawing table with a pen.

This is Vannevar Bush's differential analyzer, and the thing worth understanding about it is not that it was a primitive computer. It is that it was not a computer at all, in the sense we now mean. It did not represent numbers and manipulate them according to rules. It was *assembled into a physical system that obeyed the equation you wanted solved*, and then it was switched on. The historian Larry Owens found exactly the right verb: the machine's components did not calculate the differential equation, they kinetically acted it out.

That inversion is the whole idea, and the playground is built to make you feel its consequences. Because if your computer is a physical object, then its errors are physical too. There is no floating-point precision to increase. There is friction, torque, backlash, thermal drift, and the finite radius of a disc. Every decimal digit the machine gives you has to be bought, and the currency is metal.

The playground models four of the things you have to pay for, and each one turns out to be a wall you can walk into.

## Historical context

The story starts, as many stories in nineteenth-century physics do, with a Thomson. In 1876 James Thomson described a mechanical integrator working on a new kinematic principle: a wheel resting on a rotating disc. His brother, William Thomson, who would become Lord Kelvin, immediately saw what it was good for. If the output of one integrator could be fed into the input of another, and the last fed back to the first, then a chain of these devices would satisfy a differential equation the way a planet satisfies Newton's laws: automatically, by being what it is.

Kelvin wrote this down. He did not build it. And the reason he did not build it is the most instructive fact in the whole history of analog computation.

A wheel pressed against a disc transmits torque by friction, and friction has a limit. Push the wheel harder than the contact can hold and it stops rolling and starts sliding, and the integral it was computing quietly becomes fiction. The most a disc-and-wheel integrator can deliver is roughly the coefficient of friction times the load on the wheel times the wheel's radius, which comes to a fraction of a newton-metre: enough to turn a needle, nowhere near enough to shove the carriage of a second integrator across its disc against its own bearings and gears. Kelvin's chain of integrators could not hold hands. Each one was too weak to drive the next.

This was not a detail. It kept the machine on paper for fifty-five years.

What broke the deadlock was a piece of engineering from a completely different world. C. W. Nieman, working at Bethlehem Steel, had built a torque amplifier: a pair of counter-rotating capstan drums, with a light cord wrapped around them, so that a feeble twist on the input band tightens the cord against a drum that is already being driven by a motor. The output is powerful; the input needs almost no force at all. It is, in every meaningful sense, an amplifier, built twenty years before the word became electronic. Harold Hazen, working with Bush at MIT, recognised that this was exactly the missing piece. Hang a torque amplifier on the output of every integrator wheel and the wheels no longer have to drive anything. They only have to *decide*.

With that, between roughly 1928 and 1931, Bush, Hazen and their colleagues built a machine with six integrators, eighteen interconnection shafts, input tables where an operator traced a drawn curve by hand, and output tables where a pen drew the answer. Bush published it in the *Journal of the Franklin Institute* in 1931.

It spread. Douglas Hartree came to MIT, saw the machine, and went home to Manchester determined to have one; before committing to the expense he and his student Arthur Porter built a working model out of Meccano, the children's construction set, and published it in 1935. It was sloppy, and it worked. Differential analyzers went on to compute power transmission networks, cosmic ray trajectories, seismic profiles, and, at Aberdeen Proving Ground and the Moore School, artillery firing tables. It was the slowness of the analyzers at that last task that helped motivate the machine that replaced them all, ENIAC.

## The science

Strip away the room and the machine is one mechanism repeated.

A disc turns through an angle. A wheel of radius rho rests on its face at a distance r from the centre. The disc's surface moves faster the further out you sit, so the wheel's rotation accumulates the product of the offset and the disc's turning:

    theta_wheel = (1 / rho) * integral( r dTheta )

Now drive the disc with the independent variable, and put the wheel on a carriage that holds it at `r = k * V`, where V is some other variable in the problem and `k` is a scale factor in millimetres per unit. The output shaft comes out carrying the integral of V. That is calculus, done by a wheel.

The playground wires two of them into the classic patch for a damped oscillator. Integrator 1's carriage is positioned by the acceleration; its shaft delivers the velocity. Integrator 2's carriage is positioned by that velocity; its shaft delivers the displacement, which drives the pen and is fed back to integrator 1. The loop is the equation.

Then the mechanism starts lying to you, in four distinct ways.

**Microslip.** Below the friction limit the contact does not grip perfectly; it creeps, losing a fraction of every turn roughly proportional to how hard it is being asked to work:

    kappa = T_load / (G * mu * N * rho)

where G is the torque amplifier's gain. Past `kappa = 1` the contact breaks loose entirely and transmits nothing. That is Kelvin's wall, and you can walk into it in the playground by setting the gain to 1: the discs spin, the shafts spin, and the pen draws a perfectly straight line. The machine is running and computing nothing.

**Creep becomes phase.** Suppose you win, and the creep is a hundredth of a percent. It is still a *systematic* loss on every turn of both wheels, so the loop gain falls and the machine simply runs at the wrong frequency, `omega * (1 - kappa)`. A wrong frequency is a phase error that grows without bound, and a sinusoid is unforgiving about phase: one degree of drift is already about a percent of pointwise error. This is why quoting an analyzer's accuracy as a single number is close to meaningless. The integrators can be good to a part in ten thousand and the answer, six cycles later, can still be wrong in the second digit.

**Lag becomes negative damping.** The follow-up servos need real time, a fraction of a second, to obey an order. Turn the independent variable at S units per real second and that fixed real-time lag becomes a lag in the problem's own variable, `tau = S * L`. Inside a feedback loop a lag is not a delay, it is negative damping:

    zeta_eff = zeta - g * omega * tau / 2

Once the lag has eaten all the damping the machine begins to feed its own oscillation, and the pen climbs off the paper. This is the real reason a run of the MIT machine took the better part of an hour. Analog computers had to be run slowly, and hurrying one does not make it slightly wrong. It makes it unstable.

**The rim.** Finally, the wheel cannot leave the disc. The scale factor is squeezed between two walls: the gear trains have lost motion, so a variable smaller than the dead band never arrives at all, and the disc has an edge, so a variable larger than the rim is simply clipped flat. Both walls move with `k`:

    (beta * rho / k)  <<  |V|  <=  (R / k)

Turn the scale factor up and you buy resolution and spend headroom. Turn it down and you do the reverse. The width of the window between the walls is not up to you at all: it is `20 * log10(R / (rho * beta))` decibels, fixed on the day the gears were cut. Scaling does not widen the window. It only decides where in the window your problem sits. Choosing well was hours of slide-rule arithmetic before a single shaft turned, and if you got it wrong you found out half an hour into the run.

## Key figures and papers

**James Thomson (1876)** described the disc-and-wheel integrator. His brother saw what it meant.

**William Thomson, Lord Kelvin (1876)** showed that interconnected integrators could in principle solve differential equations, and could not make it work in practice. His failure is the most useful thing in the story, because it locates the difficulty precisely: not in the mathematics, but in the torque.

**C. W. Nieman (1927)** built the capstan torque amplifier at Bethlehem Steel, for reasons having nothing to do with computing.

**Harold Hazen** connected the two, and went on to write *Theory of Servo-Mechanisms* (1934), one of the founding documents of control theory. It is not a coincidence that the man who made the differential analyzer stable also wrote down the general theory of when feedback loops fall over.

**Vannevar Bush (1931)**, *The Differential Analyzer: A New Machine for Solving Differential Equations*, Journal of the Franklin Institute. Bush acknowledged after the fact that the finished machine embodied Kelvin's principle, which he had not known about while building it.

**Douglas Hartree and Arthur Porter (1935)** built one out of Meccano and published the fact, which is both charming and a serious result: it established how much of the machine's accuracy came from precision and how much from principle.

**Larry Owens (1986)**, *Vannevar Bush and the Differential Analyzer: The Text and Context of an Early Computer*, Technology and Culture. The best account of what the machine meant to the people who used it, and the source of the observation that its parts acted the equation out rather than calculating it.

## What the playground simplifies

A great deal, and it is worth being blunt about it.

**Only four error sources are modeled.** Real machines also suffered disc runout, wheel wear, shafts that wound up under load, paper that stretched, temperature, and an operator with a hand on the input table. The playground solves a homogeneous equation precisely so that the input table is idle and the human term drops out; a forced problem would have added a curve-following error of roughly half a percent of full scale, which for some problems would have swamped everything modeled here.

**Both integrators share one scale factor.** A real operator would have scaled each integrator separately, and it was a large part of the job. The single shared scale factor makes the saturation cliff sharper than it needed to be in 1931, particularly when the frequency is far from unity and the acceleration and the velocity differ greatly in magnitude. The playground therefore blames the machine for something that was partly a matter of how well you programmed it.

**The lag is lumped and linearised.** The whole drive train, torque amplifier, gears, shafts and carriage servos, is squeezed into a single first-order follow-up lag, applied to first order. A real transmission is a distributed second-order system with its own torsional resonance, and if that resonance fell inside the loop bandwidth this model would mispredict the onset of hunting.

**The creep law is a linearisation.** That microslip grows with transmitted torque and saturates at gross slip is solid rolling-contact physics, going back to Carter in 1926 and formalised by Kalker. That it grows *linearly*, with a constant of exactly one, is a modeling choice.

**Nothing is fitted to a historical accuracy figure.** Quoted accuracies of a few parts in a thousand are used here as a sanity target and never as a constraint. This is deliberate: an error model that had been tuned until it reproduced a number from a museum placard would tell you nothing you did not already put in.

## What you can learn

Run the five presets in order and the argument makes itself.

Start with **Kelvin, 1876**. Everything turns. Nothing computes. The gap between a correct idea and a working machine is one number, and here it is.

Then **construction set**: a differential analyzer made of toy parts, with sloppy gears and small discs. It works. It gives you about one decimal digit of truth. This is the most encouraging result in the playground and also the most sobering one, because it tells you that the *principle* is cheap and the *precision* is not.

Then **Bush, 1931**: two digits, bought with fifty minutes of turning. Look at what limits it. The integrators are far better than two digits; it is the accumulation of phase error over six cycles that eats the rest. Then open the settings and try to buy a third digit. You can, but notice what it costs, and notice from the sensitivity panel that past a certain point more torque amplification buys nothing at all, because the lost motion in the gear train has become the floor.

Then **run it fast**, which is the same machine impatient. The lag eats the damping and the pen leaves the paper. Analog computers were slow for a reason that is not about horsepower.

Then **mis-scaled**, which is the same machine programmed badly. The carriage asks for 216 millimetres of travel on a disc with a radius of 120, and the peaks come out flat.

And then, if you want the one idea to keep: look at the scaling panel and notice that the plateau is *flat*. Over a wide range of scale factors the machine is exactly as good, because a scale factor is a change of units, not a change of machine. The mechanism computes rotations of shafts. It has no idea what they mean. That, in the end, is what an analog computer is: a physical system that has been talked into agreeing with your equation, and which will go on obeying its own physics regardless of whether you have chosen the right units to listen in.

## Further reading

1. **Bush, V. (1931).** "The Differential Analyzer: A New Machine for Solving Differential Equations." *Journal of the Franklin Institute*, 212(4), 447-488. The primary source, and unexpectedly readable. Bush explains the machine as an engineer explaining a tool, not as a computer scientist explaining an architecture.

2. **Owens, L. (1986).** "Vannevar Bush and the Differential Analyzer: The Text and Context of an Early Computer." *Technology and Culture*, 27(1), 63-95. The best historical treatment. Owens is interested in what the machine *meant*, and in the culture of engineering that produced a computer you programmed with a wrench.

3. **Hartree, D. R. and Porter, A. (1935).** "The Construction and Operation of a Model Differential Analyser." *Memoirs and Proceedings of the Manchester Literary and Philosophical Society*. The Meccano machine. A serious paper about a toy, and an excellent way to see which parts of the design were essential.

4. **Hazen, H. L. (1934).** "Theory of Servo-Mechanisms." *Journal of the Franklin Institute*, 218(3), 279-331. Written by the man who made the analyzer's feedback loops behave. Read it alongside the *run it fast* preset and the hunting threshold stops being a curiosity and becomes the founding problem of control engineering.

5. **Thomson, J. (1876).** "On an Integrating Machine Having a New Kinematic Principle." *Proceedings of the Royal Society of London*, 24, 262-265. Two pages, one mechanism, and the entire machine is implicit in it.

6. **Thomson, W. (Lord Kelvin) (1876).** "Mechanical Integration of Linear Differential Equations of the Second Order with Variable Coefficients." *Proceedings of the Royal Society of London*, 24, 269-271. The idea, complete, fifty-five years early.

7. **Carter, F. W. (1926).** "On the Action of a Locomotive Driving Wheel." *Proceedings of the Royal Society A*, 112, 151-157. The origin of the creep law that governs every integrator in this playground. It is about trains.

8. **Kalker, J. J. (1990).** *Three-Dimensional Elastic Bodies in Rolling Contact*. Kluwer. The modern theory of what happens in a rolling contact that is not quite gripping. Far more than you need, and the right place to go if you want to know how much the linearisation here is costing you.

9. **Care, C. (2010).** *Technology for Modelling: Electrical Analogies, Engineering Practice, and the Development of Analogue Computing*. Springer. A broader history of analog computing as a *practice*, which is the right frame: these machines were not failed digital computers, they were successful physical models.

10. **Computer History Museum**, "Analog Computers: The Differential Analyzer." An accessible overview with photographs of the MIT machine, which are worth looking at while you orbit the model in the playground, because the reconstruction here is historically informed rather than survey-accurate.
