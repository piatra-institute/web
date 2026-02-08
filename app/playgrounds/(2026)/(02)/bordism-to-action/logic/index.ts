// --- Types ---

export type Direction = 'downhill' | 'uphill';

export interface ClassicalParams {
    gravity: number;
    angle: number;
    mass: number;
    friction: number;
    direction: Direction;
}

export interface ClassicalState {
    position: number;
    velocity: number;
}

export interface TQFTParams {
    level: number;
    braids: number;
}

export interface ComplexNumber {
    re: number;
    im: number;
}

export interface TQFTResult {
    s3Amplitude: number;
    h: number;
    spinJ: number;
    braidPhase: number;
    amplitude: ComplexNumber;
    qParameter: ComplexNumber;
}

// --- Constants ---

export const DEFAULT_CLASSICAL: ClassicalParams = {
    gravity: 9.8,
    angle: 30,
    mass: 1,
    friction: 0.1,
    direction: 'downhill',
};

export const DEFAULT_TQFT: TQFTParams = {
    level: 2,
    braids: 0,
};

export const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 10, 24];

export const DEFAULT_INITIAL_VELOCITY = 15;

export const DRAG_COEFFICIENT = 0.002;

// --- Functions ---

export function complexExp(phase: number): ComplexNumber {
    return {
        re: Math.cos(phase),
        im: Math.sin(phase),
    };
}

export function complexMagnitude(c: ComplexNumber): number {
    return Math.sqrt(c.re * c.re + c.im * c.im);
}

function dragAcceleration(velocity: number, mass: number): number {
    return -Math.sign(velocity) * DRAG_COEFFICIENT * velocity * velocity / mass;
}

export function computeAcceleration(params: ClassicalParams, state?: ClassicalState): number {
    const rad = (params.angle * Math.PI) / 180;
    const gSin = params.gravity * Math.sin(rad);
    const frictionForce = params.friction * params.gravity * Math.cos(rad);
    const vel = state?.velocity ?? 0;
    const drag = dragAcceleration(vel, params.mass);

    if (params.direction === 'downhill') {
        return Math.max(0, gSin - frictionForce) + drag;
    }

    // Uphill direction-aware acceleration
    let a: number;
    if (vel > 0.01) {
        a = -(gSin + frictionForce);
    } else if (vel < -0.01) {
        a = gSin <= frictionForce ? 0 : -(gSin - frictionForce);
    } else {
        a = gSin > frictionForce ? -(gSin - frictionForce) : 0;
    }
    return a + drag;
}

export function stepClassical(
    state: ClassicalState,
    params: ClassicalParams,
    dt: number,
): ClassicalState {
    const rad = (params.angle * Math.PI) / 180;
    const gSin = params.gravity * Math.sin(rad);
    const gCos = params.gravity * Math.cos(rad);
    const frictionForce = params.friction * gCos;
    const drag = dragAcceleration(state.velocity, params.mass);

    let a: number;

    if (params.direction === 'downhill') {
        a = Math.max(0, gSin - frictionForce) + drag;
    } else {
        if (state.velocity > 0.01) {
            a = -(gSin + frictionForce);
        } else if (state.velocity < -0.01) {
            a = gSin <= frictionForce ? 0 : -(gSin - frictionForce);
        } else {
            a = gSin > frictionForce ? -(gSin - frictionForce) : 0;
        }
        a += drag;
    }

    let velocity = state.velocity + a * dt;
    let position = state.position + velocity * dt;

    if (params.direction === 'downhill') {
        position = Math.min(100, Math.max(0, position));
        if (position >= 100) velocity = 0;
    } else {
        if (position < 0) {
            position = 0;
            velocity = 0;
        }
        position = Math.min(100, position);
    }

    return { position, velocity };
}

export function computeTQFT(params: TQFTParams, mass: number = 1): TQFTResult {
    const k = params.level;
    const spinJ = mass / 2;
    const s3Amplitude = Math.sqrt(2 / (k + 2)) * Math.sin(Math.PI / (k + 2));
    const h = (spinJ * (spinJ + 1)) / (k + 2);
    const braidPhase = 2 * Math.PI * h * params.braids;
    const amplitude = complexExp(braidPhase);
    const qParameter = complexExp((2 * Math.PI) / (k + 2));
    return { s3Amplitude, h, spinJ, braidPhase, amplitude, qParameter };
}

export function fmt(n: number, d = 4): string {
    return n.toFixed(d);
}
