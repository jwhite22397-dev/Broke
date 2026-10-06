import { Home, Briefcase, Wallet, Building2, Menu } from 'lucide-react';
import { useGameStore, type GameScreen } from '../store/gameStore';

const navItems: { screen: GameScreen; icon: typeof Home; label: string }[] = [
  { screen: 'home', icon: Home, label: 'Life' },
  { screen: 'career', icon: Briefcase, label: 'Career' },
  { screen: 'money', icon: Wallet, label: 'Money' },
  { screen: 'assets', icon: Building2, label: 'Assets' },
  { screen: 'more', icon: Menu, label: 'More' },
];

export function BottomNav() {
  const { currentScreen, setScreen } = useGameStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 pb-safe">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ screen, icon: Icon, label }) => (
          <button
            key={screen}
            onClick={() => setScreen(screen)}
            className={`nav-item ${currentScreen === screen ? 'nav-item-active' : 'text-slate-500'}`}
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
