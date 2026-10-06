import { Building2, Car, TrendingUp, Home } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, calculateNetWorth } from '../game/simulation/financialSystem';
import { hireEmployee, startBusiness } from '../game/simulation/actions';
import { BUSINESS_TYPES } from '../game/balance/constants';

export function AssetsScreen() {
  const { gameState, setScreen, runAction } = useGameStore();

  if (!gameState) return null;

  const netWorth = calculateNetWorth(gameState);
  
  const totalAssets = 
    gameState.cash + 
    gameState.checking + 
    gameState.savings +
    (gameState.vehicle?.currentValue || 0) +
    gameState.investments.reduce((sum, inv) => sum + inv.currentValue, 0) +
    gameState.properties.reduce((sum, prop) => sum + prop.currentValue, 0);

  const totalLiabilities = gameState.loans.reduce((sum, loan) => sum + loan.balance, 0);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <h1 className="text-2xl font-bold mb-4">Assets</h1>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button className="btn-secondary" onClick={() => setScreen('housing')}>Housing</button>
        <button className="btn-secondary" onClick={() => setScreen('vehicle')}>Vehicle</button>
      </div>

      {/* Net Worth Summary */}
      <div className="card mb-4 bg-gradient-to-br from-slate-800 to-slate-800/50">
        <p className="text-slate-400 text-sm mb-1">Net Worth</p>
        <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
          {formatCurrency(netWorth)}
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
          <div>
            <p className="text-xs text-slate-500">Assets</p>
            <p className="text-green-400 font-semibold">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Liabilities</p>
            <p className="text-red-400 font-semibold">{formatCurrency(totalLiabilities)}</p>
          </div>
        </div>
      </div>

      {/* Cash Assets */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            💵
          </div>
          Cash & Savings
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Checking</span>
            <span>{formatCurrency(gameState.checking)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Savings</span>
            <span>{formatCurrency(gameState.savings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Cash on Hand</span>
            <span>{formatCurrency(gameState.cash)}</span>
          </div>
          <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-green-400">
              {formatCurrency(gameState.cash + gameState.checking + gameState.savings)}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle */}
      {gameState.vehicle && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Car className="text-blue-400" size={18} />
            </div>
            Vehicle
          </h3>
          <div className="bg-slate-900/50 rounded-xl p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{gameState.vehicle.name}</p>
                <p className="text-sm text-slate-500">
                  {gameState.vehicle.age < 1 ? 'New' : `${Math.floor(gameState.vehicle.age)} years old`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">
                  {formatCurrency(gameState.vehicle.currentValue)}
                </p>
                {gameState.vehicle.loanId && (
                  <p className="text-xs text-red-400">
                    Loan: {formatCurrency(
                      gameState.loans.find(l => l.id === gameState.vehicle?.loanId)?.balance || 0
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${
                gameState.vehicle.reliability >= 70 ? 'bg-green-500/20 text-green-400' :
                gameState.vehicle.reliability >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {gameState.vehicle.reliability >= 70 ? 'Reliable' :
                 gameState.vehicle.reliability >= 40 ? 'Fair' : 'Unreliable'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Investments */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-purple-400" size={18} />
          </div>
          Investments
        </h3>
        {gameState.investments.length > 0 ? (
          <div className="space-y-2">
            {gameState.investments.map((inv) => {
              const gain = inv.currentValue - inv.costBasis;
              const gainPercent = inv.costBasis > 0 ? (gain / inv.costBasis) * 100 : 0;
              return (
                <div key={inv.id} className="bg-slate-900/50 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{inv.name}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {inv.type.replace('_', ' ')}
                        {inv.isRetirement && ' • Retirement'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(inv.currentValue)}</p>
                      <p className={`text-xs ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold">
              <span>Total Investments</span>
              <span className="text-purple-400">
                {formatCurrency(gameState.investments.reduce((sum, inv) => sum + inv.currentValue, 0))}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">
            No investments yet. Build savings first, then consider investing.
          </p>
        )}
      </div>

      {/* Properties */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <Home className="text-orange-400" size={18} />
          </div>
          Real Estate
        </h3>
        {gameState.properties.length > 0 ? (
          <div className="space-y-2">
            {gameState.properties.map((prop) => {
              const mortgage = gameState.loans.find(l => l.id === prop.mortgageId);
              const equity = prop.currentValue - (mortgage?.balance || 0);
              return (
                <div key={prop.id} className="bg-slate-900/50 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium capitalize">{prop.type} Property</p>
                      {prop.type === 'rental' && prop.monthlyRent && (
                        <p className="text-xs text-green-400">
                          Rent: {formatCurrency(prop.monthlyRent)}/mo
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(prop.currentValue)}</p>
                      {mortgage && (
                        <p className="text-xs text-slate-500">
                          Equity: {formatCurrency(equity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">
            No property owned. Save for a down payment to buy a home.
          </p>
        )}
      </div>

      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Start a business</h3>
        <p className="text-sm text-slate-400 mb-3">Most of these lose money before they make any. You need cash and some experience.</p>
        <div className="space-y-2">
          {Object.entries(BUSINESS_TYPES).map(([type, config]) => (
            <button
              key={type}
              className="w-full bg-slate-900/50 rounded-xl p-3 text-left"
              onClick={() => runAction((state) => startBusiness(state, type as keyof typeof BUSINESS_TYPES))}
            >
              <div className="flex justify-between">
                <span className="font-medium capitalize">{type.replaceAll('_', ' ')}</span>
                <span className="text-slate-400">{formatCurrency(config.startupCost)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Businesses */}
      {gameState.businesses.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="text-yellow-400" size={18} />
            </div>
            Businesses
          </h3>
          <div className="space-y-2">
            {gameState.businesses.map((biz) => {
              const profit = biz.monthlyRevenue - biz.monthlyExpenses;
              return (
                <div key={biz.id} className="bg-slate-900/50 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{biz.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{biz.type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profit >= 0 ? '+' : ''}{formatCurrency(profit)}/mo
                      </p>
                      <p className="text-xs text-slate-500">
                        {biz.customers} customers
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn-ghost text-sm mt-2"
                    onClick={() => runAction((state) => hireEmployee(state, biz.id))}
                  >
                    Hire an employee
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
