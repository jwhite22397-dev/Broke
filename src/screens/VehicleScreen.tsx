import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { purchaseVehicle, quotedVehicle, sellVehicle } from '../game/simulation/actions';
import { formatCurrency } from '../game/simulation/financialSystem';
import type { VehicleType } from '../game/models/types';

const OPTIONS: Array<Exclude<VehicleType, 'none'>> = [
  'public_transit',
  'beater',
  'used_economy',
  'used_midrange',
  'new_economy',
  'new_midrange',
  'luxury',
];

export function VehicleScreen() {
  const { gameState, setScreen, runAction } = useGameStore();
  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button onClick={() => setScreen('assets')} className="flex items-center gap-2 text-slate-400 mb-6">
        <ArrowLeft size={20} /> Back
      </button>
      <h1 className="text-2xl font-bold mb-2">Transportation</h1>
      <p className="text-slate-400 mb-4">
        {gameState.vehicle ? `You have a ${gameState.vehicle.name}.` : 'No car. Some jobs and errands get harder.'}
      </p>
      {gameState.vehicle && gameState.vehicle.type !== 'public_transit' && (
        <button className="btn-danger w-full mb-4" onClick={() => runAction((state) => sellVehicle(state))}>
          Sell for about {formatCurrency(Math.round(gameState.vehicle.currentValue * 0.82))}
        </button>
      )}
      <div className="space-y-3">
        {OPTIONS.map((type) => {
          if (type === 'public_transit') {
            return (
              <div key={type} className="card">
                <h2 className="font-semibold">Public transit</h2>
                <p className="text-sm text-slate-400 mb-3">About $100/mo. No repair surprises.</p>
                <button className="btn-secondary w-full" onClick={() => runAction((state) => purchaseVehicle(state, type, false))}>
                  Switch to transit
                </button>
              </div>
            );
          }
          const quote = quotedVehicle(gameState, type);
          return (
            <div key={type} className="card">
              <div className="flex justify-between items-start mb-1">
                <h2 className="font-semibold capitalize">{type.replaceAll('_', ' ')}</h2>
                <span>{formatCurrency(quote.price)}</span>
              </div>
              <p className="text-sm text-slate-400 mb-1">{quote.name}</p>
              <p className="text-xs text-slate-500 mb-3">
                Finance: {formatCurrency(quote.down)} down · {formatCurrency(quote.payment)}/mo · {(quote.apr * 100).toFixed(1)}% · {quote.term} mo
                <br />
                Total if financed: {formatCurrency(quote.total)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary text-sm" onClick={() => runAction((state) => purchaseVehicle(state, type, false))}>
                  Pay cash
                </button>
                <button className="btn-primary text-sm" onClick={() => runAction((state) => purchaseVehicle(state, type, true))}>
                  Finance
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
