import { describe, it, expect } from 'vitest';
import { generateStartingLife } from '../game/simulation/lifeGenerator';
import { calculateNetWorth } from '../game/simulation/financialSystem';
import { getAvailableJobs } from '../game/simulation/careerSystem';
import { getEligibleEvents } from '../game/simulation/eventSystem';

describe('generateStartingLife', () => {
  it('should create a valid game state', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    
    expect(state.name).toBe('Test');
    expect(state.hometown).toBe('Testville');
    expect(state.age).toBe(18);
    expect(state.cash).toBeGreaterThan(0);
    expect(state.isAlive).toBe(true);
    expect(state.timeline.length).toBeGreaterThan(0);
  });

  it('should produce deterministic results with same seed', () => {
    const state1 = generateStartingLife('Test', 'Testville', 12345);
    const state2 = generateStartingLife('Test', 'Testville', 12345);
    
    expect(state1.socioeconomicBackground).toBe(state2.socioeconomicBackground);
    expect(state1.cash).toBe(state2.cash);
    expect(state1.creditScore).toBe(state2.creditScore);
  });

  it('should vary socioeconomic backgrounds', () => {
    const backgrounds = new Set<string>();
    
    for (let i = 0; i < 100; i++) {
      const state = generateStartingLife('Test', 'Testville');
      backgrounds.add(state.socioeconomicBackground);
    }
    
    expect(backgrounds.size).toBeGreaterThan(3);
  });
});

describe('calculateNetWorth', () => {
  it('should sum assets and subtract liabilities', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    state.cash = 5000;
    state.checking = 5000;
    state.savings = 3000;
    state.loans = [];
    state.vehicle = null;
    state.investments = [];
    state.properties = [];
    state.businesses = [];
    
    const netWorth = calculateNetWorth(state);
    expect(netWorth).toBe(8000);
  });

  it('should subtract loan balances', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    state.cash = 5000;
    state.checking = 0;
    state.savings = 0;
    state.vehicle = null;
    state.investments = [];
    state.properties = [];
    state.businesses = [];
    state.loans = [{
      id: 'test',
      type: 'personal',
      principal: 3000,
      balance: 3000,
      apr: 0.1,
      minimumPayment: 100,
      monthlyPayment: 100,
      termMonths: 36,
      remainingMonths: 36,
    }];
    
    const netWorth = calculateNetWorth(state);
    expect(netWorth).toBe(2000);
  });

  it('should include vehicle value', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    state.cash = 0;
    state.checking = 0;
    state.savings = 0;
    state.loans = [];
    state.investments = [];
    state.properties = [];
    state.businesses = [];
    state.vehicle = {
      id: 'car1',
      name: 'Test Car',
      type: 'used_economy',
      purchasePrice: 10000,
      currentValue: 8000,
      monthlyInsurance: 100,
      monthlyFuel: 100,
      reliability: 80,
      age: 2,
      loanId: null,
    };
    
    const netWorth = calculateNetWorth(state);
    expect(netWorth).toBe(8000);
  });
});

describe('getEligibleJobs', () => {
  it('should return jobs for high school graduates', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    state.education = 'high_school';
    state.totalWorkExperience = 0;
    
    const jobs = getAvailableJobs(state);
    expect(jobs.length).toBeGreaterThan(0);
  });

  it('should return more jobs with more experience', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    state.education = 'high_school';
    
    state.totalWorkExperience = 0;
    const jobsNoExp = getAvailableJobs(state);
    
    state.totalWorkExperience = 60;
    const jobsWithExp = getAvailableJobs(state);
    
    expect(jobsWithExp.length).toBeGreaterThanOrEqual(jobsNoExp.length);
  });

  it('should return more jobs with higher education', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    state.totalWorkExperience = 0;
    state.skills.technical = 40;
    state.skills.communication = 20;
    
    state.education = 'high_school';
    const hsJobs = getAvailableJobs(state);
    
    state.education = 'bachelor';
    const bachelorJobs = getAvailableJobs(state);
    
    expect(hsJobs.some(job => job.id === 'junior_developer')).toBe(false);
    expect(bachelorJobs.some(job => job.id === 'junior_developer')).toBe(true);
    expect(bachelorJobs.length).toBeGreaterThan(hsJobs.length);
  });
});

describe('getEligibleEvents', () => {
  it('should return events based on requirements', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    
    const events = getEligibleEvents(state);
    expect(events.length).toBeGreaterThan(0);
  });

  it('should exclude events on cooldown', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    state.eventCooldowns = { 'car_breakdown_minor': 10 };
    
    const events = getEligibleEvents(state);
    const hasCarBreakdown = events.some(e => e.id === 'car_breakdown_minor');
    expect(hasCarBreakdown).toBe(false);
  });

  it('should include vehicle events only when player has vehicle', () => {
    const state = generateStartingLife('Test', 'Testville', 12345);
    
    state.vehicle = null;
    const eventsNoVehicle = getEligibleEvents(state);
    const vehicleEventsNoVehicle = eventsNoVehicle.filter(e => 
      e.requirements?.hasVehicle === true
    );
    expect(vehicleEventsNoVehicle.length).toBe(0);
    
    state.vehicle = {
      id: 'car1',
      name: 'Test Car',
      type: 'used_economy',
      purchasePrice: 10000,
      currentValue: 8000,
      monthlyInsurance: 100,
      monthlyFuel: 100,
      reliability: 80,
      age: 2,
      loanId: null,
    };
    const eventsWithVehicle = getEligibleEvents(state);
    const vehicleEventsWithVehicle = eventsWithVehicle.filter(e => 
      e.requirements?.hasVehicle === true
    );
    expect(vehicleEventsWithVehicle.length).toBeGreaterThan(0);
  });
});
