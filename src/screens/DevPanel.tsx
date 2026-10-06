import { useState } from 'react';
import { ArrowLeft, DollarSign, Calendar, CreditCard, TrendingUp, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency } from '../game/simulation/financialSystem';
import { EVENTS } from '../data/events/events';

export function DevPanel() {
  const { 
    gameState, 
    setScreen, 
    devAddCash, 
    devSetAge, 
    devSetCreditScore, 
    devAdvanceYear,
    devForceEvent,
    devSetNetWorth,
    getNetWorth,
  } = useGameStore();

  const [cashAmount, setCashAmount] = useState('10000');
  const [ageValue, setAgeValue] = useState(gameState?.age.toString() || '18');
  const [creditValue, setCreditValue] = useState(gameState?.creditScore.toString() || '650');
  const [netWorthValue, setNetWorthValue] = useState('100000');
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0]?.id || '');

  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button
        onClick={() => setScreen('more')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
          <Zap className="text-green-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dev Panel</h1>
          <p className="text-slate-400 text-sm">Testing & balancing tools</p>
        </div>
      </div>

      {/* Current State */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Current State</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Cash: <span className="text-green-400">{formatCurrency(gameState.cash)}</span></div>
          <div>Net Worth: <span className="text-blue-400">{formatCurrency(getNetWorth())}</span></div>
          <div>Age: <span className="text-purple-400">{gameState.age}</span></div>
          <div>Credit: <span className="text-yellow-400">{gameState.creditScore || 'None'}</span></div>
          <div>Economy: <span className="capitalize">{gameState.economicState}</span></div>
          <div>Seed: <span className="text-slate-500">{gameState.seed}</span></div>
        </div>
      </div>

      {/* Add Cash */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <DollarSign size={18} className="text-green-400" />
          Add Cash
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            className="flex-1 bg-slate-700 rounded-xl px-4 py-2"
          />
          <button
            onClick={() => devAddCash(parseInt(cashAmount) || 0)}
            className="btn-success"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          {[1000, 10000, 100000, 1000000].map((amount) => (
            <button
              key={amount}
              onClick={() => devAddCash(amount)}
              className="flex-1 btn-ghost text-xs"
            >
              +{formatCurrency(amount)}
            </button>
          ))}
        </div>
      </div>

      {/* Set Age */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-purple-400" />
          Set Age
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={ageValue}
            onChange={(e) => setAgeValue(e.target.value)}
            min="18"
            max="100"
            className="flex-1 bg-slate-700 rounded-xl px-4 py-2"
          />
          <button
            onClick={() => devSetAge(parseInt(ageValue) || 18)}
            className="btn-primary"
          >
            Set
          </button>
        </div>
        <button
          onClick={devAdvanceYear}
          className="w-full btn-secondary mt-2"
        >
          Advance 1 Year (12 months)
        </button>
      </div>

      {/* Set Credit Score */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CreditCard size={18} className="text-yellow-400" />
          Set Credit Score
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={creditValue}
            onChange={(e) => setCreditValue(e.target.value)}
            min="300"
            max="850"
            className="flex-1 bg-slate-700 rounded-xl px-4 py-2"
          />
          <button
            onClick={() => devSetCreditScore(parseInt(creditValue) || 650)}
            className="btn-primary"
          >
            Set
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          {[580, 650, 700, 750, 800].map((score) => (
            <button
              key={score}
              onClick={() => devSetCreditScore(score)}
              className="flex-1 btn-ghost text-xs"
            >
              {score}
            </button>
          ))}
        </div>
      </div>

      {/* Set Net Worth */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-400" />
          Set Net Worth
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={netWorthValue}
            onChange={(e) => setNetWorthValue(e.target.value)}
            className="flex-1 bg-slate-700 rounded-xl px-4 py-2"
          />
          <button
            onClick={() => devSetNetWorth(parseInt(netWorthValue) || 0)}
            className="btn-primary"
          >
            Set
          </button>
        </div>
      </div>

      {/* Force Event */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Force Event</h3>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full bg-slate-700 rounded-xl px-4 py-2 mb-2"
        >
          {EVENTS.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} ({event.category})
            </option>
          ))}
        </select>
        <button
          onClick={() => devForceEvent(selectedEvent)}
          className="w-full btn-secondary"
        >
          Trigger Event
        </button>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              devAddCash(50000);
              devSetCreditScore(750);
            }}
            className="btn-ghost text-sm"
          >
            Boost Start
          </button>
          <button
            onClick={() => {
              devSetNetWorth(1000000);
              devSetCreditScore(800);
            }}
            className="btn-ghost text-sm"
          >
            Millionaire
          </button>
        </div>
      </div>
    </div>
  );
}
