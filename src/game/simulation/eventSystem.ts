import type { GameState, GameEvent, EventChoice, Loan } from '../models/types';
import { SeededRandom } from '../engine/random';
import { EVENTS } from '../../data/events/events';

export function getEligibleEvents(state: GameState): GameEvent[] {
  return EVENTS.filter(event => {
    const cooldown = state.eventCooldowns[event.id] ?? 0;
    if (cooldown > 0) {
      return false;
    }
    
    if (event.requirements) {
      const req = event.requirements;
      
      if (req.minCash !== undefined && state.cash < req.minCash) return false;
      if (req.maxCash !== undefined && state.cash > req.maxCash) return false;
      if (req.minCreditScore !== undefined && state.creditScore < req.minCreditScore) return false;
      if (req.minNetWorth !== undefined) {
        const netWorth = calculateSimpleNetWorth(state);
        if (netWorth < req.minNetWorth) return false;
      }
      if (req.hasVehicle !== undefined && (!!state.vehicle !== req.hasVehicle)) return false;
      if (req.hasJob !== undefined && (!!state.employment !== req.hasJob)) return false;
      if (req.hasPartner !== undefined && (!!state.partner !== req.hasPartner)) return false;
      if (req.educationLevel && !req.educationLevel.includes(state.education)) return false;
      if (req.housingType && !req.housingType.includes(state.housing)) return false;
      if (req.minAge !== undefined && state.age < req.minAge) return false;
      if (req.maxAge !== undefined && state.age > req.maxAge) return false;
    }
    
    return true;
  });
}

export function selectRandomEvent(state: GameState, rng: SeededRandom): GameEvent | null {
  const eligible = getEligibleEvents(state);
  if (eligible.length === 0) return null;
  
  const rarityWeights: Record<string, number> = {
    common: 50,
    uncommon: 25,
    rare: 10,
    very_rare: 2,
  };
  
  const weights = eligible.map(e => rarityWeights[e.rarity] || 10);
  
  const eventChance = 0.35;
  if (!rng.boolean(eventChance)) return null;
  
  return rng.pickWeighted(eligible, weights);
}

export function getAvailableChoices(event: GameEvent, state: GameState): EventChoice[] {
  return event.choices.filter(choice => {
    if (!choice.requirements) return true;
    
    const req = choice.requirements;
    if (req.minCash !== undefined && state.cash < req.minCash) return false;
    if (req.minCreditScore !== undefined && state.creditScore < req.minCreditScore) return false;
    
    return true;
  });
}

export function applyEventChoice(
  state: GameState,
  event: GameEvent,
  choice: EventChoice,
  rng: SeededRandom
): { state: GameState; description: string } {
  const newState = { ...state };
  const effects = choice.effects;
  
  let description = '';
  
  if (effects.cash !== undefined) {
    newState.cash += effects.cash;
    if (effects.cash > 0) {
      description += `Received $${effects.cash}. `;
    } else if (effects.cash < 0) {
      description += `Spent $${Math.abs(effects.cash)}. `;
    }
  }
  
  if (effects.stress !== undefined) {
    newState.stats = {
      ...newState.stats,
      stress: Math.max(0, Math.min(100, newState.stats.stress + effects.stress)),
    };
  }
  
  if (effects.happiness !== undefined) {
    newState.stats = {
      ...newState.stats,
      happiness: Math.max(0, Math.min(100, newState.stats.happiness + effects.happiness)),
    };
  }
  
  if (effects.health !== undefined) {
    newState.stats = {
      ...newState.stats,
      health: Math.max(0, Math.min(100, newState.stats.health + effects.health)),
    };
  }
  
  if (effects.energy !== undefined) {
    newState.stats = {
      ...newState.stats,
      energy: Math.max(0, Math.min(100, newState.stats.energy + effects.energy)),
    };
  }
  
  if (effects.creditScore !== undefined) {
    newState.creditScore = Math.max(300, Math.min(850, newState.creditScore + effects.creditScore));
  }
  
  if (effects.addLoan) {
    const newLoan: Loan = {
      ...effects.addLoan,
      id: `loan_${Date.now()}_${rng.range(1000, 9999)}`,
    };
    newState.loans = [...newState.loans, newLoan];
    description += `Took on $${effects.addLoan.principal} in debt. `;
  }
  
  if (effects.removeLoanId) {
    newState.loans = newState.loans.filter(l => l.id !== effects.removeLoanId);
    description += 'Paid off a loan. ';
  }
  
  if (effects.removeVehicle) {
    newState.vehicle = null;
    description += 'Lost your vehicle. ';
  }
  
  if (effects.addVehicle) {
    newState.vehicle = {
      ...effects.addVehicle,
      id: `vehicle_${Date.now()}`,
    };
    description += `Got a new vehicle: ${effects.addVehicle.name}. `;
  }
  
  if (effects.employment === 'lose') {
    newState.employment = null;
    description += 'Lost your job. ';
  }
  
  if (effects.relationship) {
    newState.relationshipStatus = effects.relationship;
    description += `Relationship status changed to ${effects.relationship}. `;
  }
  
  if (effects.housing) {
    newState.housing = effects.housing.type;
    newState.monthlyRent = effects.housing.rent;
    description += `Moved to ${effects.housing.type.replace('_', ' ')}. `;
  }
  
  if (effects.skill) {
    const skillKey = effects.skill.skill;
    newState.skills = {
      ...newState.skills,
      [skillKey]: Math.min(100, (newState.skills[skillKey] || 0) + effects.skill.amount),
    };
    description += `Gained ${effects.skill.amount} ${skillKey} skill. `;
  }
  
  if (event.cooldownMonths) {
    newState.eventCooldowns = {
      ...newState.eventCooldowns,
      [event.id]: event.cooldownMonths,
    };
  }
  
  if (effects.timeline) {
    newState.timeline = [
      ...newState.timeline,
      {
        ...effects.timeline,
        date: { ...state.date },
        age: state.age,
      },
    ];
  }
  
  return { state: newState, description };
}

export function decrementEventCooldowns(state: GameState): void {
  for (const eventId of Object.keys(state.eventCooldowns)) {
    if (state.eventCooldowns[eventId]! > 0) {
      state.eventCooldowns[eventId]!--;
    }
  }
}

function calculateSimpleNetWorth(state: GameState): number {
  let assets = state.cash + state.checking + state.savings;
  
  if (state.vehicle) {
    assets += state.vehicle.currentValue;
  }
  
  for (const inv of state.investments) {
    assets += inv.currentValue;
  }
  
  for (const prop of state.properties) {
    assets += prop.currentValue;
  }
  
  let liabilities = 0;
  for (const loan of state.loans) {
    liabilities += loan.balance;
  }
  
  return assets - liabilities;
}

export function generateMonthlyNews(state: GameState, rng: SeededRandom): string[] {
  const headlines: string[] = [];
  
  const economicHeadlines: Record<string, string[]> = {
    boom: [
      'Stock Market Hits Record High',
      'Unemployment Falls to Historic Low',
      'Consumer Confidence Soars',
      'Housing Market Sees Strong Growth',
    ],
    normal: [
      'Economic Growth Remains Steady',
      'Markets Show Mixed Results',
      'Employment Numbers Hold Steady',
      'Inflation Remains Under Control',
    ],
    slowdown: [
      'Economic Growth Slows',
      'Companies Report Lower Earnings',
      'Hiring Pace Decreases',
      'Consumer Spending Weakens',
    ],
    recession: [
      'Economy Enters Recession',
      'Layoffs Increase Across Industries',
      'Stock Market Tumbles',
      'Housing Market Slumps',
    ],
    recovery: [
      'Signs of Economic Recovery',
      'Job Market Begins to Improve',
      'Consumer Confidence Returning',
      'Markets Show Positive Signs',
    ],
  };
  
  if (rng.boolean(0.4)) {
    const stateHeadlines = economicHeadlines[state.economicState] ?? economicHeadlines.normal ?? [];
    if (stateHeadlines.length > 0) headlines.push(rng.pick(stateHeadlines));
  }
  
  return headlines;
}
