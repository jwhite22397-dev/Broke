import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, calculateMonthlyIncome, calculateMonthlyExpenses } from '../game/simulation/financialSystem';

export function BudgetScreen() {
  const { gameState, setScreen } = useGameStore();

  if (!gameState) return null;

  const income = calculateMonthlyIncome(gameState);
  const expenses = calculateMonthlyExpenses(gameState);
  const cashFlow = income.total - expenses.total;

  const incomeItems = [
    { label: 'Employment', value: income.employment },
    { label: 'Partner', value: income.partner },
    { label: 'Business', value: income.business },
    { label: 'Investments', value: income.investments },
    { label: 'Rental Income', value: income.rental },
    { label: 'Other', value: income.other },
  ].filter(item => item.value > 0);

  const expenseItems = [
    { label: 'Housing', value: expenses.housing },
    { label: 'Transportation', value: expenses.transportation },
    { label: 'Food', value: expenses.food },
    { label: 'Utilities', value: expenses.utilities },
    { label: 'Debt Payments', value: expenses.debt },
    { label: 'Insurance', value: expenses.insurance },
    { label: 'Lifestyle', value: expenses.lifestyle },
    { label: 'Education', value: expenses.education },
    { label: 'Childcare', value: expenses.childcare },
    { label: 'Taxes', value: expenses.taxes },
    { label: 'Other', value: expenses.other },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button
        onClick={() => setScreen('money')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Monthly Budget</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="card text-center">
          <p className="text-xs text-slate-500">Income</p>
          <p className="text-lg font-bold text-green-400">{formatCurrency(income.total)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500">Expenses</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(expenses.total)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500">Cash Flow</p>
          <p className={`text-lg font-bold ${cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {cashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlow)}
          </p>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3 text-green-400">Income</h2>
        <div className="space-y-2">
          {incomeItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-green-400">+{formatCurrency(item.value)}</span>
            </div>
          ))}
          <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold">
            <span>Total Income</span>
            <span className="text-green-400">{formatCurrency(income.total)}</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3 text-red-400">Expenses</h2>
        <div className="space-y-2">
          {expenseItems.map((item) => {
            const percentage = expenses.total > 0 ? (item.value / expenses.total) * 100 : 0;
            return (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-red-400">-{formatCurrency(item.value)}</span>
                </div>
                <div className="progress-bar h-1">
                  <div 
                    className="progress-fill bg-red-500/50"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold">
            <span>Total Expenses</span>
            <span className="text-red-400">{formatCurrency(expenses.total)}</span>
          </div>
        </div>
      </div>

      {/* Savings Rate */}
      <div className="card">
        <h2 className="font-semibold mb-3">Savings Rate</h2>
        {income.total > 0 ? (
          <>
            <div className="text-3xl font-bold text-center mb-2">
              {Math.round((cashFlow / income.total) * 100)}%
            </div>
            <div className="progress-bar h-3">
              <div 
                className={`progress-fill ${cashFlow >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.max(0, Math.min(100, (cashFlow / income.total) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              {cashFlow >= 0 
                ? `You're saving ${formatCurrency(cashFlow)} per month`
                : `You're spending ${formatCurrency(Math.abs(cashFlow))} more than you earn`
              }
            </p>
          </>
        ) : (
          <p className="text-slate-500 text-center">No income to calculate savings rate</p>
        )}
      </div>
    </div>
  );
}
