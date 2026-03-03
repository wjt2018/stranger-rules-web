import React from 'react';
import { AlertTriangle, Skull } from 'lucide-react';

interface RulesModuleProps {
  rules: string[];
}

export const RulesModule: React.FC<RulesModuleProps> = ({ rules }) => {
  return (
    <div className="p-6 h-full flex flex-col relative overflow-hidden bg-black animate-in zoom-in-95 duration-500">
       {/* 背景噪点纹理 */}
       <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>

       <div className="flex items-center gap-3 mb-8 text-red-600 z-10">
         <AlertTriangle className="animate-pulse" />
         <h2 className="text-3xl pixel-font tracking-[0.2em] uppercase">生存协议</h2>
       </div>

       <div className="space-y-4 z-10 overflow-y-auto">
         {rules.length > 0 ? (
           rules.map((rule, idx) => (
             <div
               key={idx}
               className="p-4 border-l-2 border-red-600/60 relative overflow-hidden transition-all duration-500 hover:pl-6 hover:border-red-400 bg-red-950/5 group"
             >
               {/* 右上角序号装饰 */}
               <div className="absolute -right-2 -top-2 text-[50px] font-bold opacity-[0.04] select-none font-serif text-red-500">
                 {idx + 1}
               </div>

               <div className="flex items-start gap-3">
                 <Skull size={16} className="text-red-500/60 mt-1 shrink-0 group-hover:text-red-400 transition-colors" />
                 <p className="text-base text-red-100/80 font-mono leading-relaxed group-hover:text-red-100 transition-colors">
                   {rule}
                 </p>
               </div>

               {/* 底部闪烁效果 */}
               <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
             </div>
           ))
         ) : (
           <div className="py-16 text-center border border-dashed border-red-900/30 flex flex-col items-center gap-4">
             <AlertTriangle size={36} className="text-red-900/30" />
             <p className="text-xs text-red-900/50 italic tracking-[0.2em] uppercase">
               尚未发现规则... 保持警惕。
             </p>
           </div>
         )}
       </div>

       <div className="mt-auto pt-6 text-center text-xs text-red-900/60 uppercase tracking-[0.5em] animate-pulse">
         遵守。生存。铭记。
       </div>
    </div>
  );
};