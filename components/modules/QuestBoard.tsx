import React from 'react';
import { Target, Crown, Flame, AlertTriangle } from 'lucide-react';

interface QuestBoardProps {
  mainQuest: string;
  dailyQuest: string;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ mainQuest, dailyQuest }) => {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between border-b-2 border-white pb-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase">行动日志</h2>
        <Target className="text-white" />
      </div>

      <div className="space-y-5 overflow-y-auto pr-2">
        {/* 主线任务 */}
        <div className="relative border-2 border-amber-500/50 bg-amber-950/20 p-5 group hover:border-amber-400 transition-all duration-300">
          {/* 左侧装饰条 */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600"></div>
          
          <div className="flex items-center gap-2 mb-3 pl-2">
            <Crown size={16} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 uppercase tracking-[0.3em] font-bold">Main Quest / 主线任务</span>
          </div>
          
          {mainQuest ? (
            <p className="text-base text-amber-100/90 font-mono leading-relaxed pl-2">
              {mainQuest}
            </p>
          ) : (
            <p className="text-sm text-amber-100/40 italic pl-2 font-mono">
              任务数据加载中...
            </p>
          )}

          {/* 右上角装饰 */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-amber-500/30 border-l-transparent"></div>
        </div>

        {/* 每日任务 */}
        <div className="relative border-2 border-red-500/40 bg-red-950/15 p-5 group hover:border-red-400 transition-all duration-300">
          {/* 左侧装饰条 */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 via-red-500 to-red-700"></div>
          
          <div className="flex items-center gap-2 mb-3 pl-2">
            <Flame size={16} className="text-red-400 animate-pulse" />
            <span className="text-[10px] text-red-400 uppercase tracking-[0.3em] font-bold">Daily Quest / 每日任务</span>
            <AlertTriangle size={12} className="text-red-500 ml-auto animate-pulse" />
          </div>
          
          {dailyQuest ? (
            <p className="text-base text-red-100/90 font-mono leading-relaxed pl-2">
              {dailyQuest}
            </p>
          ) : (
            <p className="text-sm text-red-100/40 italic pl-2 font-mono">
              任务数据加载中...
            </p>
          )}

          {/* 右上角装饰 */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-red-500/20 border-l-transparent"></div>
          
          {/* 底部警告 */}
          <div className="mt-4 pl-2 flex items-center gap-2 text-[9px] text-red-500/60 uppercase tracking-widest">
            <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            逾期未完成 = 抹杀
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="mt-auto p-4 border border-white/5 bg-white/5 text-[10px] text-gray-500 italic leading-relaxed">
        * 主线任务贯穿整个7日周期。每日任务需在当日 24:00 前完成，否则将被彻底抹杀。
      </div>
    </div>
  );
};