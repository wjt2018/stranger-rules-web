import React, { useState } from 'react';
import { Package, X, Zap, Info } from 'lucide-react';
import { InventoryItem } from '../../App';

interface InventoryModuleProps {
  slots: (InventoryItem | null)[];
  setSlots: React.Dispatch<React.SetStateAction<(InventoryItem | null)[]>>;
  onUseItem?: (name: string, desc: string) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ slots, setSlots, onUseItem }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const selectedItem = selectedIdx !== null ? slots[selectedIdx] : null;

  const handleUseItem = () => {
    if (selectedIdx === null || !selectedItem) return;

    let updatedSlots = [...slots];
    if (selectedItem.count > 1) {
      updatedSlots[selectedIdx] = { ...selectedItem, count: selectedItem.count - 1 };
    } else {
      // 物品耗尽，移除该格
      updatedSlots[selectedIdx] = null;
      
      // 自动补齐逻辑：提取所有非空物品，重新排列并填充剩余格子
      const activeItems = updatedSlots.filter(s => s !== null);
      const padding = Array(20 - activeItems.length).fill(null);
      updatedSlots = [...activeItems, ...padding];
    }
    
    setSlots(updatedSlots);
    // 通知 App 物品已使用，生成隐式提示
    onUseItem?.(selectedItem.name, selectedItem.description || '未知物品');
    setSelectedIdx(null); // 关闭详情弹窗
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-2 shrink-0">
        <h2 className="text-xl font-mono uppercase flex items-center gap-2">
          <Package size={20} /> 背包存储
        </h2>
        <span className="text-xs text-gray-500 font-mono">
          {slots.filter(s => s !== null).length} / 20 格
        </span>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 md:gap-4 overflow-y-auto pr-1">
        {slots.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => item && setSelectedIdx(idx)}
            className={`aspect-square border relative group transition-all cursor-pointer flex items-center justify-center
              ${item ? 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]' : 'border-white/5 bg-transparent opacity-30 cursor-default'}`}
          >
            <div className="absolute top-1 left-1 text-[8px] text-gray-600 font-mono">{idx + 1}</div>
            
            {item ? (
              <div className="text-center p-2 overflow-hidden flex flex-col items-center justify-center gap-1">
                <div className="text-[9px] md:text-[11px] font-bold leading-tight line-clamp-2 uppercase tracking-tighter">
                  {item.name}
                </div>
                {item.count > 1 && (
                  <div className="absolute bottom-1 right-1 text-[8px] md:text-[9px] bg-white text-black px-1 font-mono font-bold">
                    x{item.count}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
            )}

            {/* Hover indication for existing items */}
            {item && (
              <div className="absolute inset-0 border border-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>

      {/* Item Details Overlay (Modal style) */}
      {selectedIdx !== null && selectedItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-sm bg-black border-2 border-white p-6 shadow-[0_0_40px_rgba(0,0,0,1)] relative overflow-hidden">
             {/* Decorative Background Icon */}
             <Package className="absolute -bottom-8 -right-8 text-white/5 w-32 h-32 rotate-12" />
             
             <div className="flex justify-between items-start mb-6 border-b border-white/20 pb-4 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-1">Item_Detail</span>
                  <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:animate-pulse">
                    {selectedItem.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedIdx(null)}
                  className="p-1 hover:bg-white hover:text-black transition-colors"
                >
                  <X size={20} />
                </button>
             </div>

             <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-3">
                   <Info size={16} className="text-gray-500 shrink-0 mt-1" />
                   <p className="text-sm text-gray-300 font-serif leading-relaxed italic">
                     "{selectedItem.description || '一件未被标记的遗物，静静地躺在废土的角落。'}"
                   </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-3 flex justify-between items-center">
                  <span className="text-[10px] uppercase text-gray-500 tracking-widest font-mono">持有数量</span>
                  <span className="text-lg font-bold font-mono">x {selectedItem.count}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={handleUseItem}
                    className="flex items-center justify-center gap-2 py-3 bg-white text-black font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all group"
                  >
                    <Zap size={16} className="group-hover:animate-bounce" />
                    使用
                  </button>
                  <button 
                    onClick={() => setSelectedIdx(null)}
                    className="py-3 border border-white/20 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
                  >
                    关闭
                  </button>
                </div>
             </div>

             {/* Corner decor */}
             <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 pointer-events-none"></div>
           </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-6 pt-4 border-t border-dashed border-white/10 flex justify-between items-center text-[10px] text-gray-600 font-mono uppercase tracking-widest shrink-0">
        <span>STORAGE_ACCESS: OK</span>
        <span>LOAD_FACTOR: {(slots.filter(s => s !== null).length / 20 * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
