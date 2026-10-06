import { TrendingUp, TrendingDown, Calendar, Briefcase, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../game/simulation/financialSystem';
import { formatDate } from '../game/simulation/monthlySimulation';
import { getEconomicStateDescription, getEconomicStateColor } from '../game/simulation/economySystem';
import { getNextMilestones } from '../game/simulation/milestoneSystem';

export function HomeScreen() {
  const { gameState, advanceMonth, setScreen, getNetWorth, getMonthlyIncome, getMonthlyExpenses } = useGameStore();

  if (!gameState) return null;

  const netWorth = getNetWorth();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const cashFlow = monthlyIncome - monthlyExpenses;
  const nextMilestones = getNextMilestones(gameState, 2);

  return (
    <div className="min-h-screen bg-slate-900 pb-4">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{gameState.name}</h1>
            <p className="text-slate-400">Age {gameState.age} • {formatDate(gameState.date)}</p>
          </div>
          <div className={`text-right ${getEconomicStateColor(gameState.economicState)}`}>
            <p className="text-xs uppercase tracking-wide opacity-75">Economy</p>
            <p className="font-semibold capitalize">{gameState.economicState}</p>
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Net Worth</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatCurrency(netWorth)}
            </span>
            {cashFlow !== 0 && (
              <span className={`text-sm flex items-center gap-1 ${cashFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cashFlow > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {cashFlow > 0 ? '+' : ''}{formatCurrency(cashFlow)}/mo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-1">Cash</p>
            <p className="text-lg font-semibold text-green-400">{formatCurrency(gameState.cash)}</p>
          </div>
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-1">Credit Score</p>
            <p className={`text-lg font-semibold ${
              gameState.creditScore >= 700 ? 'text-green-400' : 
              gameState.creditScore >= 600 ? 'text-yellow-400' : 
              gameState.creditScore > 0 ? 'text-red-400' : 'text-slate-500'
            }`}>
              {gameState.creditScore > 0 ? gameState.creditScore : 'None'}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-1">Income</p>
            <p className="text-lg font-semibold">{formatCurrency(monthlyIncome)}/mo</p>
          </div>
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-1">Expenses</p>
            <p className="text-lg font-semibold">{formatCurrency(monthlyExpenses)}/mo</p>
          </div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="px-6 mt-4 space-y-3">
        <StatBar label="Health" value={gameState.stats.health} color="bg-red-500" />
        <StatBar label="Energy" value={gameState.stats.energy} color="bg-yellow-500" />
        <StatBar label="Happiness" value={gameState.stats.happiness} color="bg-green-500" />
        <StatBar label="Stress" value={gameState.stats.stress} color="bg-purple-500" />
      </div>

      {/* Current Situation */}
      <div className="px-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">Current Situation</h2>
        
        <div className="space-y-3">
          {/* Job */}
          <button 
            onClick={() => setScreen('career')}
            className="w-full card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Briefcase className="text-blue-400" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium">
                  {gameState.employment?.title || 'Unemployed'}
                </p>
                <p className="text-sm text-slate-400">
                  {gameState.employment 
                    ? `${formatCurrency(gameState.employment.monthlyPay)}/month`
                    : 'Find a job'
                  }
                </p>
              </div>
            </div>
            <ChevronRight className="text-slate-500" size={20} />
          </button>

          {/* Housing */}
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="font-medium capitalize">
                  {gameState.housing.replace('_', ' ')}
                </p>
                <p className="text-sm text-slate-400">
                  {gameState.housing === 'with_family' && gameState.householdContribution > 0
                    ? `Contributing ${formatCurrency(gameState.householdContribution)}/month`
                    : gameState.monthlyRent > 0 
                      ? `${formatCurrency(gameState.monthlyRent)}/month`
                      : 'No rent'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          {gameState.vehicle && (
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <p className="font-medium">{gameState.vehicle.name}</p>
                  <p className="text-sm text-slate-400">
                    Value: {formatCurrency(gameState.vehicle.currentValue)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Milestones */}
      {nextMilestones.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">Next Goals</h2>
          <div className="space-y-2">
            {nextMilestones.map((m) => (
              <div key={m.id} className="card-dark py-3">
                <p className="font-medium text-sm">{m.title}</p>
                <p className="text-xs text-slate-500">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState.newsHistory.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">World</h2>
          <div className="card">
            <p className="font-medium">{gameState.newsHistory[gameState.newsHistory.length - 1]?.headline}</p>
            <p className="text-sm text-slate-400 mt-1">{getEconomicStateDescription(gameState.economicState)}</p>
          </div>
        </div>
      )}

      {/* Next Month Button */}
      <div className="px-6 mt-6 mb-4">
        <button
          onClick={advanceMonth}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 active:scale-98 transition-transform"
        >
          Next Month →
        </button>
      </div>
    </div>
  );
}

function StatBar({ label, value, color, inverted = false }: { 
  label: string; 
  value: number; 
  color: string;
  inverted?: boolean;
}) {
  const displayValue = inverted ? 100 - value : value;
  const isLow = inverted ? value > 70 : value < 30;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={isLow ? 'text-red-400' : 'text-slate-300'}>{Math.round(value)}</span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-fill ${color}`} 
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}
