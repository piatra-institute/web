// Raup's geometric model of shell coiling. A generating curve follows a
// logarithmic spiral about a fixed axis. W is the whorl expansion rate (the
// factor by which the spiral radius grows per full revolution), T the
// translation rate along the axis, and D the relative distance of the generating
// curve from the axis. These are the canonical equations; the Viewer renders the
// same spiral but applies an extra visual sensitivity tweak to W so the slider
// feels responsive. Pure functions used by the calibration.

export interface RaupParams { W: number; D: number; T: number; }

// spiral radius at angle theta (radians), from a starting radius r0
export function spiralRadius(theta: number, W: number, r0 = 1): number {
    const b = Math.log(W) / (2 * Math.PI);
    return r0 * Math.exp(b * theta);
}

// expansion factor over `whorls` full revolutions: by construction this is W^whorls
export function whorlExpansion(W: number, whorls = 1): number {
    return spiralRadius(2 * Math.PI * whorls, W) / spiralRadius(0, W);
}

// axial translation z(theta) = T * r(theta) * theta / (2 pi); after one whorl z = T * r
export function axialTranslation(theta: number, W: number, T: number, r0 = 1): number {
    return (T * spiralRadius(theta, W, r0) * theta) / (2 * Math.PI);
}
