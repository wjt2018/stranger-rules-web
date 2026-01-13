import React from 'react';
import { Package, MoreHorizontal } from 'lucide-react';

export const InventoryModule = () => {
  const slots = Array(20).fill(null);
  // Fill a few slots mock data
  slots[0] = { name: '生锈的小刀', count: 1 };
  slots[1] = { name: '绷带', count: 3 };
  slots[2] = { name: '旧照片', count: 1 };

  return (
    <div className="p-6 min-h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-2 shrink-0">
        <h2 className="text-xl font-mono uppercase flex items-center gap-2">
          <Package size={20} /> 背包存储
        </h2>
        <span className="text-xs text-gray-500">3/20 格</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-4 overflow-visible">
        {slots.map((item, idx) => (
          <div 
            key={idx} 
            className="aspect-square border border-white/20 bg-white/5 relative group hover:bg-white/10 hover:border-white transition-all cursor-pointer flex items-center justify-center"
          >
            <div className="absolute top-1 left-1 text-[8px] text-gray-600 font-mono">{idx + 1}</div>
            
            {item ? (
              <div className="text-center p-1 overflow-hidden">
                <div className="text-[10px] md:text-xs font-bold leading-tight line-clamp-2">{item.name}</div>
                {item.count > 1 && (
                  <div className="absolute bottom-1 right-1 text-[8px] md:text-[10px] bg-white text-black px-1 font-mono">
                    x{item.count}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/5 group-hover:bg-white/10"></div>
            )}
            
            {item && (
              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                <MoreHorizontal size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-4 text-xs text-gray-500 font-mono text-center shrink-0 border-t border-white/5">
        拖拽整理。点击查看详情。
      </div>
    </div>
  );
};