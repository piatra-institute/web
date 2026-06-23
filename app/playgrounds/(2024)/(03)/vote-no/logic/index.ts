// The decision rules behind the "vote no" governance model. This is consensus by
// rejection: a proposal is blocked when the share of members who actively vote to
// reject it exceeds a veto threshold, and only passes once it has survived long
// enough with rejection below a consensus bar. Consensus strength peaks when the
// community is evenly split and falls toward either unanimous extreme. These are
// the deterministic rules; the on-screen network sim draws votes stochastically
// from them. Pure functions used by the calibration.

export function rejectionRate(rejectionVotes: number, activeMembers: number): number {
    return rejectionVotes / Math.max(activeMembers, 1);
}

// a proposal is vetoed when the rejection rate exceeds the veto threshold
export function isVetoed(rate: number, vetoThreshold: number): boolean {
    return rate > vetoThreshold;
}

// a sufficiently old proposal passes when rejection falls below (1 - consensusThreshold)
export function passes(rate: number, age: number, consensusThreshold: number): boolean {
    return age > 5 && rate < 1 - consensusThreshold;
}

// consensus is strongest at an even split (rate 0.5) and zero at either extreme
export function consensusStrength(rate: number): number {
    return 1 - Math.abs(0.5 - rate) * 2;
}
