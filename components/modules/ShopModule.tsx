import React from 'react';
import { ShoppingBag, CreditCard, Lock } from 'lucide-react';
import { Item } from '../../types';

export const ShopModule = () => {
  const items: Item[] = [
    { id: '1', name: "罐装纯净水", description: "来自战前的无辐射水源。", price: 50, quantity: 10 },
    { id: '2', name: "军用口粮 (C-Type)", description: "难吃，但能补充大量卡路里。", price: 120, quantity: 5 },
    { id: '3', name: "盖革计数器电池", description: "没有它，你就是瞎子。", price: 300, quantity: 2 },
  ];

  return (
    <div className="p-0 h-full flex flex-col bg-gray-900 text-white animate-in zoom-in-95 duration-300">
      <div className="bg-white text-black p-4 flex justify-between items-center">
        <h2 className="font-black text-2xl uppercase italic tracking-tighter">自动贩卖机 3000</h2>
        <div className="flex items-center gap-2 font-mono font-bold">
           <CreditCard size={16} /> 1,250 信用点
        </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="bg-black border border-white/20 p-4 relative group hover:border-white transition-colors">
            <div className="absolute top-2 right-2 text-xs font-mono text-gray-500">#{item.id.padStart(3, '0')}</div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{item.name}</h3>
            <p className="text-xs text-gray-400 mb-4 h-8">{item.description}</p>
            
            <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-3">
              <span className="font-mono text-lg">{item.price} 信用点</span>
              <button className="bg-white text-black px-4 py-1 text-xs font-bold uppercase hover:bg-cyan-400 hover:text-white transition-colors">
                购买
              </button>
            </div>
          </div>
        ))}
        
        {/* Locked Slots */}
        {[1, 2, 3].map((i) => (
           <div key={`lock-${i}`} className="bg-black/50 border border-white/5 p-4 flex flex-col items-center justify-center opacity-50">
             <Lock className="mb-2 text-gray-600" />
             <span className="text-xs text-gray-600 font-mono uppercase">缺货</span>
           </div>
        ))}
      </div>
    </div>
  );
};