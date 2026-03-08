'use client';

import { useState } from 'react';

import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import { type Params, DEFAULT_PARAMS } from './logic';


export default function PeriodicTableOfStateSpacesPlayground() {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);

    const sections = [
        {
            id: 'intro',
            type: 'intro' as const,
        },
        {
            id: 'canvas',
            type: 'canvas' as const,
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        onParamsChange={setParams}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'outro',
            type: 'outro' as const,
            content: (
                <div className="text-gray-300 font-serif text-base leading-relaxed space-y-6 max-w-3xl mx-auto text-left">
                    <h3 className="text-lime-100 font-sans text-lg">What Is a State Space?</h3>
                    <p>
                        A state space <Equation math="X" /> equipped with a transition structure{' '}
                        <Equation math="T: X \to X" /> captures the complete information needed to determine
                        a system&apos;s future. The general form is:
                    </p>
                    <Equation mode="block" math="x_{t+1} = T(x_t, \theta, u_t, \varepsilon_t)" />
                    <p>
                        where <Equation math="\theta" /> are parameters, <Equation math="u_t" /> are
                        control inputs, and <Equation math="\varepsilon_t" /> is noise. Every science
                        studies some version of this structure. What varies is the geometry of{' '}
                        <Equation math="X" />, the character of <Equation math="T" />, and the
                        accessibility of <Equation math="\theta" /> and <Equation math="\varepsilon_t" />.
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">The Classification Axes</h3>
                    <p>
                        Ten orthogonal dimensions characterize any state space. Geometry gives
                        dimensionality. Dynamics gives stochasticity, nonlinearity, and predictability.
                        Epistemics gives observability and controllability. Systems theory gives
                        openness and adaptation. Social structure gives endogeneity and reflexivity.
                        No single axis determines the &quot;difficulty&quot; of a science — it is the
                        combination that matters.
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">The Developmental Ladder</h3>
                    <p>
                        Fixed → Adaptive → Endogenous → Reflexive. Chemistry occupies mostly-fixed
                        state spaces: the laws of thermodynamics and kinetics are exogenous to the
                        reactions they govern. Biology is adaptive: immune systems learn, neural
                        circuits rewire. Economics is endogenous: the rules of the market emerge from
                        the behavior of market participants. Finance and politics are reflexive:
                        participants&apos; models of the system feed back into the system itself.
                    </p>
                    <p>
                        This is not a value judgment. It describes the kind of regularity each domain
                        can discover and the style of explanation that works.
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">Why Contingency Doesn&apos;t Disqualify a Science</h3>
                    <p>
                        The boundary conditions of chemistry are contingent on planetary history.
                        The rules of economics are contingent on institutions. Both are still sciences
                        if they identify stable, testable structure within their state spaces.
                        The question is not &quot;are the laws arbitrary?&quot; but &quot;given these
                        constraints, do disciplined regularities emerge?&quot;
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">Prediction, Explanation, Intervention</h3>
                    <p>
                        Pure prediction is too weak a criterion for science. A black-box correlation
                        may predict without explaining. Science requires robustness under perturbation —
                        which is precisely what the controllability and observability axes capture.
                        A system that is observable and controllable admits experiments; one that is
                        neither admits only observation and narrative.
                    </p>

                    <h3 className="text-lime-100 font-sans text-lg">This Table Is a Synthesis</h3>
                    <p>
                        No single canonical &quot;periodic table of state spaces&quot; exists in the
                        literature. This playground merges ideas from: Poincaré and Gibbs (phase spaces),
                        Bertalanffy (open systems), Ashby (cybernetic feedback), Kalman (observability
                        and controllability), Lucas (endogenous policy regimes), Soros (reflexivity in
                        finance), and second-order cybernetics (observer inclusion). The result is not a
                        final taxonomy but a tool for thinking about what kind of knowledge is possible
                        in what kind of domain.
                    </p>
                </div>
            ),
        },
    ];

    const settings = (
        <Settings
            params={params}
            onParamsChange={setParams}
        />
    );

    return (
        <PlaygroundLayout
            title="periodic table of state spaces"
            subtitle="a synthetic taxonomy of what kind of space a science studies"
            description={
                <span>
                    synthesized from{' '}
                    <a
                        href="https://en.wikipedia.org/wiki/State_space"
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Poincaré, Ashby, Kalman, Bertalanffy, Soros, von Foerster
                    </a>
                </span>
            }
            sections={sections}
            settings={settings}
        />
    );
}
