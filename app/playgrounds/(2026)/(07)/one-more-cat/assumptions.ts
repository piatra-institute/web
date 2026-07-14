import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'capacity-not-count',
        statement:
            'welfare is governed by the care-load ratio rho = required care / effective capacity, not by the absolute number of cats. a high count with strong organization and reserve capacity (a managed sanctuary) can keep rho below 1, while a small household with no slack can cross it.',
        citation:
            'Association of Shelter Veterinarians, Guidelines for Standards of Care in Animal Shelters (2nd ed.): capacity for care, not headcount, is the operative welfare constraint.',
        confidence: 'established',
        falsifiability:
            'if welfare were determined by cat count alone regardless of resources, the model\'s central ratio would be the wrong state variable.',
    },
    {
        id: 'solicitation-bias',
        statement:
            'cat solicitation (purring with an embedded high-frequency cry, meowing, approach, visible vulnerability) exploits human caregiving sensory biases and raises the probability of accepting the next cat. this is encoded as a solicitation term in the acceptance benefit, not as conscious deception by the cat.',
        citation:
            'McComb, Taylor, Wilson & Charlton 2009 (Current Biology): the cry embedded within the purr exploits a mammalian sensitivity to distress cues.',
        confidence: 'contested',
        falsifiability:
            'if adoption or retention decisions were statistically insensitive to solicitation cues once need and cost are controlled, the solicitation channel would be spurious.',
    },
    {
        id: 'attachment-hysteresis',
        statement:
            'relinquishing a named, attached cat is psychologically harder than refusing an unknown one. this asymmetry is modeled as an attachment barrier that damps rehoming, producing hysteresis: the population resists falling even when intake would resist rising.',
        citation:
            'Vitale, Behnke & Udell 2019 (Current Biology): cats form secure attachment bonds to caregivers comparable to those seen in infants and dogs.',
        confidence: 'contested',
        falsifiability:
            'if surrender rates matched refusal rates for otherwise identical cats, the surrender-aversion asymmetry that drives hysteresis would be absent.',
    },
    {
        id: 'reproduction-anchor',
        statement:
            'births use a literature anchor of 1.4 litters per fertile female per year and a median of 3 kittens per litter, then scale by user-controlled reproduction intensity, kitten survival to entry, and the sterilized share.',
        citation:
            'Nutter, Levine & Stoskopf 2004 (JAVMA): reproductive capacity and kitten survival in free-roaming domestic cats.',
        confidence: 'contested',
        falsifiability:
            'these values come from a free-roaming population; a household with different fecundity, survival, or sterilization dynamics would need re-anchoring, and the calibration exposes the raw rate for inspection.',
    },
    {
        id: 'density-stress',
        statement:
            'crowding beyond a space and monitoring threshold raises conflict, disease pressure, and undetected illness, which feed back as additional care load. this is captured by density, monitoring, and disease multipliers that grow super-linearly once the relevant ratio exceeds one.',
        citation:
            'Ramos et al. 2013 (Physiology & Behavior): multi-cat household density and its association with feline stress markers.',
        confidence: 'contested',
        falsifiability:
            'the density effect is variable and resource-dependent; if well-resourced high-density homes showed no welfare decline, the density feedback would be over-weighted.',
    },
    {
        id: 'marginal-cost-underestimation',
        statement:
            'the perceived marginal cost of one more cat is systematically lower than the actual marginal load, because habituation hides incremental monitoring and medical burden ("one more bowl is cheap"). recognized overload and intake discipline push perceived cost back up.',
        citation:
            'a behavioral modeling choice consistent with habituation and present-bias literatures; not an estimated coefficient.',
        confidence: 'speculative',
        falsifiability:
            'if caregivers accurately forecast the marginal care load of an additional cat, the underestimation channel would be unnecessary.',
    },
    {
        id: 'referral-feedback',
        statement:
            'once someone is known to accept cats, more cats are directed toward them. arrival opportunities therefore grow with current population when both rescue identity and social referral feedback are high, an endogenous reputation amplifier that can outrun rehoming.',
        citation:
            'a sociological modeling choice; the reputation-as-magnet pattern is widely reported in animal-rescue and hoarding case studies but is not a fitted parameter here.',
        confidence: 'contested',
        falsifiability:
            'if arrival rates were independent of current count and reputation, the referral loop that generates runaway trajectories would vanish.',
    },
    {
        id: 'hoarding-thresholds',
        statement:
            'the model\'s high-count crisis thresholds are informed by hoarding case series, where large populations coincide with failed care rather than defining it. crossing rho = 1 with low organization, not reaching a specific number, is what the model treats as the hazard.',
        citation:
            'Patronek 1999 (Public Health Reports, median 39 animals); Tamimi et al. 2024 (J Shelter Medicine, median 22 cats); Stumpf et al. 2023 systematic review.',
        confidence: 'contested',
        falsifiability:
            'if very high counts were routinely maintained at adequate welfare without organizational scaffolding, the crisis mapping would be too pessimistic.',
    },
    {
        id: 'welfare-strain-proxies',
        statement:
            'the welfare index and caregiver-strain index are deliberately visible proxies built from care, space, monitoring, and disease adequacy. they are not validated psychometric or veterinary instruments and are intended for testing mechanisms, not measuring a real household.',
        citation:
            'a transparency disclosure; the model is framed as a hypothesis generator, not a measurement tool.',
        confidence: 'established',
        falsifiability:
            'any quantitative welfare claim would require validated instruments, ensemble runs, and fitted parameters; only the qualitative regime structure is supported.',
    },
    {
        id: 'not-a-diagnosis',
        statement:
            'a high cat count does not by itself diagnose hoarding, and the model does not pathologize multi-cat owners, women, or people living alone. it explicitly separates a managed sanctuary (high count, high organization, rho < 1) from an accumulation crisis (rho >> 1, collapsing welfare).',
        citation:
            'Stumpf et al. 2023: animal hoarding is a clinical syndrome defined by failed care and impaired insight, not by count; the model mirrors that distinction.',
        confidence: 'established',
        falsifiability:
            'a model that flagged every high-count trajectory as pathological would be wrong; this one routes organized high-count runs to a non-crisis regime.',
    },
];
