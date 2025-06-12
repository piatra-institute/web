export interface FormulaCoefficients {
  // Support formula coefficients
  communityBase: number;
  communityMaturityCoeff: number;
  communityMaturityPower: number;
  donationBase: number;
  donationMaturityCoeff: number;
  donationMaturityPower: number;
  synergyAmplitude: number;
  
  // Pressure formula coefficients
  communityResistCoeff: number;
  financialBufferCoeff: number;
  maturityInertiaCoeff: number;
  maturityInertiaPower: number;
}

export const defaultCoefficients: FormulaCoefficients = {
  communityBase: 0.7,
  communityMaturityCoeff: 0.3,
  communityMaturityPower: 0.8,
  donationBase: 0.6,
  donationMaturityCoeff: 0.4,
  donationMaturityPower: 0.6,
  synergyAmplitude: 0.5,
  communityResistCoeff: 0.3,
  financialBufferCoeff: 0.2,
  maturityInertiaCoeff: 0.4,
  maturityInertiaPower: 1.2,
};

export interface TimelineEvent {
  year: number;
  maturity: number;
  community: number;
  funding: number;
  pressure: number;
  event: string;
}

export interface CaseStudy {
  name: string;
  timeline: TimelineEvent[];
}

export interface SimulationState {
  time: number;
  isPlaying: boolean;
  trajectory: Array<{x: number; y: number}>;
  values: {
    maturity: number;
    community: number;
    donations: number;
    cloud: number;
  };
  activeCaseStudy: CaseStudy | null;
  caseStudyTimelineIndex: number;
}

export const caseStudies: Record<string, CaseStudy> = {
  redis: {
    name: 'Redis',
    timeline: [
      { year: 2009, maturity: 5, community: 10, funding: 5, pressure: 5, event: 'Project created by S. Sanfilippo' },
      { year: 2011, maturity: 15, community: 30, funding: 10, pressure: 10, event: 'VMware sponsors development' },
      { year: 2013, maturity: 25, community: 50, funding: 20, pressure: 25, event: 'AWS launches ElastiCache for Redis' },
      { year: 2015, maturity: 40, community: 70, funding: 40, pressure: 40, event: 'Redis Labs founded, raises Series A' },
      { year: 2018, maturity: 60, community: 85, funding: 60, pressure: 75, event: 'Redis moves modules to Commons Clause' },
      { year: 2022, maturity: 80, community: 90, funding: 80, pressure: 90, event: 'Redis adopts RSAL/SSPL licenses' },
    ]
  },
  elastic: {
    name: 'Elastic',
    timeline: [
      { year: 2010, maturity: 5, community: 15, funding: 5, pressure: 5, event: 'Elasticsearch 0.4 released' },
      { year: 2012, maturity: 15, community: 40, funding: 30, pressure: 10, event: 'Company founded, Series A funding' },
      { year: 2014, maturity: 30, community: 60, funding: 60, pressure: 30, event: 'Series C funding ($70M)' },
      { year: 2015, maturity: 40, community: 70, funding: 70, pressure: 55, event: 'AWS launches Elasticsearch Service' },
      { year: 2018, maturity: 60, community: 80, funding: 85, pressure: 75, event: 'Elastic IPO (NYSE: ESTC)' },
      { year: 2021, maturity: 80, community: 85, funding: 90, pressure: 95, event: 'License changed to SSPL/Elastic License' },
    ]
  },
  mongodb: {
    name: 'MongoDB',
    timeline: [
      { year: 2009, maturity: 10, community: 20, funding: 15, pressure: 5, event: 'MongoDB 1.0 released by 10gen' },
      { year: 2013, maturity: 30, community: 50, funding: 50, pressure: 20, event: 'Company rebrands to MongoDB Inc.' },
      { year: 2017, maturity: 50, community: 75, funding: 70, pressure: 60, event: 'MongoDB IPO (NASDAQ: MDB)' },
      { year: 2018, maturity: 60, community: 85, funding: 80, pressure: 85, event: 'License changed from AGPL to SSPL' },
      { year: 2019, maturity: 65, community: 88, funding: 85, pressure: 95, event: 'AWS launches DocumentDB (MongoDB compatible)' },
      { year: 2022, maturity: 85, community: 95, funding: 95, pressure: 98, event: 'Atlas revenue surpasses licenses' },
    ]
  },
  minio: {
    name: 'MinIO',
    timeline: [
      { year: 2015, maturity: 10, community: 15, funding: 10, pressure: 10, event: 'Founded, Seed round ($3.3M)' },
      { year: 2017, maturity: 25, community: 40, funding: 30, pressure: 30, event: 'Series A ($20M), AGPL license' },
      { year: 2020, maturity: 50, community: 70, funding: 50, pressure: 60, event: 'High S3 compatibility increases adoption' },
      { year: 2022, maturity: 70, community: 80, funding: 90, pressure: 70, event: 'Series B ($103M), valued at $1B' },
      { year: 2024, maturity: 80, community: 85, funding: 95, pressure: 75, event: 'Maintains AGPL, focuses on private cloud' },
    ]
  },
  sentry: {
    name: 'Sentry',
    timeline: [
      { year: 2012, maturity: 10, community: 15, funding: 5, pressure: 5, event: 'Commercial company formed' },
      { year: 2016, maturity: 25, community: 40, funding: 25, pressure: 10, event: 'Series A ($9M)' },
      { year: 2019, maturity: 50, community: 70, funding: 60, pressure: 25, event: 'Series C ($40M)' },
      { year: 2021, maturity: 70, community: 80, funding: 85, pressure: 40, event: 'Series E ($90M), Open Source-aligned model' },
      { year: 2023, maturity: 85, community: 90, funding: 95, pressure: 50, event: 'BSL License adopted for core product' },
    ]
  },
  postgresql: {
    name: 'PostgreSQL',
    timeline: [
      { year: 1996, maturity: 10, community: 20, funding: 5, pressure: 5, event: 'PostgreSQL project begins' },
      { year: 2001, maturity: 25, community: 40, funding: 10, pressure: 10, event: 'ACID compliant, growing trust' },
      { year: 2005, maturity: 40, community: 60, funding: 15, pressure: 15, event: 'Major companies (e.g., Sun) contribute' },
      { year: 2010, maturity: 60, community: 75, funding: 25, pressure: 30, event: 'Becomes default DB for many startups' },
      { year: 2015, maturity: 80, community: 85, funding: 40, pressure: 50, event: 'Cloud providers offer managed services' },
      { year: 2023, maturity: 98, community: 98, funding: 60, pressure: 60, event: 'Extremely stable community governance model' },
    ]
  }
};

export function calculatePhaseCoordinates(
  community: number, 
  donations: number, 
  cloud: number,
  maturity: number = 50,
  coefficients: FormulaCoefficients = defaultCoefficients
): {x: number, y: number} {
  // Sheaf-theoretic model: local interactions determine global position
  
  // 1. Community-Maturity interaction: mature communities are more effective
  const communityEffect = community * (coefficients.communityBase + coefficients.communityMaturityCoeff * Math.pow(maturity / 100, coefficients.communityMaturityPower));
  
  // 2. Donations-Maturity interaction: mature projects use funds more efficiently
  const donationEffect = donations * (coefficients.donationBase + coefficients.donationMaturityCoeff * Math.pow(maturity / 100, coefficients.donationMaturityPower));
  
  // 3. Support emerges from community-donation synergy (non-linear coupling)
  const synergyFactor = 1 + coefficients.synergyAmplitude * Math.sin(Math.PI * community * donations / 10000);
  const supportScore = 100 * Math.sqrt((communityEffect + donationEffect) / 200 * synergyFactor);
  
  // 4. Pressure modulated by all four variables interacting
  // Community resists pressure through solidarity
  const communityResistance = 1 - coefficients.communityResistCoeff * (community / 100);
  // Donations provide buffer against pressure
  const financialBuffer = 1 - coefficients.financialBufferCoeff * (donations / 100);
  // Maturity provides institutional inertia
  const maturityInertia = 1 - coefficients.maturityInertiaCoeff * Math.pow(maturity / 100, coefficients.maturityInertiaPower);
  
  // Combined resistance is multiplicative (each factor compounds)
  const totalResistance = communityResistance * financialBuffer * maturityInertia;
  const effectivePressure = cloud * totalResistance;
  const pressureScore = Math.pow(effectivePressure, 2) / 100;
  
  return { 
    y: Math.min(100, supportScore), 
    x: Math.min(100, pressureScore) 
  };
}

export function determineLicenseState(
  supportScore: number, 
  pressureScore: number,
  maturity: number = 50,
  community: number = 50,
  donations: number = 50
): {
  isPermissive: boolean;
  status: string;
  examples: string;
  className: string;
} {
  // Phase boundary is affected by the full state configuration
  // This represents how different resource configurations create different tipping points
  
  // Community strength shifts boundary - strong communities resist longer
  const communityShift = (community - 50) / 200; // -0.25 to +0.25
  
  // Financial health provides buffer
  const financialShift = (donations - 50) / 200; // -0.25 to +0.25
  
  // Maturity provides institutional inertia
  const maturityShift = (maturity - 50) / 200; // -0.25 to +0.25
  
  // Combined effect on boundary (additive because each provides independent resistance)
  const totalShift = communityShift + financialShift + maturityShift;
  const adjustedBoundary = pressureScore * (1 - totalShift);
  
  if (supportScore >= adjustedBoundary) {
    return {
      isPermissive: true,
      status: 'Permissive License Sustainable',
      examples: 'MIT • Apache 2.0 • BSD',
      className: 'bg-lime-900/30 border border-lime-400/50'
    };
  } else {
    return {
      isPermissive: false,
      status: 'Restrictive License Likely',
      examples: 'AGPL • BSL • SSPL',
      className: 'bg-red-900/30 border border-red-400/50'
    };
  }
}