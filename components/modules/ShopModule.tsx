import React, { useState } from 'react';
import { ShoppingBag, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface ShopItem {
  name: string;
  price: number;
  desc: string;
}

interface ShopModuleProps {
  credits: number;
  shopItems: ShopItem[];
  onPurchase: (itemName: string, price: number, description: string) => { success: boolean; message: string };
}

export const ShopModule: React.FC<ShopModuleProps> = ({ credits, shopItems, onPurchase }) => {
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleBuy = (item: ShopItem) => {
    const result = onPurchase(item.name, item.price, item.desc);
    setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-0 h-full flex flex-col bg-gray-900 text-white animate-in zoom-in-95 duration-300">
      <div className="bg-white text-black p-4 flex justify-between items-center shrink-0">
        <h2 className="font-black text-2xl uppercase italic tracking-tighter">补给商店</h2>
        <div className="flex items-center gap-2 font-mono font-bold">
           <CreditCard size={16} /> {credits.toLocaleString()} 信用点
        </div>
      </div>

      {/* 通知 */}
      {message && (
        <div className={`p-2 flex items-center justify-center gap-2 text-sm font-bold animate-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
          {message.text}
        </div>
      )}

      <div className="flex-1 p-6 overflow-y-auto">
        {shopItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shopItems.map((item, idx) => (
              <div key={idx} className="bg-black border border-white/20 p-4 relative group transition-colors flex flex-col hover:border-white">
                <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{item.desc}</p>
                
                <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-3">
                  <span className="font-mono text-lg">{item.price} 信用点</span>
                  <button 
                    onClick={() => handleBuy(item)}
                    disabled={credits < item.price}
                    className="bg-white text-black px-4 py-1 text-xs font-bold uppercase hover:bg-cyan-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {credits >= item.price ? '购买' : '余额不足'}
                  </button>
                </div>

                {/* 右上角装饰 */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-l-[20px] border-t-white/10 border-l-transparent group-hover:border-t-white/30 transition-colors"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-600">
            <ShoppingBag size={48} className="opacity-30" />
            <p className="text-sm italic tracking-widest uppercase">商店暂无商品</p>
            <p className="text-xs text-gray-700">随着剧情推进，新商品将会上架</p>
          </div>
        )}
      </div>
    </div>
  );
};
