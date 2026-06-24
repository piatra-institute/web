import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'August 2025',
        description:
            'first cut. extracts the deterministic insurance-investing model into a pure logic module: linear float accumulation, a fixed underwriting margin on premium, and compounding investment returns on the full float balance. adds compound-value, CAGR, float-contribution and cost-of-float identities, an exact calibration against closed-form answers, six assumptions that flag the constant-return and permanent-float idealisations, and a research companion on float and compounding.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'August 2025',
        changes: [
            'engine: float(n) = n x annualPremiums; cumulative underwriting = years x premium x margin; investment gain = float x return each year; portfolio = underwriting + investment gains.',
            'closed-form helpers compoundValue (FV = PV(1+r)^n), cagr ((end/start)^(1/n) - 1), floatContribution, annualUnderwriting and floatCostPercent extracted from the Viewer recurrence.',
            'calibration: five exact identities (compound value, doubling CAGR, cumulative underwriting, single-year float gain, negative cost of float) checked against analytic targets with zero error.',
            'six assumptions distinguishing established compounding mathematics from the contested permanent-float and constant-return idealisations.',
            'research companion on insurance float, the cost of float, and why compounding dominates the long-run portfolio.',
        ],
    },
];
