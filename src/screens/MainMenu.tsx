import { useState, useEffect } from 'react';
import { Play, Plus, Upload } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getAutoSave, importSave } from '../services/storage';
import type { SaveGame } from '../game/models/types';

export function MainMenu() {
  const { setScreen, continueGame } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [saveInfo, setSaveInfo] = useState<SaveGame | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    getAutoSave().then((save) => {
      setHasSave(!!save);
      setSaveInfo(save);
    });
  }, []);

  const handleContinue = async () => {
    const success = await continueGame();
    if (!success) {
      setScreen('new_game');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importSave(text);
      setShowImport(false);
      handleContinue();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
          BROKE
        </h1>
        <p className="text-slate-400 text-lg">
          Can you escape the circumstances you were born into?
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {hasSave && (
          <button
            onClick={handleContinue}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg"
          >
            <Play size={24} />
            Continue
          </button>
        )}

        {hasSave && saveInfo && (
          <div className="text-center text-sm text-slate-500 -mt-2 mb-2">
            {saveInfo.name}, Age {saveInfo.state.age}
          </div>
        )}

        <button
          onClick={() => setScreen('new_game')}
          className="w-full btn-secondary flex items-center justify-center gap-3 py-4 text-lg"
        >
          <Plus size={24} />
          New Life
        </button>

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => setShowImport(true)}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Upload size={18} />
            Import Save
          </button>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Import Save</h2>
            
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="w-full p-3 bg-slate-700 rounded-xl text-sm"
            />
            
            {importError && (
              <p className="text-red-400 text-sm mt-2">{importError}</p>
            )}
            
            <button
              onClick={() => {
                setShowImport(false);
                setImportError(null);
              }}
              className="w-full btn-ghost mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 text-center">
        <p className="text-slate-600 text-xs">
          A life simulation game
        </p>
      </div>
    </div>
  );
}
