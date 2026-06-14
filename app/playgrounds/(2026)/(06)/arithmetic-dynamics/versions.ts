import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2026',
        description:
            'first cut. builds the attractor-morphogenesis sandbox from the deep-research companion: a continuous Hopfield tissue with three orthonormalised stored morphologies, local diffusion, lesioning, Hebbian imprint, a Lyapunov-style energy, calibration of regeneration fidelity, a memory-strength sweep, and nine assumptions that keep the shared-dynamics claim apart from the speculative Platonic-form interpretation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'tissue model: a 48-by-30 grid with state u, output y = tanh(g u), updated by du/dt = -u + alpha * memory + D * diffusion + noise.',
            'low-rank associative memory over three orthonormalised target morphologies (single axis, bifurcated axis, tri-lobed), pulling the field toward the stored subspace.',
            'lesion, re-seed, randomise, and Hebbian imprint actions, so users can damage a form and watch it regenerate, or write a new attractor.',
            'Lyapunov-style energy and per-template overlaps reported live; recovery measured as cosine overlap with the active target.',
            'calibration: deterministic relaxation measures regeneration fidelity against the intact form, including a rigid case that scars instead of healing.',
            'memory-strength sweep showing the retrieval regime where a lesioned form is repaired.',
            'framing kept honest: arithmetic orbits, evolutionary learning, and bioelectric morphogenesis share attractor structure; the Platonic-space ontology is marked speculative and is not modelled.',
        ],
    },
];
