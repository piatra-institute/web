// Hydride Anomaly — substance data, families, anomaly computation

export type Property = 'bp' | 'mp' | 'dhVap' | 'dhFus' | 'liquidRange';

export type Unit = 'C' | 'K';

export type FamilyId =
  | 'group16'
  | 'group17'
  | 'group15'
  | 'group14'
  | 'nobleGas'
  | 'alkane'
  | 'alcohol'
  | 'diatomic';

export type ViewMode = 'series' | 'scatter' | 'outlier' | 'phase';

export interface Substance {
  id: string;
  name: string;
  formula: string;
  molarMass: number;   // g/mol
  period: number;       // periodic table row of central atom (0 for non-hydride families)
  familyId: FamilyId;
  mpC: number;          // melting point °C at 1 atm
  bpC: number;          // boiling point °C at 1 atm
  dhVap: number;        // latent heat of vaporization kJ/mol
  dhFus: number;        // latent heat of fusion kJ/mol
  isAnomaly: boolean;   // period-2 hydrogen-bonding anomaly
  tags: string[];       // e.g. ['H-bond donor', 'polar']
}

export interface Family {
  id: FamilyId;
  label: string;
  shortLabel: string;
  color: string;
  pattern: string;      // e.g. "H₂E" or "HX"
}

export interface AnomalyResult {
  substance: Substance;
  property: Property;
  observed: number;
  predicted: number;
  residual: number;       // observed - predicted
  residualPct: number;    // (observed - predicted) / |predicted| * 100
}

// ── Families ─────────────────────────────────────────────────────

export const FAMILIES: Family[] = [
  { id: 'group16', label: 'Group 16 hydrides (H₂E)', shortLabel: 'H₂E', color: '#3b82f6', pattern: 'H₂O → H₂Te' },
  { id: 'group17', label: 'Group 17 hydrides (HX)', shortLabel: 'HX', color: '#ef4444', pattern: 'HF → HI' },
  { id: 'group15', label: 'Group 15 hydrides (EH₃)', shortLabel: 'EH₃', color: '#a855f7', pattern: 'NH₃ → SbH₃' },
  { id: 'group14', label: 'Group 14 hydrides (EH₄)', shortLabel: 'EH₄', color: '#f97316', pattern: 'CH₄ → SnH₄' },
  { id: 'nobleGas', label: 'Noble gases', shortLabel: 'Noble', color: '#6b7280', pattern: 'He → Xe' },
  { id: 'alkane', label: 'Alkanes (CₙH₂ₙ₊₂)', shortLabel: 'Alkane', color: '#14b8a6', pattern: 'CH₄ → C₈H₁₈' },
  { id: 'alcohol', label: 'Alcohols (CₙH₂ₙ₊₁OH)', shortLabel: 'Alcohol', color: '#ec4899', pattern: 'CH₃OH → C₄H₉OH' },
  { id: 'diatomic', label: 'Diatomic molecules', shortLabel: 'Diatomic', color: '#facc15', pattern: 'H₂ → I₂' },
];

export const FAMILY_MAP: Record<FamilyId, Family> = Object.fromEntries(
  FAMILIES.map((f) => [f.id, f]),
) as Record<FamilyId, Family>;

// ── Substance data ───────────────────────────────────────────────
// Values at 1 atm. Sources: CRC Handbook, NIST WebBook, standard references.

export const SUBSTANCES: Substance[] = [
  // Group 16 hydrides (H₂E)
  { id: 'h2o',  name: 'Water',             formula: 'H₂O',  molarMass: 18.015, period: 2, familyId: 'group16', mpC: 0,      bpC: 100,    dhVap: 40.65, dhFus: 6.01,  isAnomaly: true,  tags: ['H-bond donor', 'H-bond acceptor', 'polar'] },
  { id: 'h2s',  name: 'Hydrogen sulfide',  formula: 'H₂S',  molarMass: 34.08,  period: 3, familyId: 'group16', mpC: -85.5,  bpC: -60.3,  dhVap: 18.67, dhFus: 2.38,  isAnomaly: false, tags: ['polar'] },
  { id: 'h2se', name: 'Hydrogen selenide', formula: 'H₂Se', molarMass: 80.98,  period: 4, familyId: 'group16', mpC: -65.7,  bpC: -41.3,  dhVap: 19.7,  dhFus: 2.63,  isAnomaly: false, tags: ['polar'] },
  { id: 'h2te', name: 'Hydrogen telluride',formula: 'H₂Te', molarMass: 129.62, period: 5, familyId: 'group16', mpC: -49,    bpC: -2,     dhVap: 23.4,  dhFus: 4.0,   isAnomaly: false, tags: ['polar'] },

  // Group 17 hydrides (HX)
  { id: 'hf',   name: 'Hydrogen fluoride', formula: 'HF',   molarMass: 20.01,  period: 2, familyId: 'group17', mpC: -83.6,  bpC: 19.5,   dhVap: 7.49,  dhFus: 4.58,  isAnomaly: true,  tags: ['H-bond donor', 'polar'] },
  { id: 'hcl',  name: 'Hydrogen chloride', formula: 'HCl',  molarMass: 36.46,  period: 3, familyId: 'group17', mpC: -114.2, bpC: -85.1,  dhVap: 16.15, dhFus: 2.0,   isAnomaly: false, tags: ['polar'] },
  { id: 'hbr',  name: 'Hydrogen bromide',  formula: 'HBr',  molarMass: 80.91,  period: 4, familyId: 'group17', mpC: -86.8,  bpC: -66.8,  dhVap: 17.18, dhFus: 2.41,  isAnomaly: false, tags: ['polar'] },
  { id: 'hi',   name: 'Hydrogen iodide',   formula: 'HI',   molarMass: 127.91, period: 5, familyId: 'group17', mpC: -50.8,  bpC: -35.4,  dhVap: 19.76, dhFus: 2.87,  isAnomaly: false, tags: ['polar'] },

  // Group 15 hydrides (EH₃)
  { id: 'nh3',  name: 'Ammonia',            formula: 'NH₃',  molarMass: 17.03,  period: 2, familyId: 'group15', mpC: -77.7,  bpC: -33.3,  dhVap: 23.33, dhFus: 5.66,  isAnomaly: true,  tags: ['H-bond donor', 'H-bond acceptor', 'polar'] },
  { id: 'ph3',  name: 'Phosphine',          formula: 'PH₃',  molarMass: 34.0,   period: 3, familyId: 'group15', mpC: -133.8, bpC: -87.7,  dhVap: 14.6,  dhFus: 1.13,  isAnomaly: false, tags: ['polar'] },
  { id: 'ash3', name: 'Arsine',             formula: 'AsH₃', molarMass: 77.95,  period: 4, familyId: 'group15', mpC: -116,   bpC: -55,    dhVap: 16.7,  dhFus: 1.21,  isAnomaly: false, tags: ['polar'] },
  { id: 'sbh3', name: 'Stibine',            formula: 'SbH₃', molarMass: 124.77, period: 5, familyId: 'group15', mpC: -88,    bpC: -17,    dhVap: 21.3,  dhFus: 1.9,   isAnomaly: false, tags: ['polar'] },

  // Group 14 hydrides (EH₄)
  { id: 'ch4',  name: 'Methane',            formula: 'CH₄',  molarMass: 16.04,  period: 2, familyId: 'group14', mpC: -182.5, bpC: -161.5, dhVap: 8.19,  dhFus: 0.94,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'sih4', name: 'Silane',             formula: 'SiH₄', molarMass: 32.12,  period: 3, familyId: 'group14', mpC: -185,   bpC: -111.8, dhVap: 12.1,  dhFus: 0.68,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'geh4', name: 'Germane',            formula: 'GeH₄', molarMass: 76.64,  period: 4, familyId: 'group14', mpC: -165,   bpC: -88.5,  dhVap: 14.1,  dhFus: 0.84,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'snh4', name: 'Stannane',           formula: 'SnH₄', molarMass: 122.74, period: 5, familyId: 'group14', mpC: -146,   bpC: -52,    dhVap: 18.5,  dhFus: 1.27,  isAnomaly: false, tags: ['nonpolar'] },

  // Noble gases (control family — no H-bonding)
  { id: 'he',   name: 'Helium',  formula: 'He', molarMass: 4.003,  period: 1, familyId: 'nobleGas', mpC: -272.2, bpC: -268.9, dhVap: 0.08,  dhFus: 0.01,  isAnomaly: false, tags: ['nonpolar', 'noble'] },
  { id: 'ne',   name: 'Neon',    formula: 'Ne', molarMass: 20.18,  period: 2, familyId: 'nobleGas', mpC: -248.6, bpC: -246.1, dhVap: 1.73,  dhFus: 0.34,  isAnomaly: false, tags: ['nonpolar', 'noble'] },
  { id: 'ar',   name: 'Argon',   formula: 'Ar', molarMass: 39.95,  period: 3, familyId: 'nobleGas', mpC: -189.4, bpC: -185.8, dhVap: 6.43,  dhFus: 1.18,  isAnomaly: false, tags: ['nonpolar', 'noble'] },
  { id: 'kr',   name: 'Krypton', formula: 'Kr', molarMass: 83.80,  period: 4, familyId: 'nobleGas', mpC: -157.4, bpC: -153.4, dhVap: 9.08,  dhFus: 1.64,  isAnomaly: false, tags: ['nonpolar', 'noble'] },
  { id: 'xe',   name: 'Xenon',   formula: 'Xe', molarMass: 131.29, period: 5, familyId: 'nobleGas', mpC: -111.8, bpC: -108.1, dhVap: 12.64, dhFus: 2.30,  isAnomaly: false, tags: ['nonpolar', 'noble'] },

  // Alkanes (non-H-bonding molecular series — "mass-only" baseline)
  { id: 'methane',  name: 'Methane',  formula: 'CH₄',    molarMass: 16.04,  period: 0, familyId: 'alkane', mpC: -182.5, bpC: -161.5, dhVap: 8.19,  dhFus: 0.94,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'ethane',   name: 'Ethane',   formula: 'C₂H₆',   molarMass: 30.07,  period: 0, familyId: 'alkane', mpC: -182.8, bpC: -88.6,  dhVap: 14.7,  dhFus: 2.86,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'propane',  name: 'Propane',  formula: 'C₃H₈',   molarMass: 44.10,  period: 0, familyId: 'alkane', mpC: -187.7, bpC: -42.1,  dhVap: 19.0,  dhFus: 3.53,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'butane',   name: 'Butane',   formula: 'C₄H₁₀',  molarMass: 58.12,  period: 0, familyId: 'alkane', mpC: -138.3, bpC: -1.0,   dhVap: 22.4,  dhFus: 4.66,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'pentane',  name: 'Pentane',  formula: 'C₅H₁₂',  molarMass: 72.15,  period: 0, familyId: 'alkane', mpC: -129.7, bpC: 36.1,   dhVap: 25.8,  dhFus: 8.40,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'hexane',   name: 'Hexane',   formula: 'C₆H₁₄',  molarMass: 86.18,  period: 0, familyId: 'alkane', mpC: -95.3,  bpC: 68.7,   dhVap: 28.9,  dhFus: 13.08, isAnomaly: false, tags: ['nonpolar'] },
  { id: 'octane',   name: 'Octane',   formula: 'C₈H₁₈',  molarMass: 114.23, period: 0, familyId: 'alkane', mpC: -56.8,  bpC: 125.7,  dhVap: 34.4,  dhFus: 20.7,  isAnomaly: false, tags: ['nonpolar'] },

  // Alcohols (H-bonding comparison series)
  { id: 'methanol', name: 'Methanol', formula: 'CH₃OH',   molarMass: 32.04,  period: 0, familyId: 'alcohol', mpC: -97.6,  bpC: 64.7,   dhVap: 35.2,  dhFus: 3.16,  isAnomaly: false, tags: ['H-bond donor', 'H-bond acceptor', 'polar'] },
  { id: 'ethanol',  name: 'Ethanol',  formula: 'C₂H₅OH',  molarMass: 46.07,  period: 0, familyId: 'alcohol', mpC: -114.1, bpC: 78.4,   dhVap: 38.6,  dhFus: 4.9,   isAnomaly: false, tags: ['H-bond donor', 'H-bond acceptor', 'polar'] },
  { id: 'propanol', name: '1-Propanol', formula: 'C₃H₇OH', molarMass: 60.10,  period: 0, familyId: 'alcohol', mpC: -126.2, bpC: 97.2,   dhVap: 41.4,  dhFus: 5.2,   isAnomaly: false, tags: ['H-bond donor', 'H-bond acceptor', 'polar'] },
  { id: 'butanol',  name: '1-Butanol', formula: 'C₄H₉OH', molarMass: 74.12,  period: 0, familyId: 'alcohol', mpC: -89.5,  bpC: 117.7,  dhVap: 43.3,  dhFus: 9.37,  isAnomaly: false, tags: ['H-bond donor', 'H-bond acceptor', 'polar'] },

  // Diatomic molecules
  { id: 'h2',   name: 'Hydrogen',  formula: 'H₂',  molarMass: 2.016,  period: 0, familyId: 'diatomic', mpC: -259.2, bpC: -252.9, dhVap: 0.90,  dhFus: 0.12,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'n2',   name: 'Nitrogen',  formula: 'N₂',  molarMass: 28.01,  period: 0, familyId: 'diatomic', mpC: -210.0, bpC: -195.8, dhVap: 5.57,  dhFus: 0.72,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'o2',   name: 'Oxygen',    formula: 'O₂',  molarMass: 32.00,  period: 0, familyId: 'diatomic', mpC: -218.8, bpC: -183.0, dhVap: 6.82,  dhFus: 0.44,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'f2',   name: 'Fluorine',  formula: 'F₂',  molarMass: 38.00,  period: 0, familyId: 'diatomic', mpC: -219.6, bpC: -188.1, dhVap: 6.62,  dhFus: 0.51,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'cl2',  name: 'Chlorine',  formula: 'Cl₂', molarMass: 70.91,  period: 0, familyId: 'diatomic', mpC: -101.5, bpC: -34.0,  dhVap: 20.4,  dhFus: 6.41,  isAnomaly: false, tags: ['nonpolar'] },
  { id: 'br2',  name: 'Bromine',   formula: 'Br₂', molarMass: 159.81, period: 0, familyId: 'diatomic', mpC: -7.2,   bpC: 58.8,   dhVap: 29.6,  dhFus: 10.57, isAnomaly: false, tags: ['nonpolar'] },
  { id: 'i2',   name: 'Iodine',    formula: 'I₂',  molarMass: 253.81, period: 0, familyId: 'diatomic', mpC: 113.7,  bpC: 184.3,  dhVap: 41.6,  dhFus: 15.52, isAnomaly: false, tags: ['nonpolar'] },
];

// ── Property metadata ────────────────────────────────────────────

export interface PropertyMeta {
  key: Property;
  label: string;
  unitC: string;
  unitK: string;
  getValue: (s: Substance, unit: Unit) => number;
}

function toK(c: number): number {
  return c + 273.15;
}

export const PROPERTIES: PropertyMeta[] = [
  {
    key: 'bp',
    label: 'Boiling point',
    unitC: '°C',
    unitK: 'K',
    getValue: (s, u) => u === 'K' ? toK(s.bpC) : s.bpC,
  },
  {
    key: 'mp',
    label: 'Melting point',
    unitC: '°C',
    unitK: 'K',
    getValue: (s, u) => u === 'K' ? toK(s.mpC) : s.mpC,
  },
  {
    key: 'dhVap',
    label: 'ΔH vaporization',
    unitC: 'kJ/mol',
    unitK: 'kJ/mol',
    getValue: (s) => s.dhVap,
  },
  {
    key: 'dhFus',
    label: 'ΔH fusion',
    unitC: 'kJ/mol',
    unitK: 'kJ/mol',
    getValue: (s) => s.dhFus,
  },
  {
    key: 'liquidRange',
    label: 'Liquid range',
    unitC: '°C',
    unitK: 'K',
    getValue: (s) => s.bpC - s.mpC,
  },
];

export const PROPERTY_MAP: Record<Property, PropertyMeta> = Object.fromEntries(
  PROPERTIES.map((p) => [p.key, p]),
) as Record<Property, PropertyMeta>;

// ── X-axis options ───────────────────────────────────────────────

export type XAxis = 'period' | 'molarMass';

export const X_AXES: Array<{ key: XAxis; label: string }> = [
  { key: 'period', label: 'Period (row)' },
  { key: 'molarMass', label: 'Molar mass' },
];

// ── View modes ──────────────────────────────────────────────────

export const VIEW_MODES: Array<{ key: ViewMode; label: string; description: string }> = [
  { key: 'series', label: 'Series', description: 'Kurian-style family trend lines' },
  { key: 'scatter', label: 'Scatter', description: 'mp vs bp scatter plot' },
  { key: 'outlier', label: 'Outlier', description: 'Anomaly residuals & ranking' },
  { key: 'phase', label: 'Phase', description: 'Phase at ambient temperature' },
];

// ── Anomaly computation ──────────────────────────────────────────
// Fit a line through periods ≥ 3, predict period 2, compute residual.

export function linearFit(points: Array<{ x: number; y: number }>): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function computeAnomalies(
  property: Property,
  unit: Unit,
  enabledFamilies: Set<FamilyId>,
): AnomalyResult[] {
  const propMeta = PROPERTY_MAP[property];
  const results: AnomalyResult[] = [];

  for (const familyId of enabledFamilies) {
    // Only hydride families (with period data) support anomaly computation
    if (familyId === 'nobleGas' || familyId === 'alkane' || familyId === 'alcohol' || familyId === 'diatomic') continue;

    const members = SUBSTANCES.filter((s) => s.familyId === familyId);
    const period2 = members.filter((s) => s.period === 2);
    const heavier = members.filter((s) => s.period >= 3);

    if (period2.length === 0 || heavier.length < 2) continue;

    const fitPoints = heavier.map((s) => ({
      x: s.period,
      y: propMeta.getValue(s, unit),
    }));

    const { slope, intercept } = linearFit(fitPoints);

    for (const s of period2) {
      const observed = propMeta.getValue(s, unit);
      const predicted = slope * s.period + intercept;
      const residual = observed - predicted;
      const residualPct = Math.abs(predicted) > 0.01
        ? (residual / Math.abs(predicted)) * 100
        : 0;

      results.push({ substance: s, property, observed, predicted, residual, residualPct });
    }
  }

  // Sort by absolute residual descending
  results.sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
  return results;
}

// ── Trend line for a family ──────────────────────────────────────
// Returns predicted values at periods 3-5 extrapolated to period 2

export function computeFamilyTrendLine(
  familyId: FamilyId,
  property: Property,
  unit: Unit,
): Array<{ period: number; predicted: number }> {
  const propMeta = PROPERTY_MAP[property];
  const members = SUBSTANCES.filter((s) => s.familyId === familyId);
  const heavier = members.filter((s) => s.period >= 3);

  if (heavier.length < 2) return [];

  const fitPoints = heavier.map((s) => ({
    x: s.period,
    y: propMeta.getValue(s, unit),
  }));

  const { slope, intercept } = linearFit(fitPoints);

  const periods = [2, 3, 4, 5];
  return periods.map((p) => ({ period: p, predicted: slope * p + intercept }));
}

// ── bp vs molar-mass regression (for scatter outlier detection) ──

export function computeMassRegression(
  substances: Substance[],
  unit: Unit,
): { slope: number; intercept: number } {
  // Fit on non-H-bonding, non-anomaly substances
  const fitPoints = substances
    .filter((s) => !s.isAnomaly && !s.tags.includes('H-bond donor'))
    .map((s) => ({
      x: Math.log(s.molarMass),
      y: unit === 'K' ? toK(s.bpC) : s.bpC,
    }));
  if (fitPoints.length < 2) return { slope: 0, intercept: 0 };
  return linearFit(fitPoints);
}

// ── Phase classification ─────────────────────────────────────────

export type Phase = 'solid' | 'liquid' | 'gas';

export function classifyPhase(s: Substance, tempC: number): Phase {
  if (tempC < s.mpC) return 'solid';
  if (tempC < s.bpC) return 'liquid';
  return 'gas';
}

export const PHASE_COLORS: Record<Phase, string> = {
  solid: '#22d3ee',   // cyan
  liquid: '#22c55e',  // green
  gas: '#eab308',     // yellow
};

// ── Defaults ─────────────────────────────────────────────────────

export const DEFAULT_PROPERTY: Property = 'bp';
export const DEFAULT_UNIT: Unit = 'C';
export const DEFAULT_XAXIS: XAxis = 'period';
export const DEFAULT_AMBIENT_C = 25;
export const DEFAULT_FAMILIES: FamilyId[] = ['group16', 'group17', 'group15', 'group14'];
export const DEFAULT_VIEW_MODE: ViewMode = 'series';
export const DEFAULT_PINNED: string[] = ['h2o', 'hf', 'nh3', 'ch4'];

// Hydride families that support period-based trend analysis
export const HYDRIDE_FAMILIES: FamilyId[] = ['group16', 'group17', 'group15', 'group14'];

export function fmt(n: number, d = 1): string {
  return Number.isFinite(n) ? n.toFixed(d) : '—';
}
