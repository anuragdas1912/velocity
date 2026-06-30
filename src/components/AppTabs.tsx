import React from 'react';
import { Cpu, ArrowLeftRight, Target } from 'lucide-react';

interface AppTabsProps {
  activeTab: 'dashboard' | 'quantum' | 'target';
  setActiveTab: (tab: 'dashboard' | 'quantum' | 'target') => void;
}

export const AppTabs: React.FC<AppTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tab-bar">
      <button 
        onClick={() => setActiveTab('dashboard')} 
        className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 ${
          activeTab === 'dashboard' ? 'text-teal-400' : 'text-zinc-500'
        }`}
      >
        <Cpu size={20} className={`mb-1 transition-transform duration-300 ${activeTab === 'dashboard' ? 'scale-110 filter drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]' : 'scale-100'}`} />
        <span className="text-[9px] font-bold tracking-widest uppercase font-outfit">Matrix</span>
      </button>

      <button 
        onClick={() => setActiveTab('quantum')} 
        className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 ${
          activeTab === 'quantum' ? 'text-teal-400' : 'text-zinc-500'
        }`}
      >
        <ArrowLeftRight size={20} className={`mb-1 transition-transform duration-300 ${activeTab === 'quantum' ? 'scale-110 filter drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]' : 'scale-100'}`} />
        <span className="text-[9px] font-bold tracking-widest uppercase font-outfit">Quantum</span>
      </button>

      <button 
        onClick={() => setActiveTab('target')} 
        className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 ${
          activeTab === 'target' ? 'text-teal-400' : 'text-zinc-500'
        }`}
      >
        <Target size={20} className={`mb-1 transition-transform duration-300 ${activeTab === 'target' ? 'scale-110 filter drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]' : 'scale-100'}`} />
        <span className="text-[9px] font-bold tracking-widest uppercase font-outfit">Target</span>
      </button>
    </div>
  );
};
