import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'May 2026',
        description: 'initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'May 2026',
        changes: [
            '96-site periodic 1D lattice with linear growth, local Laplacian coupling, mean-field long-range coupling, and cubic saturation',
            'Five regime presets: subcritical, critical, supercritical, avalanche edge (Beggs/Plenz-style), over-synchronised',
            'Live avalanche detection with log-binned histogram and OLS τ-exponent fit',
            'Cellular sheaf Laplacian over 16 patches with data-dependent restriction maps; Jacobi eigendecomposition exposes kernel dimension and spectral gap',
            'Analytical (gain, damping) phase diagram with critical-curve overlay and current-point marker',
            'Sensitivity tornado on λ_max across all parameters',
            'Calibration table linking presets to known empirical regimes (cortical avalanches, propofol, ketamine, percolation, seizures, BTW sandpile)',
        ],
    },
];
