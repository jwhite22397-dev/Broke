import type { GameState, EconomicState } from '../models/types';
import { SeededRandom } from '../engine/random';
import { ECONOMIC_MODIFIERS } from '../balance/constants';

const ECONOMIC_TRANSITIONS: Record<EconomicState, { next: EconomicState; probability: number }[]> = {
  boom: [
    { next: 'boom', probability: 0.7 },
    { next: 'normal', probability: 0.25 },
    { next: 'slowdown', probability: 0.05 },
  ],
  normal: [
    { next: 'boom', probability: 0.1 },
    { next: 'normal', probability: 0.7 },
    { next: 'slowdown', probability: 0.15 },
    { next: 'recession', probability: 0.05 },
  ],
  slowdown: [
    { next: 'normal', probability: 0.2 },
    { next: 'slowdown', probability: 0.5 },
    { next: 'recession', probability: 0.3 },
  ],
  recession: [
    { next: 'recession', probability: 0.6 },
    { next: 'recovery', probability: 0.4 },
  ],
  recovery: [
    { next: 'recovery', probability: 0.4 },
    { next: 'normal', probability: 0.5 },
    { next: 'boom', probability: 0.1 },
  ],
};

export function updateEconomicState(state: GameState, rng: SeededRandom): void {
  state.economicCycleMonth++;
  
  const currentModifiers = ECONOMIC_MODIFIERS[state.economicState];
  const minDuration = currentModifiers.duration.min;
  const maxDuration = currentModifiers.duration.max;
  
  if (state.economicCycleMonth < minDuration) {
    return;
  }
  
  const transitionChance = (state.economicCycleMonth - minDuration) / (maxDuration - minDuration);
  
  if (!rng.boolean(transitionChance * 0.3)) {
    return;
  }
  
  const transitions = ECONOMIC_TRANSITIONS[state.economicState];
  const states = transitions.map(t => t.next);
  const probabilities = transitions.map(t => t.probability);
  
  const newState = rng.pickWeighted(states, probabilities);
  
  if (newState !== state.economicState) {
    state.economicState = newState;
    state.economicCycleMonth = 0;
    
    state.newsHistory.push({
      date: { ...state.date },
      headline: getEconomicTransitionHeadline(newState),
      description: getEconomicTransitionDescription(newState),
    });
  }
}

function getEconomicTransitionHeadline(state: EconomicState): string {
  const headlines: Record<EconomicState, string> = {
    boom: 'Economy Enters Period of Strong Growth',
    normal: 'Economic Conditions Stabilize',
    slowdown: 'Economic Growth Slowing',
    recession: 'Economy Enters Recession',
    recovery: 'Signs of Economic Recovery Emerge',
  };
  return headlines[state];
}

function getEconomicTransitionDescription(state: EconomicState): string {
  const descriptions: Record<EconomicState, string> = {
    boom: 'Strong job market and rising investments expected.',
    normal: 'Steady growth and stable conditions ahead.',
    slowdown: 'Hiring slows and businesses become cautious.',
    recession: 'Job losses and market declines expected.',
    recovery: 'Gradual improvement in jobs and markets.',
  };
  return descriptions[state];
}

export function getEconomicStateDescription(state: EconomicState): string {
  const descriptions: Record<EconomicState, string> = {
    boom: 'The economy is booming with strong growth.',
    normal: 'The economy is stable with steady growth.',
    slowdown: 'Economic growth is slowing down.',
    recession: 'The economy is in recession.',
    recovery: 'The economy is recovering.',
  };
  return descriptions[state];
}

export function getEconomicStateColor(state: EconomicState): string {
  const colors: Record<EconomicState, string> = {
    boom: 'text-green-400',
    normal: 'text-blue-400',
    slowdown: 'text-yellow-400',
    recession: 'text-red-400',
    recovery: 'text-emerald-400',
  };
  return colors[state];
}

export function getEconomicStateEmoji(state: EconomicState): string {
  const emojis: Record<EconomicState, string> = {
    boom: '📈',
    normal: '📊',
    slowdown: '📉',
    recession: '🔻',
    recovery: '↗️',
  };
  return emojis[state];
}
