import type { GameState, Job, Employment, Skills } from '../models/types';
import { SeededRandom } from '../engine/random';
import { getJobById, getEligibleJobs, getJobsForCareerPath } from '../../data/jobs/jobs';
import { CAREER_PATHS } from '../../data/careers/careers';
import { ECONOMIC_MODIFIERS } from '../balance/constants';
import { getCityById } from '../../data/cities/cities';

export function getAvailableJobs(state: GameState): Job[] {
  return getEligibleJobs(state.education, state.totalWorkExperience, state.skills);
}

export function calculateJobApplicationSuccess(
  state: GameState,
  job: Job,
  rng: SeededRandom
): boolean {
  let baseChance = 0.3;
  
  const experienceBonus = Math.min(0.3, (state.totalWorkExperience - job.requiredExperience) / 100);
  baseChance += experienceBonus;
  
  for (const [skill, required] of Object.entries(job.skillRequirements)) {
    const playerSkill = state.skills[skill as keyof Skills] || 0;
    if (playerSkill >= required * 1.5) {
      baseChance += 0.1;
    } else if (playerSkill >= required) {
      baseChance += 0.05;
    }
  }
  
  const economicModifier = ECONOMIC_MODIFIERS[state.economicState].jobOpenings;
  baseChance *= economicModifier;
  
  if (state.careerAction === 'network') {
    baseChance += 0.15;
  }
  
  if (state.creditScore > 700) {
    baseChance += 0.05;
  }
  
  baseChance = Math.max(0.05, Math.min(0.85, baseChance));
  
  return rng.boolean(baseChance);
}

export function hireForJob(state: GameState, job: Job, rng: SeededRandom): Employment {
  const city = getCityById(state.cityId);
  const wageMultiplier = city?.wageMultiplier ?? 1;
  
  let basePay: number;
  if (job.isHourly) {
    const hourlyRate = rng.float(job.basePayMin, job.basePayMax);
    basePay = Math.round(hourlyRate * job.hoursPerWeek * 4.33);
  } else {
    const annualSalary = rng.range(job.basePayMin, job.basePayMax);
    basePay = Math.round(annualSalary / 12);
  }
  
  basePay = Math.round(basePay * wageMultiplier);
  
  return {
    jobId: job.id,
    title: job.title,
    monthlyPay: basePay,
    hoursPerWeek: job.hoursPerWeek,
    monthsEmployed: 0,
    performance: 50,
    lastRaise: null,
  };
}

export function processCareerAction(
  state: GameState,
  rng: SeededRandom
): { result: string; overtimePay: number } {
  if (!state.employment) {
    return { result: 'No job to work.', overtimePay: 0 };
  }
  
  const job = getJobById(state.employment.jobId);
  if (!job) {
    return { result: 'Job not found.', overtimePay: 0 };
  }
  
  let result = '';
  let overtimePay = 0;
  
  switch (state.careerAction) {
    case 'work_hard': {
      state.employment.performance = Math.min(100, state.employment.performance + 3);
      state.stats.stress = Math.min(100, state.stats.stress + 5);
      state.stats.energy = Math.max(0, state.stats.energy - 5);
      result = 'You worked hard this month. Your manager noticed.';
      break;
    }
    
    case 'coast': {
      state.employment.performance = Math.max(0, state.employment.performance - 2);
      state.stats.stress = Math.max(0, state.stats.stress - 5);
      state.stats.energy = Math.min(100, state.stats.energy + 5);
      result = 'You took it easy this month.';
      break;
    }
    
    case 'network': {
      const networkingBonus = rng.range(1, 3);
      state.skills.communication = Math.min(100, state.skills.communication + networkingBonus);
      result = 'You focused on building relationships this month.';
      break;
    }
    
    case 'ask_raise': {
      const raiseChance = calculateRaiseChance(state, job);
      if (rng.boolean(raiseChance)) {
        const raisePercent = rng.float(0.03, 0.08);
        const newPay = Math.round(state.employment.monthlyPay * (1 + raisePercent));
        state.employment.monthlyPay = newPay;
        state.employment.lastRaise = { ...state.date };
        result = `Your raise was approved! New salary: $${newPay}/month`;
      } else {
        state.employment.performance = Math.max(0, state.employment.performance - 5);
        result = 'Your raise request was declined.';
      }
      state.careerAction = 'normal';
      break;
    }
    
    case 'overtime': {
      overtimePay = Math.round(state.employment.monthlyPay * 0.15);
      state.stats.stress = Math.min(100, state.stats.stress + 10);
      state.stats.energy = Math.max(0, state.stats.energy - 10);
      state.stats.happiness = Math.max(0, state.stats.happiness - 5);
      result = `You worked overtime and earned an extra $${overtimePay}.`;
      break;
    }
    
    default: {
      state.employment.performance = Math.min(100, state.employment.performance + 1);
      result = 'Another month on the job.';
    }
  }
  
  for (const [skill, growth] of Object.entries(job.skillGrowth)) {
    const currentSkill = state.skills[skill as keyof Skills] || 0;
    const newValue = Math.min(100, currentSkill + growth * 0.5);
    state.skills[skill as keyof Skills] = newValue;
  }
  
  state.employment.monthsEmployed++;
  state.totalWorkExperience++;
  
  const industryExp = state.industryExperience[job.industry] || 0;
  state.industryExperience[job.industry] = industryExp + 1;
  
  return { result, overtimePay };
}

function calculateRaiseChance(state: GameState, _job: Job): number {
  if (!state.employment) return 0;
  
  let chance = 0.2;
  
  if (state.employment.performance >= 80) {
    chance += 0.25;
  } else if (state.employment.performance >= 60) {
    chance += 0.1;
  }
  
  if (state.employment.monthsEmployed >= 12) {
    chance += 0.15;
  }
  
  if (state.employment.lastRaise) {
    const monthsSinceRaise = 
      (state.date.year - state.employment.lastRaise.year) * 12 + 
      (state.date.month - state.employment.lastRaise.month);
    if (monthsSinceRaise < 6) {
      chance -= 0.3;
    } else if (monthsSinceRaise >= 12) {
      chance += 0.1;
    }
  }
  
  const economicModifier = ECONOMIC_MODIFIERS[state.economicState].wageGrowth;
  chance *= economicModifier;
  
  return Math.max(0.05, Math.min(0.7, chance));
}

export function checkForPromotion(
  state: GameState,
  rng: SeededRandom
): { promoted: boolean; newJob?: Job } {
  if (!state.employment) return { promoted: false };
  
  const currentJob = getJobById(state.employment.jobId);
  if (!currentJob) return { promoted: false };
  
  const careerPath = CAREER_PATHS.find(c => c.id === currentJob.careerPathId);
  if (!careerPath) return { promoted: false };
  
  const pathJobs = getJobsForCareerPath(careerPath.id);
  const currentIndex = pathJobs.findIndex(j => j.id === currentJob.id);
  
  if (currentIndex === -1 || currentIndex >= pathJobs.length - 1) {
    return { promoted: false };
  }
  
  const nextJob = pathJobs[currentIndex + 1];
  if (!nextJob) return { promoted: false };
  
  const eligible = getEligibleJobs(state.education, state.totalWorkExperience, state.skills);
  if (!eligible.some(j => j.id === nextJob.id)) {
    return { promoted: false };
  }
  
  let promotionChance = 0.02;
  
  if (state.employment.performance >= 80) {
    promotionChance += 0.05;
  } else if (state.employment.performance >= 60) {
    promotionChance += 0.02;
  }
  
  if (state.employment.monthsEmployed >= 24) {
    promotionChance += 0.03;
  } else if (state.employment.monthsEmployed >= 12) {
    promotionChance += 0.01;
  }
  
  if (state.careerAction === 'work_hard') {
    promotionChance += 0.02;
  }
  
  const economicModifier = ECONOMIC_MODIFIERS[state.economicState].jobOpenings;
  promotionChance *= economicModifier;
  
  if (rng.boolean(promotionChance)) {
    return { promoted: true, newJob: nextJob };
  }
  
  return { promoted: false };
}

export function checkForLayoff(state: GameState, rng: SeededRandom): boolean {
  if (!state.employment) return false;
  
  const currentJob = getJobById(state.employment.jobId);
  if (!currentJob) return false;
  
  let layoffChance = 0.005;
  
  layoffChance *= (100 - currentJob.stability) / 100;
  
  const economicModifier = ECONOMIC_MODIFIERS[state.economicState].layoffRisk;
  layoffChance *= economicModifier;
  
  if (state.employment.performance < 30) {
    layoffChance += 0.05;
  } else if (state.employment.performance >= 70) {
    layoffChance *= 0.5;
  }
  
  if (state.employment.monthsEmployed < 3) {
    layoffChance *= 2;
  } else if (state.employment.monthsEmployed >= 24) {
    layoffChance *= 0.7;
  }
  
  return rng.boolean(layoffChance);
}

export function quitJob(state: GameState): void {
  state.employment = null;
  state.careerAction = 'normal';
}

export function getJobSatisfaction(state: GameState): number {
  if (!state.employment) return 0;
  
  const job = getJobById(state.employment.jobId);
  if (!job) return 0;
  
  let satisfaction = 50;
  
  const avgPay = (job.basePayMin + job.basePayMax) / 2;
  const payRatio = job.isHourly 
    ? state.employment.monthlyPay / (avgPay * 4.33 * job.hoursPerWeek)
    : state.employment.monthlyPay / (avgPay / 12);
  
  if (payRatio > 1.1) {
    satisfaction += 15;
  } else if (payRatio < 0.9) {
    satisfaction -= 10;
  }
  
  satisfaction -= (job.stressLevel - 50) * 0.3;
  
  satisfaction += (job.advancementPotential - 50) * 0.2;
  
  if (job.benefits) {
    satisfaction += 10;
  }
  
  satisfaction += (state.employment.performance - 50) * 0.2;
  
  return Math.max(0, Math.min(100, Math.round(satisfaction)));
}
