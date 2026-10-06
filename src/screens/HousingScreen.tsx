import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { changeHousing, moveToCity, purchaseHome, quotedHome } from '../game/simulation/actions';
import { CITIES } from '../data/cities/cities';
import { HOUSING_COSTS } from '../game/balance/constants';
import { formatCurrency } from '../game/simulation/financialSystem';
import { getCityById } from '../data/cities/cities';
import type { HousingType } from '../game/models/types';

const RENTALS: HousingType[] = ['with_family', 'roommates', 'cheap_apartment', 'apartment', 'nice_apartment', 'rental_house'];

export function HousingScreen() {
  const { gameState, setScreen, runAction } = useGameStore();
  if (!gameState) return null;
  const city = getCityById(gameState.cityId);
  const home = quotedHome(gameState, false);
  const rental = quotedHome(gameState, true);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button onClick={() => setScreen('assets')} className="flex items-center gap-2 text-slate-400 mb-6">
        <ArrowLeft size={20} /> Back
      </button>
      <h1 className="text-2xl font-bold mb-1">Housing</h1>
      <p className="text-slate-400 mb-4">Now: {gameState.housing.replaceAll('_', ' ')} in {city?.name}</p>

      <div className="space-y-3 mb-6">
        {RENTALS.map((type) => {
          const base = HOUSING_COSTS[type].baseRent;
          const rent = type === 'with_family' ? gameState.socioeconomicBackground === 'privileged' ? 0 : 250 : Math.round(base * (city?.rentMultiplier ?? 1));
          return (
            <button
              key={type}
              className="card w-full text-left"
              onClick={() => runAction((state) => changeHousing(state, type))}
            >
              <div className="flex justify-between">
                <span className="font-semibold capitalize">{type.replaceAll('_', ' ')}</span>
                <span className="text-slate-300">{rent === 0 ? 'No rent' : `${formatCurrency(rent)}/mo`}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {type === 'with_family' ? 'Less privacy, lower cost' : `Move-in about ${formatCurrency(rent * 2)}`}
              </p>
            </button>
          );
        })}
      </div>

      <div className="card mb-3">
        <h2 className="font-semibold mb-1">Buy a home</h2>
        <p className="text-sm text-slate-400 mb-3">
          {formatCurrency(home.price)} · {formatCurrency(home.cashNeeded)} to close · {formatCurrency(home.payment)}/mo mortgage
        </p>
        <button className="btn-primary w-full" onClick={() => runAction((state) => purchaseHome(state, false))}>
          Make an offer
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold mb-1">Buy a rental</h2>
        <p className="text-sm text-slate-400 mb-3">
          {formatCurrency(rental.price)} · needs {formatCurrency(rental.cashNeeded)} cash. Vacancies and repairs happen.
        </p>
        <button className="btn-secondary w-full" onClick={() => runAction((state) => purchaseHome(state, true))}>
          Buy rental
        </button>
      </div>

      <h2 className="font-semibold mb-3">Move cities</h2>
      <div className="space-y-2">
        {CITIES.map((option) => (
          <button
            key={option.id}
            className="card w-full text-left"
            onClick={() => runAction((state) => moveToCity(state, option.id))}
          >
            <div className="flex justify-between">
              <span className="font-medium">{option.name}</span>
              <span className="text-xs uppercase text-slate-500">{option.costTier.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-slate-500">Wages ×{option.wageMultiplier} · Rent ×{option.rentMultiplier}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
