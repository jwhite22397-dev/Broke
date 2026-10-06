import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { canStartProgram, enrollInEducation } from '../game/simulation/actions';
import { EDUCATION_COSTS } from '../game/balance/constants';
import { formatCurrency } from '../game/simulation/financialSystem';

const PROGRAMS = [
  { id: 'ged', label: 'GED', blurb: 'If you left school early.' },
  { id: 'community_college', label: 'Community College', blurb: 'Associate degree. Works with a job.' },
  { id: 'trade_school', label: 'Trade School', blurb: 'A faster path into skilled work.' },
  { id: 'certification', label: 'Certification', blurb: 'A short credential employers notice.' },
  { id: 'university', label: "Bachelor's Degree", blurb: 'Opens professional careers. Expensive.' },
  { id: 'graduate', label: 'Graduate Degree', blurb: 'Only after a bachelor\'s.' },
] as const;

export function EducationScreen() {
  const { gameState, setScreen, runAction } = useGameStore();
  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button onClick={() => setScreen('career')} className="flex items-center gap-2 text-slate-400 mb-6">
        <ArrowLeft size={20} /> Back
      </button>
      <h1 className="text-2xl font-bold mb-2">Education</h1>
      <p className="text-slate-400 mb-4">
        School costs money, time, and energy. It improves what you can apply for. It does not promise wealth.
      </p>
      {gameState.currentEducation && (
        <div className="card mb-4 border-blue-500/40">
          <p className="font-semibold">{gameState.currentEducation.name}</p>
          <p className="text-sm text-slate-400">
            {gameState.currentEducation.monthsRemaining} months left
            {gameState.currentEducation.monthlyCost > 0 ? ` · ${formatCurrency(gameState.currentEducation.monthlyCost)}/mo` : ' · tuition financed'}
          </p>
        </div>
      )}
      <div className="space-y-3">
        {PROGRAMS.map((program) => {
          const costs = EDUCATION_COSTS[program.id];
          if (!costs || !canStartProgram(gameState.education, program.id)) return null;
          return (
            <div key={program.id} className="card">
              <h2 className="font-semibold">{program.label}</h2>
              <p className="text-sm text-slate-400 mb-2">{program.blurb}</p>
              <p className="text-xs text-slate-500 mb-3">
                Part-time {formatCurrency(costs.monthlyPart)}/mo for {costs.durationMonthsPart} months
                {' · '}
                Full-time {formatCurrency(costs.monthlyFull)}/mo for {costs.durationMonthsFull} months
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn-secondary text-sm"
                  onClick={() => runAction((state) => enrollInEducation(state, program.id, true, false))}
                >
                  Part-time
                </button>
                <button
                  className="btn-primary text-sm"
                  onClick={() => runAction((state) => enrollInEducation(state, program.id, false, false))}
                >
                  Full-time
                </button>
                <button
                  className="btn-ghost text-sm col-span-2"
                  onClick={() => runAction((state) => enrollInEducation(state, program.id, true, true))}
                >
                  Part-time with student loans
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
