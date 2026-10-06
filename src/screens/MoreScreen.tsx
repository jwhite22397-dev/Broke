import { Clock, Trophy, PieChart, Settings, Download, Code } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { exportSave } from '../services/storage';
import { relationshipAction } from '../game/simulation/actions';

export function MoreScreen() {
  const { gameState, setScreen, devMode, toggleDevMode, runAction } = useGameStore();

  if (!gameState) return null;

  const handleExport = async () => {
    try {
      const json = await exportSave(gameState.seed.toString());
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `broke-save-${gameState.name}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const menuItems = [
    { icon: Clock, label: 'Timeline', description: 'Your life story', screen: 'timeline' as const },
    { icon: Trophy, label: 'Milestones', description: 'Achievements', screen: 'milestones' as const },
    { icon: PieChart, label: 'Budget', description: 'Detailed breakdown', screen: 'budget' as const },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <h1 className="text-2xl font-bold mb-6">More</h1>

      {/* Quick Stats */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Life Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Age</p>
            <p className="font-semibold">{gameState.age} years</p>
          </div>
          <div>
            <p className="text-slate-500">Background</p>
            <p className="font-semibold capitalize">{gameState.socioeconomicBackground.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-slate-500">Hometown</p>
            <p className="font-semibold">{gameState.hometown}</p>
          </div>
          <div>
            <p className="text-slate-500">Education</p>
            <p className="font-semibold capitalize">{gameState.education.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-slate-500">Work Experience</p>
            <p className="font-semibold">
              {Math.floor(gameState.totalWorkExperience / 12)}y {gameState.totalWorkExperience % 12}m
            </p>
          </div>
          <div>
            <p className="text-slate-500">Relationship</p>
            <p className="font-semibold capitalize">{gameState.relationshipStatus}</p>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="font-semibold mb-1">Relationships</h3>
        <p className="text-sm text-slate-400 mb-3 capitalize">
          {gameState.relationshipStatus}
          {gameState.partner ? ` · ${gameState.partner.name} earns ${gameState.partner.monthlyIncome.toLocaleString()}/mo` : ''}
          {gameState.children.length > 0 ? ` · ${gameState.children.length} ${gameState.children.length === 1 ? 'child' : 'children'}` : ''}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary text-sm" onClick={() => runAction((state) => relationshipAction(state, 'date'))}>Go on a date</button>
          <button className="btn-secondary text-sm" onClick={() => runAction((state) => relationshipAction(state, 'commit'))}>Get serious</button>
          <button className="btn-primary text-sm" onClick={() => runAction((state) => relationshipAction(state, 'marry'))}>Marry</button>
          <button className="btn-secondary text-sm" onClick={() => runAction((state) => relationshipAction(state, 'child'))}>Have a child</button>
          <button className="btn-ghost text-sm col-span-2" onClick={() => runAction((state) => relationshipAction(state, 'breakup'))}>Break up / divorce</button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2 mb-6">
        {menuItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            className="w-full card flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <item.icon className="text-slate-300" size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2 mb-6">
        <button
          onClick={handleExport}
          className="w-full card flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Download className="text-blue-400" size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium">Export Save</p>
            <p className="text-sm text-slate-500">Download your progress</p>
          </div>
        </button>

        <button
          onClick={() => setScreen('menu')}
          className="w-full card flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
            <Settings className="text-slate-300" size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium">Main Menu</p>
            <p className="text-sm text-slate-500">Return to start</p>
          </div>
        </button>
      </div>

      {/* Dev Mode Toggle */}
      <div className="card">
        <button
          onClick={toggleDevMode}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Code className={devMode ? 'text-green-400' : 'text-slate-500'} size={20} />
            <span>Developer Mode</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${devMode ? 'bg-green-500' : 'bg-slate-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${devMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
        </button>
        
        {devMode && (
          <button
            onClick={() => setScreen('dev_panel')}
            className="w-full mt-3 btn-secondary"
          >
            Open Dev Panel
          </button>
        )}
      </div>

      {/* Game Info */}
      <div className="mt-6 text-center text-xs text-slate-600">
        <p>BROKE v1.0</p>
        <p>Seed: {gameState.seed}</p>
      </div>
    </div>
  );
}
