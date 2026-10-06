import { TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../game/simulation/financialSystem';
import { getMonthName } from '../game/simulation/monthlySimulation';

export function MonthlyReportScreen() {
  const { gameState, lastMonthReport, setScreen } = useGameStore();

  if (!gameState || !lastMonthReport) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <button onClick={() => setScreen('home')} className="btn-primary">
          Continue
        </button>
      </div>
    );
  }

  const report = lastMonthReport.report;
  const prevMonth = report.date.month === 1 ? 12 : report.date.month - 1;
  const prevYear = report.date.month === 1 ? report.date.year - 1 : report.date.year;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-slate-400 text-sm uppercase tracking-wider">Monthly Report</p>
        <h1 className="text-3xl font-bold mt-1">
          {getMonthName(prevMonth)} {prevYear}
        </h1>
        <p className="text-slate-400">Age {report.age}</p>
      </div>

      {/* Income & Expenses */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-400" size={20} />
            <span>Income</span>
          </div>
          <span className="text-green-400 font-bold text-xl">
            +{formatCurrency(report.income.total)}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-400" size={20} />
            <span>Expenses</span>
          </div>
          <span className="text-red-400 font-bold text-xl">
            -{formatCurrency(report.expenses.total)}
          </span>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Net</span>
            <span className={`text-2xl font-bold ${report.netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {report.netCashFlow >= 0 ? '+' : ''}{formatCurrency(report.netCashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Net Worth Change */}
      <div className="card mb-4">
        <h3 className="text-sm text-slate-400 mb-2">Net Worth</h3>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{formatCurrency(report.netWorthBefore)}</span>
          <span className="text-2xl">→</span>
          <span className={`text-xl font-bold ${report.netWorthAfter >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(report.netWorthAfter)}
          </span>
        </div>
        <div className="text-center mt-2">
          <span className={`text-sm ${report.netWorthChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {report.netWorthChange >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(report.netWorthChange))}
          </span>
        </div>
      </div>

      {/* Credit Score */}
      {report.creditScoreBefore !== report.creditScoreAfter && (
        <div className="card mb-4">
          <h3 className="text-sm text-slate-400 mb-2">Credit Score</h3>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{report.creditScoreBefore || 'None'}</span>
            <span className="text-2xl">→</span>
            <span className="text-xl font-bold">{report.creditScoreAfter}</span>
          </div>
          <div className="text-center mt-2">
            <span className={`text-sm ${report.creditScoreAfter > report.creditScoreBefore ? 'text-green-400' : 'text-red-400'}`}>
              {report.creditScoreAfter > report.creditScoreBefore ? '▲' : '▼'} {Math.abs(report.creditScoreAfter - report.creditScoreBefore)} points
            </span>
          </div>
        </div>
      )}

      {/* Milestones */}
      {lastMonthReport.newMilestones.length > 0 && (
        <div className="card mb-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
          <div className="flex items-center gap-2 mb-3">
            <Award className="text-yellow-400" size={24} />
            <h3 className="font-semibold text-yellow-400">Milestone Achieved!</h3>
          </div>
          {gameState.milestones
            .filter(m => lastMonthReport.newMilestones.includes(m.id))
            .map(m => (
              <div key={m.id} className="py-2">
                <p className="font-bold">{m.title}</p>
                <p className="text-sm text-slate-300">{m.description}</p>
              </div>
            ))}
        </div>
      )}

      {/* Promotion */}
      {lastMonthReport.promotionOccurred && (
        <div className="card mb-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-green-400">Promoted!</p>
              <p className="text-sm text-slate-300">
                You've been promoted to {gameState.employment?.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Layoff */}
      {lastMonthReport.layoffOccurred && (
        <div className="card mb-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            <div>
              <p className="font-bold text-red-400">Laid Off</p>
              <p className="text-sm text-slate-300">
                You lost your job. Time to find a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* News */}
      {report.news.length > 0 && (
        <div className="card mb-4">
          <h3 className="text-sm text-slate-400 mb-2">News</h3>
          {report.news.map((item, i) => (
            <p key={i} className="text-sm py-1 border-b border-slate-700 last:border-0">
              📰 {item.headline}
            </p>
          ))}
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={() => setScreen('home')}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg mt-4"
      >
        Continue
      </button>
    </div>
  );
}
