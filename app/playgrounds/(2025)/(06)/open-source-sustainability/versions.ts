import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2025',
        description:
            'first cut. a four-variable phase model of open source licensing: community, funding, maturity, and commercial cloud pressure map through a deterministic support-and-pressure transform to a permissive-or-restrictive verdict, with a resource-shifted boundary, six historical case-study trajectories, a stochastic sandbox loop, and a calibration that pins the deterministic core while being explicit about which historical transitions the core fails to reproduce.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2025',
        changes: [
            'phase model: four state variables (community, donations, cloud pressure, maturity) map to a (pressure, support) point via calculatePhaseCoordinates.',
            'support computed as a synergistic, maturity-weighted square root of community and donation effects; pressure as a multiplicatively resisted, squared cloud term.',
            'license verdict from determineLicenseState applies a boundary that community, funding, and maturity each shift outward.',
            'six historical case studies (Redis, Elastic, MongoDB, MinIO, Sentry, PostgreSQL) animate as trajectories through the phase space.',
            'stochastic sandbox: drifting cloud pressure and random shock events (maintainer leaves, security flaw, viral growth) perturb the live point.',
            'calibration pins four closed-form scores and two license verdicts on the deterministic core, and states plainly that the saturating support ceiling makes the model unable to reproduce the mid-range commercial relicensings it narrates.',
        ],
    },
];
