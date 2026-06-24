import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'January 2026',
        description:
            'first cut. builds the 2D fragmentation sandbox from Domokos et al. 2020: random convex bisection of a unit square, clipped Voronoi tessellation, and a mixed mode, all reduced to the two-number (mean sides, mean vertex degree) summary. tracks the trajectory toward the quadrangle (4) and hexagon (6) attractors, with a step-by-step animation, an Euler-relation readout, and a calibration of the deterministic geometric core.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'January 2026',
        changes: [
            'random-split generator: seeded convex bisection of a unit square, area-weighted cell selection, optional angle bias toward axis-aligned cuts.',
            'Voronoi generator: d3-delaunay tessellation of N seed points clipped to the unit square, one cell per site.',
            'mixed generator: a Voronoi base further bisected, so the phase point migrates between the hexagon and quadrangle attractors.',
            'two-number summary via computeStats: mean sides per cell, mean cells per vertex, plus per-class histograms.',
            'animation over stored history snapshots, with phase-space and time-series trajectories toward the reference attractors.',
            'calibration of the deterministic skeleton: shoelace area, mass conservation under splitting, cell-count bookkeeping, Voronoi tiling, and the mean-sides-to-4 attractor.',
            'honesty about finite-size effects: the Euler identity 1/n + 1/d = 1/2 holds only in the infinite-tiling limit, and boundary clipping pulls the live Voronoi mean below 6.',
        ],
    },
];
