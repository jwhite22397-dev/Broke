import type { EducationLevel, GameState, HousingType, Investment, VehicleType } from '../models/types';
import { SeededRandom } from '../engine/random';
import {
  BUSINESS_TYPES,
  ECONOMIC_MODIFIERS,
  EDUCATION_COSTS,
  HOUSING_COSTS,
  LOAN_RATES,
  VEHICLE_COSTS,
} from '../balance/constants';
import { CITIES, getCityById } from '../../data/cities/cities';
import { calculateLoanPayment, calculateNetWorth, updateCreditScore } from './financialSystem';

type EducationProgram = NonNullable<GameState['currentEducation']>['type'];

export interface ActionResult {
  ok: boolean;
  message: string;
}

const PARTNER_NAMES = ['Jordan', 'Riley', 'Avery', 'Cameron', 'Quinn', 'Morgan', 'Parker', 'Reese', 'Skyler', 'Drew'];

const VEHICLE_NAMES: Record<Exclude<VehicleType, 'none' | 'public_transit'>, string[]> = {
  beater: ['2009 Civic', '2008 Corolla', '2010 Focus'],
  used_economy: ['2017 Corolla', '2016 Civic', '2018 Elantra'],
  used_midrange: ['2019 Accord', '2018 Camry', '2019 Mazda6'],
  new_economy: ['2024 Corolla', '2024 Civic', '2024 Elantra'],
  new_midrange: ['2024 Accord', '2024 Camry', '2024 Tucson'],
  luxury: ['2024 Luxury Sedan', '2024 Performance Coupe', '2024 Premium SUV'],
};

function fail(message: string): ActionResult {
  return { ok: false, message };
}

function ok(message: string): ActionResult {
  return { ok: true, message };
}

function syncCash(state: GameState): void {
  state.checking = state.cash;
}

function rateFor(kind: keyof typeof LOAN_RATES, creditScore: number): number {
  const band = LOAN_RATES[kind];
  if (!band) return 0.12;
  if (creditScore >= 740) return band.goodCreditRate;
  if (creditScore >= 680) return band.minRate + 0.01;
  if (creditScore >= 640) return (band.minRate + band.maxRate) / 2;
  return band.maxRate;
}

function remember(state: GameState, entry: GameState['timeline'][number]): void {
  state.timeline.push(entry);
}

export function transferToSavings(state: GameState, amount: number): ActionResult {
  const move = Math.round(amount);
  if (move <= 0) return fail('Enter an amount to save.');
  if (move > state.cash) return fail('Not enough cash.');
  state.cash -= move;
  state.savings += move;
  syncCash(state);
  return ok(`Moved ${money(move)} into savings.`);
}

export function withdrawSavings(state: GameState, amount: number): ActionResult {
  const move = Math.round(amount);
  if (move <= 0) return fail('Enter an amount to withdraw.');
  if (move > state.savings) return fail('Savings are smaller than that.');
  state.savings -= move;
  state.cash += move;
  syncCash(state);
  return ok(`Moved ${money(move)} back to cash.`);
}

export function payExtraOnLoan(state: GameState, loanId: string, amount: number): ActionResult {
  const loan = state.loans.find(item => item.id === loanId);
  if (!loan) return fail('That debt is already gone.');
  const pay = Math.min(Math.round(amount), loan.balance);
  if (pay <= 0) return fail('Enter a payment amount.');
  if (pay > state.cash) return fail('Not enough cash for that payment.');
  state.cash -= pay;
  loan.balance = Math.max(0, loan.balance - pay);
  syncCash(state);
  if (loan.balance <= 0) {
    state.loans = state.loans.filter(item => item.id !== loanId);
    if (state.vehicle?.loanId === loanId && state.vehicle) state.vehicle.loanId = null;
    for (const property of state.properties) {
      if (property.mortgageId === loanId) property.mortgageId = null;
    }
    remember(state, {
      date: { ...state.date },
      age: state.age,
      type: 'financial',
      title: `Paid off ${loan.type.replace('_', ' ')}`,
      netWorthAtTime: calculateNetWorth(state),
    });
    return ok(`Paid off the ${loan.type.replace('_', ' ')}.`);
  }
  return ok(`Paid ${money(pay)} extra. ${money(loan.balance)} remains.`);
}

export function enrollInEducation(state: GameState, programId: string, partTime: boolean, finance: boolean): ActionResult {
  if (state.currentEducation) return fail('You are already in school.');
  const program = EDUCATION_COSTS[programId];
  if (!program) return fail('That program does not exist.');
  if (!canEnroll(state.education, programId)) {
    return fail('Your current education does not qualify you for that program.');
  }

  const monthlyCost = partTime ? program.monthlyPart : program.monthlyFull;
  const months = partTime ? program.durationMonthsPart : program.durationMonthsFull;
  const totalCost = monthlyCost * months;

  if (finance) {
    if (state.creditScore > 0 && state.creditScore < 520) {
      return fail('Lenders turned down the student loan.');
    }
    const apr = rateFor('student', state.creditScore || 640);
    const term = Math.max(months, 120);
    const payment = calculateLoanPayment(totalCost, apr, term);
    state.loans.push({
      id: newId(state, 'loan'),
      type: 'student',
      principal: totalCost,
      balance: totalCost,
      apr,
      minimumPayment: payment,
      monthlyPayment: payment,
      termMonths: term,
      remainingMonths: term,
    });
    state.creditScore = updateCreditScore(state, true, totalCost);
  } else if (state.cash < monthlyCost) {
    return fail(`You need at least ${money(monthlyCost)} to cover the first month.`);
  }

  state.currentEducation = {
    id: programId,
    type: programId as EducationProgram,
    name: programName(programId),
    monthsRemaining: months,
    totalMonths: months,
    monthlyCost: finance ? 0 : monthlyCost,
    isPartTime: partTime,
    targetLevel: program.targetLevel,
  };
  state.stats.energy = Math.max(0, state.stats.energy - 5);
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'education',
    title: `Enrolled in ${programName(programId)}`,
    description: finance ? `Financed ${money(totalCost)}` : `${money(monthlyCost)} per month`,
    netWorthAtTime: calculateNetWorth(state),
  });
  syncCash(state);
  return ok(finance
    ? `Enrolled. A ${money(totalCost)} student loan will cover tuition.`
    : `Enrolled. Tuition is ${money(monthlyCost)} per month.`);
}

export function canStartProgram(level: EducationLevel, programId: string): boolean {
  return canEnroll(level, programId);
}

function canEnroll(level: EducationLevel, programId: string): boolean {
  if (programId === 'ged') return level === 'no_diploma';
  if (programId === 'community_college' || programId === 'trade_school' || programId === 'certification') {
    return level === 'ged' || level === 'high_school' || level === 'some_college';
  }
  if (programId === 'university') {
    return level === 'ged' || level === 'high_school' || level === 'some_college' || level === 'associate';
  }
  if (programId === 'graduate') return level === 'bachelor';
  return false;
}

function programName(programId: string): string {
  const names: Record<string, string> = {
    ged: 'GED Program',
    community_college: 'Community College',
    trade_school: 'Trade School',
    university: "Bachelor's Program",
    graduate: 'Graduate Program',
    certification: 'Certification Program',
  };
  return names[programId] ?? programId;
}

export function changeHousing(state: GameState, housing: HousingType): ActionResult {
  if (housing === 'owned_home' || housing === 'nice_home' || housing === 'luxury_home') {
    return fail('Buy a home from the housing list instead of renting one.');
  }
  if (state.housing === housing) return fail('You already live there.');
  const city = getCityById(state.cityId);
  const multiplier = city?.rentMultiplier ?? 1;
  const costs = HOUSING_COSTS[housing];

  if (housing === 'with_family') {
    state.housing = 'with_family';
    state.monthlyRent = 0;
    state.householdContribution = state.socioeconomicBackground === 'privileged' ? 0 : 250;
    state.stats.happiness = Math.max(0, state.stats.happiness - 4);
    remember(state, {
      date: { ...state.date },
      age: state.age,
      type: 'financial',
      title: 'Moved back in with family',
      netWorthAtTime: calculateNetWorth(state),
    });
    return ok('You moved back in with family.');
  }

  if (housing === 'homeless') {
    state.housing = 'homeless';
    state.monthlyRent = 0;
    state.householdContribution = 0;
    state.stats.happiness = Math.max(0, state.stats.happiness - 20);
    state.stats.stress = Math.min(100, state.stats.stress + 20);
    return ok('You have nowhere stable to stay.');
  }

  const rent = Math.round(costs.baseRent * multiplier);
  const moveIn = rent * 2;
  if (state.cash < moveIn) return fail(`Moving in costs ${money(moveIn)} for rent and deposit.`);
  state.cash -= moveIn;
  state.housing = housing;
  state.monthlyRent = rent;
  state.householdContribution = 0;
  state.stats.happiness = Math.min(100, state.stats.happiness + Math.round(costs.happinessBonus / 5));
  syncCash(state);
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'financial',
    title: `Moved into ${housing.replaceAll('_', ' ')}`,
    description: `${money(rent)} per month`,
    netWorthAtTime: calculateNetWorth(state),
  });
  return ok(`You're in. Rent is ${money(rent)} a month.`);
}

export function purchaseVehicle(state: GameState, vehicleType: VehicleType, finance: boolean): ActionResult {
  if (vehicleType === 'none') {
    return sellVehicle(state);
  }
  if (state.vehicle && state.vehicle.type !== 'public_transit' && state.vehicle.type !== 'none') {
    return fail('Sell your current vehicle first.');
  }
  if (vehicleType === 'public_transit') {
    state.vehicle = {
      id: newId(state, 'vehicle'),
      name: 'Transit Pass',
      type: 'public_transit',
      purchasePrice: 0,
      currentValue: 0,
      monthlyInsurance: 0,
      monthlyFuel: VEHICLE_COSTS.public_transit.fuel,
      reliability: 90,
      age: 0,
      loanId: null,
    };
    return ok('You are getting around on public transit.');
  }

  const spec = VEHICLE_COSTS[vehicleType];
  const quote = quotedVehicle(state, vehicleType);
  const price = quote.price;
  const name = quote.name;

  if (!finance) {
    if (state.cash < price) return fail(`${name} costs ${money(price)} cash.`);
    state.cash -= price;
    state.vehicle = makeVehicle(state, name, vehicleType, price, spec, null);
    recordCarDecision(state, name, price, price);
    syncCash(state);
    return ok(`Bought the ${name} for ${money(price)}.`);
  }

  if ((state.creditScore || 0) < 560 && state.creditScore !== 0) {
    return fail('Your credit is too thin for an auto loan.');
  }
  const down = Math.round(price * (state.creditScore >= 700 ? 0.1 : 0.2));
  if (state.cash < down) return fail(`You need ${money(down)} down.`);
  const principal = price - down;
  const apr = rateFor('auto', state.creditScore || 600);
  const term = vehicleType === 'beater' ? 36 : 72;
  const payment = calculateLoanPayment(principal, apr, term);
  const loanId = newId(state, 'loan');
  state.cash -= down;
  state.loans.push({
    id: loanId,
    type: 'auto',
    principal,
    balance: principal,
    apr,
    minimumPayment: payment,
    monthlyPayment: payment,
    termMonths: term,
    remainingMonths: term,
    assetId: 'pending-vehicle',
  });
  state.vehicle = makeVehicle(state, name, vehicleType, price, spec, loanId);
  state.creditScore = updateCreditScore(state, true, principal);
  const totalFinanced = payment * term + down;
  recordCarDecision(state, name, totalFinanced, price);
  syncCash(state);
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'financial',
    title: `Financed a ${name}`,
    description: `${money(payment)}/mo at ${(apr * 100).toFixed(1)}% for ${term} months`,
    netWorthAtTime: calculateNetWorth(state),
  });
  return ok(`${name}: ${money(down)} down, ${money(payment)}/mo. Total payments about ${money(totalFinanced)}.`);
}

function recordCarDecision(state: GameState, name: string, actualCost: number, price: number): void {
  const cheap = VEHICLE_COSTS.used_economy.priceMin;
  state.majorDecisions.push({
    date: { ...state.date },
    type: 'vehicle',
    description: `At age ${state.age} you bought a ${name}.`,
    actualCost,
    alternativeCost: Math.min(price, cheap),
    alternativeDescription: `a ${money(cheap)} used car`,
  });
}

function makeVehicle(
  state: GameState,
  name: string,
  vehicleType: VehicleType,
  price: number,
  spec: (typeof VEHICLE_COSTS)[Exclude<VehicleType, 'none'>],
  loanId: string | null,
): GameState['vehicle'] {
  return {
    id: newId(state, 'vehicle'),
    name,
    type: vehicleType,
    purchasePrice: price,
    currentValue: price,
    monthlyInsurance: spec.insurance,
    monthlyFuel: spec.fuel,
    reliability: spec.reliability,
    age: vehicleType === 'beater' ? 12 : vehicleType.startsWith('used') ? 5 : 0,
    loanId,
  };
}

export function sellVehicle(state: GameState): ActionResult {
  if (!state.vehicle || state.vehicle.type === 'public_transit' || state.vehicle.type === 'none') {
    state.vehicle = null;
    return ok('You are getting around without a car.');
  }
  const sale = Math.round(state.vehicle.currentValue * 0.82);
  const loan = state.loans.find(item => item.id === state.vehicle?.loanId);
  let proceeds = sale;
  if (loan) {
    if (proceeds >= loan.balance) {
      proceeds -= loan.balance;
      state.loans = state.loans.filter(item => item.id !== loan.id);
    } else {
      loan.balance -= proceeds;
      loan.type = 'personal';
      proceeds = 0;
    }
  }
  state.cash += proceeds;
  const soldName = state.vehicle.name;
  state.vehicle = null;
  syncCash(state);
  return ok(`Sold the ${soldName}. ${money(proceeds)} landed in cash.`);
}

export function buyInvestment(state: GameState, type: Investment['type'], amount: number): ActionResult {
  const invest = Math.round(amount);
  if (invest < 100) return fail('The minimum investment is $100.');
  if (invest > state.cash) return fail('Not enough cash.');
  if (state.savings < state.monthlyExpenses && type !== 'high_yield_savings' && invest > state.cash * 0.5) {
    return fail('Build a small cash buffer before putting most of your money in the market.');
  }
  state.cash -= invest;
  const names: Record<Investment['type'], string> = {
    index_fund: 'Broad Market Index',
    bonds: 'Bond Ladder',
    high_yield_savings: 'High-Yield Cash',
    individual_stock: 'Single Company Stock',
    retirement: 'Employer Retirement Plan',
  };
  const isRetirement = type === 'retirement';
  const existing = state.investments.find(item => item.type === type && item.isRetirement === isRetirement);
  if (existing) {
    existing.costBasis += invest;
    existing.currentValue += invest;
  } else {
    state.investments.push({
      id: newId(state, 'inv'),
      type,
      name: names[type],
      shares: invest / 100,
      costBasis: invest,
      currentValue: invest,
      isRetirement,
    });
  }
  if (isRetirement && !state.majorDecisions.some(item => item.type === 'investment')) {
    state.majorDecisions.push({
      date: { ...state.date },
      type: 'investment',
      description: `Opening a retirement account at ${state.age}`,
      actualCost: invest,
      alternativeDescription: 'has been compounding since you opened it',
    });
  }
  syncCash(state);
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'financial',
    title: `Invested in ${names[type]}`,
    description: money(invest),
    netWorthAtTime: calculateNetWorth(state),
  });
  return ok(`Invested ${money(invest)} in ${names[type]}.`);
}

export function purchaseHome(state: GameState, rental: boolean): ActionResult {
  if ((state.creditScore || 0) < 620) return fail('Mortgage lenders want a credit score around 620 or better.');
  const city = getCityById(state.cityId);
  const econ = ECONOMIC_MODIFIERS[state.economicState].housingAppreciation;
  const base = rental ? 165000 : 240000;
  const price = Math.round(base * (city?.homeValueMultiplier ?? 1) * econ);
  const downRatio = state.creditScore >= 700 ? (rental ? 0.2 : 0.1) : (rental ? 0.25 : 0.15);
  const down = Math.round(price * downRatio);
  const closing = Math.round(price * 0.03);
  const cashNeeded = down + closing;
  if (state.cash < cashNeeded) return fail(`You need ${money(cashNeeded)} for the down payment and closing costs.`);
  const principal = price - down;
  const apr = rateFor('mortgage', state.creditScore);
  const payment = calculateLoanPayment(principal, apr, 360);
  const loanId = newId(state, 'loan');
  state.cash -= cashNeeded;
  state.loans.push({
    id: loanId,
    type: 'mortgage',
    principal,
    balance: principal,
    apr,
    minimumPayment: payment,
    monthlyPayment: payment,
    termMonths: 360,
    remainingMonths: 360,
  });
  const operating = Math.round(price * 0.012 / 12) + (rental ? 180 : 150);
  state.properties.push({
    id: newId(state, 'property'),
    type: rental ? 'rental' : 'primary',
    purchasePrice: price,
    currentValue: price,
    monthlyRent: rental ? Math.round(price * 0.007) : undefined,
    mortgageId: loanId,
    monthlyExpenses: operating,
    vacancy: rental ? 0.08 : 0,
  });
  if (!rental) {
    state.housing = 'owned_home';
    state.monthlyRent = 0;
    state.householdContribution = 0;
  }
  state.creditScore = updateCreditScore(state, true, principal);
  syncCash(state);
  state.majorDecisions.push({
    date: { ...state.date },
    type: 'housing',
    description: rental ? `Bought a rental for ${money(price)}` : `Bought a home for ${money(price)}`,
    actualCost: price,
    alternativeCost: cashNeeded,
    alternativeDescription: 'keeping the down payment invested',
  });
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'financial',
    title: rental ? 'Bought a rental property' : 'Bought a home',
    description: `${money(price)} with ${money(payment)}/mo`,
    netWorthAtTime: calculateNetWorth(state),
  });
  return ok(rental
    ? `Rental purchased for ${money(price)}. Mortgage is ${money(payment)}/mo.`
    : `You own a home. Mortgage is ${money(payment)}/mo, before taxes and upkeep.`);
}

export function startBusiness(state: GameState, type: keyof typeof BUSINESS_TYPES): ActionResult {
  const config = BUSINESS_TYPES[type];
  if (!config) return fail('Unknown business.');
  if (state.businesses.length >= 2) return fail('Two businesses is already a lot to run.');
  if (state.cash < config.startupCost) return fail(`Startup costs are ${money(config.startupCost)}.`);
  if (state.skills.entrepreneurship < 8 && state.totalWorkExperience < 24) {
    return fail('Get more work experience or practice the entrepreneurship skill first.');
  }
  state.cash -= config.startupCost;
  const label = type.replaceAll('_', ' ');
  state.businesses.push({
    id: newId(state, 'biz'),
    type,
    name: `${state.name.split(' ')[0]} ${label}`,
    monthsOperating: 0,
    monthlyRevenue: Math.round(config.revenuePerCustomer * 3),
    monthlyExpenses: config.monthlyOverhead,
    employees: 0,
    reputation: 35 + Math.round(state.skills.entrepreneurship / 5),
    customers: 3,
    loanId: null,
  });
  state.skills.entrepreneurship = Math.min(100, state.skills.entrepreneurship + 4);
  syncCash(state);
  state.majorDecisions.push({
    date: { ...state.date },
    type: 'business',
    description: `Started a ${label}`,
    actualCost: config.startupCost,
  });
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'business',
    title: `Started a ${label}`,
    description: `Put in ${money(config.startupCost)}`,
    netWorthAtTime: calculateNetWorth(state),
  });
  return ok(`The ${label} is open. Most months will be uneven at first.`);
}

export function hireEmployee(state: GameState, businessId: string): ActionResult {
  const biz = state.businesses.find(item => item.id === businessId);
  if (!biz) return fail('No business found.');
  if (biz.employees >= 5) return fail('The crew is as large as this operation can handle.');
  if (biz.monthlyRevenue < 2800 * (biz.employees + 1)) return fail('Revenue is too thin to cover another paycheck.');
  biz.employees += 1;
  biz.reputation = Math.min(100, biz.reputation + 4);
  return ok(`${biz.name} hired employee #${biz.employees}. Payroll goes up next month.`);
}

export function moveToCity(state: GameState, cityId: string): ActionResult {
  const city = CITIES.find(item => item.id === cityId);
  if (!city) return fail('Unknown city.');
  if (city.id === state.cityId) return fail('You already live there.');
  const movingCost = state.properties.some(item => item.type === 'primary') ? 6000 : 1800;
  if (state.cash < movingCost) return fail(`Moving costs about ${money(movingCost)}.`);
  state.cash -= movingCost;
  state.cityId = city.id;
  if (state.monthlyRent > 0) {
    const base = HOUSING_COSTS[state.housing].baseRent;
    state.monthlyRent = Math.round(base * city.rentMultiplier);
  }
  syncCash(state);
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'event',
    title: `Moved to ${city.name}`,
    description: `${city.costTier.replace('_', ' ')} cost of living`,
    netWorthAtTime: calculateNetWorth(state),
  });
  return ok(`You moved to ${city.name}. Local prices and wages shifted with you.`);
}

export function relationshipAction(state: GameState, action: 'date' | 'commit' | 'marry' | 'breakup' | 'child'): ActionResult {
  const rng = new SeededRandom(state.currentSeed);

  if (action === 'date') {
    if (state.partner) return fail('You are already seeing someone.');
    if (state.cash < 120) return fail('A night out costs about $120.');
    state.cash -= 120;
    const chance = 0.35 + state.stats.happiness / 400;
    if (!rng.boolean(chance)) {
      state.currentSeed = rng.getSeed();
      state.stats.happiness = Math.max(0, state.stats.happiness - 4);
      syncCash(state);
      return ok('The date was fine. Nothing came of it.');
    }
    state.partner = {
      name: rng.pick(PARTNER_NAMES),
      age: Math.max(18, state.age + rng.range(-4, 4)),
      monthlyIncome: rng.range(2200, 7000),
      spendingTendency: rng.float(0.2, 0.85),
      compatibility: rng.range(45, 95),
      financialHabits: rng.range(25, 90),
    };
    state.relationshipStatus = 'dating';
    state.stats.happiness = Math.min(100, state.stats.happiness + 12);
    state.currentSeed = rng.getSeed();
    syncCash(state);
    remember(state, {
      date: { ...state.date },
      age: state.age,
      type: 'relationship',
      title: `Started dating ${state.partner.name}`,
      netWorthAtTime: calculateNetWorth(state),
    });
    return ok(`You and ${state.partner.name} decide to keep seeing each other.`);
  }

  if (!state.partner) return fail('You are single.');

  if (action === 'commit') {
    if (state.relationshipStatus !== 'dating') return fail('You are already past casual dating.');
    state.relationshipStatus = 'serious';
    state.stats.happiness = Math.min(100, state.stats.happiness + 6);
    return ok(`You and ${state.partner.name} are in a serious relationship.`);
  }

  if (action === 'marry') {
    if (state.relationshipStatus !== 'serious' && state.relationshipStatus !== 'engaged') {
      return fail('Get serious before planning a wedding.');
    }
    const cost = state.lifestyle === 'luxury' ? 18000 : state.lifestyle === 'bare_bones' ? 1500 : 7000;
    if (state.cash < cost) return fail(`A wedding at your lifestyle costs about ${money(cost)}.`);
    state.cash -= cost;
    state.relationshipStatus = 'married';
    state.stats.happiness = Math.min(100, state.stats.happiness + 15);
    syncCash(state);
    remember(state, {
      date: { ...state.date },
      age: state.age,
      type: 'relationship',
      title: `Married ${state.partner.name}`,
      description: `Wedding cost ${money(cost)}`,
      netWorthAtTime: calculateNetWorth(state),
    });
    return ok(`You married ${state.partner.name}. Some of their income now supports the household.`);
  }

  if (action === 'child') {
    if (state.relationshipStatus !== 'married' && state.relationshipStatus !== 'serious') {
      return fail('A stable relationship makes this decision easier to simulate.');
    }
    if (state.age < 20 || state.age > 48) return fail('This is not the season of life for a new child.');
    if (state.children.length >= 4) return fail('The household is already full.');
    state.children.push({
      name: rng.pick(['Sam', 'Noah', 'Eden', 'Rowan', 'Kai', 'Remy', 'Jules', 'Ari']),
      age: 0,
      monthlyExpenses: 800,
    });
    state.currentSeed = rng.getSeed();
    state.stats.happiness = Math.min(100, state.stats.happiness + 10);
    state.stats.stress = Math.min(100, state.stats.stress + 12);
    state.stats.energy = Math.max(0, state.stats.energy - 10);
    const child = state.children[state.children.length - 1]!;
    remember(state, {
      date: { ...state.date },
      age: state.age,
      type: 'relationship',
      title: `${child.name} was born`,
      netWorthAtTime: calculateNetWorth(state),
    });
    return ok(`${child.name} joined the family. Childcare and time just became part of the budget.`);
  }

  const married = state.relationshipStatus === 'married';
  const cost = married ? Math.min(25000, Math.max(2000, Math.round(state.cash * 0.15 + 3000))) : 0;
  if (married && state.cash < cost) {
    state.cash = Math.max(0, state.cash - cost);
  } else {
    state.cash -= cost;
  }
  if (married) {
    state.savings = Math.round(state.savings * 0.6);
    state.relationshipStatus = 'divorced';
  } else {
    state.relationshipStatus = 'single';
  }
  const former = state.partner.name;
  state.partner = null;
  state.stats.happiness = Math.max(0, state.stats.happiness - (married ? 20 : 10));
  state.stats.stress = Math.min(100, state.stats.stress + (married ? 20 : 8));
  state.currentSeed = rng.getSeed();
  syncCash(state);
  remember(state, {
    date: { ...state.date },
    age: state.age,
    type: 'relationship',
    title: married ? `Divorced ${former}` : `Broke up with ${former}`,
    description: married ? `Settlement and costs about ${money(cost)}` : undefined,
    netWorthAtTime: calculateNetWorth(state),
  });
  return ok(married ? `The divorce from ${former} is final.` : `You and ${former} went separate ways.`);
}

function money(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function newId(state: GameState, prefix: string): string {
  const rng = new SeededRandom(state.currentSeed);
  const id = `${prefix}_${state.date.year}${state.date.month}_${rng.range(1000, 9999)}`;
  state.currentSeed = rng.getSeed();
  return id;
}

export function quotedVehicle(state: GameState, vehicleType: Exclude<VehicleType, 'none' | 'public_transit'>): {
  name: string;
  price: number;
  payment: number;
  apr: number;
  down: number;
  term: number;
  total: number;
} {
  const spec = VEHICLE_COSTS[vehicleType];
  const rng = new SeededRandom(state.seed + vehicleType.length * 17 + state.age);
  const price = rng.range(spec.priceMin, spec.priceMax);
  const name = rng.pick(VEHICLE_NAMES[vehicleType]);
  const apr = rateFor('auto', state.creditScore || 600);
  const down = Math.round(price * (state.creditScore >= 700 ? 0.1 : 0.2));
  const term = vehicleType === 'beater' ? 36 : 72;
  const payment = calculateLoanPayment(price - down, apr, term);
  return { name, price, payment, apr, down, term, total: payment * term + down };
}

export function quotedHome(state: GameState, rental: boolean): { price: number; down: number; payment: number; cashNeeded: number } {
  const city = getCityById(state.cityId);
  const econ = ECONOMIC_MODIFIERS[state.economicState].housingAppreciation;
  const price = Math.round((rental ? 165000 : 240000) * (city?.homeValueMultiplier ?? 1) * econ);
  const downRatio = state.creditScore >= 700 ? (rental ? 0.2 : 0.1) : (rental ? 0.25 : 0.15);
  const down = Math.round(price * downRatio);
  const apr = rateFor('mortgage', Math.max(state.creditScore, 620));
  const payment = calculateLoanPayment(price - down, apr, 360);
  return { price, down, payment, cashNeeded: down + Math.round(price * 0.03) };
}
