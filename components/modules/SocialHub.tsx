import React from 'react';
import { Radio, Signal, SignalHigh, SignalLow } from 'lucide-react';

export const SocialHub = () => {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col animate-in slide-in-from-left-4 duration-500">
       <div className="border-b border-white/20 pb-4 mb-4 flex justify-between items-center">
         <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
           <Radio size={20} /> 频率扫描仪
         </h2>
         <div className="flex gap-1">
           <div className="w-1 h-4 bg-white animate-pulse"></div>
           <div className="w-1 h-3 bg-white/70 animate-pulse delay-75"></div>
           <div className="w-1 h-5 bg-white/40 animate-pulse delay-150"></div>
         </div>
       </div>

       <div className="flex-1 flex items-center justify-center border border-dashed border-white/20 bg-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
          
          <div className="text-center space-y-4 p-8">
             <SignalHigh size={48} className="mx-auto text-white/50 animate-pulse" />
             <h3 className="text-lg font-mono text-gray-400">未检测到信号</h3>
             <p className="text-xs text-gray-600 max-w-xs mx-auto">
               远程发射塔已离线。本地网状网络静默中。尝试前往高地（第4区）。
             </p>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
             <div className="h-full bg-white/50 w-1/3 animate-[shimmer_2s_infinite]"></div>
          </div>
       </div>
    </div>
  );
};