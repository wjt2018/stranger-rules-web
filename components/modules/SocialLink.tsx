import React from 'react';
import { Users, Heart, MessageSquare, AlertCircle } from 'lucide-react';

interface NpcInfo {
  name: string;
  favorability: number;
  last_interaction: number;
}

interface SocialLinkProps {
  npcStatus: NpcInfo[];
}

// 根据好感度自动生成关系标签
const getStatusLabel = (favorability: number): string => {
  if (favorability >= 80) return '信赖';
  if (favorability >= 60) return '友好';
  if (favorability >= 40) return '中立';
  if (favorability >= 20) return '警惕';
  return '厌恶';
};

export const SocialLink: React.FC<SocialLinkProps> = ({ npcStatus }) => {
  // 将 npcStatus 映射为组件内部使用的格式
  const relationships = npcStatus.map(npc => ({
    name: npc.name,
    favorability: npc.favorability,
    status: getStatusLabel(npc.favorability),
    lastInteractionTurn: npc.last_interaction
  }));

  return (
    <div className="p-6 min-h-full flex flex-col gap-6 bg-black text-white font-mono animate-in fade-in duration-500 overflow-y-auto">
      <div className="border-b border-white/20 pb-4 flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-1">Human_Connection_Index</span>
          <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-2">
            <Users size={20} /> 社会羁绊
          </h2>
        </div>
        <div className="text-right">
           <div className="text-xs text-gray-500 uppercase">已知个体: {relationships.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relationships.map((npc, idx) => (
          <div key={idx} className="border border-white/10 bg-white/5 p-4 relative group hover:border-white transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <h4 className="font-bold text-lg tracking-widest uppercase group-hover:text-cyan-400 transition-colors">{npc.name}</h4>
                <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-1 uppercase">
                  <MessageSquare size={10} /> 最后互动: {npc.lastInteractionTurn} 回合前
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 border font-black uppercase
                ${npc.status === '信赖' ? 'border-green-500 text-green-500 bg-green-500/10' : 
                  npc.status === '警惕' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                  npc.status === '厌恶' ? 'border-red-500 text-red-500 bg-red-500/10 animate-pulse' : 'border-gray-500 text-gray-500 bg-gray-500/10'}`}>
                {npc.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
                <span>纽带强度</span>
                <span>{npc.favorability}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart size={14} className={`${npc.favorability > 50 ? 'text-red-600 fill-red-600' : 'text-gray-700'}`} />
                <div className="flex-1 h-2 bg-black border border-white/10 overflow-hidden rounded-sm">
                  <div 
                    className={`h-full transition-all duration-1000 ${npc.favorability > 70 ? 'bg-white' : npc.favorability < 30 ? 'bg-red-900' : 'bg-gray-500'}`}
                    style={{ width: `${npc.favorability}%` }}
                  >
                    <div className="w-full h-full bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:4px_100%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decor */}
            <div className="absolute bottom-1 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <AlertCircle size={32} />
            </div>
          </div>
        ))}
        
        {relationships.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 flex flex-col items-center gap-4">
            <Users size={40} className="text-gray-800" />
            <p className="text-xs text-gray-600 italic tracking-[0.2em] uppercase">
              NO SIGNAL DETECTED. YOU ARE ALONE IN THE VOID.
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border border-white/5 bg-white/5 text-[10px] text-gray-500 italic leading-relaxed">
        * 纽带强度会随着你的行为实时波动。某些极端的负面倾向可能会导致目标永久性的敌对或消失。请谨慎对待废土中的每一段关系。
      </div>
    </div>
  );
};