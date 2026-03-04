
export interface LLMConfig {
  model: string;
  temperature: number;
  endpoint: string;
  apiKey: string;
}

// 游戏状态快照（用于持久化）
export interface GameSaveData {
  hp: number;
  san: number;
  credits: number;
  currentStatus: string[];
  playerInfo: { name_now: string; identity: string; name_old: string };
  location: string;
  gameTime: { day: number; time: string };
  questLog: { main_quest: string; daily_quest: string };
  strangerRules: string[];
  npcStatus: { name: string; favorability: number; last_interaction: number }[];
  shopInventory: { name: string; price: number; desc: string }[];
  inventorySlots: (any | null)[];
}

// 聊天消息
export interface SavedMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

// 建议行动
export interface SavedActions {
  actions: any[];
}

const DB_NAME = 'stranger_rules_db';
const DB_VERSION = 2; // 升级版本以触发 onupgradeneeded

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // 原有 settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      // 新增 game_data store（存储游戏状态、消息等）
      if (!db.objectStoreNames.contains('game_data')) {
        db.createObjectStore('game_data');
      }
    };
  });
};

// ========== LLM Settings ==========

export const saveConfig = async (config: LLMConfig): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put(config, 'llm_config');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to save config to IDB:', error);
  }
};

export const getConfig = async (): Promise<LLMConfig | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('llm_config');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Failed to get config from IDB:', error);
    return null;
  }
};

// ========== 游戏状态存储 ==========

const putGameData = async (key: string, value: any): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('game_data', 'readwrite');
      const store = tx.objectStore('game_data');
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
};

const getGameData = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('game_data', 'readonly');
      const store = tx.objectStore('game_data');
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  } catch (error) {
    console.error(`Failed to get ${key}:`, error);
    return null;
  }
};

// 保存游戏状态
export const saveGameState = (state: GameSaveData) => putGameData('game_state', state);

// 读取游戏状态
export const getGameState = () => getGameData<GameSaveData>('game_state');

// 保存聊天消息
export const saveMessages = (msgs: SavedMessage[]) => putGameData('messages', msgs);

// 读取聊天消息
export const getMessages = () => getGameData<SavedMessage[]>('messages');

// 保存建议行动
export const saveSuggestedActions = (actions: any[]) => putGameData('suggested_actions', actions);

// 读取建议行动
export const getSuggestedActions = () => getGameData<any[]>('suggested_actions');

// 清除所有游戏数据（重新开始）
export const clearGameData = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('game_data', 'readwrite');
      const store = tx.objectStore('game_data');
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to clear game data:', error);
  }
};
