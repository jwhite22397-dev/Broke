import type { GameState, Loan, Property, Vehicle } from '../models/types';
import { getJobById } from '../../data/jobs/jobs';
import { SeededRandom } from '../engine/random';
import { 
  TAX_BRACKETS, 
  INVESTMENT_RETURNS, 
  ECONOMIC_MODIFIERS,
  CREDIT_SCORE_FACTORS,
  CREDIT_SCORE_MIN,
  CREDIT_SCORE_MAX,
  HOUSING_COSTS,
  LIFESTYLE_COSTS,
  CHILD_COSTS,
} from '../balance/constants';
import { getCityById } from '../../data/cities/cities';

export function calculateMonthlyIncome(state: GameState): {
  employment: number;
  partner: number;
  business: number;
  investments: number;
  rental: number;
  other: number;
  total: number;
} {
  let employment = 0;
  let partner = 0;
  let business = 0;
  let investments = 0;
  let rental = 0;
  const other = 0;
  
  if (state.employment) {
    employment = state.employment.monthlyPay;
  }
  
  if (state.partner && state.relationshipStatus === 'married') {
    partner = state.partner.monthlyIncome * 0.5;
  }
  
  for (const biz of state.businesses) {
    business += biz.monthlyRevenue - biz.monthlyExpenses;
  }
  
  for (const prop of state.properties) {
    if (prop.type === 'rental' && prop.monthlyRent) {
      const occupied = 1 - prop.vacancy;
      rental += (prop.monthlyRent - prop.monthlyExpenses) * occupied;
    }
  }
  
  const total = employment + partner + business + investments + rental + other;
  
  return { employment, partner, business, investments, rental, other, total };
}

export function calculateMonthlyExpenses(state: GameState): {
  housing: number;
  transportation: number;
  food: number;
  utilities: number;
  debt: number;
  insurance: number;
  lifestyle: number;
  education: number;
  childcare: number;
  taxes: number;
  other: number;
  total: number;
} {
  const city = getCityById(state.cityId);
  const rentMultiplier = city?.rentMultiplier ?? 1;
  
  let housing = 0;
  const isRenter = state.housing === 'roommates'
    || state.housing === 'cheap_apartment'
    || state.housing === 'apartment'
    || state.housing === 'nice_apartment'
    || state.housing === 'rental_house';
  if (state.housing === 'with_family') {
    housing = state.householdContribution;
  } else if (isRenter) {
    const baseRent = HOUSING_COSTS[state.housing].baseRent;
    housing = state.monthlyRent > 0 ? state.monthlyRent : Math.round(baseRent * rentMultiplier);
  }
  
  for (const prop of state.properties) {
    if (prop.type === 'primary') {
      const mortgage = state.loans.find(l => l.id === prop.mortgageId);
      if (mortgage) {
        housing += mortgage.monthlyPayment;
      }
      housing += prop.monthlyExpenses;
    }
  }
  
  let transportation = 0;
  if (state.vehicle) {
    transportation = state.vehicle.monthlyInsurance + state.vehicle.monthlyFuel;
    const autoLoan = state.loans.find(l => l.id === state.vehicle?.loanId);
    if (autoLoan) {
      transportation += autoLoan.monthlyPayment;
    }
    transportation += Math.round((100 - state.vehicle.reliability) * 2);
  }
  
  const baseFood = 400;
  const lifestyleMultiplier = {
    bare_bones: 0.6,
    frugal: 0.8,
    comfortable: 1.0,
    expensive: 1.4,
    luxury: 2.0,
  }[state.lifestyle];
  const food = Math.round(baseFood * lifestyleMultiplier * rentMultiplier);
  
  const utilities = HOUSING_COSTS[state.housing].utilities;
  
  let debt = 0;
  for (const loan of state.loans) {
    if (loan.type !== 'mortgage' && loan.type !== 'auto') {
      debt += loan.monthlyPayment;
    }
  }
  
  let insurance = 350;
  if (state.employment) {
    const job = getJobById(state.employment.jobId);
    if (job?.benefits) insurance = 150;
  }
  
  const lifestyle = LIFESTYLE_COSTS[state.lifestyle].monthlyBase;
  
  let education = 0;
  if (state.currentEducation) {
    education = state.currentEducation.monthlyCost;
  }
  
  let childcare = 0;
  for (const child of state.children) {
    let multiplier = 1.0;
    for (const bracket of CHILD_COSTS.ageMultipliers) {
      if (child.age <= bracket.maxAge) {
        multiplier = bracket.multiplier;
        break;
      }
    }
    childcare += CHILD_COSTS.baseMonthly * multiplier;
    if (child.age < 5 && state.employment) {
      childcare += CHILD_COSTS.childcareMonthly;
    }
  }
  
  const annualIncome = state.monthlyIncome * 12;
  const taxes = Math.round(calculateAnnualTaxes(annualIncome, city?.taxRate ?? 0.05) / 12);
  
  const other = 50;
  
  const total = housing + transportation + food + utilities + debt + insurance + lifestyle + education + childcare + taxes + other;
  
  return {
    housing,
    transportation,
    food,
    utilities,
    debt,
    insurance,
    lifestyle,
    education,
    childcare,
    taxes,
    other,
    total,
  };
}

export function calculateAnnualTaxes(annualIncome: number, stateTaxRate: number): number {
  let federalTax = 0;
  let remainingIncome = annualIncome;
  
  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    federalTax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }
  
  const stateTax = annualIncome * stateTaxRate;
  const ficaTax = Math.min(annualIncome, 160200) * 0.0765;
  
  return Math.round(federalTax + stateTax + ficaTax);
}

export function calculateNetWorth(state: GameState): number {
  let assets = state.cash + state.savings;
  
  if (state.vehicle) {
    assets += state.vehicle.currentValue;
  }
  
  for (const inv of state.investments) {
    assets += inv.currentValue;
  }
  
  for (const prop of state.properties) {
    assets += prop.currentValue;
  }
  
  for (const biz of state.businesses) {
    assets += biz.monthlyRevenue * 12 * 2;
  }
  
  let liabilities = 0;
  for (const loan of state.loans) {
    liabilities += loan.balance;
  }
  
  return assets - liabilities;
}

export function processLoanPayment(loan: Loan): { newBalance: number; interestPaid: number; principalPaid: number } {
  const monthlyRate = loan.apr / 12;
  const interestPaid = loan.balance * monthlyRate;
  const principalPaid = Math.min(loan.monthlyPayment - interestPaid, loan.balance);
  const newBalance = Math.max(0, loan.balance - principalPaid);
  
  return { newBalance, interestPaid, principalPaid };
}

export function calculateLoanPayment(principal: number, apr: number, termMonths: number): number {
  if (apr === 0) {
    return Math.ceil(principal / termMonths);
  }
  
  const monthlyRate = apr / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.ceil(payment);
}

export function simulateInvestments(state: GameState, rng: SeededRandom): void {
  const economicModifier = ECONOMIC_MODIFIERS[state.economicState].investmentReturn;
  
  for (const inv of state.investments) {
    const returns = INVESTMENT_RETURNS[inv.type];
    const monthlyMean = returns.mean / 12;
    const monthlyStdDev = returns.stdDev / Math.sqrt(12);
    
    let monthlyReturn = rng.normal(monthlyMean, monthlyStdDev) * economicModifier;
    
    monthlyReturn = Math.max(returns.minAnnual / 12, Math.min(returns.maxAnnual / 12, monthlyReturn));
    
    inv.currentValue = Math.max(0, inv.currentValue * (1 + monthlyReturn));
  }
}

export function updateCreditScore(state: GameState, paidOnTime: boolean, newDebt: number): number {
  let change = 0;
  
  if (paidOnTime) {
    change += CREDIT_SCORE_FACTORS.onTimePaymentBonus;
  } else {
    change -= CREDIT_SCORE_FACTORS.missedPaymentPenalty;
    state.missedPayments++;
  }
  
  if (state.creditHistory < 24) {
    change += 1;
  }
  
  const totalDebt = state.loans.reduce((sum, l) => sum + l.balance, 0);
  const income = state.monthlyIncome * 12;
  if (income > 0) {
    const utilization = totalDebt / (income * 0.4);
    if (utilization < 0.3) {
      change += 2;
    } else if (utilization > 0.8) {
      change -= 3;
    }
  }
  
  if (newDebt > 5000) {
    change -= 5;
  } else if (newDebt > 1000) {
    change -= 2;
  }
  
  change = Math.max(-CREDIT_SCORE_FACTORS.maxMonthlyChange, Math.min(CREDIT_SCORE_FACTORS.maxMonthlyChange, change));
  
  const baseScore = state.creditScore || 580;
  let newScore = baseScore + change;
  
  if (state.creditHistory === 0 && state.creditScore === 0) {
    newScore = 580 + change;
  }
  
  return Math.max(CREDIT_SCORE_MIN, Math.min(CREDIT_SCORE_MAX, newScore));
}

export function depreciateVehicle(vehicle: Vehicle): void {
  const monthlyDepreciation = vehicle.type === 'none' ? 0 : 
    (vehicle.currentValue * (0.15 / 12));
  vehicle.currentValue = Math.max(500, vehicle.currentValue - monthlyDepreciation);
  vehicle.age += 1 / 12;
}

export function appreciateProperty(property: Property, economicState: string): void {
  const modifier = ECONOMIC_MODIFIERS[economicState as keyof typeof ECONOMIC_MODIFIERS]?.housingAppreciation ?? 1;
  const monthlyAppreciation = (0.03 / 12) * modifier;
  property.currentValue = Math.round(property.currentValue * (1 + monthlyAppreciation));
}

export function getEmergencyFundMonths(state: GameState): number {
  const monthlyExpenses = calculateMonthlyExpenses(state).total;
  if (monthlyExpenses === 0) return 0;
  return state.savings / monthlyExpenses;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}
