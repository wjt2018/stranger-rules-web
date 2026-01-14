export enum ModuleType {
  TERMINAL = 'TERMINAL',
  CHARACTER = 'CHARACTER',
  QUESTS = 'QUESTS',
  INVENTORY = 'INVENTORY',
  RULES = 'RULES',
  SHOP = 'SHOP',
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'narrator';
  text: string;
  timestamp: number;
}

export interface NPCRelationship {
  name: string;
  favorability: number; // 0-100
  status: string;
  lastInteractionTurn: number; // 内部逻辑使用，UI 不显示
}

export interface CharacterStats {
  hp: number;
  maxHp: number;
  sanity: number;
  maxSanity: number;
  credits: number;
  level: number;
  statusEffects: string[];
  relationships: NPCRelationship[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  difficulty: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface Rule {
  id: string;
  content: string;
  isCorrupted: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price?: number;
  icon?: string;
  quantity: number;
}