import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'process-as-sheaf',
        statement:
            'a coherent process is modelled as a sheaf of trajectories over a site of time-intervals: local micro-histories that agree on overlaps glue into a unique global section. the "event becomes process" question is recast as "does the presheaf of local sections satisfy descent?".',
        citation:
            'sheaf semantics of behaviour and observation; Mac Lane and Moerdijk, Sheaves in Geometry and Logic; spatiotemporal sheaf models of signals (Robinson, Topological Signal Processing).',
        confidence: 'contested',
        falsifiability:
            'real processes can have genuinely non-local constraints (boundary conditions, global conservation laws) that no gluing of purely local sections reproduces; such a constraint would break the sheaf framing for that system.',
    },
    {
        id: 'overlapping-cover',
        statement:
            'time is covered by finitely many overlapping intervals, and consistency is checked only pairwise (and on triples for the cocycle test). this is a Cech-style approximation to the full sheaf condition over the continuous site.',
        citation:
            'Cech cohomology of a cover; the nerve of a good cover approximates the underlying space (good-cover / nerve lemma).',
        confidence: 'established',
        falsifiability:
            'a pathological cover whose overlaps miss the relevant scale would pass the pairwise test yet hide a genuine gluing obstruction; the finite cover is an approximation, not the full Grothendieck topology.',
    },
    {
        id: 'micro-dynamics-jump-drift',
        statement:
            'the micro-trajectory is a discrete-time drift-plus-jump random walk: an event fires with probability lambda*dt and adds a Gaussian jump of scale stepSigma, on top of a constant drift. it stands in for a generic event-driven micro-process.',
        citation:
            'compound-Poisson / jump-diffusion processes (Cont and Tankov, Financial Modelling with Jump Processes); the discrete Euler scheme is a first-order approximation.',
        confidence: 'established',
        falsifiability:
            'the Euler-Maruyama jump scheme has order-dt bias and a fixed grid; a process with heavy-tailed or state-dependent jump rates would not be captured by the constant-lambda, Gaussian-jump generator.',
    },
    {
        id: 'coarse-grain-natural',
        statement:
            'coarse-graining q from micro to macro is a centred moving average, treated as a natural transformation from the presheaf of micro-histories to the presheaf of macro-observables. naturality (q commutes with restriction) is measured, not assumed.',
        citation:
            'projection operators in coarse-graining; the natural-transformation framing follows categorical accounts of observables (Baez and Stay, Rosetta Stone).',
        confidence: 'contested',
        falsifiability:
            'the commutativity matrix in the viewer shows nonzero deviations near interval boundaries, so the moving average is only approximately natural; an exact natural transformation would require a boundary-aware projector.',
    },
    {
        id: 'mori-zwanzig-closure',
        statement:
            'closure is judged by the Mori-Zwanzig decomposition dm/dt = R(m) + integral K(t-s) m(s) ds + noise. a fitted exponential / finite-impulse-response kernel approximates K, and a fast-decaying kernel is read as Markovian closure of the macro dynamics.',
        citation:
            'Zwanzig, Nonequilibrium Statistical Mechanics; Mori 1965; Chorin, Hald and Kupferman on optimal prediction and memory.',
        confidence: 'contested',
        falsifiability:
            'the exact memory kernel is generally non-exponential and infinite-range; the low-order FIR / exponential fit can mislabel a long-memory process as Markovian when the lag count is too small.',
    },
    {
        id: 'ljung-box-residual-test',
        statement:
            'Markovian adequacy is quantified by a Ljung-Box test on the closure residuals: white (uncorrelated) residuals are read as evidence that the macro state is self-contained. the chi-square p-value uses an analytic regularised incomplete-gamma evaluation.',
        citation:
            'Ljung and Box 1978, On a measure of lack of fit in time series models; standard portmanteau autocorrelation test.',
        confidence: 'established',
        falsifiability:
            'the Ljung-Box test detects only linear autocorrelation; a residual stream that is uncorrelated but nonlinearly dependent would pass the test while the macro dynamics are not truly closed.',
    },
];
