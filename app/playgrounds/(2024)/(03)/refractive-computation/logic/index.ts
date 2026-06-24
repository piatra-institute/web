/**
 * Pure, deterministic core of the granular polycomputation playground.
 *
 * The visualisation in components/Viewer animates a stochastic granular packing,
 * but the computation it is built around is deterministic and is collected here so
 * it can be tested and calibrated independently of the random packing:
 *
 *   - the contact normal-force law (a Hertz-style square-root contact law),
 *   - the frequency-modulation factor that multiplexes two vibration channels,
 *   - the NAND truth table the material is evolved to implement,
 *   - the output-grain correctness check, and
 *   - a packing geometry estimate (grain radius from packing fraction).
 *
 * "Refraction" here is the metaphor used by the playground title: a single grain
 * bends and re-routes incoming vibration energy differently at different
 * frequencies, the way a medium bends light differently at different wavelengths,
 * so that one physical element performs two logic gates at once.
 */

export interface Vector2 {
    x: number;
    y: number;
}

export interface ContactState {
    /** overlap = (r_i + r_j) - distance, in the same length units as the radii */
    overlap: number;
    stiffness: number;
}


// --- contact mechanics ------------------------------------------------------

/**
 * Hertz-style contact normal force used by the Viewer:
 *   F_n = sqrt(overlap) * stiffness   for overlap > 0, else 0.
 * A square-root law (sublinear in overlap) is the form the simulation applies
 * to grain-grain contacts; no force is transmitted when grains are not touching.
 */
export function contactNormalForce(overlap: number, stiffness: number): number {
    if (overlap <= 0) return 0;
    return Math.sqrt(overlap) * stiffness;
}

/**
 * Frequency-modulation factor that makes the same contact respond differently to
 * different vibration channels: factor(f, t) = 1 + 0.5 * sin(2 pi f t).
 * Bounded in [0.5, 1.5]; this is the term that lets one medium carry two gates.
 */
export function frequencyFactor(frequency: number, time: number): number {
    return 1 + 0.5 * Math.sin(frequency * time * 2 * Math.PI);
}

/**
 * Effective transmitted force at a contact for one frequency channel:
 *   F_eff = contactNormalForce(overlap, stiffness) * frequencyFactor(f, t).
 */
export function effectiveContactForce(
    contact: ContactState,
    frequency: number,
    time: number,
): number {
    return contactNormalForce(contact.overlap, contact.stiffness)
        * frequencyFactor(frequency, time);
}


// --- logic ------------------------------------------------------------------

/** NAND is functionally complete: every Boolean circuit reduces to NAND gates. */
export function nand(a: boolean, b: boolean): boolean {
    return !(a && b);
}

/** NAND as an integer (0 or 1), the encoding the output grain reports. */
export function nandBit(a: boolean, b: boolean): 0 | 1 {
    return nand(a, b) ? 1 : 0;
}

/**
 * The output grain reports the result of one channel by whether its displacement
 * along that channel's axis exceeds a threshold. This is the deterministic
 * decision rule the Viewer applies (channel 1 reads the x displacement, channel 2
 * the y displacement, threshold 0.1).
 */
export function readChannelBit(displacementComponent: number, threshold = 0.1): 0 | 1 {
    return Math.abs(displacementComponent) > threshold ? 1 : 0;
}

/**
 * An evolved material is "correct" on a given input set when the output grain's
 * reported bits on both channels match the two NAND truth tables simultaneously.
 * Returns 1 when both channels agree with NAND, else 0.
 */
export function outputCorrect(
    reported1: 0 | 1,
    reported2: 0 | 1,
    input1: { a: boolean; b: boolean },
    input2: { a: boolean; b: boolean },
): 0 | 1 {
    const target1 = nandBit(input1.a, input1.b);
    const target2 = nandBit(input2.a, input2.b);
    return reported1 === target1 && reported2 === target2 ? 1 : 0;
}


// --- packing geometry -------------------------------------------------------

/**
 * Mean grain radius implied by a packing fraction over a container.
 * If grainCount grains of equal area fill a fraction phi of an area A, then
 * each grain has area phi*A / N and radius sqrt(area / pi). This is exactly the
 * baseRadius the Viewer uses to seed the packing.
 */
export function grainRadius(
    packingFraction: number,
    containerArea: number,
    grainCount: number,
): number {
    if (grainCount <= 0) return 0;
    const grainArea = (packingFraction * containerArea) / grainCount;
    return Math.sqrt(grainArea / Math.PI);
}

/**
 * Coordination-number-style estimate: how many grain areas fit into the packed
 * region, i.e. the count consistent with a target packing fraction. Returned as
 * a real number so callers can compare against the integer grain count.
 */
export function packedGrainCapacity(
    packingFraction: number,
    containerArea: number,
    radius: number,
): number {
    if (radius <= 0) return 0;
    const grainArea = Math.PI * radius * radius;
    return (packingFraction * containerArea) / grainArea;
}


// --- exhaustive NAND verification ------------------------------------------

/**
 * Counts how many of the four NAND input rows a candidate truth table reproduces.
 * Used to certify that a channel really implements NAND (4/4) rather than some
 * other gate. The reference truth table is the deterministic NAND.
 */
export function nandRowsMatched(
    candidate: (a: boolean, b: boolean) => boolean,
): number {
    const rows: Array<[boolean, boolean]> = [
        [false, false],
        [false, true],
        [true, false],
        [true, true],
    ];
    let matched = 0;
    for (const [a, b] of rows) {
        if (candidate(a, b) === nand(a, b)) matched += 1;
    }
    return matched;
}
