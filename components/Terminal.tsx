import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal as TerminalIcon, ChevronUp, ChevronDown, Zap, Search, Eye, MessageSquare, ShieldAlert, Cpu, Radio } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGLM, GameState, StateUpdate, ActionChoice } from '../services/geminiService';
import { GlitchText } from './GlitchText';

interface TerminalProps {
  active: boolean;
  llmConfig: { 
    model: string; 
    temperature: number;
    endpoint?: string;
    apiKey?: string;
  };
  gameState: GameState;
  onStateUpdate: (diff: StateUpdate) => void;
  pendingItemHint?: string;
  onClearItemHint?: () => void;
  introData?: { codeName: string; gender: string; anchor: string; extra: string } | null;
  onIntroDone?: () => void;
  firstAIResult?: { text: string; stateUpdate?: StateUpdate; actions?: any[] } | null;
  initialMessages?: ChatMessage[] | null;
  initialActions?: any[] | null;
  onMessagesChange?: (msgs: ChatMessage[]) => void;
  onActionsChange?: (acts: any[]) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ active, llmConfig, gameState, onStateUpdate, pendingItemHint, onClearItemHint, introData, onIntroDone, firstAIResult, initialMessages, initialActions, onMessagesChange, onActionsChange }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  
  // Use gameState time, fallback to default if not ready
  const gameTime = gameState?.time || { day: 1, hour: 23, minute: 45, year: 2049, month: 10, second: 0 };

  const INIT_MSG: ChatMessage = {
    id: 'init-1',
    sender: 'system',
    text: '系统正在初始化...\n连接至 [异世界]...\n\n你醒了。\n这不是你熟悉的世界\n包括你的身体也变成了陌生的模样。\n\n主线任务：你需要替宿主（即此刻这副身体原本的主人）完成ta最深的愿望。记住：你有7天时间完成，才能逃离这里回到你原本的世界，否则你将永远停留在这里。\n\n每日任务：在这7日里每一天都会对应七宗罪中的其中一罪，你必须在每日0点前完成它。否则会被当场抹杀。\n\n规则怪谈：请遵循每个世界的规则。你说不遵守怎样？哈哈哈哈哈哈你可以试试看。\n\n请及时在下方信息栏查看你的任务和状态。',
    timestamp: Date.now(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages && initialMessages.length > 0 ? initialMessages : [INIT_MSG]
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(prev => {
        let { year, month, day, hour, minute, second } = prev;
        second += 1;
        if (second >= 60) { second = 0; minute += 1; }
        if (minute >= 60) { minute = 0; hour += 1; }
        if (hour >= 24) { hour = 0; day += 1; }
        if (day > 30) { day = 1; month += 1; } 
        if (month > 12) { month = 1; year += 1; }
        return { year, month, day, hour, minute, second };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, active, isActionsExpanded]);

  // IntroScene 完成后，将首轮 AI 结果直接注入消息列表
  useEffect(() => {
    if (!introData || !firstAIResult) return;
    const narratorMsg: ChatMessage = {
      id: 'intro-ai-1',
      sender: 'narrator',
      text: firstAIResult.text,
      timestamp: Date.now(),
    };
    setMessages((prev: ChatMessage[]) => [...prev, narratorMsg]);
    if (firstAIResult.actions && firstAIResult.actions.length > 0) {
      setSuggestedActions(firstAIResult.actions);
    }
    onIntroDone?.();
  }, [introData, firstAIResult]);

  const [suggestedActions, setSuggestedActions] = useState<ActionChoice[]>(
    initialActions && initialActions.length > 0 ? initialActions : []
  );

  // 消息变更时同步到 App 层持久化
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages]);

  // 建议行动变更时同步到 App 层持久化
  useEffect(() => {
    onActionsChange?.(suggestedActions);
  }, [suggestedActions]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setIsActionsExpanded(false);
    setSuggestedActions([]); // Clear previous actions

    try {
      const history = messages
        .filter(m => m.sender !== 'system')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      // 将物品使用提示附加到发送给 AI 的内容末尾（但不显示给玩家）
      const actualInput = pendingItemHint ? `${userMsg.text}\n${pendingItemHint}` : userMsg.text;
      if (pendingItemHint) {
        onClearItemHint?.();
      }

      // 调用智谱 GLM API
      const { text, stateUpdate } = await sendMessageToGLM(history, actualInput, llmConfig, gameState);

      // Process State Update
      if (stateUpdate) {
        onStateUpdate(stateUpdate);
        if (stateUpdate.suggested_actions) {
          setSuggestedActions(stateUpdate.suggested_actions);
        }
      }

      const narratorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'narrator',
        text: text, // Show the pure narrative text
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, narratorMsg]);
    } catch (e: any) {
      console.error("Gemini request failed:", e?.message || e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'system',
        text: `Error: ${e.message}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const appendAction = (actionText: string) => {
    setInput(actionText);
    setIsActionsExpanded(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const actions = [
    { 
      label: '环境侦察', 
      icon: <Search size={16} />, 
      text: '我决定屏住呼吸，轻手轻脚地探索这片死寂的废墟，试图在断壁残垣中寻找可能被前人遗忘的应急物资或是关键的逃生线索，哪怕只有一点点希望。' 
    },
    { 
      label: '规则验证', 
      icon: <ShieldAlert size={16} />, 
      text: '我颤抖着从怀里掏出那张染血的规则手册，对照眼前的阴影和怪异声响，拼命确认自己是否还在所谓的“安全准则”保护之下，试图寻找逻辑的漏洞。' 
    },
    { 
      label: '精神同调', 
      icon: <Eye size={16} />, 
      text: '我闭上双眼，强迫自己忽略耳边不断回响的疯狂低语，试图利用这种禁忌的感官去捕捉空气中弥漫的异常量子波动，感受那股来自深渊的视线。' 
    },
    { 
      label: '身份重构', 
      icon: <Cpu size={16} />, 
      text: '看着镜子中逐渐变得陌生的脸庞，我反复对自己强调着原来的名字和记忆，试图在身体彻底崩坏前保留最后一丝属于“人类”的自尊与清醒的意志。' 
    },
    { 
      label: '因果干预', 
      icon: <Zap size={16} />, 
      text: '面对前方那团不可名状的蠕动黑影，我握紧了手中唯一的武器，决定违背生存本能，用一次鲁莽且疯狂的尝试去打破这个循环往复且绝望的梦魇世界。' 
    },
    { 
      label: '紧急求援', 
      icon: <Radio size={16} />, 
      text: '我疯狂地调试着手中破旧且满是铁锈的无线电收音机，哪怕只有万分之一的生还可能，我也渴望能在这个被神遗弃的废土中听到除我之外的生命信号。' 
    },
  ];

  if (!active) return null;

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  // Helper to map type to icon
  const getIconForType = (type: string) => {
     switch(type) {
       case 'logical': return <Search size={16} />;
       case 'twist': return <Zap size={16} />;
       case 'aggressive': return <ShieldAlert size={16} />;
       case 'romantic': return <Radio size={16} />;
       case 'irony': return <MessageSquare size={16} />;
       case 'timeskip': return <Cpu size={16} />;
       default: return <Eye size={16} />;
     }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-black text-gray-300 font-mono">
      {/* ... (Header preserved via context) ... */} 
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[90%] md:max-w-[80%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest opacity-40 mb-1">
              {msg.sender === 'user' ? '> 玩家' : msg.sender === 'narrator' ? '> GM' : '> 系统'}
            </span>
            <div
              className={`relative p-3 md:p-4 text-sm md:text-base leading-relaxed whitespace-pre-wrap rounded-sm border ${
                msg.sender === 'user'
                  ? 'bg-white/5 border-white/20 text-white rounded-tr-none'
                  : msg.sender === 'system'
                  ? 'bg-red-900/10 border-red-500/20 text-red-100/80 w-full font-mono text-xs'
                  : 'bg-black border-white/10 text-gray-300 font-serif rounded-tl-none shadow-[0_0_15px_rgba(255,255,255,0.05)]'
              }`}
            >
              {msg.sender === 'system' ? <span className="pixel-font text-lg">{msg.text}</span> : msg.text}
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-white/20"></div>
              <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-white/20"></div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse ml-2">
             <div className="w-1 h-4 bg-white/50"></div>
             <span>解析因果律中...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Quick Actions Area */}
      <div className="flex-shrink-0 w-full p-4 bg-black border-t border-white/10 z-40">
        <div className="mb-2 flex flex-col items-start w-full">
          <button 
            onClick={() => setIsActionsExpanded(!isActionsExpanded)}
            className="flex items-center gap-2 px-3 py-2 bg-black border border-white/20 text-[11px] text-gray-400 hover:text-white hover:border-white/50 transition-all rounded-t-sm"
          >
            {isActionsExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <span className="uppercase tracking-[0.3em] font-bold">Quick_Actions.sh</span>
          </button>
          
          <div className={`
            w-full bg-black border border-white/20 transition-all duration-300 flex flex-col gap-2 overflow-hidden
            ${isActionsExpanded ? 'max-h-[300px] p-3 opacity-100' : 'max-h-0 p-0 opacity-0 pointer-events-none'}
          `}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar">
              {/* Show AI Actions if available, else show nothing */}
              {suggestedActions.length > 0 ? (
                suggestedActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => appendAction(action.text)}
                    className="flex flex-col text-left p-3 border border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all group relative"
                  >
                    <div className="flex items-center gap-2 mb-2 text-cyan-500 group-hover:text-black transition-colors">
                      {getIconForType(action.type)}
                      <span className="text-[10px] uppercase tracking-widest font-bold">{action.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-70 group-hover:opacity-100 line-clamp-2">
                      {action.text}
                    </p>
                    <div className="absolute bottom-1 right-2 text-[8px] opacity-20 group-hover:opacity-50">EXECUTE_0{idx+1}</div>
                  </button>
                ))
              ) : (
                 <div className="p-4 text-center text-xs text-gray-600 italic">
                    等待终端计算因果分支...<br/>(请输入任意指令开启交互)
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex items-end gap-2 bg-black border border-white/20 p-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] focus-within:border-white/50 transition-all">
          <span className="pb-3 pl-2 text-white/50 font-bold">{'>'}</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的抉择..."
            className="w-full bg-transparent text-white placeholder-gray-700 outline-none resize-none min-h-[44px] max-h-32 py-3 px-2 font-mono text-sm md:text-base"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 text-black bg-white hover:bg-gray-300 disabled:opacity-30 disabled:grayscale transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};