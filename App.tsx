import React, { useState, useEffect } from 'react';
import { Terminal } from './components/Terminal';
import { ModuleContainer } from './components/ModuleContainer';
import { IntroScene } from './components/IntroScene';
import { CharacterSheet } from './components/modules/CharacterSheet';
import { QuestBoard } from './components/modules/QuestBoard';
import { RulesModule } from './components/modules/RulesModule';
import { ShopModule } from './components/modules/ShopModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { SocialLink } from './components/modules/SocialLink';
import { SettingsModule } from './components/modules/SettingsModule';
import { ModuleType } from './types';
import { User, Map, AlertOctagon, ShoppingCart, Package, PlayCircle, Users, Settings } from 'lucide-react';

export interface InventoryItem {
  name: string;
  count: number;
  description: string;
}

import { getConfig, saveConfig } from './services/db';

const App = () => {
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  
  // Shared game state
  const [hp, setHp] = useState(100);
  const [san, setSan] = useState(80);
  const [credits, setCredits] = useState(1250);
  const [location, setLocation] = useState('Safehouse');
  
  const [gameTime, setGameTime] = useState({
    day: 1,
    hour: 23,
    minute: 45
  });

  const [questLog, setQuestLog] = useState({
    main_mission: "替宿主完成最后的执念，开启回归之门。",
    daily_mission: "【暴食】今日任务结算中...",
    active_rules: ["禁止直视月亮", "听到敲门声必须在3秒内回应"]
  });

  const [npcStatus, setNpcStatus] = useState<any[]>([
    { name: '神秘商人', affinity: 0, last_seen_turns: 99 }
  ]);
  
  const [shopInventory, setShopInventory] = useState<any[]>([
    { name: '面包', price: 50 },
    { name: '纯净水', price: 100 }
  ]);

  const [inventorySlots, setInventorySlots] = useState<(InventoryItem | null)[]>(() => {
    const initialSlots = Array(20).fill(null);
    initialSlots[0] = { name: '生锈的小刀', count: 1, description: '虽然已经锈迹斑斑，但在绝境中依然是可靠的防身工具。' };
    initialSlots[1] = { name: '绷带', count: 3, description: '基础医疗物资，能够止血并防止伤口感染。' };
    initialSlots[2] = { name: '旧照片', count: 1, description: '一张边缘泛黄的照片，背面写着模糊的地址。看着它能让你感到一丝人性。' };
    return initialSlots;
  });

  // LLM Configuration state
  const [llmConfig, setLlmConfig] = useState({
    model: 'gemini-2.5-pro',
    temperature: 0.8,
    endpoint: '',
    apiKey: '',
  });

  // Load config from IndexedDB on mount
  useEffect(() => {
    const loadSettings = async () => {
      const savedConfig = await getConfig();
      if (savedConfig) {
        // Sanitize: If saved config matches invisible env vars, clear it from UI state
        // This prevents old persisted values from showing up after we decided to hide them
        const sanitizedConfig = { ...savedConfig };
        
        if (process.env.GEMINI_API_ENDPOINT && savedConfig.endpoint === process.env.GEMINI_API_ENDPOINT) {
          sanitizedConfig.endpoint = '';
        }
        
        // Also check if matches standard default, just in case
        if (savedConfig.endpoint === 'https://generativelanguage.googleapis.com') {
           // Optional: keep it or clear it? Let's keep specific env var sanitization focus
        }

        if (process.env.GEMINI_API_KEY && savedConfig.apiKey === process.env.GEMINI_API_KEY) {
          sanitizedConfig.apiKey = '';
        }
        
        setLlmConfig(sanitizedConfig);
      }
    };
    loadSettings();
  }, []);

  // Save config to IndexedDB whenever it changes
  useEffect(() => {
    if (llmConfig.apiKey) { // Only save if there's meaningful data (optional check)
      const timer = setTimeout(() => {
        saveConfig(llmConfig);
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [llmConfig]);

  const toggleModule = (type: ModuleType) => {
    setActiveModule(activeModule === type ? null : type);
  };

  // Derived GameState object for AI injection
  const gameState = {
    player: { hp, san, credits, location },
    time: gameTime,
    inventory: inventorySlots.filter(Boolean) as InventoryItem[],
    quest_log: questLog,
    npc_status: npcStatus,
    shop_inventory: shopInventory
  };

  // State Update Handler for AI Response
  const handleStateUpdate = (diff: any) => {
    if (!diff) return;

    // 1. Player Vitals
    if (diff.player_diff) {
      if (diff.player_diff.hp) setHp(prev => Math.min(100, Math.max(0, prev + diff.player_diff.hp)));
      if (diff.player_diff.san) setSan(prev => Math.min(100, Math.max(0, prev + diff.player_diff.san)));
      if (diff.player_diff.credits) setCredits(prev => Math.max(0, prev + diff.player_diff.credits));
    }

    // 2. Time Logic
    if (diff.time_passed) {
      setGameTime(prev => {
        let { day, hour, minute } = prev;
        minute += diff.time_passed;
        while (minute >= 60) { minute -= 60; hour += 1; }
        while (hour >= 24) { hour -= 24; day += 1; }
        return { day, hour, minute };
      });
    }

    // 3. Inventory (Simplified Add/Remove Logic)
    if (diff.inventory_diff) {
        if (diff.inventory_diff.add) {
          setInventorySlots(prev => {
            const next = [...prev];
            diff.inventory_diff.add.forEach((newItem: any) => {
              const existingIdx = next.findIndex(s => s?.name === newItem.name);
              if (existingIdx !== -1) {
                next[existingIdx]!.count += newItem.count;
              } else {
                const emptyIdx = next.findIndex(s => s === null);
                if (emptyIdx !== -1) {
                  next[emptyIdx] = { 
                    name: newItem.name, 
                    count: newItem.count, 
                    description: newItem.desc || '未知物品' 
                  };
                }
              }
            });
            return next;
          });
        }
    }
  };

  const handlePurchase = (itemName: string, price: number, description: string) => {
    if (credits < price) {
      return { success: false, message: '信用点不足' };
    }

    const nextSlots = [...inventorySlots];
    const existingIndex = nextSlots.findIndex(s => s?.name === itemName);

    if (existingIndex !== -1 && nextSlots[existingIndex]) {
      nextSlots[existingIndex] = { 
        ...nextSlots[existingIndex]!, 
        count: nextSlots[existingIndex]!.count + 1 
      };
    } else {
      const emptyIndex = nextSlots.findIndex(s => s === null);
      if (emptyIndex === -1) {
        return { success: false, message: '背包已满' };
      }
      nextSlots[emptyIndex] = { name: itemName, count: 1, description: description };
    }

    setCredits(prev => prev - price);
    setInventorySlots(nextSlots);
    return { success: true, message: '购买成功' };
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case ModuleType.CHARACTER: return <CharacterSheet credits={credits} />;
      case ModuleType.QUESTS: return <QuestBoard />;
      case ModuleType.RULES: return <RulesModule />;
      case ModuleType.SHOP: return <ShopModule credits={credits} onPurchase={handlePurchase} />;
      case ModuleType.INVENTORY: return <InventoryModule slots={inventorySlots} setSlots={setInventorySlots} />;
      case ModuleType.SOCIAL_LINK: return <SocialLink />;
      case ModuleType.SETTINGS: return <SettingsModule llmConfig={llmConfig} onConfigChange={setLlmConfig} />;
      default: return null;
    }
  };

  const handleIntroComplete = (data: any) => {
    setShowIntro(false);
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col relative scanlines">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black z-0"></div>

      {/* Intro Scene Overlay */}
      {showIntro && (
        <IntroScene 
          onComplete={handleIntroComplete} 
          onClose={() => setShowIntro(false)} 
        />
      )}

      {/* Main Content Area (Terminal) */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        <Terminal 
          active={true} 
          llmConfig={llmConfig} 
          gameState={gameState}
          onStateUpdate={handleStateUpdate}
        />
        
        {/* Module Overlay */}
        {activeModule && (
          <ModuleContainer type={activeModule} onClose={() => setActiveModule(null)}>
            {renderModuleContent()}
          </ModuleContainer>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="h-16 md:h-20 bg-black border-t border-white/20 z-50 flex items-center justify-around md:justify-center md:gap-6 lg:gap-8 px-2">
        <NavButton 
          icon={<User size={18} />} 
          label="档案" 
          active={activeModule === ModuleType.CHARACTER} 
          onClick={() => toggleModule(ModuleType.CHARACTER)} 
        />
        <NavButton 
          icon={<Users size={18} />} 
          label="羁绊" 
          active={activeModule === ModuleType.SOCIAL_LINK} 
          onClick={() => toggleModule(ModuleType.SOCIAL_LINK)} 
        />
        <NavButton 
          icon={<Map size={18} />} 
          label="任务" 
          active={activeModule === ModuleType.QUESTS} 
          onClick={() => toggleModule(ModuleType.QUESTS)} 
        />
        <NavButton 
          icon={<AlertOctagon size={18} />} 
          label="规则" 
          active={activeModule === ModuleType.RULES} 
          onClick={() => toggleModule(ModuleType.RULES)} 
          danger
        />
        <NavButton 
          icon={<Package size={18} />} 
          label="物品" 
          active={activeModule === ModuleType.INVENTORY} 
          onClick={() => toggleModule(ModuleType.INVENTORY)} 
        />
        <NavButton 
          icon={<ShoppingCart size={18} />} 
          label="商店" 
          active={activeModule === ModuleType.SHOP} 
          onClick={() => toggleModule(ModuleType.SHOP)} 
        />
        <NavButton 
          icon={<Settings size={18} />} 
          label="设置" 
          active={activeModule === ModuleType.SETTINGS} 
          onClick={() => toggleModule(ModuleType.SETTINGS)} 
        />
        
        {/* Debug/Intro Trigger */}
        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden lg:block"></div>
        <button
          onClick={() => setShowIntro(true)}
          className="flex flex-col items-center justify-center gap-1 p-2 md:p-3 rounded-sm text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-cyan-500/20"
          title="预览开局引导"
        >
          <PlayCircle size={18} />
          <span className="text-[9px] font-mono tracking-widest hidden md:block uppercase font-bold">Intro</span>
        </button>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center gap-1 p-2 md:p-3 rounded-sm transition-all duration-300 relative group
      ${active 
        ? 'bg-white text-black translate-y-[-4px] shadow-[0_4px_0_rgba(255,255,255,0.5)]' 
        : 'text-gray-400 hover:text-white hover:bg-white/10'
      }
      ${danger && !active ? 'text-red-900 hover:text-red-500 hover:bg-red-900/10' : ''}
    `}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="text-[9px] font-mono tracking-widest hidden md:block uppercase font-bold">{label}</span>
    {active && <div className="md:hidden w-1 h-1 bg-black rounded-full absolute bottom-1"></div>}
  </button>
);

export default App;