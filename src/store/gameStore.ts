import { create } from 'zustand';
import type { GameState, GameEvent, EventChoice, CareerAction, Job } from '../game/models/types';
import { generateStartingLife } from '../game/simulation/lifeGenerator';
import { simulateMonth, type MonthResult } from '../game/simulation/monthlySimulation';
import { applyEventChoice } from '../game/simulation/eventSystem';
import { calculateJobApplicationSuccess, hireForJob, quitJob } from '../game/simulation/careerSystem';
import { calculateNetWorth, calculateMonthlyIncome, calculateMonthlyExpenses, getEmergencyFundMonths } from '../game/simulation/financialSystem';
import { SeededRandom } from '../game/engine/random';
import { saveGame, setCurrentSave, getAutoSave } from '../services/storage';
import { EVENTS } from '../data/events/events';
import type { ActionResult } from '../game/simulation/actions';

export type GameScreen = 
  | 'menu'
  | 'new_game'
  | 'loading'
  | 'home'
  | 'career'
  | 'money'
  | 'assets'
  | 'more'
  | 'monthly_report'
  | 'event'
  | 'job_search'
  | 'education'
  | 'housing'
  | 'vehicle'
  | 'investments'
  | 'timeline'
  | 'milestones'
  | 'budget'
  | 'game_over'
  | 'dev_panel';

interface GameStore {
  gameState: GameState | null;
  currentScreen: GameScreen;
  pendingEvents: GameEvent[];
  currentEvent: GameEvent | null;
  lastMonthReport: MonthResult | null;
  isLoading: boolean;
  devMode: boolean;
  actionMessage: string | null;
  
  setScreen: (screen: GameScreen) => void;
  
  startNewGame: (name: string, hometown: string, seed?: number) => Promise<void>;
  continueGame: () => Promise<boolean>;
  saveCurrentGame: () => Promise<void>;
  
  advanceMonth: () => void;
  
  setCareerAction: (action: CareerAction) => void;
  applyForJob: (job: Job) => boolean;
  quitCurrentJob: () => void;
  
  handleEventChoice: (choice: EventChoice) => void;
  dismissEvent: () => void;
  
  setLifestyle: (lifestyle: GameState['lifestyle']) => void;
  clearActionMessage: () => void;
  runAction: (mutator: (state: GameState) => ActionResult) => void;
  
  toggleDevMode: () => void;
  devAddCash: (amount: number) => void;
  devSetAge: (age: number) => void;
  devSetCreditScore: (score: number) => void;
  devAdvanceYear: () => void;
  devForceEvent: (eventId: string) => void;
  devSetNetWorth: (amount: number) => void;
  
  getNetWorth: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getEmergencyFundMonths: () => number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  currentScreen: 'menu',
  pendingEvents: [],
  currentEvent: null,
  lastMonthReport: null,
  isLoading: false,
  devMode: false,
  actionMessage: null,
  
  setScreen: (screen) => set({ currentScreen: screen }),
  
  startNewGame: async (name, hometown, seed) => {
    set({ isLoading: true });
    
    const state = generateStartingLife(name, hometown, seed);
    
    await saveGame(state);
    await setCurrentSave(state.seed.toString());
    
    set({
      gameState: state,
      currentScreen: 'home',
      pendingEvents: [],
      currentEvent: null,
      lastMonthReport: null,
      isLoading: false,
    });
  },
  
  continueGame: async () => {
    set({ isLoading: true });
    
    const save = await getAutoSave();
    
    if (save) {
      set({
        gameState: save.state,
        currentScreen: 'home',
        pendingEvents: [],
        currentEvent: null,
        lastMonthReport: null,
        isLoading: false,
      });
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },
  
  saveCurrentGame: async () => {
    const { gameState } = get();
    if (!gameState) return;
    
    await saveGame(gameState);
    await setCurrentSave(gameState.seed.toString());
  },
  
  advanceMonth: () => {
    const { gameState } = get();
    if (!gameState) return;
    
    const stateCopy = JSON.parse(JSON.stringify(gameState)) as GameState;
    
    const result = simulateMonth(stateCopy);
    
    set({
      gameState: stateCopy,
      lastMonthReport: result,
      pendingEvents: result.events,
      currentEvent: result.events[0] || null,
      currentScreen: result.events.length > 0 ? 'event' : 'monthly_report',
    });
    
    if (!stateCopy.isAlive) {
      set({ currentScreen: 'game_over' });
    }
    
    saveGame(stateCopy).then(() => setCurrentSave(stateCopy.seed.toString()));
  },
  
  setCareerAction: (action) => {
    const { gameState } = get();
    if (!gameState) return;
    
    set({
      gameState: {
        ...gameState,
        careerAction: action,
      },
    });
  },
  
  applyForJob: (job) => {
    const { gameState } = get();
    if (!gameState) return false;
    
    const rng = new SeededRandom(gameState.currentSeed);
    const success = calculateJobApplicationSuccess(gameState, job, rng);
    
    if (success) {
      const employment = hireForJob(gameState, job, rng);
      
      const newState: GameState = {
        ...gameState,
        employment,
        currentSeed: rng.getSeed(),
        timeline: [
          ...gameState.timeline,
          {
            date: { ...gameState.date },
            age: gameState.age,
            type: 'career',
            title: `Started job: ${job.title}`,
            description: `Hired at $${employment.monthlyPay}/month`,
            netWorthAtTime: calculateNetWorth(gameState),
          },
        ],
      };
      
      set({ gameState: newState });
      saveGame(newState);
      return true;
    }
    
    set({
      gameState: {
        ...gameState,
        currentSeed: rng.getSeed(),
      },
    });
    
    return false;
  },
  
  quitCurrentJob: () => {
    const { gameState } = get();
    if (!gameState || !gameState.employment) return;
    
    const jobTitle = gameState.employment.title;
    quitJob(gameState);
    
    const newState: GameState = {
      ...gameState,
      timeline: [
        ...gameState.timeline,
        {
          date: { ...gameState.date },
          age: gameState.age,
          type: 'career',
          title: `Quit job: ${jobTitle}`,
          netWorthAtTime: calculateNetWorth(gameState),
        },
      ],
    };
    
    set({ gameState: newState });
    saveGame(newState);
  },
  
  handleEventChoice: (choice) => {
    const { gameState, currentEvent, pendingEvents } = get();
    if (!gameState || !currentEvent) return;
    
    const rng = new SeededRandom(gameState.currentSeed);
    const { state: newState } = applyEventChoice(gameState, currentEvent, choice, rng);
    newState.currentSeed = rng.getSeed();
    
    const remainingEvents = pendingEvents.slice(1);
    
    set({
      gameState: newState,
      pendingEvents: remainingEvents,
      currentEvent: remainingEvents[0] || null,
      currentScreen: remainingEvents.length > 0 ? 'event' : 'monthly_report',
    });
    
    saveGame(newState);
  },
  
  dismissEvent: () => {
    const { pendingEvents } = get();
    const remainingEvents = pendingEvents.slice(1);
    
    set({
      pendingEvents: remainingEvents,
      currentEvent: remainingEvents[0] || null,
      currentScreen: remainingEvents.length > 0 ? 'event' : 'monthly_report',
    });
  },
  
  setLifestyle: (lifestyle) => {
    const { gameState } = get();
    if (!gameState) return;
    
    set({
      gameState: {
        ...gameState,
        lifestyle,
      },
    });
  },

  clearActionMessage: () => set({ actionMessage: null }),

  runAction: (mutator) => {
    const { gameState } = get();
    if (!gameState) return;
    const next = structuredClone(gameState);
    const result = mutator(next);
    next.checking = next.cash;
    set({ gameState: next, actionMessage: result.message });
    if (result.ok) {
      saveGame(next).then(() => setCurrentSave(next.seed.toString()));
    }
  },
  
  toggleDevMode: () => {
    set((state) => ({ devMode: !state.devMode }));
  },
  
  devAddCash: (amount) => {
    const { gameState } = get();
    if (!gameState) return;
    
    set({
      gameState: {
        ...gameState,
        cash: gameState.cash + amount,
      },
    });
  },
  
  devSetAge: (age) => {
    const { gameState } = get();
    if (!gameState) return;
    
    set({
      gameState: {
        ...gameState,
        age,
      },
    });
  },
  
  devSetCreditScore: (score) => {
    const { gameState } = get();
    if (!gameState) return;
    
    set({
      gameState: {
        ...gameState,
        creditScore: Math.max(300, Math.min(850, score)),
      },
    });
  },
  
  devAdvanceYear: () => {
    const { gameState } = get();
    if (!gameState) return;
    
    for (let i = 0; i < 12; i++) {
      get().advanceMonth();
    }
  },
  
  devForceEvent: (eventId) => {
    const { gameState } = get();
    if (!gameState) return;
    
    const event = EVENTS.find((item) => item.id === eventId);
    
    if (event) {
      set({
        currentEvent: event,
        pendingEvents: [event],
        currentScreen: 'event',
      });
    }
  },
  
  devSetNetWorth: (amount) => {
    const { gameState } = get();
    if (!gameState) return;
    
    const currentNetWorth = calculateNetWorth(gameState);
    const diff = amount - currentNetWorth;
    
    set({
      gameState: {
        ...gameState,
        cash: gameState.cash + diff,
      },
    });
  },
  
  getNetWorth: () => {
    const { gameState } = get();
    if (!gameState) return 0;
    return calculateNetWorth(gameState);
  },
  
  getMonthlyIncome: () => {
    const { gameState } = get();
    if (!gameState) return 0;
    return calculateMonthlyIncome(gameState).total;
  },
  
  getMonthlyExpenses: () => {
    const { gameState } = get();
    if (!gameState) return 0;
    return calculateMonthlyExpenses(gameState).total;
  },
  
  getEmergencyFundMonths: () => {
    const { gameState } = get();
    if (!gameState) return 0;
    return getEmergencyFundMonths(gameState);
  },
}));
