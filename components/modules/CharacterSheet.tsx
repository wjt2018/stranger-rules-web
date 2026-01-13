import React from 'react';
import { Activity, Brain, Shield, Zap, Skull } from 'lucide-react';
import { CharacterStats } from '../../types';

export const CharacterSheet = () => {
  // Mock data
  const stats: CharacterStats = {
    hp: 65,
    maxHp: 100,
    sanity: 42,
    maxSanity: 100,
    credits: 1250,
    level: 3
  };

  return (
    <div className="p-6 min-h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/20 pb-4 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-4xl pixel-font uppercase">ID: 流浪者_04</h2>
          <span className="text-xs text-gray-500 tracking-[0.2em]">职业: 拾荒者</span>
        </div>
        <div className="text-right">
           <div className="text-2xl font-bold">{stats.level}</div>
           <div className="text-[10px] text-gray-500 uppercase">权限等级</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Vitals */}
        <div className="space-y-6">
           <h3 className="text-sm text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-4">生命体征监测</h3>
           
           {/* HP */}
           <div className="group">
             <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-2"><Activity size={12}/> 生理完整度</span>
                <span>{stats.hp}/{stats.maxHp}</span>
             </div>
             <div className="h-4 bg-gray-900 border border-white/10 relative overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-700 ease-out" 
                  style={{width: `${(stats.hp / stats.maxHp) * 100}%`}}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                </div>
             </div>
           </div>

           {/* Sanity */}
           <div className="group">
             <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-2"><Brain size={12}/> 精神稳定性</span>
                <span className={`${stats.sanity < 50 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>{stats.sanity}/{stats.maxSanity}</span>
             </div>
             <div className="h-4 bg-gray-900 border border-white/10 relative overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${stats.sanity < 30 ? 'bg-red-800' : 'bg-gray-400'}`}
                  style={{width: `${(stats.sanity / stats.maxSanity) * 100}%`}}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                </div>
             </div>
           </div>
        </div>

        {/* Status Effects */}
        <div className="space-y-4">
           <h3 className="text-sm text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-4">活跃异常状态</h3>
           <div className="flex flex-wrap gap-2">
             <div className="px-3 py-1 border border-white/20 text-xs bg-white/5 flex items-center gap-2">
               <Shield size={10} /> 轻度辐射
             </div>
             <div className="px-3 py-1 border border-red-500/30 text-xs bg-red-900/10 text-red-300 flex items-center gap-2 animate-pulse">
               <Skull size={10} /> 偏执 II
             </div>
             <div className="px-3 py-1 border border-white/20 text-xs bg-white/5 flex items-center gap-2 opacity-50">
               <Zap size={10} /> 饥饿
             </div>
           </div>
        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="mt-auto border-t border-dashed border-white/20 pt-4 flex justify-between text-[10px] text-gray-600 font-mono shrink-0">
        <span>生物扫描: 运行中</span>
        <span>最后更新: 00:00:01</span>
      </div>
    </div>
  );
};