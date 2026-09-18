import React, { useState } from 'react';
import { 
  Database, 
  ArrowRightLeft, 
  HelpCircle, 
  History, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const DemoToolbar = () => {
  const { runDemoStep, activeView } = useMemory();
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  if (activeView !== 'chat') return null;

  const handleStep = (num) => {
    setActiveStep(num);
    runDemoStep(num);
  };

  const steps = [
    { num: 1, label: "1. Create Mongo", desc: "My project uses MongoDB", icon: Database, color: "text-orange-400" },
    { num: 2, label: "2. Switch Postgres", desc: "Migrate DB to PostgreSQL", icon: ArrowRightLeft, color: "text-amber-400" },
    { num: 3, label: "3. Current DB?", desc: "Which DB am I using?", icon: HelpCircle, color: "text-emerald-400" },
    { num: 4, label: "4. Past DB?", desc: "What DB did I use before?", icon: History, color: "text-rose-400" },
  ];

  return (
    <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-8 z-20 select-none">
      <div className="p-2 rounded-2xl bg-[#0f0f14]/95 backdrop-blur-xl border border-orange-500/35 shadow-2xl shadow-orange-950/50 text-white max-w-md animate-slide-up">
        {/* Header strip */}
        <div className="flex items-center justify-between px-2 pb-1.5 border-b border-orange-500/20 gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-wider text-orange-400 uppercase">
              Hackathon Demo Quick Runner
            </span>
          </div>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Action Steps */}
        {!isMinimized && (
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isSelected = activeStep === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => handleStep(s.num)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all text-xs font-semibold border ${
                    isSelected
                      ? 'bg-orange-500/25 border-orange-500/60 text-white shadow-md'
                      : 'bg-white/5 border-white/5 hover:border-orange-500/40 text-stone-200 hover:bg-white/10'
                  }`}
                  title={s.desc}
                >
                  <Icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                  <div className="min-w-0">
                    <span className="block truncate font-bold text-[11px]">{s.label}</span>
                    <span className="block text-[9px] text-stone-400 truncate">{s.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
