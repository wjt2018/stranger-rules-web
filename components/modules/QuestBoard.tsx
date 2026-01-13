import React from 'react';
import { Target, CheckSquare, Clock } from 'lucide-react';
import { Quest } from '../../types';

export const QuestBoard = () => {
  const quests: Quest[] = [
    { id: '1', title: "寂静的信号", description: "前往3号无线电塔，寻找失踪的斥候小队留下的黑匣子。", status: 'active', difficulty: 'B' },
    { id: '2', title: "规则：不可直视", description: "在不直视任何镜子的情况下穿过镜廊。", status: 'active', difficulty: 'S' },
    { id: '3', title: "物资收集：滤芯", description: "收集3个防毒面具滤芯上交给军需官。", status: 'completed', difficulty: 'D' },
  ];

  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
       <div className="flex items-center justify-between border-b-2 border-white pb-2">
         <h2 className="text-2xl font-bold tracking-tighter uppercase">行动日志</h2>
         <Target className="text-white" />
       </div>

       <div className="space-y-4 overflow-y-auto pr-2">
         {quests.map((quest) => (
           <div 
            key={quest.id} 
            className={`relative p-4 border transition-all duration-300 group
              ${quest.status === 'completed' 
                ? 'border-gray-700 bg-gray-900/50 opacity-60 grayscale' 
                : 'border-white/30 bg-black hover:border-white hover:bg-white/5'
              }`}
           >
             {/* Sticky Note Effect / Paperclip visual could be added here */}
             <div className="flex justify-between items-start mb-2">
               <h3 className={`font-bold text-lg font-serif ${quest.status === 'active' ? 'text-white' : 'text-gray-500 line-through'}`}>
                 {quest.title}
               </h3>
               <span className={`text-xs px-2 py-0.5 border ${quest.difficulty === 'S' ? 'border-red-500 text-red-500' : 'border-gray-500 text-gray-500'}`}>
                 等级 {quest.difficulty}
               </span>
             </div>
             
             <p className="text-sm text-gray-400 mb-4 font-mono leading-relaxed">
               {quest.description}
             </p>

             <div className="flex items-center gap-4 text-xs uppercase tracking-wider text-gray-500">
               {quest.status === 'active' ? (
                 <span className="flex items-center gap-1 text-yellow-500"><Clock size={12}/> 进行中</span>
               ) : (
                 <span className="flex items-center gap-1 text-green-500"><CheckSquare size={12}/> 已完成</span>
               )}
             </div>

             {/* Corner decor */}
             <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-l-[20px] border-t-white/10 border-l-transparent group-hover:border-t-white/30 transition-colors"></div>
           </div>
         ))}
       </div>
    </div>
  );
};