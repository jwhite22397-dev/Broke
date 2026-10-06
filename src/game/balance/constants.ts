import type { SocioeconomicClass, EducationLevel, HousingType, LifestyleTier, EconomicState, VehicleType } from '../models/types';

export const GAME_VERSION = 1;

export const STARTING_AGE = 18;
export const MAX_AGE = 100;

export const CREDIT_SCORE_MIN = 300;
export const CREDIT_SCORE_MAX = 850;

export const STARTING_CONDITIONS: Record<SocioeconomicClass, {
  cashMin: number;
  cashMax: number;
  creditScore: number;
  creditHistory: number;
  housing: HousingType;
  householdContribution: number;
  hasVehicle: boolean;
  vehicleValue: number;
  education: EducationLevel;
  familySupport: number;
  startingDebt: number;
  weight: number;
}> = {
  struggling: {
    cashMin: 50,
    cashMax: 250,
    creditScore: 0,
    creditHistory: 0,
    housing: 'with_family',
    householdContribution: 350,
    hasVehicle: false,
    vehicleValue: 0,
    education: 'high_school',
    familySupport: 0.1,
    startingDebt: 0,
    weight: 15,
  },
  working_class: {
    cashMin: 200,
    cashMax: 800,
    creditScore: 580,
    creditHistory: 6,
    housing: 'with_family',
    householdContribution: 250,
    hasVehicle: false,
    vehicleValue: 0,
    education: 'high_school',
    familySupport: 0.3,
    startingDebt: 0,
    weight: 25,
  },
  lower_middle: {
    cashMin: 500,
    cashMax: 1500,
    creditScore: 620,
    creditHistory: 12,
    housing: 'with_family',
    householdContribution: 150,
    hasVehicle: true,
    vehicleValue: 4000,
    education: 'high_school',
    familySupport: 0.5,
    startingDebt: 0,
    weight: 25,
  },
  middle: {
    cashMin: 1000,
    cashMax: 3000,
    creditScore: 680,
    creditHistory: 18,
    housing: 'with_family',
    householdContribution: 0,
    hasVehicle: true,
    vehicleValue: 8000,
    education: 'high_school',
    familySupport: 0.7,
    startingDebt: 0,
    weight: 20,
  },
  upper_middle: {
    cashMin: 2500,
    cashMax: 5000,
    creditScore: 720,
    creditHistory: 24,
    housing: 'with_family',
    householdContribution: 0,
    hasVehicle: true,
    vehicleValue: 15000,
    education: 'high_school',
    familySupport: 0.85,
    startingDebt: 0,
    weight: 10,
  },
  privileged: {
    cashMin: 5000,
    cashMax: 10000,
    creditScore: 750,
    creditHistory: 36,
    housing: 'with_family',
    householdContribution: 0,
    hasVehicle: true,
    vehicleValue: 25000,
    education: 'high_school',
    familySupport: 1.0,
    startingDebt: 0,
    weight: 5,
  },
};

export const EDUCATION_REQUIREMENTS: Record<EducationLevel, number> = {
  no_diploma: 0,
  ged: 1,
  high_school: 0,
  some_college: 2,
  associate: 3,
  trade_cert: 4,
  bachelor: 5,
  master: 6,
  doctorate: 7,
};

export const EDUCATION_COSTS: Record<string, {
  monthlyFull: number;
  monthlyPart: number;
  durationMonthsFull: number;
  durationMonthsPart: number;
  targetLevel: EducationLevel;
}> = {
  ged: { monthlyFull: 150, monthlyPart: 100, durationMonthsFull: 3, durationMonthsPart: 6, targetLevel: 'ged' },
  community_college: { monthlyFull: 400, monthlyPart: 250, durationMonthsFull: 24, durationMonthsPart: 36, targetLevel: 'associate' },
  trade_school: { monthlyFull: 800, monthlyPart: 500, durationMonthsFull: 12, durationMonthsPart: 18, targetLevel: 'trade_cert' },
  university: { monthlyFull: 1500, monthlyPart: 900, durationMonthsFull: 48, durationMonthsPart: 72, targetLevel: 'bachelor' },
  graduate: { monthlyFull: 2000, monthlyPart: 1200, durationMonthsFull: 24, durationMonthsPart: 36, targetLevel: 'master' },
  certification: { monthlyFull: 300, monthlyPart: 200, durationMonthsFull: 6, durationMonthsPart: 9, targetLevel: 'trade_cert' },
};

export const HOUSING_COSTS: Record<HousingType, {
  baseRent: number;
  utilities: number;
  happinessBonus: number;
  privacyBonus: number;
}> = {
  homeless: { baseRent: 0, utilities: 0, happinessBonus: -30, privacyBonus: 0 },
  with_family: { baseRent: 0, utilities: 0, happinessBonus: -5, privacyBonus: 20 },
  roommates: { baseRent: 500, utilities: 50, happinessBonus: 0, privacyBonus: 40 },
  cheap_apartment: { baseRent: 800, utilities: 80, happinessBonus: 5, privacyBonus: 70 },
  apartment: { baseRent: 1200, utilities: 100, happinessBonus: 10, privacyBonus: 80 },
  nice_apartment: { baseRent: 1800, utilities: 120, happinessBonus: 15, privacyBonus: 90 },
  rental_house: { baseRent: 2200, utilities: 180, happinessBonus: 20, privacyBonus: 100 },
  owned_home: { baseRent: 0, utilities: 200, happinessBonus: 25, privacyBonus: 100 },
  nice_home: { baseRent: 0, utilities: 300, happinessBonus: 30, privacyBonus: 100 },
  luxury_home: { baseRent: 0, utilities: 500, happinessBonus: 35, privacyBonus: 100 },
};

export const LIFESTYLE_COSTS: Record<LifestyleTier, {
  monthlyBase: number;
  happinessBonus: number;
  stressReduction: number;
  socialBonus: number;
}> = {
  bare_bones: { monthlyBase: 200, happinessBonus: -10, stressReduction: 0, socialBonus: 0 },
  frugal: { monthlyBase: 400, happinessBonus: 0, stressReduction: 5, socialBonus: 5 },
  comfortable: { monthlyBase: 800, happinessBonus: 10, stressReduction: 10, socialBonus: 15 },
  expensive: { monthlyBase: 1500, happinessBonus: 15, stressReduction: 15, socialBonus: 25 },
  luxury: { monthlyBase: 3000, happinessBonus: 20, stressReduction: 20, socialBonus: 40 },
};

export const VEHICLE_COSTS: Record<VehicleType, {
  priceMin: number;
  priceMax: number;
  insurance: number;
  fuel: number;
  maintenance: number;
  reliability: number;
  depreciationRate: number;
}> = {
  none: { priceMin: 0, priceMax: 0, insurance: 0, fuel: 0, maintenance: 0, reliability: 0, depreciationRate: 0 },
  public_transit: { priceMin: 0, priceMax: 0, insurance: 0, fuel: 100, maintenance: 0, reliability: 90, depreciationRate: 0 },
  beater: { priceMin: 1500, priceMax: 4000, insurance: 80, fuel: 150, maintenance: 200, reliability: 40, depreciationRate: 0.15 },
  used_economy: { priceMin: 6000, priceMax: 12000, insurance: 100, fuel: 120, maintenance: 80, reliability: 70, depreciationRate: 0.12 },
  used_midrange: { priceMin: 12000, priceMax: 22000, insurance: 140, fuel: 140, maintenance: 100, reliability: 75, depreciationRate: 0.10 },
  new_economy: { priceMin: 22000, priceMax: 30000, insurance: 160, fuel: 100, maintenance: 40, reliability: 95, depreciationRate: 0.15 },
  new_midrange: { priceMin: 32000, priceMax: 48000, insurance: 200, fuel: 140, maintenance: 50, reliability: 95, depreciationRate: 0.12 },
  luxury: { priceMin: 55000, priceMax: 120000, insurance: 350, fuel: 200, maintenance: 150, reliability: 90, depreciationRate: 0.18 },
};

export const LOAN_RATES: Record<string, { minRate: number; maxRate: number; goodCreditRate: number }> = {
  auto: { minRate: 0.049, maxRate: 0.189, goodCreditRate: 0.059 },
  student: { minRate: 0.045, maxRate: 0.089, goodCreditRate: 0.055 },
  personal: { minRate: 0.069, maxRate: 0.299, goodCreditRate: 0.089 },
  mortgage: { minRate: 0.055, maxRate: 0.085, goodCreditRate: 0.062 },
  business: { minRate: 0.079, maxRate: 0.199, goodCreditRate: 0.099 },
  credit_card: { minRate: 0.149, maxRate: 0.299, goodCreditRate: 0.169 },
};

export const CREDIT_SCORE_FACTORS = {
  paymentHistoryWeight: 0.35,
  utilizationWeight: 0.30,
  historyLengthWeight: 0.15,
  newDebtWeight: 0.10,
  mixWeight: 0.10,
  missedPaymentPenalty: 50,
  onTimePaymentBonus: 3,
  maxMonthlyChange: 15,
};

export const ECONOMIC_MODIFIERS: Record<EconomicState, {
  jobOpenings: number;
  layoffRisk: number;
  wageGrowth: number;
  investmentReturn: number;
  housingAppreciation: number;
  businessGrowth: number;
  interestRateModifier: number;
  duration: { min: number; max: number };
}> = {
  boom: {
    jobOpenings: 1.4,
    layoffRisk: 0.5,
    wageGrowth: 1.3,
    investmentReturn: 1.5,
    housingAppreciation: 1.3,
    businessGrowth: 1.4,
    interestRateModifier: 1.1,
    duration: { min: 18, max: 36 },
  },
  normal: {
    jobOpenings: 1.0,
    layoffRisk: 1.0,
    wageGrowth: 1.0,
    investmentReturn: 1.0,
    housingAppreciation: 1.0,
    businessGrowth: 1.0,
    interestRateModifier: 1.0,
    duration: { min: 24, max: 60 },
  },
  slowdown: {
    jobOpenings: 0.8,
    layoffRisk: 1.3,
    wageGrowth: 0.8,
    investmentReturn: 0.7,
    housingAppreciation: 0.8,
    businessGrowth: 0.7,
    interestRateModifier: 0.95,
    duration: { min: 12, max: 24 },
  },
  recession: {
    jobOpenings: 0.5,
    layoffRisk: 2.0,
    wageGrowth: 0.5,
    investmentReturn: 0.3,
    housingAppreciation: 0.6,
    businessGrowth: 0.4,
    interestRateModifier: 0.8,
    duration: { min: 12, max: 30 },
  },
  recovery: {
    jobOpenings: 1.2,
    layoffRisk: 0.8,
    wageGrowth: 1.1,
    investmentReturn: 1.3,
    housingAppreciation: 1.1,
    businessGrowth: 1.2,
    interestRateModifier: 0.9,
    duration: { min: 12, max: 24 },
  },
};

export const INVESTMENT_RETURNS = {
  index_fund: { mean: 0.08, stdDev: 0.15, minAnnual: -0.35, maxAnnual: 0.40 },
  bonds: { mean: 0.04, stdDev: 0.05, minAnnual: -0.05, maxAnnual: 0.12 },
  high_yield_savings: { mean: 0.045, stdDev: 0.005, minAnnual: 0.03, maxAnnual: 0.06 },
  individual_stock: { mean: 0.10, stdDev: 0.30, minAnnual: -0.60, maxAnnual: 1.00 },
  retirement: { mean: 0.07, stdDev: 0.12, minAnnual: -0.30, maxAnnual: 0.35 },
};

export const TAX_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

export const CHILD_COSTS = {
  baseMonthly: 800,
  childcareMonthly: 1200,
  ageMultipliers: [
    { maxAge: 2, multiplier: 1.5 },
    { maxAge: 5, multiplier: 1.3 },
    { maxAge: 12, multiplier: 1.0 },
    { maxAge: 18, multiplier: 1.2 },
  ],
};

export const RELATIONSHIP_COSTS = {
  dating: 200,
  serious: 150,
  engaged: 300,
  married: 0,
  weddingCostMin: 5000,
  weddingCostMax: 30000,
  divorceCostMin: 2000,
  divorceCostMax: 50000,
};

export const BUSINESS_TYPES = {
  cleaning: { startupCost: 2000, monthlyOverhead: 300, revenuePerCustomer: 150, maxCustomers: 50, failureRate: 0.3 },
  landscaping: { startupCost: 5000, monthlyOverhead: 500, revenuePerCustomer: 200, maxCustomers: 40, failureRate: 0.25 },
  online_store: { startupCost: 1000, monthlyOverhead: 200, revenuePerCustomer: 30, maxCustomers: 500, failureRate: 0.5 },
  food_truck: { startupCost: 40000, monthlyOverhead: 2000, revenuePerCustomer: 12, maxCustomers: 3000, failureRate: 0.4 },
  consulting: { startupCost: 500, monthlyOverhead: 100, revenuePerCustomer: 2000, maxCustomers: 10, failureRate: 0.35 },
  contracting: { startupCost: 15000, monthlyOverhead: 1500, revenuePerCustomer: 5000, maxCustomers: 20, failureRate: 0.3 },
  creative_agency: { startupCost: 3000, monthlyOverhead: 800, revenuePerCustomer: 3000, maxCustomers: 15, failureRate: 0.4 },
};

export const HEALTH_FACTORS = {
  baseLifeExpectancy: 78,
  stressImpact: -0.1,
  wealthBonus: 0.05,
  healthcareBonus: 0.03,
  randomVariance: 10,
};

export const MILESTONES_CONFIG = [
  { id: 'first_job', title: 'First Job', description: 'Started your first job' },
  { id: 'first_1k', title: 'First $1,000', description: 'Saved your first $1,000' },
  { id: 'positive_net_worth', title: 'Positive Net Worth', description: 'Assets exceed debts' },
  { id: 'credit_700', title: 'Good Credit', description: 'Credit score reached 700' },
  { id: 'credit_750', title: 'Excellent Credit', description: 'Credit score reached 750' },
  { id: 'first_promotion', title: 'First Promotion', description: 'Got your first promotion' },
  { id: 'first_degree', title: 'First Degree', description: 'Earned a degree or certification' },
  { id: 'first_home', title: 'Homeowner', description: 'Purchased your first home' },
  { id: 'debt_free', title: 'Debt Free', description: 'Paid off all debts' },
  { id: 'emergency_fund', title: 'Emergency Fund', description: 'Saved 6 months of expenses' },
  { id: 'net_worth_10k', title: '$10K Club', description: 'Net worth reached $10,000' },
  { id: 'net_worth_100k', title: '$100K Club', description: 'Net worth reached $100,000' },
  { id: 'net_worth_500k', title: 'Half Millionaire', description: 'Net worth reached $500,000' },
  { id: 'net_worth_1m', title: 'Millionaire', description: 'Net worth reached $1,000,000' },
  { id: 'net_worth_10m', title: 'Deca-Millionaire', description: 'Net worth reached $10,000,000' },
  { id: 'first_business', title: 'Entrepreneur', description: 'Started your first business' },
  { id: 'business_profitable', title: 'Profitable Business', description: 'Business became profitable' },
  { id: 'business_1m_revenue', title: 'Million Dollar Business', description: 'Business hit $1M total revenue' },
  { id: 'first_investment', title: 'Investor', description: 'Made your first investment' },
  { id: 'first_rental', title: 'Landlord', description: 'Purchased first rental property' },
  { id: 'married', title: 'Married', description: 'Got married' },
  { id: 'first_child', title: 'Parent', description: 'Had your first child' },
  { id: 'retirement_100k', title: 'Retirement Saver', description: 'Retirement accounts reached $100K' },
  { id: 'early_retirement', title: 'Early Retirement', description: 'Retired before 55' },
  { id: 'full_retirement', title: 'Retired', description: 'Retired with financial security' },
];

export const STAT_LIMITS = {
  min: 0,
  max: 100,
  criticalLow: 20,
  criticalHigh: 90,
};

export const MONTHLY_STAT_DECAY = {
  health: -1,
  energy: 0,
  happiness: -2,
  stress: -3,
};
