import type { GameState, Milestone } from '../models/types';
import { calculateNetWorth, getEmergencyFundMonths } from './financialSystem';

export function checkMilestones(state: GameState): string[] {
  const achieved: string[] = [];
  const netWorth = calculateNetWorth(state);
  
  for (const milestone of state.milestones) {
    if (milestone.achieved) continue;
    
    let shouldAchieve = false;
    
    switch (milestone.id) {
      case 'first_job':
        shouldAchieve = state.employment !== null && state.totalWorkExperience > 0;
        break;
        
      case 'first_1k':
        shouldAchieve = state.cash + state.savings >= 1000;
        break;
        
      case 'positive_net_worth':
        shouldAchieve = netWorth > 0;
        break;
        
      case 'credit_700':
        shouldAchieve = state.creditScore >= 700;
        break;
        
      case 'credit_750':
        shouldAchieve = state.creditScore >= 750;
        break;
        
      case 'first_promotion':
        shouldAchieve = state.timeline.some(t => t.type === 'career' && t.title.includes('Promoted'));
        break;
        
      case 'first_degree':
        shouldAchieve = ['associate', 'trade_cert', 'bachelor', 'master', 'doctorate'].includes(state.education);
        break;
        
      case 'first_home':
        shouldAchieve = state.properties.some(p => p.type === 'primary');
        break;
        
      case 'debt_free':
        shouldAchieve = state.loans.length === 0 && state.totalWorkExperience > 0;
        break;
        
      case 'emergency_fund':
        shouldAchieve = getEmergencyFundMonths(state) >= 6;
        break;
        
      case 'net_worth_10k':
        shouldAchieve = netWorth >= 10000;
        break;
        
      case 'net_worth_100k':
        shouldAchieve = netWorth >= 100000;
        break;
        
      case 'net_worth_500k':
        shouldAchieve = netWorth >= 500000;
        break;
        
      case 'net_worth_1m':
        shouldAchieve = netWorth >= 1000000;
        break;
        
      case 'net_worth_10m':
        shouldAchieve = netWorth >= 10000000;
        break;
        
      case 'first_business':
        shouldAchieve = state.businesses.length > 0;
        break;
        
      case 'business_profitable':
        shouldAchieve = state.businesses.some(b => b.monthlyRevenue > b.monthlyExpenses);
        break;
        
      case 'business_1m_revenue':
        shouldAchieve = state.businesses.some(b => b.monthlyRevenue * b.monthsOperating >= 1000000);
        break;
        
      case 'first_investment':
        shouldAchieve = state.investments.length > 0;
        break;
        
      case 'first_rental':
        shouldAchieve = state.properties.some(p => p.type === 'rental');
        break;
        
      case 'married':
        shouldAchieve = state.relationshipStatus === 'married';
        break;
        
      case 'first_child':
        shouldAchieve = state.children.length > 0;
        break;
        
      case 'retirement_100k':
        shouldAchieve = state.investments
          .filter(i => i.isRetirement)
          .reduce((sum, i) => sum + i.currentValue, 0) >= 100000;
        break;
        
      case 'early_retirement':
        shouldAchieve = state.age < 55 && netWorth >= state.monthlyExpenses * 12 * 25;
        break;
        
      case 'full_retirement':
        shouldAchieve = state.age >= 55 && netWorth >= state.monthlyExpenses * 12 * 20;
        break;
    }
    
    if (shouldAchieve) {
      milestone.achieved = true;
      milestone.achievedDate = { ...state.date };
      achieved.push(milestone.id);
      
      state.timeline.push({
        date: { ...state.date },
        age: state.age,
        type: 'milestone',
        title: milestone.title,
        description: milestone.description,
        netWorthAtTime: netWorth,
      });
    }
  }
  
  return achieved;
}

export function getMilestoneProgress(state: GameState, milestoneId: string): number {
  const netWorth = calculateNetWorth(state);
  
  switch (milestoneId) {
    case 'first_1k':
      return Math.min(100, ((state.cash + state.savings) / 1000) * 100);
      
    case 'credit_700':
      return Math.min(100, ((state.creditScore - 300) / (700 - 300)) * 100);
      
    case 'credit_750':
      return Math.min(100, ((state.creditScore - 300) / (750 - 300)) * 100);
      
    case 'emergency_fund':
      return Math.min(100, (getEmergencyFundMonths(state) / 6) * 100);
      
    case 'net_worth_10k':
      return Math.min(100, (netWorth / 10000) * 100);
      
    case 'net_worth_100k':
      return Math.min(100, (netWorth / 100000) * 100);
      
    case 'net_worth_500k':
      return Math.min(100, (netWorth / 500000) * 100);
      
    case 'net_worth_1m':
      return Math.min(100, (netWorth / 1000000) * 100);
      
    default:
      return 0;
  }
}

export function getNextMilestones(state: GameState, count: number = 3): Milestone[] {
  return state.milestones
    .filter(m => !m.achieved)
    .slice(0, count);
}
