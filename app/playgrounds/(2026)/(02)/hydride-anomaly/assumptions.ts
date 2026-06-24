import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'linear-trend',
        statement:
            'within a hydride family the boiling point, melting point, and latent heats of the heavier members (periods 3, 4, 5) rise close to linearly with periodic-table row, so a least-squares line through those three points is a fair "no special bonding" baseline.',
        citation:
            'Kurian, J. Chem. Educ. style anomaly plots; CRC Handbook trend data for group 14 to 17 hydrides.',
        confidence: 'contested',
        falsifiability:
            'the heavier members are not perfectly collinear; if the period 3 to 5 points curve strongly, the straight-line extrapolation to period 2 is biased and the residual is partly a fit artefact rather than a hydrogen-bond signal.',
    },
    {
        id: 'period2-anomaly',
        statement:
            'the period-2 hydrides of the most electronegative donors (H2O, HF, NH3) sit far above this baseline because hydrogen bonding adds an intermolecular attraction absent in the heavier homologues.',
        citation:
            'Pauling, The Nature of the Chemical Bond; standard inorganic-chemistry treatment of the hydride boiling-point anomaly.',
        confidence: 'established',
        falsifiability:
            'a period-2 hydride with a strongly electronegative donor that showed no positive residual would contradict the hydrogen-bonding explanation.',
    },
    {
        id: 'dispersion-scales-with-mass',
        statement:
            'London dispersion forces scale roughly with molecular polarisability, which itself grows with molar mass and electron count, so molar mass is used as a stand-in for dispersion strength in the scatter baseline.',
        citation:
            'London 1937; Israelachvili, Intermolecular and Surface Forces, on dispersion and polarisability.',
        confidence: 'contested',
        falsifiability:
            'polarisability is not a strict function of mass (shape and electron distribution matter), so substances of equal mass but different shape can deviate from the ln(mass) regression without any hydrogen bonding.',
    },
    {
        id: 'one-atmosphere',
        statement:
            'all boiling and melting points are taken at 1 atm, so the anomaly is a property of standard-pressure phase behaviour, not of the high-pressure superhydride regime.',
        citation:
            'CRC Handbook and NIST WebBook values, all at standard pressure.',
        confidence: 'established',
        falsifiability:
            'under megabar pressure the same hydrides (LaH10, H3S) behave entirely differently; this playground says nothing about that regime, so applying its trend there would be wrong.',
    },
    {
        id: 'family-membership-fixed',
        statement:
            'each substance belongs to exactly one family with a fixed periodic row, and the trend is fit only over members sharing a structural pattern (H2E, HX, EH3, EH4).',
        citation:
            'modelling choice; families follow the standard binary-hydride grouping by periodic group.',
        confidence: 'established',
        falsifiability:
            'mixing families or including associated/dimerising species (HF chains, water clusters) in the same fit would change the slope and is deliberately avoided.',
    },
    {
        id: 'static-tabulated-data',
        statement:
            'the playground reads fixed literature values rather than computing thermodynamics from first principles; the only computation is the linear regression, residual, ln(mass) regression, and phase classification.',
        citation:
            'tabulated CRC and NIST data; no electronic-structure or molecular-dynamics calculation is performed.',
        confidence: 'established',
        falsifiability:
            'measured values carry uncertainty and source disagreement of a few degrees; residuals smaller than that spread are not meaningful, though the period-2 anomalies are far larger than any such uncertainty.',
    },
];
