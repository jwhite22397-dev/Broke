import { useState } from 'react';
import { ArrowLeft, Shuffle, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { generateRandomName, generateRandomHometown } from '../game/simulation/lifeGenerator';
import { SeededRandom, generateSeed } from '../game/engine/random';

export function NewGame() {
  const { setScreen, startNewGame } = useGameStore();
  const [name, setName] = useState('');
  const [hometown, setHometown] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleRandomize = () => {
    const rng = new SeededRandom(generateSeed());
    setName(generateRandomName(rng));
    setHometown(generateRandomHometown(rng));
  };

  const handleStart = async () => {
    if (!name.trim() || !hometown.trim()) return;
    
    setIsStarting(true);
    await startNewGame(name.trim(), hometown.trim());
  };

  const canStart = name.trim().length > 0 && hometown.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button
        onClick={() => setScreen('menu')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">New Life</h1>
        <p className="text-slate-400 mb-8">
          Begin your journey. Your circumstances will be randomly determined.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hometown
            </label>
            <input
              type="text"
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
              placeholder="Where are you from?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              maxLength={30}
            />
          </div>

          <button
            onClick={handleRandomize}
            className="w-full btn-ghost flex items-center justify-center gap-2"
          >
            <Shuffle size={18} />
            Randomize
          </button>

          <div className="pt-4">
            <button
              onClick={handleStart}
              disabled={!canStart || isStarting}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                canStart && !isStarting
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isStarting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play size={24} />
                  Start Life
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="font-semibold mb-2 text-slate-200">How it works</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• You'll start at age 18 with randomized circumstances</li>
            <li>• Make decisions each month to build your life</li>
            <li>• Find work, manage money, build relationships</li>
            <li>• Can you achieve financial freedom?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
