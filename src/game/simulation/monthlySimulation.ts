import type { GameState, MonthlyReport, GameEvent, DateInfo } from '../models/types';
import { SeededRandom } from '../engine/random';
import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetWorth,
  processLoanPayment,
  simulateInvestments,
  updateCreditScore,
  depreciateVehicle,
  appreciateProperty,
} from './financialSystem';
import { processCareerAction, checkForPromotion, checkForLayoff, hireForJob } from './careerSystem';
import { selectRandomEvent, decrementEventCooldowns, generateMonthlyNews } from './eventSystem';
import { updateEconomicState } from './economySystem';
import { checkMilestones } from './milestoneSystem';
import { MONTHLY_STAT_DECAY, STAT_LIMITS, HEALTH_FACTORS, BUSINESS_TYPES, ECONOMIC_MODIFIERS } from '../balance/constants';
import { getJobById } from '../../data/jobs/jobs';

export interface MonthResult {
  report: MonthlyReport;
  events: GameEvent[];
  promotionOccurred: boolean;
  layoffOccurred: boolean;
  newMilestones: string[];
}

export function simulateMonth(state: GameState): MonthResult {
  const rng = new SeededRandom(state.currentSeed);
  
  const netWorthBefore = calculateNetWorth(state);
  const creditScoreBefore = state.creditScore;
  
  const career = state.employment ? processCareerAction(state, rng) : { result: '', overtimePay: 0 };

  simulateBusinesses(state, rng);

  const income = calculateMonthlyIncome(state);
  income.other += career.overtimePay;
  income.total += career.overtimePay;
  state.monthlyIncome = income.total;
  
  const expenses = calculateMonthlyExpenses(state);
  state.monthlyExpenses = expenses.total;

  const loanPaymentsBudgeted = expenses.debt
    + state.loans
      .filter(loan => loan.type === 'auto' || loan.type === 'mortgage')
      .reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const livingExpenses = Math.max(0, expenses.total - loanPaymentsBudgeted);

  state.cash += income.total - livingExpenses;
  coverShortfallFromSavings(state);
  
  let paidAllBills = true;
  let debtPaid = 0;
  
  for (const loan of state.loans) {
    if (state.cash >= loan.monthlyPayment) {
      state.cash -= loan.monthlyPayment;
      debtPaid += loan.monthlyPayment;
      const { newBalance } = processLoanPayment(loan);
      loan.balance = newBalance;
      loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);
    } else if (state.savings >= loan.monthlyPayment) {
      state.savings -= loan.monthlyPayment;
      debtPaid += loan.monthlyPayment;
      const { newBalance } = processLoanPayment(loan);
      loan.balance = newBalance;
      loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);
    } else {
      paidAllBills = false;
    }
  }
  
  state.loans = state.loans.filter(l => l.balance > 0);
  state.checking = state.cash;
  if (state.cash < 0) paidAllBills = false;
  
  state.creditScore = updateCreditScore(state, paidAllBills, 0);
  state.creditHistory++;
  
  simulateInvestments(state, rng);
  
  let repairCostPaid = 0;
  if (state.vehicle) {
    depreciateVehicle(state.vehicle);
    
    if (rng.boolean((100 - state.vehicle.reliability) / 500)) {
      const repairCost = rng.range(200, 1500);
      if (state.cash >= repairCost) {
        state.cash -= repairCost;
        repairCostPaid = repairCost;
      }
    }
  }
  
  for (const property of state.properties) {
    appreciateProperty(property, state.economicState);
  }
  
  let promotionOccurred = false;
  let layoffOccurred = false;
  
  if (state.employment) {
    const promotionResult = checkForPromotion(state, rng);
    if (promotionResult.promoted && promotionResult.newJob) {
      promotionOccurred = true;
      const newEmployment = hireForJob(state, promotionResult.newJob, rng);
      newEmployment.monthsEmployed = state.employment.monthsEmployed;
      newEmployment.performance = Math.min(70, state.employment.performance);
      state.employment = newEmployment;
      
      state.timeline.push({
        date: { ...state.date },
        age: state.age,
        type: 'career',
        title: `Promoted to ${promotionResult.newJob.title}`,
        description: `Promoted after ${newEmployment.monthsEmployed} months`,
        netWorthAtTime: calculateNetWorth(state),
      });
    }
    
    if (!promotionOccurred && checkForLayoff(state, rng)) {
      layoffOccurred = true;
      state.timeline.push({
        date: { ...state.date },
        age: state.age,
        type: 'career',
        title: 'Lost Job',
        description: `Laid off from ${state.employment.title}`,
        netWorthAtTime: calculateNetWorth(state),
      });
      state.employment = null;
    }
  }
  
  if (state.currentEducation) {
    const studyDrain = state.currentEducation.isPartTime ? 6 : 14;
    state.stats.energy = Math.max(0, state.stats.energy - studyDrain);
    state.stats.stress = Math.min(100, state.stats.stress + (state.currentEducation.isPartTime ? 3 : 8));
    const skillKey = state.currentEducation.type === 'trade_school' || state.currentEducation.type === 'certification'
      ? 'trade'
      : state.currentEducation.type === 'university' || state.currentEducation.type === 'graduate'
        ? 'technical'
        : 'communication';
    state.skills[skillKey] = Math.min(100, state.skills[skillKey] + (state.currentEducation.isPartTime ? 1 : 2));
    state.currentEducation.monthsRemaining--;
    
    if (state.currentEducation.monthsRemaining <= 0) {
      state.education = state.currentEducation.targetLevel;
      state.timeline.push({
        date: { ...state.date },
        age: state.age,
        type: 'education',
        title: `Completed ${state.currentEducation.name}`,
        description: `Achieved ${state.currentEducation.targetLevel} education level`,
        netWorthAtTime: calculateNetWorth(state),
      });
      state.currentEducation = null;
    }
  }
  
  for (const child of state.children) {
    child.age += 1 / 12;
  }
  
  const events: GameEvent[] = [];
  const selectedEvent = selectRandomEvent(state, rng);
  if (selectedEvent) {
    events.push(selectedEvent);
  }
  
  decrementEventCooldowns(state);
  
  state.stats.health = Math.max(STAT_LIMITS.min, Math.min(STAT_LIMITS.max, 
    state.stats.health + MONTHLY_STAT_DECAY.health));
  state.stats.stress = Math.max(STAT_LIMITS.min, Math.min(STAT_LIMITS.max, 
    state.stats.stress + MONTHLY_STAT_DECAY.stress));
  state.stats.happiness = Math.max(STAT_LIMITS.min, Math.min(STAT_LIMITS.max, 
    state.stats.happiness + MONTHLY_STAT_DECAY.happiness));
  
  if (!paidAllBills || state.cash < 100) {
    state.stats.stress = Math.min(100, state.stats.stress + 12);
    state.stats.happiness = Math.max(0, state.stats.happiness - 8);
  } else if (state.savings > state.monthlyExpenses * 3) {
    state.stats.stress = Math.max(0, state.stats.stress - 4);
  }

  applyRetirementMatch(state);
  
  if (state.employment) {
    const job = getJobById(state.employment.jobId);
    if (job) {
      state.stats.stress = Math.min(100, state.stats.stress + (job.stressLevel - 50) / 10);
    }
  }
  
  updateEconomicState(state, rng);
  
  const news = generateMonthlyNews(state, rng);
  for (const headline of news) {
    state.newsHistory.push({
      date: { ...state.date },
      headline,
      description: '',
    });
  }
  
  if (state.newsHistory.length > 50) {
    state.newsHistory = state.newsHistory.slice(-50);
  }
  
  const newMilestones = checkMilestones(state);
  
  advanceDate(state);
  
  const netCashFlow = income.total - livingExpenses - debtPaid - repairCostPaid;
  const netWorthAfter = calculateNetWorth(state);
  state.netWorthHistory.push(netWorthAfter);
  if (state.netWorthHistory.length > 1200) {
    state.netWorthHistory = state.netWorthHistory.slice(-1200);
  }
  
  state.currentSeed = rng.getSeed();
  
  const report: MonthlyReport = {
    date: state.date,
    age: state.age,
    income,
    expenses,
    netCashFlow,
    netWorthBefore,
    netWorthAfter,
    netWorthChange: netWorthAfter - netWorthBefore,
    creditScoreBefore,
    creditScoreAfter: state.creditScore,
    events,
    news: news.map(h => ({ date: state.date, headline: h, description: '' })),
  };
  
  return {
    report,
    events,
    promotionOccurred,
    layoffOccurred,
    newMilestones,
  };
}

function coverShortfallFromSavings(state: GameState): void {
  if (state.cash >= 0) return;
  const needed = Math.abs(state.cash);
  const pulled = Math.min(state.savings, needed);
  state.savings -= pulled;
  state.cash += pulled;
}

function applyRetirementMatch(state: GameState): void {
  if (!state.employment) return;
  const job = getJobById(state.employment.jobId);
  if (!job?.benefits) return;
  const retirement = state.investments.find(inv => inv.isRetirement);
  if (!retirement) return;
  const match = Math.round(state.employment.monthlyPay * 0.03);
  retirement.currentValue += match;
  retirement.employerMatch = match;
}

function simulateBusinesses(state: GameState, rng: SeededRandom): void {
  const econ = ECONOMIC_MODIFIERS[state.economicState].businessGrowth;
  const failedIds: string[] = [];

  for (const biz of state.businesses) {
    const config = BUSINESS_TYPES[biz.type as keyof typeof BUSINESS_TYPES];
    if (!config) continue;

    biz.monthsOperating++;
    const growth = ((biz.reputation / 100) * 0.08 + 0.02) * econ;
    const churn = rng.float(0.03, 0.1);
    biz.customers = Math.max(0, Math.round(biz.customers * (1 + growth - churn) + rng.range(0, 2)));
    biz.customers = Math.min(config.maxCustomers, biz.customers);
    biz.monthlyRevenue = Math.round(biz.customers * config.revenuePerCustomer * econ);
    biz.monthlyExpenses = Math.round(config.monthlyOverhead + biz.employees * 2800);
    biz.reputation = Math.max(5, Math.min(100, biz.reputation + rng.range(-2, 3)));

    const losing = biz.monthlyRevenue < biz.monthlyExpenses * 0.6;
    if (biz.monthsOperating > 4 && losing && rng.boolean(config.failureRate / 8)) {
      failedIds.push(biz.id);
      state.timeline.push({
        date: { ...state.date },
        age: state.age,
        type: 'business',
        title: `${biz.name} failed`,
        description: 'The business could not cover its costs.',
        netWorthAtTime: calculateNetWorth(state),
      });
    }
  }

  if (failedIds.length > 0) {
    state.businesses = state.businesses.filter(biz => !failedIds.includes(biz.id));
  }
}

function advanceDate(state: GameState): void {
  state.date.month++;
  if (state.date.month > 12) {
    state.date.month = 1;
    state.date.year++;
    state.age++;
    
    checkForDeath(state);
  }
}

function checkForDeath(state: GameState): void {
  const baseLifeExpectancy = HEALTH_FACTORS.baseLifeExpectancy;
  
  let lifeExpectancy = baseLifeExpectancy;
  lifeExpectancy += (state.stats.health - 50) * HEALTH_FACTORS.stressImpact * -1;
  lifeExpectancy -= (state.stats.stress - 50) * Math.abs(HEALTH_FACTORS.stressImpact);
  
  const netWorth = calculateNetWorth(state);
  if (netWorth > 1000000) {
    lifeExpectancy += HEALTH_FACTORS.wealthBonus * 100;
  } else if (netWorth > 100000) {
    lifeExpectancy += HEALTH_FACTORS.wealthBonus * 50;
  }
  
  const rng = new SeededRandom(state.currentSeed);
  const variance = rng.normal(0, HEALTH_FACTORS.randomVariance);
  const effectiveLifeExpectancy = lifeExpectancy + variance;
  
  if (state.age >= effectiveLifeExpectancy) {
    const deathChance = (state.age - effectiveLifeExpectancy + 10) / 30;
    if (rng.boolean(Math.min(0.95, Math.max(0.01, deathChance)))) {
      state.isAlive = false;
      state.deathAge = state.age;
    }
  }
  
  state.currentSeed = rng.getSeed();
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}

export function formatDate(date: DateInfo): string {
  return `${getMonthName(date.month)} ${date.year}`;
}
