import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal as TerminalIcon, ChevronUp, ChevronDown, Zap, Search, Eye, MessageSquare, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { GlitchText } from './GlitchText';

interface TerminalProps {
  active: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ active }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  
  // 游戏时间状态
  const [gameTime, setGameTime] = useState({
    day: 1,
    hour: 23,
    minute: 45,
    second: 0
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'system',
      text: '系统正在初始化...\n连接至 [虚空时间线]...\n目标世界：未定义 (等待流浪者指令)\n\n欢迎回来。记住：你有7天时间完成执念，否则你将成为规则的一部分。',
      timestamp: Date.now(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 模拟游戏时间流逝
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime(prev => {
        let { day, hour, minute, second } = prev;
        second += 1;
        if (second >= 60) { second = 0; minute += 1; }
        if (minute >= 60) { minute = 0; hour += 1; }
        if (hour >= 24) { hour = 0; day += 1; }
        return { day, hour, minute, second };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, active]);

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

    try {
      const history = messages
        .filter(m => m.sender !== 'system')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const responseText = await sendMessageToGemini(history, userMsg.text);

      const narratorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'narrator',
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, narratorMsg]);
    } catch (e) {
      console.error(e);
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

  // 行动选择器逻辑：追加内容到光标后
  const appendAction = (actionText: string) => {
    if (!inputRef.current) return;
    
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const text = input;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    setInput(before + actionText + after);
    
    // 重新聚焦并调整光标位置（在下一帧执行以确保 state 已更新）
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + actionText.length, start + actionText.length);
      }
    }, 0);
  };

  const actions = [
    { label: '搜索环境', icon: <Search size={14} />, text: '我仔细观察四周，寻找有用的物资或线索。' },
    { label: '检视规则', icon: <ShieldAlert size={14} />, text: '我拿出那张皱巴巴的规则纸，试图核对当前的情况。' },
    { label: '尝试感知', icon: <Eye size={14} />, text: '我闭上眼，感受空气中的震动和那股莫名的恶意。' },
    { label: '低声自语', icon: <MessageSquare size={14} />, text: '“这里...不对劲。”我小声嘀咕着，试图缓解内心的恐惧。' },
    { label: '对抗本能', icon: <Zap size={14} />, text: '我强行压制住逃跑的冲动，决定正面面对眼前的阴影。' },
  ];

  if (!active) return null;

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-black text-gray-300 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-sm z-30">
        <div className="flex items-center gap-2">
           <TerminalIcon size={18} className="text-white animate-pulse" />
           <GlitchText text="ECHOES_CORE // UPLINK" className="text-sm tracking-widest text-gray-400" />
        </div>
        
        {/* 新增时间显示 */}
        <div className="flex items-center gap-4 bg-white/5 px-3 py-1 border border-white/10 rounded-sm">
          <div className="flex flex-col items-center leading-none border-r border-white/20 pr-3">
            <span className="text-[10px] text-gray-500 uppercase">Cycle</span>
            <span className="text-sm font-bold text-white">第 {gameTime.day} 天</span>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] text-gray-500 uppercase">Chronos</span>
            <span className="text-sm font-bold text-white tracking-widest">
              {formatNum(gameTime.hour)}:{formatNum(gameTime.minute)}:<span className="text-gray-500">{formatNum(gameTime.second)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide pb-32">
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

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black to-transparent z-20">
        
        {/* 行动选择器 Action Selector */}
        <div className="mb-2 flex flex-col items-start max-w-full overflow-hidden">
          <button 
            onClick={() => setIsActionsExpanded(!isActionsExpanded)}
            className="flex items-center gap-2 px-3 py-1 bg-black border border-white/20 text-[10px] text-gray-500 hover:text-white hover:border-white/50 transition-all rounded-t-sm"
          >
            {isActionsExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            <span className="uppercase tracking-[0.2em]">Quick_Actions.sh</span>
          </button>
          
          <div className={`
            w-full flex gap-2 p-2 bg-black border-x border-t border-white/20 transition-all duration-300 overflow-x-auto no-scrollbar
            ${isActionsExpanded ? 'max-h-24 opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-2 pointer-events-none'}
          `}>
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => appendAction(action.text)}
                className="whitespace-nowrap flex items-center gap-2 px-3 py-2 border border-white/10 bg-white/5 hover:bg-white hover:text-black text-xs transition-all"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
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
    </div>
  );
};