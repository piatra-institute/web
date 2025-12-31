/**
 * Core logic for the Ultimatum Game simulation
 */

export const TOTAL_PIE = 10;
export const FAIR_OFFER = 5;

/**
 * Calculates the resentment level based on the unfairness of the offer.
 * @param offer - The number of coins offered to the responder (0-10)
 * @returns The calculated resentment value (0-100)
 */
export function calculateResentment(offer: number): number {
    if (offer >= FAIR_OFFER) return 0; // No resentment for fair or generous offers
    const unfairness = FAIR_OFFER - offer; // Scale of 0 to 5
    // Scale to 0-100 range (unfairness * 20 would max at 100, but we use 25 for steeper curve)
    return Math.min(unfairness * 25, 100);
}

/**
 * Predicts whether the responder will accept or reject based on desire vs resentment
 * @param desire - The responder's desire level (0-100)
 * @param resentment - The calculated resentment level (0-100)
 * @returns The predicted decision
 */
export function predictDecision(desire: number, resentment: number): 'accept' | 'reject' {
    return desire >= resentment ? 'accept' : 'reject';
}

/**
 * Generates a new offer from the proposer.
 * Biased towards slightly unfair offers to better test the model.
 * @returns The offer amount (1-5 coins)
 */
export function generateOffer(): number {
    // Bias towards lower offers: 1, 2, 2, 3, 3, 3, 4, 4, 5
    const offerPool = [1, 2, 2, 3, 3, 3, 4, 4, 5];
    return offerPool[Math.floor(Math.random() * offerPool.length)];
}

/**
 * Calculates what the proposer keeps
 * @param offer - The offer amount
 * @returns The amount the proposer keeps
 */
export function calculateProposerShare(offer: number): number {
    return TOTAL_PIE - offer;
}

/**
 * Determines if the player is at a decision tipping point
 * @param desire - The responder's desire level
 * @param resentment - The calculated resentment level
 * @returns Whether the player is near the tipping point
 */
export function isAtTippingPoint(desire: number, resentment: number): boolean {
    return resentment > 0 && Math.abs(desire - resentment) < 5;
}

/**
 * Formats the offer description
 * @param offer - The offer amount
 * @returns Formatted offer text
 */
export function formatOfferText(offer: number): {
    main: string;
    sub: string;
} {
    const proposerKeeps = calculateProposerShare(offer);
    return {
        main: `The Proposer offers you ${offer} coin${offer !== 1 ? 's' : ''}.`,
        sub: `(They will keep ${proposerKeeps} coin${proposerKeeps !== 1 ? 's' : ''})`
    };
}

/**
 * Gets a description of the offer fairness
 * @param offer - The offer amount
 * @returns Description of the offer
 */
export function getOfferDescription(offer: number): string {
    if (offer >= 5) return 'Fair';
    if (offer >= 4) return 'Slightly Unfair';
    if (offer >= 3) return 'Unfair';
    if (offer >= 2) return 'Very Unfair';
    return 'Insulting';
}
