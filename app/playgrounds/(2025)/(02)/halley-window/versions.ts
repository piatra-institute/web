import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2025',
        description:
            'WebGL fractal of Halley\'s root-finding method on p(z) = z^n - 1, colouring the complex plane by which root of unity each start converges to. Retrofitted with the scientific scaffolding: a complex-arithmetic logic module implementing the generalized Halley step (with the Newton special case), calibration that runs the iteration to the known roots of unity, and assumptions on convergence, the basins-of-attraction framing, and the rendering limits.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2025',
        changes: [
            'WebGL shader rendering Halley-method convergence basins for p(z) = z^n - 1, with pan, zoom, degree, and colour controls.',
            'a "constant" weight on the second-derivative term: 1 is standard Halley, 0 reduces to Newton\'s method.',
            'logic module with complex arithmetic and the generalized Halley iteration, used by the calibration.',
            'calibration runs the iteration from several starts and confirms it converges to the exact n-th roots of unity (all on the unit circle).',
            'assumptions cover cubic convergence, the basins-of-attraction fractal, and the pixel/precision limits of the render.',
        ],
    },
];
