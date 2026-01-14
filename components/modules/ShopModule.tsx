import React, { useState } from 'react';
import { ShoppingBag, CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Item } from '../../types';

interface ShopModuleProps {
  credits: number;
  onPurchase: (itemName: string, price: number, description: string) => { success: boolean; message: string };
}

export const ShopModule: React.FC<ShopModuleProps> = ({ credits, onPurchase }) => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: "罐装纯净水", description: "来自战前的无辐射水源。饮用可恢复少量生理完整度。", price: 50, quantity: 10 },
    { id: '2', name: "军用口粮 (C-Type)", description: "难吃，但能补充大量卡路里。有效缓解饥饿状态。", price: 120, quantity: 5 },
    { id: '3', name: "盖革计数器电池", description: "没有它，你就是瞎子。用于维持盖革计数器的运作。", price: 300, quantity: 2 },
  ]);

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleBuy = (item: Item) => {
    if (item.quantity <= 0) return;

    const result = onPurchase(item.name, item.price || 0, item.description);
    
    if (result.success) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
      setMessage({ text: result.message, type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-0 h-full flex flex-col bg-gray-900 text-white animate-in zoom-in-95 duration-300">
      <div className="bg-white text-black p-4 flex justify-between items-center shrink-0">
        <h2 className="font-black text-2xl uppercase italic tracking-tighter">自动贩卖机 3000</h2>
        <div className="flex items-center gap-2 font-mono font-bold">
           <CreditCard size={16} /> {credits.toLocaleString()} 信用点
        </div>
      </div>

      {/* Notification Toast Area */}
      {message && (
        <div className={`p-2 flex items-center justify-center gap-2 text-sm font-bold animate-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
          {message.text}
        </div>
      )}

      <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className={`bg-black border p-4 relative group transition-colors flex flex-col ${
            item.quantity > 0 ? 'border-white/20 hover:border-white' : 'border-white/5 opacity-50'
          }`}>
            <div className="absolute top-2 right-2 text-xs font-mono text-gray-500">库存: {item.quantity}</div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{item.name}</h3>
            <p className="text-xs text-gray-400 mb-4 h-8">{item.description}</p>
            
            <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-3">
              <span className="font-mono text-lg">{item.price} 信用点</span>
              <button 
                onClick={() => handleBuy(item)}
                disabled={item.quantity <= 0}
                className="bg-white text-black px-4 py-1 text-xs font-bold uppercase hover:bg-cyan-400 hover:text-white transition-colors disabled:opacity-30"
              >
                {item.quantity > 0 ? '购买' : '缺货'}
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
