'use client';

import React, { useState, useMemo } from 'react';

import PlaygroundLayout, { PlaygroundSection } from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import Equation from '@/components/Equation';
import ModelChangelog from '@/components/ModelChangelog';
import ResearchPromptButton from '@/components/ResearchPromptButton';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

import Settings from './components/Settings';
import Viewer from './components/Viewer';
import {
    Params, SweepableKey,
    DEFAULT_PARAMS, computeMetrics, computeSensitivity,
    computeNarrative,
} from './logic';
import { assumptions } from './assumptions';
import { versions, changelog } from './versions';


interface Props {
    sourceContext?: PlaygroundSourceContext;
}

export default function MoaralPhaseSpacePlayground({ sourceContext }: Props) {
    const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
    const [sweepParam, setSweepParam] = useState<SweepableKey>('arbitraryDetention');

    const metrics = useMemo(() => computeMetrics(params), [params]);
    const sensitivityBars = useMemo(() => computeSensitivity(params), [params]);
    const narrative = useMemo(() => computeNarrative(metrics, params), [metrics, params]);

    const sections: PlaygroundSection[] = [
        { id: 'intro', type: 'intro' },
        {
            id: 'canvas',
            type: 'canvas',
            content: (
                <PlaygroundViewer>
                    <Viewer
                        params={params}
                        metrics={metrics}
                        sensitivityBars={sensitivityBars}
                        assumptions={assumptions}
                        versions={versions}
                        sweepParam={sweepParam}
                        onSweepParamChange={setSweepParam}
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
                        <h3 className="text-lime-400 font-semibold mb-3">The question</h3>
                        <p className="leading-relaxed text-sm">
                            You cannot show a human right under a microscope. You cannot
                            prove in a mathematical theorem why segregation was wrong, why
                            it was wrong to kill people in the gulag for a better tomorrow.
                            But you can build formal systems that make the wrongness
                            visible, testable, and structurally clear. This playground
                            explores three such systems.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Deontic logic: rights as constraints</h3>
                        <p className="leading-relaxed text-sm">
                            Deontic logic formalizes the distinction between what is
                            obligatory, forbidden, and permitted. In this model, rights
                            enter as <em>side-constraints</em> on optimization: some
                            actions are categorically inadmissible regardless of their
                            aggregate welfare consequences.
                        </p>
                        <Equation mode="block" math="\text{Adm}(s) = \{a \in A \mid a \text{ does not violate basic rights constraints}\}" />
                        <p className="leading-relaxed text-sm mt-2">
                            Optimization happens only inside the admissible set. This is
                            how the mathematics says: &ldquo;you do not get to solve an
                            equation by deleting the people who make it
                            inconvenient.&rdquo;
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">Capability lattice: real freedoms</h3>
                        <p className="leading-relaxed text-sm">
                            The capability approach, developed by Amartya Sen and Martha
                            Nussbaum, evaluates social states not by reported satisfaction
                            or resource holdings, but by what persons are actually able to
                            do and be. The seven capabilities measured here &mdash; bodily
                            integrity, mobility, speech, participation, education, health,
                            and contestation &mdash; form a partial order, not a single
                            scalar. Two states can be incomparable: one may improve
                            education while worsening political voice. The capability
                            floor matters because a society with one collapsed freedom is
                            not redeemed by luxuries elsewhere.
                        </p>
                    </div>

                    <div className="border-l-2 border-lime-500/40 pl-4">
                        <h3 className="text-lime-400 font-semibold mb-3">State-space: domination and repair</h3>
                        <p className="leading-relaxed text-sm">
                            The third framework models the polity as a dynamical system
                            with two competing forces: domination (coercion, targeted
                            burden, persistence of unjust structures) and repair (courts,
                            participation, accountability). What matters is not just the
                            snapshot but where the institutional dynamics are dragging the
                            system. Domination can become self-reinforcing: coercion
                            erodes repair capacity, which reduces correction, which
                            enables further coercion. The system classifies trajectories
                            into three attractor basins: entrenched domination, contested
                            transition, and repair-and-stabilization.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">Naive utility as foil</h3>
                        <p className="leading-relaxed text-sm">
                            A crude utilitarian machine compresses moral reality into one
                            scalar: <Equation math="\max \sum_i U_i" />. This playground
                            includes a naive utility score as a deliberate foil &mdash; to
                            show how single-number optimization can rate a
                            rights-violating, coercive system as tolerable when
                            future-welfare rhetoric is high. The other three frameworks
                            exist precisely to block this failure mode.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">What each framework sees</h3>
                        <p className="leading-relaxed text-sm">
                            The point is not to force agreement between the models. Each
                            one notices something the others miss. Deontic logic cleanly
                            captures why &ldquo;better tomorrow&rdquo; does not justify
                            arbitrary detention. The capability lattice reveals that
                            formally equal opportunities can coexist with targeted
                            subordination. The state-space model shows that tolerable
                            present indicators can mask a trajectory toward entrenched
                            domination. Together they approximate the &ldquo;non-crude
                            mathematics&rdquo; that a single utility function cannot
                            provide.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lime-400 font-semibold mb-3">The limitation</h3>
                        <p className="leading-relaxed text-sm">
                            This mathematics is not value-free in the strong sense. It
                            needs axioms: persons count, equal standing matters, some
                            forms of coercion are impermissible, aggregate gain does not
                            automatically justify sacrifice of the few. These are closer
                            to axioms in geometry than to empirical findings. But once
                            chosen, they generate a strong formal system, and many
                            atrocities become demonstrably invalid moves within it.
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
            title="Moral phase space"
            subtitle="three non-crude moral formalisms applied to the same political scenario"
            description={
                <>
                    <a href="https://plato.stanford.edu/entries/logic-deontic/" className="underline" target="_blank" rel="noopener noreferrer">
                        SEP, Deontic Logic
                    </a>
                    {' \u00B7 '}
                    <a href="https://global.oup.com/academic/product/development-as-freedom-9780198297581" className="underline" target="_blank" rel="noopener noreferrer">
                        1999, Sen, Development as Freedom
                    </a>
                </>
            }
            sections={sections}
            settings={
                <Settings
                    params={params}
                    onParamsChange={setParams}
                    metrics={metrics}
                    narrative={narrative}
                />
            }
        />
    );
}
