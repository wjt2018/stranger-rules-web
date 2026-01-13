import React from 'react';
import { AlertTriangle, EyeOff } from 'lucide-react';
import { Rule } from '../../types';

export const RulesModule = () => {
  const rules: Rule[] = [
    { id: '1', content: "午夜十二点后，禁止回应任何敲门声，无论听起来多像你认识的人。", isCorrupted: false },
    { id: '2', content: "如果看见红色的月亮，立即闭上双眼，数到一百。", isCorrupted: false },
    { id: '3', content: "不要相信穿黄色雨衣的女孩。不要相信穿黄色雨衣的女孩。不要相信穿黄色雨衣的女孩。", isCorrupted: true },
    { id: '4', content: "电梯只能去双数楼层。如果你按了单数，立刻出电梯，不要回头。", isCorrupted: false },
    { id: '5', content: "此处文字已无法辨认...", isCorrupted: true },
  ];

  return (
    <div className="p-6 h-full flex flex-col relative overflow-hidden bg-black animate-in zoom-in-95 duration-500">
       {/* Background Noise Texture */}
       <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>

       <div className="flex items-center gap-3 mb-8 text-red-600 z-10">
         <AlertTriangle className="animate-pulse" />
         <h2 className="text-3xl pixel-font tracking-[0.2em] uppercase">生存协议</h2>
       </div>

       <div className="space-y-6 z-10 overflow-y-auto">
         {rules.map((rule, idx) => (
           <div 
            key={rule.id} 
            className={`p-4 border-l-2 relative overflow-hidden transition-all duration-500 hover:pl-6
              ${rule.isCorrupted 
                ? 'border-red-600 bg-red-900/5 text-red-400 font-serif italic' 
                : 'border-white/40 text-gray-300 font-mono'
              }`}
           >
             <div className="absolute -right-4 -top-4 text-[60px] font-bold opacity-5 select-none font-serif text-white">
               {idx + 1}
             </div>
             
             <div className={`${rule.isCorrupted ? 'blur-[0.5px] hover:blur-none' : ''}`}>
                {rule.isCorrupted && <EyeOff size={16} className="mb-2 opacity-50" />}
                <p className="text-lg leading-relaxed">
                  {rule.content}
                </p>
             </div>

             {rule.isCorrupted && (
               <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none animate-flicker"></div>
             )}
           </div>
         ))}
       </div>

       <div className="mt-auto pt-6 text-center text-xs text-red-900/60 uppercase tracking-[0.5em] animate-pulse">
         遵守。生存。铭记。
       </div>
    </div>
  );
};