import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface IntroSceneProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

// const BG_PHASE_1 = 'https://i.postimg.cc/RFKHB9zG/f47d197b208d34a2fb4773509c88cf82.jpg';
const BG_PHASE_1 = 'https://i.postimg.cc/hvQjS9wy/Bobbin-heads.gif';
const BG_PHASE_2 = 'https://i.postimg.cc/NjryvBYv/xia-zai.png'; 
const BG_PHASE_3 = 'https://i.postimg.cc/Xvrr355V/The-DAMNED.gif'; 
const BG_PHASE_4 = 'https://i.postimg.cc/vTBrX6CC/xia-zai.gif';

const SCARY_PHRASES = [
  "I FOUND YOU", "I HEAR YOU", "I SEE YOU", "NO ESCAPE", "LOOK BEHIND YOU", 
  "IT'S HERE", "DIE", "RUN", "THEY ARE WATCHING", "NOT ALONE", "STAY QUIET",
  "DON'T BREATHE", "END IS NEAR", "VOICES", "STATIC", "DEATH", "FEAR ME"
];

// 将文本修改为数组格式，方便逐行精准控制
const BRIEFING_LINES = [
  "系统正在初始化...",
  "连接至 [异世界]...",
  "",
  "你醒了。",
  "这不是你熟悉的世界",
  "包括你的身体也变成了陌生的模样。",
  "",
  "主线任务：你需要替宿主(即此刻这副身体原本的主人)完成ta最深的愿望。记住：你有7天时间完成，才能逃离这里回到你原本的世界，否则你将永远停留在这里。",
  "",
  "每日任务：在这7日里每一天都会对应七宗罪中的其中一罪，你必须在每日12点前完成它。否则会被当场抹杀。",
  "",
  "规则怪谈：请遵循每个世界的规则。你说不遵守怎样？哈哈哈哈哈哈你可以试试看。",
  "",
  "请及时在下方信息栏查看你的任务和状态。"
];

export const IntroScene: React.FC<IntroSceneProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState(0); 
  const briefingEndRef = useRef<HTMLDivElement>(null);
  
  // --- Step 0: 叙事状态 ---
  const [textIndex, setTextIndex] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(0);
  const [showStartBtn, setShowStartBtn] = useState(false);
  
  // --- Step 1: 表单状态 ---
  const [formData, setFormData] = useState({
    codeName: '',
    gender: '',
    anchor: '',
    extra: ''
  });
  const [horrorLevel, setHorrorLevel] = useState(0); 

  // --- Step 2: 高潮状态 ---
  const [isZooming, setIsZooming] = useState(false); 
  const [bloodTexts, setBloodTexts] = useState<Array<{
    id: number;
    text: string;
    style: React.CSSProperties;
  }>>([]);

  // --- Step 3: 简报状态 ---
  const [displayedBriefingLines, setDisplayedBriefingLines] = useState<string[]>([]);
  const [briefingComplete, setBriefingComplete] = useState(false);

  const narrativeLines = [
    "滴—— 死亡确认",
    "根据评估，你的平生... 真是乏善可陈",
    "别急着哭丧",
    "真当天堂有空位留给你这种人？",
    "不过...",
    "我今天心情很好",
    "你地下的祖宗把头磕烂了才为你求来了这场‘加时赛’",
    "看看现在的自己",
    "这具身体感觉如何？",
    "虽然是偷来的，但总比没有好。",
    "交易很简单",
    "这具身体的原主死不瞑目，留下了一个疯狂的遗愿。",
    "你只有7天",
    "扮演他，完成它",
    "别露馅，别搞砸",
    "成功了",
    "我送你回人间享受余生",
    "失败了...",
    "呵",
    "我就把你的灵魂扔进绞肉机里听个响",
    "现在",
    "在这份卖身契上签个字",
    "别让我等太久"
  ];

  // Step 0 叙事逻辑
  useEffect(() => {
    if (step === 0) {
      if (textIndex < narrativeLines.length) {
        setBgOpacity((textIndex + 1) / narrativeLines.length);
        const timeout = setTimeout(() => {
          setTextIndex(prev => prev + 1);
        }, 1800); 
        return () => clearTimeout(timeout);
      } else {
        setShowStartBtn(true);
      }
    }
  }, [step, textIndex]);

  // Step 1 恐怖等级计算
  useEffect(() => {
    if (step === 1) {
      const filledCount = Object.values(formData).filter(v => (v as string).trim().length > 0).length;
      setHorrorLevel(filledCount / 4);
    }
  }, [formData, step]);

  // Step 2 高潮启动计时
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setIsZooming(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 2 文字瀑布逻辑
  useEffect(() => {
    if (step === 2 && isZooming) {
      const totalLines = 40; 
      const totalTime = 2000; 
      const intervalTime = totalTime / totalLines;
      let currentLine = 0;

      const interval = setInterval(() => {
        if (currentLine >= totalLines) {
          clearInterval(interval);
          setTimeout(() => setStep(3), 1000); 
          return;
        }

        const progress = currentLine / totalLines;
        const fontSize = 0.8 + (progress * 4.2);
        
        const newText = {
          id: Math.random(),
          text: SCARY_PHRASES[Math.floor(Math.random() * SCARY_PHRASES.length)],
          style: {
            top: `${progress * 100}%`,
            width: '100%',
            textAlign: 'center' as 'center',
            fontSize: `${fontSize}rem`,
            color: `rgba(${150 + progress * 105}, 0, 0, ${0.7 + progress * 0.3})`,
            textShadow: '2px 2px 4px black',
            animation: `jitter ${Math.max(0.05, 0.2 - progress * 0.15)}s infinite linear`,
            position: 'absolute' as 'absolute',
            transform: 'translateY(-50%)',
            zIndex: 100 + currentLine,
            fontWeight: '900',
            letterSpacing: `${progress * 1}rem`,
            whiteSpace: 'nowrap' as 'nowrap'
          }
        };

        setBloodTexts(prev => [...prev, newText]);
        currentLine++;
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [step, isZooming]);

  // Step 3 简报逐行显示逻辑 - 修复重复添加 Bug
  useEffect(() => {
    if (step === 3) {
      let currentIdx = 0;
      const timer = setInterval(() => {
        if (currentIdx < BRIEFING_LINES.length) {
          const lineToAdd = BRIEFING_LINES[currentIdx];
          setDisplayedBriefingLines(prev => [...prev, lineToAdd]);
          currentIdx++;
        } else {
          clearInterval(timer);
          setBriefingComplete(true);
        }
      }, 500);

      return () => clearInterval(timer);
    }
  }, [step]);

  // 简报自动滚动
  useEffect(() => {
    if (step === 3) {
      briefingEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedBriefingLines, step]);

  const getCorruptedStyle = () => {
    if (horrorLevel === 0) return {};
    const filter = `
      sepia(${horrorLevel * 100}%) 
      saturate(${100 + horrorLevel * 300}%) 
      hue-rotate(${horrorLevel * -50}deg)
      contrast(${100 + horrorLevel * 50}%)
    `;
    const shakeDuration = Math.max(0.08, 1.1 - horrorLevel) + 's';

    return {
      filter,
      animation: horrorLevel > 0 ? `screen-shake ${shakeDuration} infinite` : 'none',
    };
  };

  const getJitterStyle = (level: number, baseSpeed = 1) => {
    if (level <= 0) return {};
    const duration = Math.max(0.05, (0.5 - level * 0.4) * baseSpeed) + 's';
    return { animation: `jitter ${duration} infinite linear` };
  };

  const getHeartbeatStyle = (level: number) => {
    const duration = Math.max(0.3, 2 - (level * 1.7)) + 's';
    return { animation: `heartbeat ${duration} infinite ease-in-out` };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white font-mono overflow-hidden select-none">
      
      {/* Step 0 背景 */}
      <div 
        key="bg-phase-0"
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${BG_PHASE_1}')`,
          opacity: step === 0 ? bgOpacity : 0,
          zIndex: 1
        }}
      />

      {/* Step 1 背景 */}
      <div 
        key="bg-phase-1"
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url('${BG_PHASE_2}')`,
          opacity: step === 1 ? 1 : 0,
          zIndex: 1,
          ...getCorruptedStyle()
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Step 2 背景 */}
      {step === 2 && (
        <div 
            key="bg-phase-2-wrapper"
            className="absolute inset-0 z-50 overflow-hidden"
            style={{ ...getCorruptedStyle() }}
        >
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-[4000ms] ease-in"
              style={{
                backgroundImage: `url('${BG_PHASE_3}')`,
                transform: isZooming ? 'scale(1.8)' : 'scale(1)',
              }}
            />
        </div>
      )}

      {/* Step 3 (Phase 4) 背景 */}
      {step === 3 && (
        <div 
          key="bg-phase-4"
          className="absolute inset-0 z-10 bg-cover bg-center"
          style={{ backgroundImage: `url('${BG_PHASE_4}')` }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        </div>
      )}

      {/* 扫线与噪点覆盖 */}
      <div className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" style={{ opacity: 0.1 + (horrorLevel * 0.4) }}></div>
      </div>

      {/* 界面层 */}
      <div className="relative z-30 w-full h-full flex flex-col items-center justify-center p-6">
        
        {step === 0 && textIndex < narrativeLines.length && (
          <div className="max-w-2xl text-center">
            <p 
              key={textIndex}
              className="text-2xl md:text-4xl font-serif tracking-widest animate-narrative-line text-gray-200"
              style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.5)' }}
            >
              {narrativeLines[textIndex]}
            </p>
          </div>
        )}

        {step === 0 && showStartBtn && (
          <div className="mt-16 animate-in fade-in duration-1000">
             <button 
               onClick={() => setStep(1)}
               className="px-12 py-4 border-2 border-white/50 bg-black/50 text-white hover:bg-white hover:text-black transition-all tracking-[0.5em] uppercase text-sm font-bold animate-pulse"
             >
               进入游戏
             </button>
          </div>
        )}

        {step === 1 && (
          <div className="w-full max-w-lg space-y-6 relative">
            <h2 className="text-center text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8" style={{ color: horrorLevel > 0.5 ? '#800' : '#fff', ...getJitterStyle(horrorLevel, 1.5) }}>
              {horrorLevel > 0.8 ? "RUN AWAY" : "Identity Override"}
            </h2>
            <div className="space-y-6 p-6 transition-all duration-300" style={{ background: `rgba(0, 0, 0, ${0.5 + horrorLevel * 0.3})`, border: '1px solid rgba(255,255,255,0.1)', ...getJitterStyle(horrorLevel) }}>
                <GlitchInput label="告诉我你的名字，虽然即将没用了，但是还是象征性的问下你吧" value={formData.codeName} onChange={(v: string) => setFormData({...formData, codeName: v})} horrorLevel={horrorLevel} jitterStyle={getJitterStyle(horrorLevel, 0.8)} />
                <div className="space-y-2" style={getJitterStyle(horrorLevel, 0.9)}>
                    <label className={`text-xs uppercase tracking-widest ${horrorLevel > 0.5 ? 'text-red-500' : 'text-gray-500'}`}>告诉我你想成为…</label>
                    <div className="flex gap-2">
                        {['男', '女', '其他'].map(g => (
                            <button key={g} onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-3 text-xs border transition-all ${formData.gender === g ? 'bg-white text-black border-white' : 'border-white/20 text-gray-500'}`}>{g}</button>
                        ))}
                    </div>
                </div>
                <GlitchInput 
                  label="告诉我你要去哪里完成救赎" 
                  placeholder="选择你即将前往的世界背景，寂静岭？怪奇物语？中世纪魔幻？古代权谋？武侠修仙？…" 
                  value={formData.anchor} 
                  onChange={(v: string) => setFormData({...formData, anchor: v})} 
                  horrorLevel={horrorLevel} 
                  jitterStyle={getJitterStyle(horrorLevel, 0.7)} 
                />
                <GlitchInput 
                  label="其他需求？你写吧，反正我也不一定会满足你" 
                  placeholder="对你即将前往的世界的任何愿望，包括但不限于你对于新身份的期望？世界背景补充？…" 
                  value={formData.extra} 
                  onChange={(v: string) => setFormData({...formData, extra: v})} 
                  horrorLevel={horrorLevel} 
                  isArea 
                  jitterStyle={getJitterStyle(horrorLevel, 1.1)} 
                />
            </div>
            <button onClick={() => setStep(2)} disabled={horrorLevel < 0.75} className="w-full py-4 text-xl font-black uppercase tracking-[0.5em] transition-all" style={{ background: horrorLevel > 0.8 ? '#500' : '#fff', color: horrorLevel > 0.8 ? '#f00' : '#000', opacity: horrorLevel < 0.75 ? 0.3 : 1, ...getHeartbeatStyle(horrorLevel) }}>
                {horrorLevel === 1 ? "RUNNN!!!!" : "等待同步..."}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-2xl h-[80vh] flex flex-col items-start p-6 md:p-10 font-mono">
             <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 w-full">
                {displayedBriefingLines.map((line, i) => {
                  // 防御性检查，确保 line 存在且为字符串
                  const safeLine = (line || '').toString();
                  const isSpecial = safeLine.startsWith('主线') || safeLine.startsWith('每日') || safeLine.startsWith('规则');
                  
                  return (
                    <p key={i} className={`text-base md:text-xl leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,1)] ${isSpecial ? 'text-red-500 font-bold' : 'text-gray-100'} animate-in fade-in slide-in-from-left-2 duration-300`}>
                      {safeLine.trim() === '' ? '\u00A0' : safeLine}
                    </p>
                  );
                })}
                <div ref={briefingEndRef} className="h-20" />
             </div>
             
             {briefingComplete && (
               <div className="w-full pt-8 flex justify-center animate-in fade-in zoom-in duration-1000">
                  <button 
                    onClick={() => onComplete(formData)}
                    className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-[0_0_25px_rgba(255,255,255,0.5)] border-2 border-transparent hover:border-white"
                  >
                    接受协议
                  </button>
               </div>
             )}
          </div>
        )}
        
        <button onClick={onClose} className="absolute top-4 right-4 opacity-30 hover:opacity-100 z-[60]"><X /></button>
      </div>

      {step === 2 && isZooming && (
          <div className="absolute inset-0 z-[200] overflow-hidden pointer-events-none">
              {bloodTexts.map(bt => (
                  <div key={bt.id} style={bt.style}>
                      {bt.text}
                  </div>
              ))}
          </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes screen-shake {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-4px, 4px) rotate(-1deg); }
          50% { transform: translate(4px, -4px) rotate(1deg); }
          75% { transform: translate(-4px, -4px) rotate(-1deg); }
          100% { transform: translate(4px, 4px) rotate(1deg); }
        }
        @keyframes jitter {
          0% { transform: translate(0, 0); }
          33% { transform: translate(2px, -2px); }
          66% { transform: translate(-2px, 2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.1); }
          30% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        @keyframes narrative-line {
          0% { opacity: 0; transform: translateY(10px); filter: blur(5px); }
          20% { opacity: 1; transform: translateY(0); filter: blur(0); }
          80% { opacity: 1; transform: translateY(0); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-10px); filter: blur(5px); }
        }
        .animate-narrative-line {
          animation: narrative-line 1.8s forwards ease-in-out;
        }
      `}</style>
    </div>
  );
};

const GlitchInput = ({ label, value, onChange, horrorLevel, isArea, jitterStyle, placeholder }: any) => {
    const inputStyle = {
        borderColor: horrorLevel > 0.5 ? `rgba(150, 0, 0, 0.5)` : 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: horrorLevel > 0.5 ? '#f88' : '#fff'
    };

    return (
        <div className="space-y-2" style={jitterStyle}>
            <label className={`text-xs uppercase tracking-widest ${horrorLevel > 0.5 ? 'text-red-500' : 'text-gray-500'}`}>{label}</label>
            {isArea ? (
                <textarea 
                  value={value} 
                  onChange={e => onChange(e.target.value)} 
                  placeholder={placeholder}
                  className="w-full p-3 bg-black/50 border outline-none font-serif h-24 resize-none text-sm placeholder:text-gray-700" 
                  style={inputStyle} 
                />
            ) : (
                <input 
                  type="text" 
                  value={value} 
                  onChange={e => onChange(e.target.value)} 
                  placeholder={placeholder}
                  className="w-full p-3 bg-black/50 border outline-none font-serif text-sm placeholder:text-gray-700" 
                  style={inputStyle} 
                />
            )}
        </div>
    );
};
