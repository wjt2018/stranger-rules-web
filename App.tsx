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

import { getConfig, saveConfig, saveGameState, getGameState, saveMessages, getMessages, GameSaveData, SavedMessage, saveSuggestedActions, getSuggestedActions } from './services/db';
import { sendMessageToGLM, GameState, StateUpdate } from './services/geminiService';

const App = () => {
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [showIntro, setShowIntro] = useState(true); // 默认显示，从 IndexedDB 恢复后关闭
  const [isLoaded, setIsLoaded] = useState(false); // 防止初始化闪烁
  
  // Shared game state
  const [hp, setHp] = useState(100);
  const [san, setSan] = useState(80);
  const [credits, setCredits] = useState(1250);
  const [currentStatus, setCurrentStatus] = useState<string[]>([]);
  const [playerInfo, setPlayerInfo] = useState<{ name_now: string; identity: string; name_old: string }>({
    name_now: '', identity: '', name_old: ''
  });
  const [location, setLocation] = useState('Safehouse');
  
  const [gameTime, setGameTime] = useState({
    day: 1,
    time: '06:00'
  });

  const [questLog, setQuestLog] = useState({
    main_quest: '',
    daily_quest: '',
  });
  const [strangerRules, setStrangerRules] = useState<string[]>([]);

  const [npcStatus, setNpcStatus] = useState<{ name: string; favorability: number; last_interaction: number }[]>([]);
  
  const [shopInventory, setShopInventory] = useState<{ name: string; price: number; desc: string }[]>([]);

  // 物品使用隐式提示：使用物品后暂存提示，下次发送请求时附加到用户输入末尾
  const [pendingItemHint, setPendingItemHint] = useState('');

  // IntroScene 完成后的表单数据，传给 Terminal 触发首轮 AI 调用
  const [introData, setIntroData] = useState<{ codeName: string; gender: string; anchor: string; extra: string } | null>(null);

  // 首轮 AI 请求状态：点击 RUNNN!!!! 后异步调用，完成后“接受协议”按钮可用
  const [isAIReady, setIsAIReady] = useState(false);
  const [firstAIResult, setFirstAIResult] = useState<{ text: string; stateUpdate?: StateUpdate; actions?: any[] } | null>(null);

  const [inventorySlots, setInventorySlots] = useState<(InventoryItem | null)[]>(() => {
    return Array(20).fill(null);
  });

  // 用于 Terminal 的消息和建议行动（提升到 App 层管理，便于持久化）
  const [savedMessages, setSavedMessages] = useState<SavedMessage[] | null>(null);
  const [savedActions, setSavedActions] = useState<any[] | null>(null);

  // LLM Configuration state
  const [llmConfig, setLlmConfig] = useState({
    model: 'GLM-4.7-Flash',
    temperature: 0.8,
    endpoint: '',
    apiKey: '',
  });

  // 从 IndexedDB 加载 LLM 配置和游戏数据
  useEffect(() => {
    const loadAll = async () => {
      // 1. 加载 LLM 配置
      const savedConfig = await getConfig();
      if (savedConfig) {
        const sanitizedConfig = { ...savedConfig };
        if (process.env.GEMINI_API_ENDPOINT && savedConfig.endpoint === process.env.GEMINI_API_ENDPOINT) {
          sanitizedConfig.endpoint = '';
        }
        if (process.env.GEMINI_API_KEY && savedConfig.apiKey === process.env.GEMINI_API_KEY) {
          sanitizedConfig.apiKey = '';
        }
        setLlmConfig(sanitizedConfig);
      }

      // 2. 加载游戏状态
      const state = await getGameState();
      if (state) {
        setHp(state.hp);
        setSan(state.san);
        setCredits(state.credits);
        setCurrentStatus(state.currentStatus);
        setPlayerInfo(state.playerInfo);
        setLocation(state.location);
        setGameTime(state.gameTime);
        setQuestLog(state.questLog);
        setStrangerRules(state.strangerRules);
        setNpcStatus(state.npcStatus);
        setShopInventory(state.shopInventory);
        setInventorySlots(state.inventorySlots);
      }

      // 3. 加载消息和建议行动
      const msgs = await getMessages();
      if (msgs && msgs.length > 0) {
        setSavedMessages(msgs);
        setShowIntro(false); // 有历史消息 → 非首次进入，跳过 IntroScene
      }
      const acts = await getSuggestedActions();
      if (acts) {
        setSavedActions(acts);
      }

      setIsLoaded(true);
    };
    loadAll();
  }, []);

  // 自动保存游戏状态到 IndexedDB（防抖 500ms）
  useEffect(() => {
    if (!isLoaded) return; // 未加载完毕不保存
    const timer = setTimeout(() => {
      saveGameState({
        hp, san, credits, currentStatus, playerInfo, location,
        gameTime, questLog, strangerRules, npcStatus, shopInventory, inventorySlots
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [hp, san, credits, currentStatus, playerInfo, location, gameTime, questLog, strangerRules, npcStatus, shopInventory, inventorySlots, isLoaded]);

  // 保存 LLM 配置
  useEffect(() => {
    if (llmConfig.apiKey) {
      const timer = setTimeout(() => {
        saveConfig(llmConfig);
      }, 500);
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

    // 1. Player Vitals（直接数值，非变化量）
    if (diff.player_status) {
      if (diff.player_status.hp != null) setHp(Math.min(100, Math.max(0, diff.player_status.hp)));
      if (diff.player_status.san != null) setSan(Math.min(100, Math.max(0, diff.player_status.san)));
      if (diff.player_status.credits != null) setCredits(Math.max(0, diff.player_status.credits));
      if (diff.player_status.current_status) setCurrentStatus(diff.player_status.current_status);
    }

    // 1.5 Player Info（仅首次写入，后续不变）
    if (diff.player_info && !playerInfo.name_now) {
      setPlayerInfo(prev => ({
        name_now: diff.player_info.name_now || prev.name_now,
        identity: diff.player_info.identity || prev.identity,
        name_old: diff.player_info.name_old || prev.name_old
      }));
    }

    // 2. Time（直接赋值当前时间）
    if (diff.time) {
      setGameTime(prev => ({
        day: diff.time.day ?? prev.day,
        time: diff.time.time ?? prev.time
      }));
    }

    // 3. Inventory (Simplified Add/Remove Logic)
    if (diff.inventory_status) {
        if (diff.inventory_status.add) {
          setInventorySlots(prev => {
            const next = [...prev];
            diff.inventory_status.add.forEach((newItem: any) => {
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

    // 4. NPC Status（AI 返回完整列表，直接替换）
    if (diff.npc_status) {
      setNpcStatus(diff.npc_status);
    }

    // 5. Quest Status
    if (diff.quest_status) {
      setQuestLog(prev => ({
        main_quest: diff.quest_status.main_quest ?? prev.main_quest,
        daily_quest: diff.quest_status.daily_quest ?? prev.daily_quest,
      }));
      if (diff.quest_status.stranger_rule) {
        const raw = diff.quest_status.stranger_rule;
        if (Array.isArray(raw)) {
          setStrangerRules(raw);
        } else if (typeof raw === 'string') {
          // 兼容字符串格式，按【】分割
          const parsed = (raw as string).match(/【[^】]+】/g) || [raw];
          setStrangerRules(parsed);
        }
      }
    }

    // 6. Shop Status（AI 返回完整列表，直接替换）
    if (diff.shop_status && Array.isArray(diff.shop_status)) {
      setShopInventory(diff.shop_status);
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
      case ModuleType.CHARACTER: return <CharacterSheet hp={hp} san={san} credits={credits} currentStatus={currentStatus} playerInfo={playerInfo} />;
      case ModuleType.QUESTS: return <QuestBoard mainQuest={questLog.main_quest} dailyQuest={questLog.daily_quest} />;
      case ModuleType.RULES: return <RulesModule rules={strangerRules} />;
      case ModuleType.SHOP: return <ShopModule credits={credits} shopItems={shopInventory} onPurchase={handlePurchase} />;
      case ModuleType.INVENTORY: return <InventoryModule slots={inventorySlots} setSlots={setInventorySlots} onUseItem={(name: string, desc: string) => setPendingItemHint(`[系统提示：玩家本轮使用了物品「${name}」（${desc}），请在叙事和状态更新中体现该物品的使用效果。]`)} />;
      case ModuleType.SOCIAL_LINK: return <SocialLink npcStatus={npcStatus} />;
      case ModuleType.SETTINGS: return <SettingsModule llmConfig={llmConfig} onConfigChange={setLlmConfig} />;
      default: return null;
    }
  };

  // 点击 RUNNN!!!! 时触发首轮 AI 请求（在 IntroScene 动画期间异步执行）
  const handleStartAI = async (data: any) => {
    setPlayerInfo((prev: any) => ({ ...prev, name_old: data.codeName || '' }));
    try {
      const firstMessage = `[游戏初始化] 玩家原名：${data.codeName}，性别：${data.gender}，世界背景：${data.anchor}${data.extra ? '，额外设定：' + data.extra : ''}。\n这是第一轮游戏开始，请生成完整的开场叙事，必须包含：1) 宿主的身份介绍；2) 当前世界观背景；3) 主线任务；4) 今日的每日任务；5) 规则怪谈的规则。同时返回完整的 state_update（包括 player_info、quest_status、shop_status 等所有字段）。`;
      const { text, stateUpdate } = await sendMessageToGLM([], firstMessage, llmConfig, gameState);
      setFirstAIResult({ text, stateUpdate, actions: stateUpdate?.suggested_actions });
      if (stateUpdate) {
        handleStateUpdate(stateUpdate);
      }
      setIsAIReady(true);
    } catch (e: any) {
      console.error('First AI call failed:', e?.message || e);
      // 即使失败也允许进入，避免卡死
      setFirstAIResult({ text: `系统初始化异常: ${e?.message || '未知错误'}，请在主界面重新尝试。` });
      setIsAIReady(true);
    }
  };

  // 点击“接受协议”时：关闭 IntroScene，将首轮 AI 结果注入 Terminal
  const handleIntroComplete = (data: any) => {
    setIntroData(data); // 传给 Terminal 注入首轮 AI 回复
    setShowIntro(false);
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col relative scanlines">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black z-0"></div>

      {/* Top Banner - 显示游戏时间 */}
      <div className="h-10 bg-black border-b border-white/10 z-50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-mono">SYSTEM_ACTIVE</span>
        </div>
        <span className="text-sm font-mono font-bold tracking-wider text-white">
          第{gameTime.day}天 <span className="text-gray-400">{gameTime.time}</span>
        </span>
      </div>

      {/* Intro Scene Overlay */}
      {showIntro && (
        <IntroScene 
          onComplete={handleIntroComplete} 
          onClose={() => setShowIntro(false)}
          onStartAI={handleStartAI}
          isAIReady={isAIReady}
        />
      )}

      {/* Main Content Area (Terminal) */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {isLoaded && (
        <Terminal 
          active={true} 
          llmConfig={llmConfig} 
          gameState={gameState}
          onStateUpdate={handleStateUpdate}
          pendingItemHint={pendingItemHint}
          onClearItemHint={() => setPendingItemHint('')}
          introData={introData}
          onIntroDone={() => setIntroData(null)}
          firstAIResult={firstAIResult}
          initialMessages={savedMessages}
          initialActions={savedActions}
          onMessagesChange={(msgs: SavedMessage[]) => { setSavedMessages(msgs); saveMessages(msgs); }}
          onActionsChange={(acts: any[]) => { setSavedActions(acts); saveSuggestedActions(acts); }}
        />
        )}
        
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