import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'January 2026',
        description:
            'first cut. builds the Nested Observer Windows sandbox: a hierarchy of phase oscillators grouped into windows across levels, with within-window synchrony, lagged peer coherence, a cross-frequency-coupling summary, and a heuristic report-stability output. adds a calibration of the deterministic core (Kuramoto endpoints and the report-stability law), seven assumptions separating mechanism from interpretation, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'January 2026',
        changes: [
            'oscillator hierarchy: numLevels levels, each with windowsPerLevel windows of phase oscillators, slower intrinsic frequency toward the apex, a single window at the apex.',
            'within-window synchrony pulls phases toward their circular mean; the Kuramoto order parameter r = |mean(exp(i*theta))| reads out window coherence.',
            'peer coherence pulls window means toward a non-zero preferred lag, separating zero-lag synchrony (within) from lagged coherence (between).',
            'cross-frequency coupling scalar: parent mean phase modulates a child amplitude envelope, averaged over parent-child level pairs.',
            'report stability composite: clamp01(syncApex*(0.55+0.45*bandwidth)*(0.6+0.4*avgCoherence)), encoding joint necessity of all three mechanisms.',
            'live time series of apex synchrony, cross-frequency coupling, and report stability.',
            'calibration targets the deterministic, noise-free core (Kuramoto order at exact endpoints, report-stability law at hand-worked operating points) since the live run is stochastic.',
            'framing kept honest: the toy illustrates the NOW hypothesis and does not test it; the report-stability law is marked speculative.',
        ],
    },
];
