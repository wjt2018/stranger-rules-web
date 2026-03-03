import React from 'react';
import { Activity, Brain, Shield, Zap, Skull, CreditCard } from 'lucide-react';
import { CharacterStats } from '../../types';

interface CharacterSheetProps {
  hp: number;
  san: number;
  credits: number;
  currentStatus: string[];
  playerInfo: { name_now: string; identity: string; name_old: string };
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ hp, san, credits, currentStatus, playerInfo }) => {
  // 使用 props 传入的实际游戏状态
  const stats: CharacterStats = {
    hp: hp,
    maxHp: 100,
    sanity: san,
    maxSanity: 100,
    credits: credits,
    level: 3,
    statusEffects: currentStatus.length > 0 ? currentStatus : ['正常'],
    relationships: [] // Relationships now handled in SocialLink module
  };

  return (
    <div className="p-6 min-h-full flex flex-col gap-6 bg-black text-white font-mono animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-12">
      {/* 顶部标识 */}
      <div className="border-b border-white/20 pb-4 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-1">Biological_Profile</span>
          <h2 className="text-4xl pixel-font uppercase tracking-tighter">宿主: {playerInfo.name_now || '加载中...'}</h2>
          <div className="flex gap-4 mt-1">
            <span className="text-[10px] bg-white text-black px-1 font-bold">本名: {playerInfo.name_old || '未知'}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">身份: {playerInfo.identity || '未知'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Vitals and Credits */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-6">体征监测 / VITALS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* HP */}
              <div className="group">
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
              <div className="group">
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
            </div>
            
            {/* Credits */}
            <div className="mt-8 p-6 bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={24} className="text-cyan-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">网络资产余额</span>
                  <span className="text-xs text-gray-400">CREDIT_BALANCE_SECURE</span>
                </div>
              </div>
              <span className="text-4xl font-black italic tracking-tighter text-white">
                {credits.toLocaleString()} <span className="text-sm font-normal not-italic text-gray-500 ml-2">CREDITS</span>
              </span>
            </div>
          </section>

          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-4">当前状态 / STATUS</h3>
            <div className="flex flex-wrap gap-3">
              {stats.statusEffects.map((effect, idx) => (
                <div key={idx} className={`px-4 py-2 border text-[11px] flex items-center gap-2 uppercase tracking-[0.2em] font-bold transition-all hover:bg-white hover:text-black
                  ${effect.includes('辐射') || effect.includes('偏执') ? 'border-red-500/50 bg-red-900/10 text-red-400' : 'border-white/20 bg-white/5 text-gray-300'}`}>
                  {effect.includes('辐射') && <Shield size={12} />}
                  {effect.includes('偏执') && <Skull size={12} />}
                  {effect.includes('饥饿') && <Zap size={12} />}
                  {effect}
                </div>
              ))}
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