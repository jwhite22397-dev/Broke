import { SeededRandom, generateSeed } from '../engine/random';
import { STARTING_CONDITIONS, STARTING_AGE, GAME_VERSION, VEHICLE_COSTS, MILESTONES_CONFIG } from '../balance/constants';
import { calculateNetWorth } from './financialSystem';
import { CITIES } from '../../data/cities/cities';
import type { GameState, SocioeconomicClass, Vehicle, Skills, Milestone } from '../models/types';

export function generateStartingLife(name: string, hometown: string, customSeed?: number): GameState {
  const seed = customSeed ?? generateSeed();
  const rng = new SeededRandom(seed);
  
  const socioClass = generateSocioeconomicClass(rng);
  const conditions = STARTING_CONDITIONS[socioClass];
  
  const startingCash = rng.range(conditions.cashMin, conditions.cashMax);
  
  let vehicle: Vehicle | null = null;
  if (conditions.hasVehicle) {
    vehicle = generateStartingVehicle(rng, conditions.vehicleValue);
  }
  
  const city = rng.pick(CITIES.filter(c => c.costTier === 'average' || c.costTier === 'low'));
  
  const skills: Skills = {
    technical: rng.range(0, 10),
    communication: rng.range(5, 15),
    leadership: rng.range(0, 5),
    sales: rng.range(0, 10),
    financial: rng.range(0, 10),
    trade: rng.range(0, 5),
    entrepreneurship: rng.range(0, 5),
  };
  
  const milestones: Milestone[] = MILESTONES_CONFIG.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    achieved: false,
  }));
  
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - STARTING_AGE;
  
  const state: GameState = {
    seed,
    currentSeed: rng.getSeed(),
    name,
    hometown,
    cityId: city.id,
    
    date: { year: currentYear, month: 1 },
    age: STARTING_AGE,
    birthYear,
    
    socioeconomicBackground: socioClass,
    
    stats: {
      health: rng.range(70, 90),
      stress: rng.range(20, 40),
      happiness: rng.range(50, 70),
      energy: rng.range(60, 80),
    },
    
    skills,
    
    cash: startingCash - Math.round(startingCash * 0.2),
    checking: startingCash - Math.round(startingCash * 0.2),
    savings: Math.round(startingCash * 0.2),
    
    education: conditions.education,
    currentEducation: null,
    
    employment: null,
    careerAction: 'normal',
    totalWorkExperience: 0,
    industryExperience: {},
    
    housing: conditions.housing,
    monthlyRent: 0,
    householdContribution: conditions.householdContribution,
    
    vehicle,
    
    loans: [],
    
    creditScore: conditions.creditScore || 0,
    creditHistory: conditions.creditHistory,
    missedPayments: 0,
    
    lifestyle: 'frugal',
    
    relationshipStatus: 'single',
    partner: null,
    children: [],
    
    investments: [],
    
    properties: [],
    
    businesses: [],
    
    economicState: 'normal',
    economicCycleMonth: 0,
    
    timeline: [{
      date: { year: currentYear, month: 1 },
      age: STARTING_AGE,
      type: 'milestone',
      title: 'Life Begins',
      description: `Started life in ${hometown} with ${formatMoney(startingCash)} and a ${getClassDescription(socioClass)} background.`,
      netWorthAtTime: calculateInitialNetWorth(startingCash, vehicle),
    }],
    
    majorDecisions: [],
    milestones,
    
    monthlyIncome: 0,
    monthlyExpenses: conditions.householdContribution,
    
    eventCooldowns: {},
    
    isAlive: true,
    
    newsHistory: [],

    netWorthHistory: [],
    
    version: GAME_VERSION,
  };

  state.netWorthHistory = [calculateNetWorth(state)];

  if (calculateNetWorth(state) > 0) {
    const alreadySolvent = state.milestones.find(item => item.id === 'positive_net_worth');
    if (alreadySolvent) {
      alreadySolvent.achieved = true;
      alreadySolvent.achievedDate = { ...state.date };
    }
  }
  
  return state;
}

function generateSocioeconomicClass(rng: SeededRandom): SocioeconomicClass {
  const classes: SocioeconomicClass[] = [
    'struggling',
    'working_class',
    'lower_middle',
    'middle',
    'upper_middle',
    'privileged',
  ];
  
  const weights = classes.map(c => STARTING_CONDITIONS[c].weight);
  return rng.pickWeighted(classes, weights);
}

function generateStartingVehicle(rng: SeededRandom, targetValue: number): Vehicle {
  let vehicleType: keyof typeof VEHICLE_COSTS;
  
  if (targetValue <= 4000) {
    vehicleType = 'beater';
  } else if (targetValue <= 12000) {
    vehicleType = 'used_economy';
  } else if (targetValue <= 22000) {
    vehicleType = 'used_midrange';
  } else {
    vehicleType = 'new_economy';
  }
  
  const costs = VEHICLE_COSTS[vehicleType];
  const actualValue = rng.range(
    Math.max(costs.priceMin, targetValue * 0.7),
    Math.min(costs.priceMax, targetValue * 1.3)
  );
  
  const vehicleNames: Record<string, string[]> = {
    beater: ['2008 Civic', '2006 Corolla', '2009 Focus', '2007 Accord', '2005 Camry'],
    used_economy: ['2016 Corolla', '2017 Civic', '2015 Elantra', '2016 Mazda3', '2017 Sentra'],
    used_midrange: ['2019 Accord', '2018 Camry', '2019 Sonata', '2018 Altima', '2019 Malibu'],
    new_economy: ['2024 Corolla', '2024 Civic', '2024 Elantra', '2024 Mazda3', '2024 Sentra'],
  };
  
  return {
    id: `vehicle_${Date.now()}`,
    name: rng.pick(vehicleNames[vehicleType] ?? vehicleNames.beater ?? ['Used Car']),
    type: vehicleType,
    purchasePrice: actualValue,
    currentValue: actualValue,
    monthlyInsurance: costs.insurance,
    monthlyFuel: costs.fuel,
    reliability: costs.reliability + rng.range(-10, 10),
    age: vehicleType === 'beater' ? rng.range(10, 18) : vehicleType.startsWith('used') ? rng.range(3, 8) : 0,
    loanId: null,
  };
}

function calculateInitialNetWorth(cash: number, vehicle: Vehicle | null): number {
  let netWorth = cash;
  if (vehicle) {
    netWorth += vehicle.currentValue;
  }
  return netWorth;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function getClassDescription(socioClass: SocioeconomicClass): string {
  const descriptions: Record<SocioeconomicClass, string> = {
    struggling: 'struggling',
    working_class: 'working class',
    lower_middle: 'lower middle class',
    middle: 'middle class',
    upper_middle: 'upper middle class',
    privileged: 'privileged',
  };
  return descriptions[socioClass];
}

export function generateRandomName(rng: SeededRandom): string {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery',
    'Jamie', 'Drew', 'Cameron', 'Sage', 'Reese', 'Skyler', 'Parker', 'Dakota',
  ];
  return rng.pick(firstNames);
}

export function generateRandomHometown(rng: SeededRandom): string {
  const towns = [
    'Springfield', 'Riverside', 'Fairview', 'Madison', 'Georgetown',
    'Franklin', 'Clinton', 'Salem', 'Bristol', 'Greenville',
    'Oakland', 'Burlington', 'Manchester', 'Milton', 'Newport',
  ];
  return rng.pick(towns);
}
