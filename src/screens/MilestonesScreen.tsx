import { ArrowLeft, Trophy, Lock, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getMilestoneProgress } from '../game/simulation/milestoneSystem';

export function MilestonesScreen() {
  const { gameState, setScreen } = useGameStore();

  if (!gameState) return null;

  const achieved = gameState.milestones.filter(m => m.achieved);
  const pending = gameState.milestones.filter(m => !m.achieved);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button
        onClick={() => setScreen('more')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Milestones</h1>
      <p className="text-slate-400 mb-6">
        {achieved.length} of {gameState.milestones.length} achieved
      </p>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Progress</span>
          <span>{Math.round((achieved.length / gameState.milestones.length) * 100)}%</span>
        </div>
        <div className="progress-bar h-3">
          <div 
            className="progress-fill bg-gradient-to-r from-yellow-500 to-orange-500"
            style={{ width: `${(achieved.length / gameState.milestones.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achieved */}
      {achieved.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            <Trophy size={18} />
            Achieved ({achieved.length})
          </h2>
          <div className="space-y-2">
            {achieved.map((milestone) => (
              <div key={milestone.id} className="card bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="text-yellow-400" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{milestone.title}</h3>
                    <p className="text-sm text-slate-400">{milestone.description}</p>
                    {milestone.achievedDate && (
                      <p className="text-xs text-yellow-400/70 mt-1">
                        Achieved: {milestone.achievedDate.month}/{milestone.achievedDate.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Lock size={18} />
            Locked ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((milestone) => {
              const progress = getMilestoneProgress(gameState, milestone.id);
              
              return (
                <div key={milestone.id} className="card opacity-75">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lock className="text-slate-500" size={16} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-300">{milestone.title}</h3>
                      <p className="text-sm text-slate-500">{milestone.description}</p>
                      {progress > 0 && progress < 100 && (
                        <div className="mt-2">
                          <div className="progress-bar h-1.5">
                            <div 
                              className="progress-fill bg-slate-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{Math.round(progress)}% progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
