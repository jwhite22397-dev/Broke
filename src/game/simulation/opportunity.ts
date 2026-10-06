import type { DateInfo, MajorDecision } from '../models/types';

export function monthsBetween(from: DateInfo, to: DateInfo): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function projectGrowth(principal: number, months: number, annualReturn = 0.08): number {
  if (principal <= 0 || months <= 0) return principal;
  return principal * Math.pow(1 + annualReturn, months / 12);
}

export interface WhatIfInsight {
  title: string;
  detail: string;
  tone: 'neutral' | 'positive';
}

export function describeDecision(decision: MajorDecision, now: DateInfo): WhatIfInsight | null {
  const months = monthsBetween(decision.date, now);
  if (months < 6) return null;

  if (decision.type === 'investment' && decision.alternativeDescription) {
    const grown = projectGrowth(decision.actualCost, months, 0.07);
    return {
      tone: 'positive',
      title: decision.description,
      detail: `About ${formatRound(grown)} of your current balance traces back to starting with ${formatRound(decision.actualCost)}.`,
    };
  }

  if (decision.alternativeCost === undefined) return null;
  const gap = decision.actualCost - decision.alternativeCost;
  if (gap <= 500) {
    return {
      tone: 'positive',
      title: decision.description,
      detail: decision.alternativeDescription ?? 'A smaller commitment left more room to save.',
    };
  }

  const grown = projectGrowth(gap, months, 0.08);
  return {
    tone: 'neutral',
    title: decision.description,
    detail: `Total cost was about ${formatRound(decision.actualCost)}. Had the ${formatRound(gap)} difference versus ${decision.alternativeDescription ?? 'a cheaper option'} been invested, it might be worth about ${formatRound(grown)} today.`,
  };
}

function formatRound(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
