/**
 * Activation Function Lab - Core Logic
 *
 * A comprehensive collection of activation functions, gates, expression parser,
 * and analysis utilities for exploring the landscape of neural network activations.
 */

// ============================================================================
// Types
// ============================================================================

export type BuiltinType =
    // Classic
    | 'ReLU'
    | 'LeakyReLU'
    | 'PReLU'
    | 'ELU'
    | 'SELU'
    | 'CELU'
    // Smooth Modern
    | 'GELU'
    | 'Swish'
    | 'Mish'
    | 'SiLU'
    | 'Logish'
    // Hard Variants
    | 'HardSwish'
    | 'HardSigmoid'
    | 'HardTanh'
    // Bounded
    | 'Tanh'
    | 'Sigmoid'
    | 'Softsign'
    | 'ArcTan'
    | 'SQNL'
    // Soft
    | 'Softplus'
    | 'Softmax1D'
    // Parametric & Adaptive
    | 'RReLU'
    | 'ThresholdedReLU'
    | 'ISRU'
    | 'ISRLU'
    | 'PLU'
    | 'APL'
    // Exponential Family
    | 'Exponential'
    | 'PELU'
    | 'GELU_tanh'
    | 'GELU_sigmoid'
    // Oscillating & Periodic
    | 'Sinc'
    | 'Sin'
    | 'Gaussian'
    | 'GCU'
    // Polynomial-like
    | 'BentIdentity'
    | 'SoftExponential'
    | 'SQRBF'
    // Hybrid & Modern
    | 'ELiSH'
    | 'HardELiSH'
    | 'Seagull'
    | 'Phish'
    | 'TanhExp'
    | 'Aria2'
    | 'MaxMin'
    | 'LiSHT'
    | 'ReLU6'
    | 'SReLU'
    | 'BReLU'
    | 'CReLU'
    | 'ReLUN'
    | 'SquaredReLU'
    | 'StarReLU'
    | 'ShiftedSoftplus'
    | 'Smish'
    | 'LogSigmoid'
    | 'TanhShrink'
    | 'SoftShrink'
    | 'HardShrink'
    | 'Snake';

export type GateType =
    | 'none'
    | 'sigmoid'
    | 'hard_sigmoid'
    | 'tanh'
    | 'softplus'
    | 'step';

export type SpecKind = 'builtin' | 'composer' | 'expression';

export interface Spec {
    id: string;
    name: string;
    kind: SpecKind;

    // builtin
    builtinType?: BuiltinType;

    // composer
    base?: BuiltinType;
    gate?: GateType;

    // parameters
    alpha: number;
    beta: number;
    tau: number;
    b: number;
    posScale: number;
    negScale: number;

    // expression
    expr?: string;
}

export interface Stats {
    ok: boolean;
    err?: string;
    maxAbsY?: number;
    maxAbsDy?: number;
    monotoneNondecreasing?: boolean;
    deadFrac?: number;
    oddness?: number;
    evenness?: number;
}

export interface PlotData {
    x: number;
    y: number;
    dy: number;
    [key: string]: number;
}

export interface ActivationMeta {
    name: BuiltinType;
    category: string;
    description: string;
    year?: number;
    paper?: string;
    arxiv?: string;
}

export interface LandscapePoint {
    name: string;
    x: number;
    y: number;
    z: number;
    category: string;
    isCurrent?: boolean;
    isOverlay?: boolean;
    // All computed dimensions for flexible projection
    dimensions: Record<string, number>;
}

export type LandscapeDimension =
    | 'negRegion'
    | 'posRegion'
    | 'atZero'
    | 'smoothness'
    | 'maxDeriv'
    | 'symmetry'
    | 'boundedness'
    | 'saturation'
    | 'curvature'
    | 'spread';

export const LANDSCAPE_DIMENSIONS: { value: LandscapeDimension; label: string; description: string }[] = [
    { value: 'negRegion', label: 'Negative Region', description: 'Behavior for x < 0' },
    { value: 'posRegion', label: 'Positive Region', description: 'Behavior for x > 0' },
    { value: 'atZero', label: 'Value at Zero', description: 'f(0)' },
    { value: 'smoothness', label: 'Smoothness', description: 'Derivative consistency' },
    { value: 'maxDeriv', label: 'Max Derivative', description: 'Steepest slope' },
    { value: 'symmetry', label: 'Symmetry', description: 'Odd/even balance' },
    { value: 'boundedness', label: 'Boundedness', description: 'Output range limitation' },
    { value: 'saturation', label: 'Saturation', description: 'Tendency to flatten' },
    { value: 'curvature', label: 'Curvature', description: 'Second derivative behavior' },
    { value: 'spread', label: 'Spread', description: 'Output variance' },
];

// ============================================================================
// Utility Functions
// ============================================================================

export function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

export function clamp(x: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, x));
}

export function formatNum(x: number): string {
    if (!Number.isFinite(x)) return 'NaN';
    const ax = Math.abs(x);
    if (ax >= 1000 || (ax > 0 && ax < 1e-3)) return x.toExponential(3);
    return x.toFixed(4);
}

// ============================================================================
// Core Mathematical Functions
// ============================================================================

export function sigmoid(z: number): number {
    if (z >= 0) {
        const e = Math.exp(-z);
        return 1 / (1 + e);
    } else {
        const e = Math.exp(z);
        return e / (1 + e);
    }
}

export function softplus(z: number): number {
    if (z > 30) return z;
    if (z < -30) return Math.exp(z);
    return Math.log(1 + Math.exp(z));
}

export function relu(x: number): number {
    return Math.max(0, x);
}

// ============================================================================
// Activation Function Implementations
// ============================================================================

// Classic family
function leakyRelu(x: number, a: number): number {
    return x >= 0 ? x : a * x;
}

function elu(x: number, a: number): number {
    return x >= 0 ? x : a * (Math.exp(x) - 1);
}

function selu(x: number): number {
    const lambda = 1.0507009873554804934193349852946;
    const alpha = 1.6732632423543772848170429916717;
    return x >= 0 ? lambda * x : lambda * alpha * (Math.exp(x) - 1);
}

function celu(x: number, a: number): number {
    return x >= 0 ? x : a * (Math.exp(x / a) - 1);
}

// Smooth modern family
function geluApprox(x: number): number {
    const c = Math.sqrt(2 / Math.PI);
    return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
}

function geluSigmoid(x: number): number {
    return x * sigmoid(1.702 * x);
}

function swish(x: number, beta: number): number {
    return x * sigmoid(beta * x);
}

function mish(x: number): number {
    return x * Math.tanh(softplus(x));
}

function logish(x: number): number {
    return x * Math.log(1 + sigmoid(x));
}

// Hard variants
function hardSwish(x: number): number {
    if (x <= -3) return 0;
    if (x >= 3) return x;
    return x * (x + 3) / 6;
}

function hardSigmoid(z: number): number {
    return clamp(0.2 * z + 0.5, 0, 1);
}

function hardTanh(x: number): number {
    return clamp(x, -1, 1);
}

// Bounded family
function softsign(x: number): number {
    return x / (1 + Math.abs(x));
}

function arctan(x: number): number {
    return Math.atan(x);
}

function sqnl(x: number): number {
    if (x > 2) return 1;
    if (x >= 0) return x - x * x / 4;
    if (x >= -2) return x + x * x / 4;
    return -1;
}

// Soft family
function softmax1d(x: number): number {
    // For 1D, softmax is just sigmoid-like normalization
    return Math.exp(x) / (1 + Math.exp(x));
}

// Parametric & Adaptive
function rrelu(x: number, lower: number, upper: number): number {
    if (x >= 0) return x;
    // Use midpoint for deterministic visualization (training would use random)
    const a = (lower + upper) / 2;
    return a * x;
}

function thresholdedRelu(x: number, theta: number): number {
    return x > theta ? x : 0;
}

function isru(x: number, a: number): number {
    return x / Math.sqrt(1 + a * x * x);
}

function isrlu(x: number, a: number): number {
    return x >= 0 ? x : x / Math.sqrt(1 + a * x * x);
}

function plu(x: number, a: number, c: number): number {
    return Math.max(a * (x + c) - c, Math.min(a * (x - c) + c, x));
}

function apl(x: number, a: number, b: number): number {
    // Adaptive Piecewise Linear: sum of hinged linear pieces
    return relu(x) + a * relu(-x + b);
}

// Exponential family
function exponential(x: number): number {
    return Math.exp(x);
}

function pelu(x: number, a: number, b: number): number {
    return x >= 0 ? (a / b) * x : a * (Math.exp(x / b) - 1);
}

// Oscillating & Periodic
function sinc(x: number): number {
    if (Math.abs(x) < 1e-8) return 1;
    return Math.sin(x) / x;
}

function gaussian(x: number): number {
    return Math.exp(-x * x);
}

function gcu(x: number): number {
    // Growing Cosine Unit
    return x * Math.cos(x);
}

// Polynomial-like
function bentIdentity(x: number): number {
    return (Math.sqrt(x * x + 1) - 1) / 2 + x;
}

function softExponential(x: number, a: number): number {
    if (a < 0) return -Math.log(1 - a * (x + a)) / a;
    if (a === 0) return x;
    return (Math.exp(a * x) - 1) / a + a;
}

function sqrbf(x: number): number {
    // Square Radial Basis Function
    if (Math.abs(x) <= 1) return 1 - x * x;
    return 0;
}

// Hybrid & Modern
function elish(x: number): number {
    return x >= 0 ? x * sigmoid(x) : (Math.exp(x) - 1) * sigmoid(x);
}

function hardElish(x: number): number {
    if (x >= 0) return x * Math.max(0, Math.min(1, (x + 1) / 2));
    return (Math.exp(x) - 1) * Math.max(0, Math.min(1, (x + 1) / 2));
}

function seagull(x: number): number {
    return Math.log(1 + x * x);
}

function phish(x: number): number {
    return x * Math.tanh(geluApprox(x));
}

function tanhExp(x: number): number {
    return x * Math.tanh(Math.exp(x));
}

function aria2(x: number, a: number, b: number): number {
    return Math.pow(1 + Math.exp(-b * x), -a);
}

function maxMin(x: number): number {
    // Absolute value activation: |x| = max(x, -x)
    return Math.abs(x);
}

function lisht(x: number): number {
    return x * Math.tanh(x);
}

function relu6(x: number): number {
    return Math.min(Math.max(0, x), 6);
}

function srelu(x: number, tl: number, tr: number, al: number, ar: number): number {
    if (x <= tl) return tl + al * (x - tl);
    if (x >= tr) return tr + ar * (x - tr);
    return x;
}

function brelu(x: number): number {
    // Bipolar ReLU
    return relu(x) - relu(-x);
}

function crelu(x: number): [number, number] {
    // Concatenated ReLU: [relu(x), relu(-x)] - doubles dimensionality
    // For scalar visualization, we show the sum which equals |x|
    return [relu(x), relu(-x)];
}

function reluN(x: number, n: number): number {
    return Math.min(relu(x), n);
}

function squaredRelu(x: number): number {
    const r = relu(x);
    return r * r;
}

function starRelu(x: number, s: number, b: number): number {
    const r = relu(x);
    return s * r * r + b * r;
}

function shiftedSoftplus(x: number): number {
    return softplus(x) - Math.log(2);
}

function smish(x: number): number {
    return x * Math.tanh(Math.log(1 + sigmoid(x)));
}

function logSigmoid(x: number): number {
    return Math.log(sigmoid(x));
}

function tanhShrink(x: number): number {
    return x - Math.tanh(x);
}

function softShrink(x: number, lambda: number): number {
    if (x > lambda) return x - lambda;
    if (x < -lambda) return x + lambda;
    return 0;
}

function hardShrink(x: number, lambda: number): number {
    if (Math.abs(x) > lambda) return x;
    return 0;
}

function snake(x: number, a: number): number {
    return x + (1 - Math.cos(2 * a * x)) / (2 * a);
}

// ============================================================================
// Gate Functions
// ============================================================================

export function gateFn(x: number, gate: GateType, beta: number, b: number): number {
    const z = beta * x + b;
    switch (gate) {
        case 'sigmoid':
            return sigmoid(z);
        case 'hard_sigmoid':
            return hardSigmoid(z);
        case 'tanh':
            return 0.5 * (Math.tanh(z) + 1);
        case 'softplus':
            return 1 - Math.exp(-softplus(z));
        case 'step':
            return z >= 0 ? 1 : 0;
        case 'none':
        default:
            return 1;
    }
}

// ============================================================================
// Built-in Activation Evaluation
// ============================================================================

export function builtinEval(type: BuiltinType, x: number, s: Spec): number {
    const a = s.alpha;
    const beta = s.beta;
    const tau = s.tau;
    const b = s.b;

    switch (type) {
        // Classic
        case 'ReLU':
            return relu(x);
        case 'LeakyReLU':
            return leakyRelu(x, a);
        case 'PReLU':
            return relu(x) + a * Math.min(0, x);
        case 'ELU':
            return elu(x, a);
        case 'SELU':
            return selu(x);
        case 'CELU':
            return celu(x, Math.max(0.01, a));

        // Smooth Modern
        case 'GELU':
            return geluApprox(x);
        case 'GELU_tanh':
            return geluApprox(x);
        case 'GELU_sigmoid':
            return geluSigmoid(x);
        case 'Swish':
            return swish(x, beta);
        case 'SiLU':
            return swish(x, 1);
        case 'Mish':
            return mish(x);
        case 'Logish':
            return logish(x);

        // Hard Variants
        case 'HardSwish':
            return hardSwish(x);
        case 'HardSigmoid':
            return hardSigmoid(x);
        case 'HardTanh':
            return hardTanh(x);

        // Bounded
        case 'Tanh':
            return Math.tanh(x);
        case 'Sigmoid':
            return sigmoid(x);
        case 'Softsign':
            return softsign(x);
        case 'ArcTan':
            return arctan(x);
        case 'SQNL':
            return sqnl(x);

        // Soft
        case 'Softplus':
            return softplus(x);
        case 'Softmax1D':
            return softmax1d(x);

        // Parametric & Adaptive
        case 'RReLU':
            return rrelu(x, a * 0.5, a * 1.5);
        case 'ThresholdedReLU':
            return thresholdedRelu(x, tau);
        case 'ISRU':
            return isru(x, Math.max(0.01, a));
        case 'ISRLU':
            return isrlu(x, Math.max(0.01, a));
        case 'PLU':
            return plu(x, a, tau);
        case 'APL':
            return apl(x, a, tau);

        // Exponential Family
        case 'Exponential':
            return exponential(clamp(x, -10, 10));
        case 'PELU':
            return pelu(x, Math.max(0.01, a), Math.max(0.01, beta));

        // Oscillating & Periodic
        case 'Sinc':
            return sinc(x);
        case 'Sin':
            return Math.sin(x);
        case 'Gaussian':
            return gaussian(x);
        case 'GCU':
            return gcu(x);

        // Polynomial-like
        case 'BentIdentity':
            return bentIdentity(x);
        case 'SoftExponential':
            return softExponential(x, clamp(a, -0.99, 10));
        case 'SQRBF':
            return sqrbf(x);

        // Hybrid & Modern
        case 'ELiSH':
            return elish(x);
        case 'HardELiSH':
            return hardElish(x);
        case 'Seagull':
            return seagull(x);
        case 'Phish':
            return phish(x);
        case 'TanhExp':
            return tanhExp(clamp(x, -5, 5));
        case 'Aria2':
            return aria2(x, Math.max(0.1, a), Math.max(0.1, beta));
        case 'MaxMin':
            return maxMin(x);
        case 'LiSHT':
            return lisht(x);
        case 'ReLU6':
            return relu6(x);
        case 'SReLU':
            return srelu(x, -tau, tau, a, a);
        case 'BReLU':
            return brelu(x);
        case 'CReLU':
            const [p, n] = crelu(x);
            return p + n;
        case 'ReLUN':
            return reluN(x, Math.max(1, beta));
        case 'SquaredReLU':
            return squaredRelu(x);
        case 'StarReLU':
            return starRelu(x, a, b);
        case 'ShiftedSoftplus':
            return shiftedSoftplus(x);
        case 'Smish':
            return smish(x);
        case 'LogSigmoid':
            return logSigmoid(x);
        case 'TanhShrink':
            return tanhShrink(x);
        case 'SoftShrink':
            return softShrink(x, Math.max(0.01, tau));
        case 'HardShrink':
            return hardShrink(x, Math.max(0.01, tau));
        case 'Snake':
            return snake(x, Math.max(0.01, a));

        default:
            return relu(x);
    }
}

// ============================================================================
// Composer Evaluation
// ============================================================================

export function composerEval(x: number, s: Spec): number {
    const baseType = (s.base ?? 'ReLU') as BuiltinType;
    let y = builtinEval(baseType, x, s);

    // gate multiplies everything
    const g = gateFn(x - s.tau, s.gate ?? 'none', s.beta, s.b);
    y = g * y;

    // separate scaling for pos/neg parts
    const pos = Math.max(0, y) * s.posScale;
    const neg = Math.min(0, y) * s.negScale;
    return pos + neg;
}

// ============================================================================
// Expression Parser
// ============================================================================

type TokType = 'num' | 'id' | 'op' | 'lpar' | 'rpar' | 'comma' | 'eof';

interface Tok {
    t: TokType;
    v?: string;
    n?: number;
}

type TokenizeResult = { ok: true; toks: Tok[] } | { ok: false; err: string };

function tokenizeExpr(input: string): TokenizeResult {
    if (/[;=]/.test(input)) {
        return { ok: false, err: "Expression cannot contain ';' or '='." };
    }

    const s = input.trim();
    const toks: Tok[] = [];
    let i = 0;

    const isWS = (c: string) => c === ' ' || c === '\n' || c === '\t' || c === '\r';
    const isDigit = (c: string) => c >= '0' && c <= '9';
    const isAlpha = (c: string) =>
        (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';

    while (i < s.length) {
        const c = s[i];

        if (isWS(c)) {
            i++;
            continue;
        }

        if (c === '(') {
            toks.push({ t: 'lpar' });
            i++;
            continue;
        }
        if (c === ')') {
            toks.push({ t: 'rpar' });
            i++;
            continue;
        }
        if (c === ',') {
            toks.push({ t: 'comma' });
            i++;
            continue;
        }

        if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^') {
            toks.push({ t: 'op', v: c });
            i++;
            continue;
        }

        if (isDigit(c) || c === '.') {
            let j = i;
            let sawDot = c === '.';

            if (c === '.') {
                if (i + 1 >= s.length || !isDigit(s[i + 1])) {
                    return { ok: false, err: `Invalid number near position ${i}.` };
                }
            }

            j++;
            while (j < s.length) {
                const cj = s[j];
                if (isDigit(cj)) {
                    j++;
                    continue;
                }
                if (cj === '.') {
                    if (sawDot) break;
                    sawDot = true;
                    j++;
                    continue;
                }
                break;
            }

            if (j < s.length && (s[j] === 'e' || s[j] === 'E')) {
                let k = j + 1;
                if (k < s.length && (s[k] === '+' || s[k] === '-')) k++;
                if (k >= s.length || !isDigit(s[k])) {
                    return { ok: false, err: `Invalid exponent near position ${j}.` };
                }
                while (k < s.length && isDigit(s[k])) k++;
                j = k;
            }

            const raw = s.slice(i, j);
            const num = Number(raw);
            if (!Number.isFinite(num)) {
                return { ok: false, err: `Invalid number '${raw}'.` };
            }
            toks.push({ t: 'num', n: num });
            i = j;
            continue;
        }

        if (isAlpha(c)) {
            let j = i + 1;
            while (j < s.length && (isAlpha(s[j]) || isDigit(s[j]))) j++;
            const id = s.slice(i, j);
            toks.push({ t: 'id', v: id });
            i = j;
            continue;
        }

        return { ok: false, err: `Unexpected character '${c}' at position ${i}.` };
    }

    toks.push({ t: 'eof' });
    return { ok: true, toks };
}

type AST =
    | { k: 'num'; n: number }
    | { k: 'var' }
    | { k: 'const'; name: 'pi' | 'e' }
    | { k: 'un'; op: '+' | '-'; a: AST }
    | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: AST; b: AST }
    | { k: 'call'; fn: string; args: AST[] };

type ParseResult = { ok: true; ast: AST } | { ok: false; err: string };

function parseExpr(toks: Tok[]): ParseResult {
    let p = 0;
    const peek = () => toks[p];
    const eat = (tt: TokType, vv?: string) => {
        const tk = toks[p];
        if (tk.t !== tt) return false;
        if (vv != null && tk.v !== vv) return false;
        p++;
        return true;
    };

    const expect = (tt: TokType, vv?: string) => {
        const tk = toks[p];
        if (!eat(tt, vv)) {
            const got = tk.t + (tk.v ? `('${tk.v}')` : '');
            const need = tt + (vv ? `('${vv}')` : '');
            throw new Error(`Expected ${need}, got ${got}.`);
        }
    };

    function primary(): AST {
        const tk = peek();
        if (eat('num')) return { k: 'num', n: tk.n as number };

        if (eat('id')) {
            const name = (tk.v as string) || '';
            if (name === 'x') return { k: 'var' };
            if (name === 'pi' || name === 'PI') return { k: 'const', name: 'pi' };
            if (name === 'e' || name === 'E') return { k: 'const', name: 'e' };

            if (eat('lpar')) {
                const args: AST[] = [];
                if (!eat('rpar')) {
                    args.push(expr());
                    while (eat('comma')) {
                        args.push(expr());
                    }
                    expect('rpar');
                }
                return { k: 'call', fn: name, args };
            }

            throw new Error(`Unknown identifier '${name}'. Use x, pi, e, or a function call.`);
        }

        if (eat('lpar')) {
            const a = expr();
            expect('rpar');
            return a;
        }

        throw new Error('Unexpected token while parsing expression.');
    }

    function unary(): AST {
        const tk = peek();
        if (tk.t === 'op' && (tk.v === '+' || tk.v === '-')) {
            p++;
            const a = unary();
            return { k: 'un', op: tk.v as '+' | '-', a };
        }
        return primary();
    }

    function power(): AST {
        let a = unary();
        const tk = peek();
        if (tk.t === 'op' && tk.v === '^') {
            p++;
            const b = power();
            a = { k: 'bin', op: '^', a, b };
        }
        return a;
    }

    function term(): AST {
        let a = power();
        while (true) {
            const tk = peek();
            if (tk.t === 'op' && (tk.v === '*' || tk.v === '/')) {
                p++;
                const b = power();
                a = { k: 'bin', op: tk.v as '*' | '/', a, b };
            } else {
                break;
            }
        }
        return a;
    }

    function expr(): AST {
        let a = term();
        while (true) {
            const tk = peek();
            if (tk.t === 'op' && (tk.v === '+' || tk.v === '-')) {
                p++;
                const b = term();
                a = { k: 'bin', op: tk.v as '+' | '-', a, b };
            } else {
                break;
            }
        }
        return a;
    }

    try {
        const ast = expr();
        expect('eof');
        return { ok: true, ast };
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to parse expression.';
        return { ok: false, err: message };
    }
}

type Fn1 = (x: number) => number;

export type CompileResult = { ok: true; f: Fn1 } | { ok: false; err: string };

export function compileExpression(expr: string): CompileResult {
    const t = tokenizeExpr(expr);
    if (!t.ok) return { ok: false, err: t.err };
    const parsed = parseExpr(t.toks);
    if (!parsed.ok) return { ok: false, err: parsed.err };

    const funcs: Record<string, (...args: number[]) => number> = {
        abs: (v) => Math.abs(v),
        max: (...vs) => Math.max(...vs),
        min: (...vs) => Math.min(...vs),
        exp: (v) => Math.exp(v),
        log: (v) => Math.log(Math.max(v, 1e-12)),
        sqrt: (v) => Math.sqrt(Math.max(v, 0)),
        pow: (a, b) => Math.pow(a, b),
        sin: (v) => Math.sin(v),
        cos: (v) => Math.cos(v),
        tanh: (v) => Math.tanh(v),
        sign: (v) => Math.sign(v),

        relu: (v) => relu(v),
        sigmoid: (v) => sigmoid(v),
        softplus: (v) => softplus(v),
        gelu: (v) => geluApprox(v),
        swish: (v, b = 1) => swish(v, b),
        mish: (v) => mish(v),
        step: (v) => (v >= 0 ? 1 : 0),
        elu: (v, a = 1) => elu(v, a),
        selu: (v) => selu(v),
        softsign: (v) => softsign(v),
        sinc: (v) => sinc(v),
        gaussian: (v) => gaussian(v),
    };

    function evalAST(node: AST, x: number): number {
        switch (node.k) {
            case 'num':
                return node.n;
            case 'var':
                return x;
            case 'const':
                return node.name === 'pi' ? Math.PI : Math.E;
            case 'un': {
                const a = evalAST(node.a, x);
                return node.op === '-' ? -a : a;
            }
            case 'bin': {
                const a = evalAST(node.a, x);
                const b = evalAST(node.b, x);
                switch (node.op) {
                    case '+':
                        return a + b;
                    case '-':
                        return a - b;
                    case '*':
                        return a * b;
                    case '/':
                        return a / b;
                    case '^':
                        return Math.pow(a, b);
                }
                return NaN;
            }
            case 'call': {
                const fn = funcs[node.fn];
                if (!fn) throw new Error(`Unknown function '${node.fn}'.`);
                const args = node.args.map((arg) => evalAST(arg, x));
                return fn(...args);
            }
        }
    }

    return {
        ok: true,
        f: (x: number) => {
            try {
                const y = evalAST(parsed.ast, x);
                return Number.isFinite(y) ? y : NaN;
            } catch {
                return NaN;
            }
        },
    };
}

// ============================================================================
// Spec Evaluation
// ============================================================================

export type BuiltSpecEval = { ok: true; f: Fn1; err?: string } | { ok: false; f: Fn1; err: string };

export function buildSpecEvaluator(s: Spec): BuiltSpecEval {
    if (s.kind === 'builtin') {
        return { ok: true, f: (x) => builtinEval(s.builtinType ?? 'ReLU', x, s), err: '' };
    }
    if (s.kind === 'composer') {
        return { ok: true, f: (x) => composerEval(x, s), err: '' };
    }
    const expr = (s.expr ?? 'relu(x)').trim();
    const c = compileExpression(expr);
    if (!c.ok) return { ok: false, f: () => NaN, err: c.err };
    return { ok: true, f: c.f, err: '' };
}

// ============================================================================
// Analysis Functions
// ============================================================================

export function numericDerivative(f: (x: number) => number, x: number, h: number): number {
    const y1 = f(x + h);
    const y0 = f(x - h);
    if (!Number.isFinite(y1) || !Number.isFinite(y0)) return NaN;
    return (y1 - y0) / (2 * h);
}

export function checkStats(xs: number[], ys: number[], dys: number[]): Stats {
    const n = xs.length;
    const finiteIdx = ys
        .map((v, i) => (Number.isFinite(v) && Number.isFinite(dys[i]) ? i : -1))
        .filter((i) => i >= 0);

    if (finiteIdx.length < 10) {
        return {
            ok: false,
            err: 'Too many NaN/Inf values in the sampled range.',
        };
    }

    let maxAbsY = 0;
    let maxAbsDy = 0;
    let monotoneNondecreasing = true;
    let deadFrac = 0;
    let oddErr = 0;
    let evenErr = 0;

    const yMap = new Map<number, number>();
    for (let i = 0; i < n; i++) yMap.set(xs[i], ys[i]);

    for (let k = 0; k < finiteIdx.length; k++) {
        const i = finiteIdx[k];
        const y = ys[i];
        const dy = dys[i];
        maxAbsY = Math.max(maxAbsY, Math.abs(y));
        maxAbsDy = Math.max(maxAbsDy, Math.abs(dy));
        if (Math.abs(dy) < 1e-3) deadFrac += 1;

        if (k > 0) {
            const j = finiteIdx[k - 1];
            if (ys[i] + 1e-6 < ys[j]) monotoneNondecreasing = false;
        }

        const x = xs[i];
        const yNeg = yMap.get(-x);
        if (typeof yNeg === 'number' && Number.isFinite(yNeg)) {
            oddErr += Math.abs(y + yNeg);
            evenErr += Math.abs(y - yNeg);
        }
    }

    deadFrac /= finiteIdx.length;
    const oddness = oddErr / finiteIdx.length;
    const evenness = evenErr / finiteIdx.length;

    return {
        ok: true,
        maxAbsY,
        maxAbsDy,
        monotoneNondecreasing,
        deadFrac,
        oddness,
        evenness,
    };
}

// ============================================================================
// Landscape Computation
// ============================================================================

/**
 * Compute rich dimensional features for an activation function.
 * Returns a record of named dimensions for flexible projection.
 */
export function computeDimensions(f: (x: number) => number): Record<LandscapeDimension, number> {
    const samples = [-4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4];
    const h = 0.01;

    const values = samples.map((x) => {
        const y = f(x);
        return Number.isFinite(y) ? clamp(y, -20, 20) : 0;
    });

    const derivs = samples.map((x) => {
        const d = (f(x + h) - f(x - h)) / (2 * h);
        return Number.isFinite(d) ? clamp(d, -20, 20) : 0;
    });

    const secondDerivs = samples.map((x) => {
        const d2 = (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
        return Number.isFinite(d2) ? clamp(d2, -50, 50) : 0;
    });

    // Negative region behavior (average of f(x) for x < 0)
    const negValues = values.slice(0, 5);
    const negRegion = negValues.reduce((a, b) => a + b, 0) / negValues.length;

    // Positive region behavior (average of f(x) for x > 0)
    const posValues = values.slice(6);
    const posRegion = posValues.reduce((a, b) => a + b, 0) / posValues.length;

    // Value at zero
    const atZero = values[5];

    // Smoothness: inverse of derivative variance (higher = smoother)
    const derivMean = derivs.reduce((a, b) => a + b, 0) / derivs.length;
    const derivVar = derivs.reduce((a, b) => a + (b - derivMean) ** 2, 0) / derivs.length;
    const smoothness = 1 / (1 + Math.sqrt(derivVar));

    // Max derivative (steepness)
    const maxDeriv = Math.max(...derivs.map(Math.abs));

    // Symmetry: how odd vs even the function is
    // odd: f(-x) = -f(x), even: f(-x) = f(x)
    let oddScore = 0;
    let evenScore = 0;
    for (let i = 0; i < 5; i++) {
        const pos = values[10 - i]; // positive x
        const neg = values[i]; // negative x
        oddScore += Math.abs(pos + neg); // should be 0 for odd
        evenScore += Math.abs(pos - neg); // should be 0 for even
    }
    // Lower score means more symmetric; invert for visualization
    const symmetry = evenScore / (oddScore + 0.01); // > 1 means more odd-like

    // Boundedness: how much the output is constrained
    const range = Math.max(...values) - Math.min(...values);
    const boundedness = 1 / (1 + range * 0.2);

    // Saturation: derivative drops near extremes
    const edgeDerivs = [derivs[0], derivs[1], derivs[9], derivs[10]];
    const centerDerivs = [derivs[4], derivs[5], derivs[6]];
    const edgeAvg = edgeDerivs.reduce((a, b) => a + Math.abs(b), 0) / edgeDerivs.length;
    const centerAvg = centerDerivs.reduce((a, b) => a + Math.abs(b), 0) / centerDerivs.length;
    const saturation = centerAvg / (edgeAvg + 0.01);

    // Curvature: average absolute second derivative
    const curvature = secondDerivs.reduce((a, b) => a + Math.abs(b), 0) / secondDerivs.length;

    // Spread: variance of output values
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const spread = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);

    return {
        negRegion: clamp(negRegion, -5, 5),
        posRegion: clamp(posRegion, -2, 10),
        atZero: clamp(atZero, -2, 2),
        smoothness: clamp(smoothness, 0, 1),
        maxDeriv: clamp(maxDeriv, 0, 5),
        symmetry: clamp(Math.log(symmetry + 0.1), -2, 3),
        boundedness: clamp(boundedness, 0, 1),
        saturation: clamp(Math.log(saturation + 0.1), -1, 3),
        curvature: clamp(curvature * 0.1, 0, 3),
        spread: clamp(spread, 0, 5),
    };
}

/**
 * Compute 3D landscape positions for all activations with selectable dimensions.
 */
export function computeLandscape(
    currentSpec: Spec,
    overlaySpecs: Spec[],
    xDim: LandscapeDimension = 'posRegion',
    yDim: LandscapeDimension = 'smoothness',
    zDim: LandscapeDimension = 'negRegion'
): LandscapePoint[] {
    const points: LandscapePoint[] = [];
    const items: { name: string; dims: Record<LandscapeDimension, number>; category: string; isCurrent?: boolean; isOverlay?: boolean }[] = [];

    // Compute dimensions for all built-in functions
    const defaultSpecForBuiltin = defaultSpec();
    for (const name of BUILTINS) {
        const spec = { ...defaultSpecForBuiltin, builtinType: name };
        const ev = buildSpecEvaluator(spec);
        if (ev.ok) {
            const dims = computeDimensions(ev.f);
            const meta = ACTIVATION_META.find((m) => m.name === name);
            items.push({
                name,
                dims,
                category: meta?.category ?? 'Other',
            });
        }
    }

    // Add current spec
    const currentEv = buildSpecEvaluator(currentSpec);
    if (currentEv.ok) {
        const dims = computeDimensions(currentEv.f);
        items.push({
            name: currentSpec.name,
            dims,
            category: 'Current',
            isCurrent: true,
        });
    }

    // Add overlays
    for (const overlay of overlaySpecs) {
        const ev = buildSpecEvaluator(overlay);
        if (ev.ok) {
            const dims = computeDimensions(ev.f);
            items.push({
                name: overlay.name,
                dims,
                category: 'Overlay',
                isOverlay: true,
            });
        }
    }

    if (items.length === 0) return [];

    // Normalize dimensions for visualization
    const allX = items.map((it) => it.dims[xDim]);
    const allY = items.map((it) => it.dims[yDim]);
    const allZ = items.map((it) => it.dims[zDim]);

    const normalize = (values: number[]) => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        return values.map((v) => (v - min) / range);
    };

    const normX = normalize(allX);
    const normY = normalize(allY);
    const normZ = normalize(allZ);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        points.push({
            name: item.name,
            x: normX[i] * 10,
            y: normY[i] * 6,
            z: normZ[i],
            category: item.category,
            isCurrent: item.isCurrent,
            isOverlay: item.isOverlay,
            dimensions: item.dims,
        });
    }

    return points;
}

// ============================================================================
// Formula Display
// ============================================================================

export function prettyFormula(s: Spec): string {
    const a = formatNum(s.alpha);
    const beta = formatNum(s.beta);
    const tau = formatNum(s.tau);
    const b = formatNum(s.b);

    if (s.kind === 'builtin') {
        const t = s.builtinType ?? 'ReLU';
        const meta = ACTIVATION_META.find((m) => m.name === t);
        const fullName = meta?.description ?? t;

        if (t === 'LeakyReLU') return `${fullName}: max(0,x) + α·min(0,x)   (α=${a})`;
        if (t === 'PReLU') return `${fullName}: max(0,x) + α·min(0,x)   (α=${a})`;
        if (t === 'Swish') return `${fullName}: x·σ(β·x)   (β=${beta})`;
        if (t === 'ELU') return `${fullName}: x if x≥0 else α·(eˣ-1)   (α=${a})`;
        if (t === 'Snake') return `${fullName}: x + sin²(α·x)/α   (α=${a})`;
        return `${fullName} — ${t}(x)`;
    }

    if (s.kind === 'composer') {
        const base = s.base ?? 'ReLU';
        const gate = s.gate ?? 'none';
        const g = gate === 'none' ? '1' : `${gate}(β·(x-τ)+b)`;
        const post = `pos=${formatNum(s.posScale)}, neg=${formatNum(s.negScale)}`;
        return `Composer: ${g} · ${base}(x)   (β=${beta}, τ=${tau}, b=${b}, ${post})`;
    }

    return `Expression: ${s.expr ?? 'relu(x)'}`;
}

// ============================================================================
// Default Spec
// ============================================================================

export function defaultSpec(): Spec {
    return {
        id: uid(),
        name: 'GELU',
        kind: 'builtin',
        builtinType: 'GELU',

        alpha: 0.2,
        beta: 1,
        tau: 0.5,
        b: 0,
        posScale: 1,
        negScale: 1,

        base: 'ReLU',
        gate: 'none',

        expr: 'x * sigmoid(x)',
    };
}

// ============================================================================
// Constants & Metadata
// ============================================================================

export const BUILTINS: BuiltinType[] = [
    // Classic
    'ReLU',
    'LeakyReLU',
    'PReLU',
    'ELU',
    'SELU',
    'CELU',
    // Smooth Modern
    'GELU',
    'GELU_tanh',
    'GELU_sigmoid',
    'Swish',
    'SiLU',
    'Mish',
    'Logish',
    // Hard Variants
    'HardSwish',
    'HardSigmoid',
    'HardTanh',
    // Bounded
    'Tanh',
    'Sigmoid',
    'Softsign',
    'ArcTan',
    'SQNL',
    // Soft
    'Softplus',
    'Softmax1D',
    // Parametric & Adaptive
    'RReLU',
    'ThresholdedReLU',
    'ISRU',
    'ISRLU',
    'PLU',
    'APL',
    // Exponential Family
    'Exponential',
    'PELU',
    // Oscillating & Periodic
    'Sinc',
    'Sin',
    'Gaussian',
    'GCU',
    // Polynomial-like
    'BentIdentity',
    'SoftExponential',
    'SQRBF',
    // Hybrid & Modern
    'ELiSH',
    'HardELiSH',
    'Seagull',
    'Phish',
    'TanhExp',
    'Aria2',
    'MaxMin',
    'LiSHT',
    'ReLU6',
    'SReLU',
    'BReLU',
    'CReLU',
    'ReLUN',
    'SquaredReLU',
    'StarReLU',
    'ShiftedSoftplus',
    'Smish',
    'LogSigmoid',
    'TanhShrink',
    'SoftShrink',
    'HardShrink',
    'Snake',
];

export const ACTIVATION_META: ActivationMeta[] = [
    // Classic
    { name: 'ReLU', category: 'Classic', description: 'Rectified Linear Unit', year: 2010, paper: 'Nair & Hinton', arxiv: '1803.08375' },
    { name: 'LeakyReLU', category: 'Classic', description: 'Leaky ReLU with small negative slope', year: 2013, paper: 'Maas et al.' },
    { name: 'PReLU', category: 'Classic', description: 'Parametric ReLU with learnable slope', year: 2015, paper: 'He et al.', arxiv: '1502.01852' },
    { name: 'ELU', category: 'Classic', description: 'Exponential Linear Unit', year: 2015, paper: 'Clevert et al.', arxiv: '1511.07289' },
    { name: 'SELU', category: 'Classic', description: 'Scaled ELU for self-normalizing networks', year: 2017, paper: 'Klambauer et al.', arxiv: '1706.02515' },
    { name: 'CELU', category: 'Classic', description: 'Continuously differentiable ELU', year: 2017, paper: 'Barron', arxiv: '1704.07483' },

    // Smooth Modern
    { name: 'GELU', category: 'Smooth', description: 'Gaussian Error Linear Unit', year: 2016, paper: 'Hendrycks & Gimpel', arxiv: '1606.08415' },
    { name: 'GELU_tanh', category: 'Smooth', description: 'GELU with tanh approximation', year: 2016, paper: 'Hendrycks & Gimpel', arxiv: '1606.08415' },
    { name: 'GELU_sigmoid', category: 'Smooth', description: 'GELU with sigmoid approximation', year: 2016, paper: 'Hendrycks & Gimpel', arxiv: '1606.08415' },
    { name: 'Swish', category: 'Smooth', description: 'Self-gated activation x*sigmoid(bx)', year: 2017, paper: 'Ramachandran et al.', arxiv: '1710.05941' },
    { name: 'SiLU', category: 'Smooth', description: 'Sigmoid Linear Unit (Swish with b=1)', year: 2017, paper: 'Elfwing et al.', arxiv: '1702.03118' },
    { name: 'Mish', category: 'Smooth', description: 'x*tanh(softplus(x))', year: 2019, paper: 'Misra', arxiv: '1908.08681' },
    { name: 'Logish', category: 'Smooth', description: 'x*log(1+sigmoid(x))', year: 2020 },

    // Hard Variants
    { name: 'HardSwish', category: 'Hard', description: 'Piecewise linear Swish approximation', year: 2019, paper: 'Howard et al.', arxiv: '1905.02244' },
    { name: 'HardSigmoid', category: 'Hard', description: 'Piecewise linear sigmoid', year: 2016 },
    { name: 'HardTanh', category: 'Hard', description: 'Clipped tanh', year: 2010 },

    // Bounded
    { name: 'Tanh', category: 'Bounded', description: 'Hyperbolic tangent', year: 1986 },
    { name: 'Sigmoid', category: 'Bounded', description: 'Logistic function', year: 1986 },
    { name: 'Softsign', category: 'Bounded', description: 'x/(1+|x|)', year: 2009, paper: 'Bergstra et al.' },
    { name: 'ArcTan', category: 'Bounded', description: 'Inverse tangent', year: 2000 },
    { name: 'SQNL', category: 'Bounded', description: 'Square nonlinearity', year: 2017 },

    // Soft
    { name: 'Softplus', category: 'Soft', description: 'Smooth ReLU: log(1+exp(x))', year: 2001, paper: 'Dugas et al.' },
    { name: 'Softmax1D', category: 'Soft', description: '1D softmax (equivalent to sigmoid)', year: 1989 },

    // Parametric & Adaptive
    { name: 'RReLU', category: 'Parametric', description: 'Randomized Leaky ReLU (midpoint shown)', year: 2015, paper: 'Xu et al.', arxiv: '1505.00853' },
    { name: 'ThresholdedReLU', category: 'Parametric', description: 'ReLU with threshold', year: 2015 },
    { name: 'ISRU', category: 'Parametric', description: 'Inverse Square Root Unit', year: 2017, paper: 'Carlile et al.', arxiv: '1710.09967' },
    { name: 'ISRLU', category: 'Parametric', description: 'ISRU for negative, linear for positive', year: 2017, paper: 'Carlile et al.', arxiv: '1710.09967' },
    { name: 'PLU', category: 'Parametric', description: 'Piecewise Linear Unit', year: 2016 },
    { name: 'APL', category: 'Parametric', description: 'Adaptive Piecewise Linear', year: 2014, paper: 'Agostinelli et al.', arxiv: '1412.6830' },

    // Exponential Family
    { name: 'Exponential', category: 'Exponential', description: 'exp(x)', year: 1986 },
    { name: 'PELU', category: 'Exponential', description: 'Parametric Exponential LU', year: 2016, paper: 'Trottier et al.', arxiv: '1605.09332' },

    // Oscillating & Periodic
    { name: 'Sinc', category: 'Oscillating', description: 'sin(x)/x', year: 2018 },
    { name: 'Sin', category: 'Oscillating', description: 'Sine function', year: 2018, paper: 'Parascandolo et al.', arxiv: '1801.07145' },
    { name: 'Gaussian', category: 'Oscillating', description: 'exp(-x^2)', year: 1988 },
    { name: 'GCU', category: 'Oscillating', description: 'Growing Cosine Unit: x*cos(x)', year: 2021, paper: 'Noel et al.', arxiv: '2108.12943' },

    // Polynomial-like
    { name: 'BentIdentity', category: 'Polynomial', description: '(sqrt(x^2+1)-1)/2 + x', year: 2015 },
    { name: 'SoftExponential', category: 'Polynomial', description: 'Parameterized soft exponential', year: 2016, paper: 'Godfrey & Gashler' },
    { name: 'SQRBF', category: 'Polynomial', description: 'Square Radial Basis Function', year: 2010 },

    // Hybrid & Modern
    { name: 'ELiSH', category: 'Hybrid', description: 'ELU-Swish hybrid', year: 2018 },
    { name: 'HardELiSH', category: 'Hybrid', description: 'Hard version of ELiSH', year: 2018 },
    { name: 'Seagull', category: 'Hybrid', description: 'log(1+x^2)', year: 2020 },
    { name: 'Phish', category: 'Hybrid', description: 'x*tanh(gelu(x))', year: 2021 },
    { name: 'TanhExp', category: 'Hybrid', description: 'x*tanh(exp(x))', year: 2020, paper: 'Liu & Di' },
    { name: 'Aria2', category: 'Hybrid', description: 'Power-sigmoid hybrid', year: 2019 },
    { name: 'MaxMin', category: 'Hybrid', description: 'Absolute value |x|', year: 2016 },
    { name: 'LiSHT', category: 'Hybrid', description: 'x*tanh(x)', year: 2019, paper: 'Roy et al.', arxiv: '1901.05894' },
    { name: 'ReLU6', category: 'Hybrid', description: 'ReLU capped at 6', year: 2017, paper: 'Howard et al.' },
    { name: 'SReLU', category: 'Hybrid', description: 'S-shaped ReLU', year: 2015, paper: 'Jin et al.', arxiv: '1512.07030' },
    { name: 'BReLU', category: 'Hybrid', description: 'Bipolar ReLU', year: 2016 },
    { name: 'CReLU', category: 'Hybrid', description: 'Concatenated ReLU (sum projection)', year: 2016, paper: 'Shang et al.', arxiv: '1603.05201' },
    { name: 'ReLUN', category: 'Hybrid', description: 'ReLU capped at N', year: 2017 },
    { name: 'SquaredReLU', category: 'Hybrid', description: 'relu(x)^2', year: 2022, paper: 'So et al.' },
    { name: 'StarReLU', category: 'Hybrid', description: 's*relu(x)^2 + b*relu(x)', year: 2022, paper: 'Yu et al.', arxiv: '2210.13452' },
    { name: 'ShiftedSoftplus', category: 'Hybrid', description: 'softplus(x) - ln(2)', year: 2020 },
    { name: 'Smish', category: 'Hybrid', description: 'x*tanh(log(1+sigmoid(x)))', year: 2021 },
    { name: 'LogSigmoid', category: 'Hybrid', description: 'log(sigmoid(x))', year: 2010 },
    { name: 'TanhShrink', category: 'Shrink', description: 'x - tanh(x)', year: 2015 },
    { name: 'SoftShrink', category: 'Shrink', description: 'Soft shrinkage operator', year: 2010 },
    { name: 'HardShrink', category: 'Shrink', description: 'Hard shrinkage operator', year: 2010 },
    { name: 'Snake', category: 'Periodic', description: 'x + sin^2(ax)/a', year: 2020, paper: 'Ziyin et al.', arxiv: '2006.08195' },
];

export const GATES: { value: GateType; label: string }[] = [
    { value: 'none', label: 'none' },
    { value: 'sigmoid', label: 'sigmoid' },
    { value: 'hard_sigmoid', label: 'hard_sigmoid' },
    { value: 'tanh', label: 'tanh (scaled)' },
    { value: 'softplus', label: 'softplus-squash' },
    { value: 'step', label: 'step' },
];

export const CATEGORY_COLORS: Record<string, string> = {
    Classic: '#ef4444',
    Smooth: '#22c55e',
    Hard: '#f97316',
    Bounded: '#3b82f6',
    Soft: '#a855f7',
    Parametric: '#ec4899',
    Exponential: '#eab308',
    Oscillating: '#06b6d4',
    Polynomial: '#14b8a6',
    Hybrid: '#6366f1',
    Shrink: '#78716c',
    Periodic: '#0ea5e9',
    Current: '#84cc16',
    Overlay: '#f472b6',
    Other: '#71717a',
};
