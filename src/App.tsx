import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { initDB } from './services/storage';
import { MainMenu } from './screens/MainMenu';
import { NewGame } from './screens/NewGame';
import { HomeScreen } from './screens/HomeScreen';
import { CareerScreen } from './screens/CareerScreen';
import { MoneyScreen } from './screens/MoneyScreen';
import { AssetsScreen } from './screens/AssetsScreen';
import { MoreScreen } from './screens/MoreScreen';
import { MonthlyReportScreen } from './screens/MonthlyReportScreen';
import { EventScreen } from './screens/EventScreen';
import { JobSearchScreen } from './screens/JobSearchScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { MilestonesScreen } from './screens/MilestonesScreen';
import { BudgetScreen } from './screens/BudgetScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { DevPanel } from './screens/DevPanel';
import { EducationScreen } from './screens/EducationScreen';
import { HousingScreen } from './screens/HousingScreen';
import { VehicleScreen } from './screens/VehicleScreen';
import { BottomNav } from './components/BottomNav';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const { currentScreen, isLoading, gameState, actionMessage, clearActionMessage } = useGameStore();

  useEffect(() => {
    initDB().catch(console.error);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <MainMenu />;
      case 'new_game':
        return <NewGame />;
      case 'home':
        return <HomeScreen />;
      case 'career':
        return <CareerScreen />;
      case 'money':
        return <MoneyScreen />;
      case 'assets':
        return <AssetsScreen />;
      case 'more':
        return <MoreScreen />;
      case 'monthly_report':
        return <MonthlyReportScreen />;
      case 'event':
        return <EventScreen />;
      case 'job_search':
        return <JobSearchScreen />;
      case 'timeline':
        return <TimelineScreen />;
      case 'milestones':
        return <MilestonesScreen />;
      case 'budget':
        return <BudgetScreen />;
      case 'game_over':
        return <GameOverScreen />;
      case 'dev_panel':
        return <DevPanel />;
      case 'education':
        return <EducationScreen />;
      case 'housing':
        return <HousingScreen />;
      case 'vehicle':
        return <VehicleScreen />;
      default:
        return <MainMenu />;
    }
  };

  const showNav = gameState && !['menu', 'new_game', 'monthly_report', 'event', 'game_over'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {actionMessage && (
        <button
          onClick={clearActionMessage}
          className="fixed top-3 left-3 right-3 z-50 bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3 text-left shadow-xl"
        >
          <p className="text-sm">{actionMessage}</p>
          <p className="text-xs text-slate-500 mt-1">Tap to dismiss</p>
        </button>
      )}
      <div className={`flex-1 overflow-auto ${showNav ? 'pb-20' : ''}`}>
        {renderScreen()}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
