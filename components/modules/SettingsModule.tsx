import React from 'react';
import { Settings, Cpu, Github, Globe, Zap, ShieldCheck, Thermometer } from 'lucide-react';

interface SettingsModuleProps {
  llmConfig: { model: string; temperature: number };
  onConfigChange: (newConfig: { model: string; temperature: number }) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ llmConfig, onConfigChange }) => {
  return (
    <div className="p-6 min-h-full flex flex-col gap-8 bg-black text-white font-mono animate-in zoom-in-95 duration-500">
      <div className="border-b border-white/20 pb-4 flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-1">System_Config_v4.2</span>
          <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-2">
            <Settings size={20} /> 系统设置
          </h2>
        </div>
      </div>

      <div className="space-y-8">
        {/* LLM Info Section */}
        <section>
          <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-6 flex items-center gap-2">
            <Cpu size={16} className="text-cyan-400" /> 神经逻辑核心配置
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="p-4 bg-white/5 border border-white/10 flex flex-col gap-4 relative overflow-hidden">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">驱动模型引擎</label>
                 <select 
                   value={llmConfig.model}
                   onChange={(e) => onConfigChange({ ...llmConfig, model: e.target.value })}
                   className="bg-black text-white border border-white/20 p-2 text-sm outline-none focus:border-cyan-500 transition-colors font-bold uppercase tracking-tighter"
                 >
                   <option value="gemini-3-flash-preview">Gemini 3 Flash (极速响应)</option>
                   <option value="gemini-3-pro-preview">Gemini 3 Pro (深度推演)</option>
                   <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite (资源节省)</option>
                 </select>
               </div>

               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                     <Thermometer size={10} /> 逻辑发散度 (Temperature)
                   </label>
                   <span className="text-xs font-bold text-cyan-400">{llmConfig.temperature.toFixed(1)}</span>
                 </div>
                 <input 
                   type="range"
                   min="0.1"
                   max="1.5"
                   step="0.1"
                   value={llmConfig.temperature}
                   onChange={(e) => onConfigChange({ ...llmConfig, temperature: parseFloat(e.target.value) })}
                   className="w-full accent-white bg-white/10 h-1 appearance-none cursor-pointer"
                 />
                 <div className="flex justify-between text-[8px] text-gray-600 uppercase mt-1">
                   <span>严谨/逻辑</span>
                   <span>混乱/创意</span>
                 </div>
               </div>

               <div className="absolute top-2 right-2 flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[8px] text-green-500 uppercase">Synchronized</span>
               </div>
            </div>
          </div>
        </section>

        {/* Project Section */}
        <section>
          <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-6 flex items-center gap-2">
            <Globe size={16} className="text-white" /> 源代码与仓库
          </h3>
          <a 
            href="https://github.com/wjt2018/stranger-rules-web" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group p-6 bg-white border-2 border-white text-black flex items-center justify-between transition-all hover:bg-black hover:text-white"
          >
            <div className="flex items-center gap-4">
              <Github size={32} />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase italic">Open_Source_Archive</span>
                <span className="text-xs font-mono group-hover:text-gray-400">View project on GitHub</span>
              </div>
            </div>
            <Zap className="opacity-50 group-hover:opacity-100 group-hover:animate-bounce" />
          </a>
        </section>

        {/* Diagnostic Data */}
        <section className="bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
             <ShieldCheck size={14} /> 系统自检报告
          </div>
          <div className="grid grid-cols-3 gap-2">
             {[
               { k: "内核", v: "0x82A" },
               { k: "延迟", v: "42ms" },
               { k: "同步", v: "OK" },
               { k: "区域", v: "S0_WEST" },
               { k: "加密", v: "RSA_4K" },
               { k: "模型状态", v: "ACTIVE" }
             ].map((d, i) => (
               <div key={i} className="flex flex-col border border-white/5 p-2 bg-black/40">
                  <span className="text-[8px] text-gray-600 uppercase">{d.k}</span>
                  <span className="text-xs font-bold text-white/80">{d.v}</span>
               </div>
             ))}
          </div>
        </section>
      </div>

      <div className="mt-auto text-center">
         <p className="text-[9px] text-gray-600 uppercase tracking-[0.5em] italic">
           All rights reserved to the remnants of humanity. 2049.
         </p>
      </div>
    </div>
  );
};