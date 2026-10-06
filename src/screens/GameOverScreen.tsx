import { useGameStore } from '../store/gameStore';
import { formatCurrency, calculateNetWorth } from '../game/simulation/financialSystem';
import type { GameState } from '../game/models/types';

export function GameOverScreen() {
  const { gameState, setScreen } = useGameStore();

  if (!gameState) return null;

  const finalNetWorth = calculateNetWorth(gameState);
  const achievedMilestones = gameState.milestones.filter(m => m.achieved);
  
  const lifeScore = calculateLifeScore(gameState, finalNetWorth, achievedMilestones.length);

  const handleNewLife = () => {
    setScreen('new_game');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Life</h1>
        <p className="text-slate-400">{gameState.name}, {gameState.birthYear} - {gameState.date.year}</p>
        <p className="text-2xl mt-2">Lived to age {gameState.deathAge || gameState.age}</p>
      </div>

      {/* Life Score */}
      <div className="card mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 text-center">
        <p className="text-sm text-slate-400 mb-2">Life Score</p>
        <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {lifeScore}
        </p>
        <p className="text-sm text-slate-400 mt-2">{getScoreDescription(lifeScore)}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card">
          <p className="text-xs text-slate-500">Final Net Worth</p>
          <p className={`text-xl font-bold ${finalNetWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(finalNetWorth)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Final Career</p>
          <p className="text-lg font-semibold truncate">
            {gameState.employment?.title || 'Retired'}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Education</p>
          <p className="text-lg font-semibold capitalize">
            {gameState.education.replace('_', ' ')}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Relationship</p>
          <p className="text-lg font-semibold capitalize">
            {gameState.relationshipStatus}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Children</p>
          <p className="text-lg font-semibold">{gameState.children.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Milestones</p>
          <p className="text-lg font-semibold">{achievedMilestones.length}</p>
        </div>
      </div>

      {/* Milestones Achieved */}
      {achievedMilestones.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-3">Milestones Achieved</h3>
          <div className="flex flex-wrap gap-2">
            {achievedMilestones.map((m) => (
              <span key={m.id} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                {m.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline highlights */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Life Highlights</h3>
        <div className="space-y-2 max-h-60 overflow-auto">
          {gameState.timeline.slice(-10).reverse().map((entry, i) => (
            <div key={i} className="text-sm py-1 border-b border-slate-700 last:border-0">
              <span className="text-slate-500">Age {entry.age}:</span> {entry.title}
            </div>
          ))}
        </div>
      </div>

      {/* New Life Button */}
      <button
        onClick={handleNewLife}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg"
      >
        Start Another Life
      </button>

      <button
        onClick={() => setScreen('menu')}
        className="w-full btn-ghost mt-3"
      >
        Main Menu
      </button>
    </div>
  );
}

function calculateLifeScore(
  gameState: GameState,
  netWorth: number,
  milestonesAchieved: number
): number {
  let score = 0;

  if (netWorth > 10000000) score += 100;
  else if (netWorth > 1000000) score += 80;
  else if (netWorth > 500000) score += 60;
  else if (netWorth > 100000) score += 40;
  else if (netWorth > 0) score += 20;
  else score += 0;

  score += milestonesAchieved * 5;

  score += Math.round(gameState.stats.happiness / 5);
  score -= Math.round(gameState.stats.stress / 10);
  score += Math.round(gameState.stats.health / 5);

  const educationScores: Record<string, number> = {
    'doctorate': 20,
    'master': 15,
    'bachelor': 10,
    'associate': 7,
    'trade_cert': 8,
    'high_school': 3,
    'ged': 2,
    'no_diploma': 0,
  };
  score += educationScores[gameState.education] || 0;

  if (gameState.relationshipStatus === 'married') score += 10;
  score += gameState.children.length * 5;

  score += gameState.businesses.length * 10;

  return Math.max(0, Math.min(999, Math.round(score)));
}

function getScoreDescription(score: number): string {
  if (score >= 200) return 'Legendary Life';
  if (score >= 150) return 'Exceptional Life';
  if (score >= 100) return 'Successful Life';
  if (score >= 70) return 'Good Life';
  if (score >= 40) return 'Average Life';
  if (score >= 20) return 'Challenging Life';
  return 'Difficult Life';
}
