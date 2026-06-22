// Halley's method as complex dynamics. The fractal iterates a root finder on the
// polynomial p(z) = z^n - 1, whose roots are the n-th roots of unity (all on the
// unit circle), and colours each starting point by which root it converges to.
// A tunable weight c on the second-derivative term unifies two classics:
//   c = 1  ->  Halley's method (third-order convergence)
//   c = 0  ->  Newton's method (second-order convergence)
// These are pure complex-arithmetic helpers used by the calibration.

export interface Complex { re: number; im: number; }

const cx = (re: number, im = 0): Complex => ({ re, im });
const cadd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
const csub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
const cmul = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const cdiv = (a: Complex, b: Complex): Complex => {
    const d = b.re * b.re + b.im * b.im;
    return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};

export const cabs = (a: Complex): number => Math.hypot(a.re, a.im);

// integer power via polar form, matching the shader's complex_pow
function cpow(z: Complex, n: number): Complex {
    const r = Math.hypot(z.re, z.im);
    const t = Math.atan2(z.im, z.re);
    const rn = Math.pow(r, n);
    return { re: rn * Math.cos(n * t), im: rn * Math.sin(n * t) };
}

// p(z) = z^n - 1 and its first two derivatives
const f = (z: Complex, n: number): Complex => csub(cpow(z, n), cx(1));
const fp = (z: Complex, n: number): Complex => cmul(cx(n), cpow(z, n - 1));
const fpp = (z: Complex, n: number): Complex => cmul(cx(n * (n - 1)), cpow(z, n - 2));

// one generalized-Halley step: z - 2 f f' / (2 f'^2 - c f f'')
export function halleyStep(z: Complex, degree: number, c = 1): Complex {
    const fz = f(z, degree);
    const fpz = fp(z, degree);
    const fppz = fpp(z, degree);
    const num = cmul(cx(2), cmul(fz, fpz));
    const den = csub(cmul(cx(2), cmul(fpz, fpz)), cmul(cx(c), cmul(fz, fppz)));
    return csub(z, cdiv(num, den));
}

export interface HalleyResult {
    root: Complex;
    iterations: number;
    converged: boolean;
}

// iterate from z0 until p(z) is within tolerance of zero, or maxIter is reached
export function halleyRoot(z0: Complex, degree: number, c = 1, maxIter = 80, tol = 1e-10): HalleyResult {
    let z = z0;
    for (let i = 1; i <= maxIter; i++) {
        z = halleyStep(z, degree, c);
        if (cabs(f(z, degree)) < tol) return { root: z, iterations: i, converged: true };
    }
    return { root: z, iterations: maxIter, converged: false };
}
