import React from 'react';
import { Activity, Brain, Shield, Zap, Skull, CreditCard, Users, Heart } from 'lucide-react';
import { CharacterStats, NPCRelationship } from '../../types';

interface CharacterSheetProps {
  credits: number;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ credits }) => {
  // 模拟数据：在实际应用中这些应从父组件 state 传入
  const stats: CharacterStats = {
    hp: 65,
    maxHp: 100,
    sanity: 42,
    maxSanity: 100,
    credits: credits,
    level: 3,
    statusEffects: ['轻度辐射', '偏执 II', '饥饿'],
    relationships: [
      { name: "军需官 老莫", favorability: 85, status: "信赖", lastInteractionTurn: 12 },
      { name: "拾荒女孩 艾莉", favorability: 40, status: "警惕", lastInteractionTurn: 5 },
      { name: "避难所 医生", favorability: 15, status: "厌恶", lastInteractionTurn: 22 },
      { name: "黑市商人 '影子'", favorability: 55, status: "中立", lastInteractionTurn: 30 }
    ]
  };

  return (
    <div className="p-6 min-h-full flex flex-col gap-6 bg-black text-white font-mono animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-12">
      {/* 顶部标识 */}
      <div className="border-b border-white/20 pb-4 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-1">Biological_Profile</span>
          <h2 className="text-4xl pixel-font uppercase tracking-tighter">ID: 流浪者_04</h2>
          <div className="flex gap-4 mt-1">
            <span className="text-[10px] bg-white text-black px-1 font-bold">等级: {stats.level}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">职业: 拾荒者</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 第一列：体征与资产 */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-6">体征监测 / VITALS</h3>
            
            {/* HP */}
            <div className="group mb-6">
              <div className="flex justify-between text-[11px] mb-2">
                <span className="flex items-center gap-2 uppercase tracking-widest"><Activity size={14} className="text-white"/> 生理完整度 (HP)</span>
                <span className="font-bold">{stats.hp} / {stats.maxHp}</span>
              </div>
              <div className="h-4 bg-white/5 border border-white/10 relative overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-out" 
                  style={{width: `${(stats.hp / stats.maxHp) * 100}%`}}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                </div>
              </div>
            </div>

            {/* Sanity */}
            <div className="group mb-6">
              <div className="flex justify-between text-[11px] mb-2">
                <span className="flex items-center gap-2 uppercase tracking-widest"><Brain size={14} className={stats.sanity < 40 ? 'animate-pulse text-red-500' : ''}/> 精神稳定性 (SAN)</span>
                <span className={`font-bold ${stats.sanity < 40 ? 'text-red-500' : ''}`}>{stats.sanity} / {stats.maxSanity}</span>
              </div>
              <div className="h-4 bg-white/5 border border-white/10 relative overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${stats.sanity < 30 ? 'bg-red-800' : 'bg-gray-400'}`}
                  style={{width: `${(stats.sanity / stats.maxSanity) * 100}%`}}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                </div>
              </div>
            </div>
            
            {/* Credits */}
            <div className="p-4 bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-cyan-500" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400">当前可用资产</span>
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-white">
                {credits.toLocaleString()} <span className="text-xs font-normal not-italic text-gray-500">CREDITS</span>
              </span>
            </div>
          </section>

          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-4">当前状态 / STATUS</h3>
            <div className="flex flex-wrap gap-2">
              {stats.statusEffects.map((effect, idx) => (
                <div key={idx} className={`px-3 py-1 border text-[10px] flex items-center gap-2 uppercase tracking-widest font-bold
                  ${effect.includes('辐射') || effect.includes('偏执') ? 'border-red-500/50 bg-red-900/10 text-red-400' : 'border-white/20 bg-white/5 text-gray-300'}`}>
                  {effect.includes('辐射') && <Shield size={10} />}
                  {effect.includes('偏执') && <Skull size={10} />}
                  {effect.includes('饥饿') && <Zap size={10} />}
                  {effect}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 第二列：社会联系 */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-6 flex items-center gap-2">
              <Users size={16} /> 社会羁绊 / NETWORK
            </h3>
            <div className="space-y-4">
              {stats.relationships.map((npc, idx) => (
                <div key={idx} className="border border-white/10 bg-black p-4 relative group hover:border-white transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-sm tracking-widest uppercase">{npc.name}</h4>
                    <span className={`text-[9px] px-2 py-0.5 border font-bold
                      ${npc.status === '信赖' ? 'border-green-500 text-green-500' : 
                        npc.status === '警惕' ? 'border-yellow-500 text-yellow-500' :
                        npc.status === '厌恶' ? 'border-red-500 text-red-500 animate-pulse' : 'border-gray-500 text-gray-500'}`}>
                      {npc.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Heart size={10} className={`${npc.favorability > 50 ? 'text-red-500' : 'text-gray-600'}`} />
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${npc.favorability > 70 ? 'bg-white' : 'bg-gray-600'}`}
                        style={{ width: `${npc.favorability}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 w-8 text-right">{npc.favorability}%</span>
                  </div>

                  {/* 装饰细节 */}
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/0 group-hover:border-white/40 transition-all"></div>
                </div>
              ))}
              
              {stats.relationships.length === 0 && (
                <div className="py-12 text-center border border-dashed border-white/10 text-gray-700 italic text-xs">
                  在这片荒原中，你孑然一身。暂时还没有任何生物与你产生有意义的交集。
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="mt-auto border-t border-dashed border-white/20 pt-6 flex justify-between text-[10px] text-gray-600 font-mono shrink-0 uppercase tracking-[0.2em]">
        <div className="flex gap-4">
          <span>BIOMETRIC_SCAN: ACTIVE</span>
          <span>LOCATION: SECTOR_0</span>
        </div>
        <span>LAST_SYNC: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};