import { openDB, type IDBPDatabase } from 'idb';
import type { GameState, SaveGame } from '../game/models/types';
import { GAME_VERSION } from '../game/balance/constants';

const DB_NAME = 'broke-game';
const DB_VERSION = 1;
const SAVES_STORE = 'saves';
const SETTINGS_STORE = 'settings';

let db: IDBPDatabase | null = null;

export async function initDB(): Promise<IDBPDatabase> {
  if (db) return db;
  
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(SAVES_STORE)) {
        const savesStore = database.createObjectStore(SAVES_STORE, { keyPath: 'id' });
        savesStore.createIndex('savedAt', 'savedAt');
      }
      
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    },
  });
  
  return db;
}

export async function saveGame(state: GameState): Promise<string> {
  const database = await initDB();
  
  const saveId = state.seed.toString();
  
  const saveGame: SaveGame = {
    id: saveId,
    name: state.name,
    state: state,
    savedAt: Date.now(),
    version: GAME_VERSION,
  };
  
  await database.put(SAVES_STORE, saveGame);
  
  return saveId;
}

export async function loadGame(saveId: string): Promise<GameState | null> {
  const database = await initDB();
  
  const save = await database.get(SAVES_STORE, saveId) as SaveGame | undefined;
  
  if (!save) return null;
  
  if (save.version !== GAME_VERSION) {
    const migrated = migrateState(save.state, save.version);
    if (migrated) {
      return migrated;
    }
    return null;
  }
  
  return save.state;
}

export async function getAllSaves(): Promise<SaveGame[]> {
  const database = await initDB();
  
  const saves = await database.getAll(SAVES_STORE) as SaveGame[];
  
  return saves.sort((a, b) => b.savedAt - a.savedAt);
}

export async function deleteSave(saveId: string): Promise<void> {
  const database = await initDB();
  await database.delete(SAVES_STORE, saveId);
}

export async function exportSave(saveId: string): Promise<string> {
  const database = await initDB();
  const save = await database.get(SAVES_STORE, saveId) as SaveGame | undefined;
  
  if (!save) throw new Error('Save not found');
  
  return JSON.stringify(save);
}

export async function importSave(jsonString: string): Promise<string> {
  const database = await initDB();
  
  let save: SaveGame;
  try {
    save = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid save file');
  }
  
  if (!save.id || !save.state || !save.version) {
    throw new Error('Invalid save format');
  }
  
  if (save.version !== GAME_VERSION) {
    const migrated = migrateState(save.state, save.version);
    if (migrated) {
      save.state = migrated;
      save.version = GAME_VERSION;
    } else {
      throw new Error('Incompatible save version');
    }
  }
  
  save.savedAt = Date.now();
  
  await database.put(SAVES_STORE, save);
  
  return save.id;
}

export async function getAutoSave(): Promise<SaveGame | null> {
  const database = await initDB();
  
  const setting = await database.get(SETTINGS_STORE, 'currentSaveId') as { key: string; value: string } | undefined;
  
  if (!setting) return null;
  
  const save = await database.get(SAVES_STORE, setting.value) as SaveGame | undefined;
  return save || null;
}

export async function setCurrentSave(saveId: string): Promise<void> {
  const database = await initDB();
  await database.put(SETTINGS_STORE, { key: 'currentSaveId', value: saveId });
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const database = await initDB();
  const setting = await database.get(SETTINGS_STORE, key) as { key: string; value: T } | undefined;
  return setting?.value ?? defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const database = await initDB();
  await database.put(SETTINGS_STORE, { key, value });
}

function migrateState(state: GameState, fromVersion: number): GameState | null {
  let migrated = { ...state };
  
  if (fromVersion < GAME_VERSION) {
    migrated.version = GAME_VERSION;
    
    if (!migrated.eventCooldowns) {
      migrated.eventCooldowns = {};
    }
    if (!migrated.newsHistory) {
      migrated.newsHistory = [];
    }
    if (!migrated.majorDecisions) {
      migrated.majorDecisions = [];
    }
    if (!migrated.netWorthHistory) {
      migrated.netWorthHistory = [];
    }
  }
  
  return migrated;
}

export function validateGameState(state: unknown): state is GameState {
  if (typeof state !== 'object' || state === null) return false;
  
  const s = state as Record<string, unknown>;
  
  if (typeof s.seed !== 'number') return false;
  if (typeof s.name !== 'string') return false;
  if (typeof s.age !== 'number') return false;
  if (typeof s.cash !== 'number') return false;
  if (typeof s.creditScore !== 'number') return false;
  
  return true;
}
