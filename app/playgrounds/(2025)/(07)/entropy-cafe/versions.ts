import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude (fable 5)',
        date: 'June 2026',
        description:
            'brings the WebGPU coffee-and-cream fluid onto the playground template: PlaygroundLayout, black-and-lime palette, honest coarse-grained entropy and complexity with no cosmetic rescaling (auto-scaled charts instead), five named presets, snapshot comparison, the entropy-and-complexity time-series, nine assumptions, a qualitative reading of the three mixing phases, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'particle fluid: about sixty thousand SPH-style particles (coffee sinks, cream floats) with density and pressure passes, Brownian diffusion, a stirring vortex with secondary helical flow, and viscous damping, inside a cylindrical glass.',
            'screen-space fluid rendering: a particle depth map, bilateral smoothing, color blur, and a glass overlay turn the particles into a cohesive liquid surface.',
            'metrics by coarse-graining: the cup is binned into a 32-cubed voxel grid; per voxel the cream fraction gives a binary Shannon entropy and a mixedness, and the concentration gradient times mixedness gives an apparent-complexity proxy.',
            'the signature result: the coarse-grained entropy climbs while apparent complexity rises and then falls; both are small in absolute terms (immiscible cream and coffee form separate particle domains), so the overlay and chart auto-scale to reveal the shapes.',
            'five presets traverse the mixing regimes: fresh pour, gentle settle, vigorous stir, thick, and watery.',
        ],
    },
];
