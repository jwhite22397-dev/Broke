import { useState } from 'react';
import { Briefcase, Search, LogOut } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../game/simulation/financialSystem';
import { getJobById } from '../data/jobs/jobs';
import { getJobSatisfaction } from '../game/simulation/careerSystem';
import type { CareerAction } from '../game/models/types';

const careerActions: { id: CareerAction; label: string; description: string }[] = [
  { id: 'normal', label: 'Normal Effort', description: 'Standard work performance' },
  { id: 'work_hard', label: 'Work Hard', description: '+Stress, better reviews' },
  { id: 'coast', label: 'Coast', description: '-Stress, risk of issues' },
  { id: 'network', label: 'Network', description: 'Build connections' },
  { id: 'overtime', label: 'Overtime', description: 'Extra pay, more stress' },
  { id: 'ask_raise', label: 'Ask for Raise', description: 'Request more pay' },
];

export function CareerScreen() {
  const { gameState, setScreen, setCareerAction, quitCurrentJob } = useGameStore();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  if (!gameState) return null;

  const job = gameState.employment ? getJobById(gameState.employment.jobId) : null;
  const satisfaction = gameState.employment ? getJobSatisfaction(gameState) : 0;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <h1 className="text-2xl font-bold mb-6">Career</h1>

      {gameState.employment && job ? (
        <>
          {/* Current Job */}
          <div className="card mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Briefcase className="text-blue-400" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{gameState.employment.title}</h2>
                <p className="text-slate-400">{job.industry}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-slate-500 text-xs">Monthly Pay</p>
                <p className="text-lg font-semibold text-green-400">
                  {formatCurrency(gameState.employment.monthlyPay)}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-slate-500 text-xs">Hours/Week</p>
                <p className="text-lg font-semibold">
                  {gameState.employment.hoursPerWeek}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-slate-500 text-xs">Time at Job</p>
                <p className="text-lg font-semibold">
                  {Math.floor(gameState.employment.monthsEmployed / 12)}y {gameState.employment.monthsEmployed % 12}m
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-slate-500 text-xs">Performance</p>
                <p className={`text-lg font-semibold ${
                  gameState.employment.performance >= 70 ? 'text-green-400' :
                  gameState.employment.performance >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {gameState.employment.performance}%
                </p>
              </div>
            </div>

            {/* Job Satisfaction */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Job Satisfaction</span>
                <span>{satisfaction}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${satisfaction >= 60 ? 'bg-green-500' : satisfaction >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${satisfaction}%` }}
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-2">
              {job.benefits && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                  Benefits
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs ${
                job.stability >= 70 ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {job.stability >= 70 ? 'Stable' : 'Moderate Stability'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                job.advancementPotential >= 65 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-600/50 text-slate-400'
              }`}>
                {job.advancementPotential >= 65 ? 'Good Growth' : 'Limited Growth'}
              </span>
            </div>
          </div>

          {/* Career Action */}
          <div className="card mb-4">
            <h3 className="font-semibold mb-3">Monthly Focus</h3>
            <div className="grid grid-cols-2 gap-2">
              {careerActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setCareerAction(action.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    gameState.careerAction === action.id
                      ? 'bg-blue-500/20 border-2 border-blue-500'
                      : 'bg-slate-900/50 border-2 border-transparent'
                  }`}
                >
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
          <button
            onClick={() => setScreen('education')}
            className="w-full btn-secondary mb-3"
          >
            Education
          </button>
          <button
            onClick={() => setScreen('job_search')}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
              <Search size={18} />
              Look Elsewhere
            </button>
            <button
              onClick={() => setShowQuitConfirm(true)}
              className="btn-ghost text-red-400 flex items-center gap-2"
            >
              <LogOut size={18} />
              Quit
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Unemployed */}
          <div className="card text-center py-12 mb-6">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-slate-500" size={40} />
            </div>
            <h2 className="text-xl font-bold mb-2">Unemployed</h2>
            <p className="text-slate-400 mb-6">
              You need to find a job to earn income.
            </p>
            <button
              onClick={() => setScreen('education')}
              className="btn-secondary mx-auto mb-3"
            >
              Look at school
            </button>
            <button
              onClick={() => setScreen('job_search')}
              className="btn-primary mx-auto flex items-center gap-2"
            >
              <Search size={18} />
              Search for Jobs
            </button>
          </div>

          {/* Work Experience */}
          <div className="card">
            <h3 className="font-semibold mb-3">Experience</h3>
            <p className="text-slate-400">
              Total: {Math.floor(gameState.totalWorkExperience / 12)} years, {gameState.totalWorkExperience % 12} months
            </p>
          </div>
        </>
      )}

      {/* Skills */}
      <div className="card mt-4">
        <h3 className="font-semibold mb-3">Skills</h3>
        <div className="space-y-2">
          {Object.entries(gameState.skills).map(([skill, level]) => (
            <div key={skill}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400 capitalize">{skill}</span>
                <span>{Math.round(level)}</span>
              </div>
              <div className="progress-bar h-1.5">
                <div className="progress-fill bg-blue-500" style={{ width: `${level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2">Quit Your Job?</h2>
            <p className="text-slate-400 mb-6">
              Are you sure you want to quit? You'll lose your income until you find a new job.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  quitCurrentJob();
                  setShowQuitConfirm(false);
                }}
                className="flex-1 btn-danger"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
