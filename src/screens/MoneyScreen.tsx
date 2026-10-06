import { Wallet, PiggyBank, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, getEmergencyFundMonths, calculateMonthlyIncome, calculateMonthlyExpenses } from '../game/simulation/financialSystem';
import { buyInvestment, payExtraOnLoan, transferToSavings, withdrawSavings } from '../game/simulation/actions';

export function MoneyScreen() {
  const { gameState, setScreen, setLifestyle, runAction } = useGameStore();

  if (!gameState) return null;

  const income = calculateMonthlyIncome(gameState);
  const expenses = calculateMonthlyExpenses(gameState);
  const emergencyMonths = getEmergencyFundMonths(gameState);
  const cashFlow = income.total - expenses.total;

  const lifestyleOptions = [
    { id: 'bare_bones', label: 'Bare Bones', description: 'Minimal spending', cost: '$200/mo' },
    { id: 'frugal', label: 'Frugal', description: 'Careful with money', cost: '$400/mo' },
    { id: 'comfortable', label: 'Comfortable', description: 'Normal lifestyle', cost: '$800/mo' },
    { id: 'expensive', label: 'Expensive', description: 'Nice things', cost: '$1,500/mo' },
    { id: 'luxury', label: 'Luxury', description: 'The best of everything', cost: '$3,000/mo' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <h1 className="text-2xl font-bold mb-6">Money</h1>

      {/* Cash & Savings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="text-green-400" size={20} />
            <span className="text-slate-400 text-sm">Cash</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(gameState.cash)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="text-blue-400" size={20} />
            <span className="text-slate-400 text-sm">Savings</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(gameState.savings)}</p>
        </div>
      </div>

      {/* Emergency Fund */}
      <div className="card mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400">Emergency Fund</span>
          <span className={`font-semibold ${emergencyMonths >= 6 ? 'text-green-400' : emergencyMonths >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
            {emergencyMonths.toFixed(1)} months
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${emergencyMonths >= 6 ? 'bg-green-500' : emergencyMonths >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, (emergencyMonths / 6) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Goal: 6 months of expenses
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button className="btn-secondary text-sm" onClick={() => runAction((state) => transferToSavings(state, Math.min(500, state.cash)))}>
          Save up to $500
        </button>
        <button className="btn-ghost text-sm" onClick={() => runAction((state) => withdrawSavings(state, Math.min(500, state.savings)))}>
          Withdraw up to $500
        </button>
      </div>

      <div className="card mb-4">
        <h3 className="font-semibold mb-2">Invest</h3>
        <p className="text-sm text-slate-400 mb-3">Returns move with the economy. Index funds swing less than a single stock. Retirement accounts can get an employer match if your job has benefits.</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary text-sm" onClick={() => runAction((state) => buyInvestment(state, 'high_yield_savings', 500))}>HYSA $500</button>
          <button className="btn-secondary text-sm" onClick={() => runAction((state) => buyInvestment(state, 'index_fund', 500))}>Index $500</button>
          <button className="btn-secondary text-sm" onClick={() => runAction((state) => buyInvestment(state, 'bonds', 500))}>Bonds $500</button>
          <button className="btn-secondary text-sm" onClick={() => runAction((state) => buyInvestment(state, 'individual_stock', 500))}>Stock $500</button>
          <button className="btn-primary text-sm col-span-2" onClick={() => runAction((state) => buyInvestment(state, 'retirement', 500))}>Open / add retirement $500</button>
        </div>
      </div>

      {/* Credit Score */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="text-purple-400" size={20} />
          <span className="text-slate-400">Credit Score</span>
        </div>
        {gameState.creditScore > 0 ? (
          <>
            <p className={`text-3xl font-bold ${
              gameState.creditScore >= 750 ? 'text-green-400' :
              gameState.creditScore >= 700 ? 'text-blue-400' :
              gameState.creditScore >= 650 ? 'text-yellow-400' :
              gameState.creditScore >= 600 ? 'text-orange-400' : 'text-red-400'
            }`}>
              {gameState.creditScore}
            </p>
            <p className="text-sm text-slate-500">
              {gameState.creditScore >= 750 ? 'Excellent' :
               gameState.creditScore >= 700 ? 'Good' :
               gameState.creditScore >= 650 ? 'Fair' :
               gameState.creditScore >= 600 ? 'Poor' : 'Very Poor'}
            </p>
          </>
        ) : (
          <p className="text-slate-500">No credit history yet</p>
        )}
      </div>

      {/* Monthly Cash Flow */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Monthly Cash Flow</h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-400" size={18} />
            <span>Income</span>
          </div>
          <span className="text-green-400 font-semibold">{formatCurrency(income.total)}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-400" size={18} />
            <span>Expenses</span>
          </div>
          <span className="text-red-400 font-semibold">{formatCurrency(expenses.total)}</span>
        </div>

        <div className="border-t border-slate-700 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Net Cash Flow</span>
            <span className={`text-xl font-bold ${cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {cashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlow)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setScreen('budget')}
          className="w-full btn-ghost mt-3 text-sm"
        >
          View Full Budget →
        </button>
      </div>

      {/* Debts */}
      {gameState.loans.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Debts</h3>
          <div className="space-y-2">
            {gameState.loans.map((loan) => (
              <div key={loan.id} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                <div>
                  <p className="font-medium capitalize">{loan.type.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-500">{loan.apr * 100}% APR</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-semibold">{formatCurrency(loan.balance)}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(loan.monthlyPayment)}/mo</p>
                  <button
                    className="text-xs text-blue-400 mt-1"
                    onClick={() => runAction((state) => payExtraOnLoan(state, loan.id, Math.min(200, loan.balance)))}
                  >
                    Pay $200 extra
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between">
            <span className="text-slate-400">Total Debt</span>
            <span className="text-red-400 font-bold">
              {formatCurrency(gameState.loans.reduce((sum, l) => sum + l.balance, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Lifestyle */}
      <div className="card">
        <h3 className="font-semibold mb-3">Lifestyle</h3>
        <div className="space-y-2">
          {lifestyleOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setLifestyle(option.id)}
              className={`w-full p-3 rounded-xl text-left transition-all flex justify-between items-center ${
                gameState.lifestyle === option.id
                  ? 'bg-blue-500/20 border-2 border-blue-500'
                  : 'bg-slate-900/50 border-2 border-transparent'
              }`}
            >
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
              <span className="text-sm text-slate-400">{option.cost}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
