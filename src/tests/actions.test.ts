import { describe, it, expect } from 'vitest';
import { generateStartingLife } from '../game/simulation/lifeGenerator';
import { simulateMonth } from '../game/simulation/monthlySimulation';
import { calculateNetWorth, simulateInvestments } from '../game/simulation/financialSystem';
import { SeededRandom } from '../game/engine/random';
import { buyInvestment, enrollInEducation, payExtraOnLoan, transferToSavings } from '../game/simulation/actions';
import { getEligibleEvents } from '../game/simulation/eventSystem';
import { getEligibleJobs } from '../data/jobs/jobs';
import { validateGameState } from '../services/storage';
import { EVENTS } from '../data/events/events';

describe('monthly cash flow', () => {
  it('adds job pay and subtracts living costs', () => {
    const state = generateStartingLife('Ada', 'Millbrook', 42);
    state.cash = 1000;
    state.savings = 0;
    state.checking = 1000;
    state.employment = {
      jobId: 'warehouse_associate',
      title: 'Warehouse Associate',
      monthlyPay: 3000,
      hoursPerWeek: 40,
      monthsEmployed: 2,
      performance: 60,
      lastRaise: null,
    };
    state.housing = 'with_family';
    state.householdContribution = 200;
    state.loans = [];
    state.vehicle = null;

    const before = state.cash;
    simulateMonth(state);
    expect(state.cash).not.toBe(before);
    expect(state.monthlyIncome).toBeGreaterThan(2500);
    expect(state.monthlyExpenses).toBeGreaterThan(200);
  });
});

describe('player actions', () => {
  it('moves cash into savings without changing net worth', () => {
    const state = generateStartingLife('Ada', 'Millbrook', 7);
    state.cash = 2000;
    state.savings = 100;
    const before = calculateNetWorth(state);
    const result = transferToSavings(state, 500);
    expect(result.ok).toBe(true);
    expect(state.cash).toBe(1500);
    expect(state.savings).toBe(600);
    expect(calculateNetWorth(state)).toBe(before);
  });

  it('pays down a loan principal', () => {
    const state = generateStartingLife('Ada', 'Millbrook', 7);
    state.cash = 1000;
    state.loans = [{
      id: 'loan1',
      type: 'personal',
      principal: 800,
      balance: 800,
      apr: 0.1,
      minimumPayment: 50,
      monthlyPayment: 50,
      termMonths: 20,
      remainingMonths: 20,
    }];
    const result = payExtraOnLoan(state, 'loan1', 300);
    expect(result.ok).toBe(true);
    expect(state.loans[0]?.balance).toBe(500);
    expect(state.cash).toBe(700);
  });

  it('blocks school the player does not qualify for', () => {
    const state = generateStartingLife('Ada', 'Millbrook', 7);
    state.education = 'high_school';
    state.cash = 10000;
    const result = enrollInEducation(state, 'graduate', true, false);
    expect(result.ok).toBe(false);
    expect(state.currentEducation).toBeNull();
  });
});

describe('investments', () => {
  it('is deterministic for a seed', () => {
    const state = generateStartingLife('Ada', 'Millbrook', 99);
    state.investments = [{
      id: 'idx',
      type: 'index_fund',
      name: 'Index',
      shares: 10,
      costBasis: 1000,
      currentValue: 1000,
      isRetirement: false,
    }];
    const clone = structuredClone(state);
    simulateInvestments(state, new SeededRandom(123));
    simulateInvestments(clone, new SeededRandom(123));
    expect(state.investments[0]?.currentValue).toBe(clone.investments[0]?.currentValue);
    expect(state.investments[0]?.currentValue).not.toBe(1000);
  });

  it('lets the player buy an index fund', () => {
    const state = generateStartingLife('Ada', 'Millbrook', 3);
    state.cash = 2000;
    state.savings = 5000;
    state.monthlyExpenses = 400;
    const result = buyInvestment(state, 'index_fund', 500);
    expect(result.ok).toBe(true);
    expect(state.investments.some(item => item.type === 'index_fund')).toBe(true);
    expect(state.cash).toBe(1500);
  });
});

describe('job and event eligibility', () => {
  it('rejects jobs above the player education', () => {
    const jobs = getEligibleJobs('high_school', 0, {
      technical: 0,
      communication: 10,
      leadership: 0,
      sales: 0,
      financial: 0,
      trade: 0,
      entrepreneurship: 0,
    });
    expect(jobs.some(job => job.id === 'engineering_manager')).toBe(false);
    expect(jobs.some(job => job.tier === 1)).toBe(true);
  });

  it('ships a large event catalog', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(60);
    const state = generateStartingLife('Ada', 'Millbrook', 11);
    expect(getEligibleEvents(state).length).toBeGreaterThan(10);
  });
});

describe('save serialization', () => {
  it('round-trips a life through JSON', () => {
    const state = generateStartingLife('Ada', 'Millbrook', 15);
    const raw = JSON.stringify(state);
    const parsed: unknown = JSON.parse(raw);
    expect(validateGameState(parsed)).toBe(true);
    if (validateGameState(parsed)) {
      expect(parsed.name).toBe('Ada');
      expect(parsed.seed).toBe(state.seed);
      expect(parsed.cash).toBe(state.cash);
    }
  });

  it('rejects corrupted saves', () => {
    expect(validateGameState({ name: 'Nope' })).toBe(false);
    expect(validateGameState(null)).toBe(false);
  });
});
