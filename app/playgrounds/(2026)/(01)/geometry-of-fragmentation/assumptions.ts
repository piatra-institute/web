import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'mosaic-idealisation',
        statement:
            'fragmentation is modelled as a mosaic: convex cells that tile the domain with no gaps and no overlaps. real fragments are non-convex, may overlap after rotation, and leave voids; the playground studies the idealised average, not a literal pile of rock.',
        citation:
            'Domokos, Jerolmack, Kun, Torok 2020 (PNAS): the convex-mosaic framework underlying the universal geometry of fragmentation.',
        confidence: 'established',
        falsifiability:
            'a fracture pattern dominated by strongly non-convex or interpenetrating fragments would not be captured by any convex-cell mosaic, so its statistics would not match this model.',
    },
    {
        id: 'two-number-summary',
        statement:
            'a mosaic is summarised by two averages: the mean number of sides per cell and the mean number of cells meeting at a vertex. this low-dimensional projection is what makes "attractors" visible at all.',
        citation:
            'Domokos et al. 2020: classification of planar mosaics by cell-vertex statistics, after Grunbaum and Shephard, Tilings and Patterns.',
        confidence: 'established',
        falsifiability:
            'two mosaics with very different fracture physics but identical (sides, degree) averages are indistinguishable here; if those distinctions matter, two numbers are too few.',
    },
    {
        id: 'splits-give-quadrangles',
        statement:
            'iterated random convex bisection of cells drives the mean side count toward 4, the 2D "Platonic quadrangle" attractor. each cut adds one edge to each child, and the population mean settles at 4 regardless of seed.',
        citation:
            'Domokos et al. 2020: primary 2D fracture mosaics average four sides; reproduced exactly by the calibration panel.',
        confidence: 'established',
        falsifiability:
            'if a long run of this generator settled at a mean clearly away from 4 (say 5 or 6) the quadrangle claim for binary bisection would be wrong; the calibration shows it lands on 4.',
    },
    {
        id: 'voronoi-gives-hexagons',
        statement:
            'Voronoi tessellations average about 6 sides per cell and 3 cells per interior vertex, the hexagonal attractor associated with cooling joints and drying mud. the live value sits a little below 6 because boundary cells are clipped.',
        citation:
            'Domokos et al. 2020 and standard Poisson-Voronoi theory: interior mean side count is exactly 6 in the infinite limit.',
        confidence: 'established',
        falsifiability:
            'an infinite (or periodic, boundary-free) Voronoi mosaic that did not approach mean 6 sides would contradict the well-established Poisson-Voronoi result.',
    },
    {
        id: 'euler-constraint',
        statement:
            'for an infinite planar tiling the mean sides n and mean vertex degree d satisfy 1/n + 1/d = 1/2, so only a constrained curve of (n, d) pairs is realisable. the live readout deviates from 1/2 because boundary vertices are counted with low degree on a finite patch.',
        citation:
            'Euler relation for planar graphs (V - E + F = 2) applied to tilings; the 1/2 identity is the infinite-tiling limit.',
        confidence: 'contested',
        falsifiability:
            'the identity is exact only as the patch grows without bound; on the finite unit square shown here the measured 1/n + 1/d is noticeably above 1/2, so the readout is a finite-size approximation, not the theorem.',
    },
    {
        id: 'process-selects-attractor',
        statement:
            'the inverse claim, that measured fragment statistics reveal formation conditions (single fracture vs repeated cracking vs cooling), is plausible but under-constrained: different processes can land near the same averages.',
        citation:
            'Domokos et al. 2020 propose attractor statistics as a fingerprint of process; the playground treats this as a hypothesis, not a calibrated inverse map.',
        confidence: 'speculative',
        falsifiability:
            'if two demonstrably different geological processes reliably produced the same (sides, degree) averages, the statistics could not be inverted to recover the process, and the fingerprint claim would fail.',
    },
];
