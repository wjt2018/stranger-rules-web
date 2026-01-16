import React from 'react';
import { X } from 'lucide-react';
import { ModuleType } from '../types';

interface ModuleContainerProps {
  type: ModuleType | null;
  onClose: () => void;
  children: React.ReactNode;
}

const MODULE_TITLES: Record<ModuleType, string> = {
  [ModuleType.TERMINAL]: '终端',
  [ModuleType.CHARACTER]: '角色档案',
  [ModuleType.QUESTS]: '行动日志',
  [ModuleType.INVENTORY]: '物品清单',
  [ModuleType.RULES]: '生存协议',
  [ModuleType.SHOP]: '补给商店',
  [ModuleType.SOCIAL_LINK]: '社会羁绊',
  [ModuleType.SETTINGS]: '系统设置',
};

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ type, onClose, children }) => {
  if (!type) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-full max-h-[90dvh] bg-black border-2 border-white relative shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-2 border-b-2 border-white bg-white text-black select-none shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-black"></div>
            <span className="font-bold font-mono text-lg tracking-wider">{MODULE_TITLES[type]}.EXE</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Fixed Scrollable */}
        <div className="flex-1 overflow-y-auto relative scrollbar-thin">
           {children}
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 p-2 pointer-events-none">
            <div className="w-4 h-4 border-b-2 border-r-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};