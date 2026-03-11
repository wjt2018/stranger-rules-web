import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Github, Globe, Zap, ShieldCheck, Thermometer, Database, Key, Server, RefreshCw } from 'lucide-react';
import { fetchModelList } from '../../services/geminiService';

interface SettingsModuleProps {
  llmConfig: { 
    model: string; 
    temperature: number;
    endpoint: string;
    apiKey: string;
  };
  onConfigChange: (newConfig: { 
    model: string; 
    temperature: number;
    endpoint: string;
    apiKey: string; 
  }) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ llmConfig, onConfigChange }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('');

  const isSystemMode = !llmConfig.apiKey && !!(process.env.GEMINI_API_KEY || process.env.API_KEY);

  const defaultModels = isSystemMode 
    ? [process.env.GEMINI_API_MODEL || 'GLM-4.7-Flash'] 
    : ['GLM-4.7-Flash'];

  const handleTestConnection = async () => {
    if (isSystemMode) {
      setTestStatus('idle'); // Or stay idle
      setStatusMessage('使用系统默认配置 (System Mode) - 无法手动拉取模型列表');
      return;
    }

    // Check valid key (Legacy check, though isSystemMode covers the visible part)
    if (!llmConfig.apiKey) {
      setTestStatus('error');
      setStatusMessage('请先输入 API Key');
      return;
    }

    setIsTesting(true);
    setTestStatus('idle');
    setStatusMessage('正在连接神经漫游网络...');
    
    try {
      const models = await fetchModelList(llmConfig.endpoint, llmConfig.apiKey);
      setAvailableModels(models);
      setTestStatus('success');
      setStatusMessage(`连接成功: 同步 ${models.length} 个模型节点`);
      
      // 如果当前模型不在列表中，自动切换到第一个可用模型
      if (models.length > 0 && !models.includes(llmConfig.model)) {
        onConfigChange({ ...llmConfig, model: models[0] });
      }
    } catch (error: any) {
      console.error(error);
      setTestStatus('error');
      setStatusMessage('连接失败: 无法访问目标节点');
    } finally {
      setIsTesting(false);
    }
  };

  const getModelList = () => {
    if (isSystemMode) {
      return [process.env.GEMINI_API_MODEL || 'GLM-4.7-Flash'];
    }
    return availableModels.length > 0 ? availableModels : defaultModels;
  };

  return (
    <div className="p-6 min-h-full flex flex-col gap-8 bg-black text-white font-mono animate-in zoom-in-95 duration-500 overflow-y-auto">
      <div className="border-b border-white/20 pb-4 flex justify-between items-center shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-1">System_Config_v4.5</span>
          <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-2">
            <Settings size={20} /> 系统设置
          </h2>
        </div>
      </div>

      <div className="space-y-8">
        {/* LLM Info Section */}
        <section>
          <h3 className="text-xs text-gray-400 uppercase tracking-widest border-l-2 border-white pl-2 mb-6 flex items-center gap-2">
            <Cpu size={16} className="text-cyan-400" /> 神经逻辑核心配置 （该模块暂时不可用）
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="p-4 bg-white/5 border border-white/10 flex flex-col gap-4 relative overflow-hidden">
               
               {/* API Config Area */}
               <div className="flex flex-col gap-4 border-b border-white/10 pb-4 mb-2">
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                     <Server size={10} /> API 网关地址 (Endpoint)
                   </label>
                   <input 
                     type="text"
                     placeholder={process.env.GEMINI_API_ENDPOINT ? "System Configured (Hidden)" : "https://generativelanguage.googleapis.com"}
                     value={llmConfig.endpoint === process.env.GEMINI_API_ENDPOINT ? '' : llmConfig.endpoint}
                     onChange={(e) => onConfigChange({ ...llmConfig, endpoint: e.target.value })}
                     className="bg-black text-cyan-500 border border-white/20 p-2 text-xs outline-none focus:border-cyan-500 transition-colors font-mono tracking-wider"
                   />
                 </div>

                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                     <Key size={10} /> 访问密钥 (API Key)
                   </label>
                   <div className="flex gap-2">
                     <input 
                       type="password"
                       placeholder={(process.env.GEMINI_API_KEY || process.env.API_KEY) ? "System Configured (Hidden)" : "sk-..."}
                       value={(llmConfig.apiKey === process.env.GEMINI_API_KEY || llmConfig.apiKey === process.env.API_KEY) ? '' : llmConfig.apiKey}
                       onChange={(e) => onConfigChange({ ...llmConfig, apiKey: e.target.value })}
                       className="flex-1 bg-black text-yellow-500 border border-white/20 p-2 text-xs outline-none focus:border-yellow-500 transition-colors font-mono tracking-wider"
                     />
                     <button
                       onClick={handleTestConnection}
                       disabled={isTesting || isSystemMode}
                       className={`
                         px-3 py-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider border transition-all
                         ${(isTesting || isSystemMode) ? 'text-gray-500 border-gray-700 cursor-not-allowed opacity-50' : 'text-black bg-white hover:bg-cyan-400 border-white hover:border-cyan-400'}
                       `}
                     >
                       {isTesting ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                       {isTesting ? 'Ping...' : isSystemMode ? 'Sys_Lock' : 'Test'}
                     </button>
                   </div>
                   {statusMessage && (
                     <div className={`text-[10px] uppercase tracking-wider flex items-center gap-1
                       ${testStatus === 'success' ? 'text-green-500' : testStatus === 'error' ? 'text-red-500' : 'text-gray-400'}
                     `}>
                       <span>{statusMessage}</span>
                     </div>
                   )}
                 </div>
               </div>

               {/* Model Selection */}
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                   <Database size={10} /> 模型引擎 (Model Engine)
                 </label>
                 <select 
                   value={llmConfig.model}
                   onChange={(e) => onConfigChange({ ...llmConfig, model: e.target.value })}
                   className="bg-black text-white border border-white/20 p-2 text-sm outline-none focus:border-cyan-500 transition-colors font-bold uppercase tracking-tighter"
                 >
                   {getModelList().map(model => (
                     <option key={model} value={model}>{model.toUpperCase()}</option>
                   ))}
                 </select>
               </div>

               {/* Temperature Slider */}
               <div className="flex flex-col gap-2 mt-2">
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
                 <div className={`w-1.5 h-1.5 rounded-full ${testStatus === 'success' ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`}></div>
                 <span className={`text-[8px] uppercase ${testStatus === 'success' ? 'text-green-500' : 'text-gray-700'}`}>
                   {testStatus === 'success' ? 'Link_Active' : 'Offline'}
                 </span>
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


      </div>

      <div className="mt-auto text-center">
         <p className="text-[9px] text-gray-600 uppercase tracking-[0.5em] italic">
           All rights reserved to the remnants of humanity. 2049.
         </p>
      </div>
    </div>
  );
};