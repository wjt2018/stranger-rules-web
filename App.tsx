import React, { useState } from 'react';
import { Terminal } from './components/Terminal';
import { ModuleContainer } from './components/ModuleContainer';
import { IntroScene } from './components/IntroScene';
import { CharacterSheet } from './components/modules/CharacterSheet';
import { QuestBoard } from './components/modules/QuestBoard';
import { RulesModule } from './components/modules/RulesModule';
import { ShopModule } from './components/modules/ShopModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { ModuleType } from './types';
import { User, Map, AlertOctagon, ShoppingCart, Package, PlayCircle } from 'lucide-react';

export interface InventoryItem {
  name: string;
  count: number;
  description: string;
}

const App = () => {
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  
  // Lifted state for shared data
  const [credits, setCredits] = useState(1250);
  const [inventorySlots, setInventorySlots] = useState<(InventoryItem | null)[]>(() => {
    const initialSlots = Array(20).fill(null);
    initialSlots[0] = { name: '生锈的小刀', count: 1, description: '虽然已经锈迹斑斑，但在绝境中依然是可靠的防身工具。' };
    initialSlots[1] = { name: '绷带', count: 3, description: '基础医疗物资，能够止血并防止伤口感染。' };
    initialSlots[2] = { name: '旧照片', count: 1, description: '一张边缘泛黄的照片，背面写着模糊的地址。看着它能让你感到一丝人性。' };
    return initialSlots;
  });

  const toggleModule = (type: ModuleType) => {
    setActiveModule(activeModule === type ? null : type);
  };

  const handlePurchase = (itemName: string, price: number, description: string) => {
    if (credits < price) {
      return { success: false, message: '信用点不足' };
    }

    const nextSlots = [...inventorySlots];
    const existingIndex = nextSlots.findIndex(s => s?.name === itemName);

    if (existingIndex !== -1 && nextSlots[existingIndex]) {
      // Stack item
      nextSlots[existingIndex] = { 
        ...nextSlots[existingIndex]!, 
        count: nextSlots[existingIndex]!.count + 1 
      };
    } else {
      // Find empty slot
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
      default: return null;
    }
  };

  const handleIntroComplete = (data: any) => {
    console.log("玩家初始设定:", data);
    setShowIntro(false);
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col relative scanlines">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black z-0"></div>

      {/* 开局引导页覆盖层 */}
      {showIntro && (
        <IntroScene 
          onComplete={handleIntroComplete} 
          onClose={() => setShowIntro(false)} 
        />
      )}

      {/* Main Content Area (Terminal) */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        <Terminal active={true} />
        
        {/* Module Overlay */}
        {activeModule && (
          <ModuleContainer type={activeModule} onClose={() => setActiveModule(null)}>
            {renderModuleContent()}
          </ModuleContainer>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="h-16 md:h-20 bg-black border-t border-white/20 z-50 flex items-center justify-around md:justify-center md:gap-8 px-2">
        <NavButton 
          icon={<User size={20} />} 
          label="状态" 
          active={activeModule === ModuleType.CHARACTER} 
          onClick={() => toggleModule(ModuleType.CHARACTER)} 
        />
        <NavButton 
          icon={<Map size={20} />} 
          label="任务" 
          active={activeModule === ModuleType.QUESTS} 
          onClick={() => toggleModule(ModuleType.QUESTS)} 
        />
        <NavButton 
          icon={<AlertOctagon size={20} />} 
          label="规则" 
          active={activeModule === ModuleType.RULES} 
          onClick={() => toggleModule(ModuleType.RULES)} 
          danger
        />
        <NavButton 
          icon={<Package size={20} />} 
          label="物品" 
          active={activeModule === ModuleType.INVENTORY} 
          onClick={() => toggleModule(ModuleType.INVENTORY)} 
        />
        <NavButton 
          icon={<ShoppingCart size={20} />} 
          label="商店" 
          active={activeModule === ModuleType.SHOP} 
          onClick={() => toggleModule(ModuleType.SHOP)} 
        />
        
        {/* 调试用引导按钮 */}
        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden md:block"></div>
        <button
          onClick={() => setShowIntro(true)}
          className="flex flex-col items-center justify-center gap-1 p-2 md:p-3 rounded-sm text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-cyan-500/20"
          title="预览开局引导"
        >
          <PlayCircle size={20} />
          <span className="text-[10px] font-mono tracking-widest hidden md:block">引导预览</span>
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
    <span className="text-[10px] font-mono tracking-widest hidden md:block">{label}</span>
    {active && <div className="md:hidden w-1 h-1 bg-black rounded-full absolute bottom-1"></div>}
  </button>
);

export default App;
