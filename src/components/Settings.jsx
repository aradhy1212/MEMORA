import React from 'react';
import { 
  Settings as SettingsIcon, 
  Brain, 
  Lock, 
  RotateCcw, 
  Download, 
  Server
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const Settings = () => {
  const { settings, setSettings, exportMemoryJson, resetMemoryData } = useMemory();

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8f5]/60 dark:bg-[#0e0e12] overflow-hidden">
      {/* Header */}
      <div className="h-14 px-6 border-b border-orange-200/50 dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-[#121217]/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
              System Settings & Memory Governance
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Configure automated conflict resolution, provenance visibility and account sandboxing
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* User Profile Card in Warm Orange Gradient */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-orange-500/25">
                RS
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-white">Rahul Sharma</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  Student Account · VIT Chennai (CSE) · ID: user_rahul_01
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-500/30">
                    Episodic Memory Tier: Pro Hackathon
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    12 Facts Indexed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Memory Engine Configuration */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/5 pb-3">
              <Brain className="w-5 h-5 text-orange-500" />
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">Memory Lifecycle Rules</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block text-sm">
                    Enable Persistent Long-Term Memory
                  </span>
                  <p className="text-stone-500 dark:text-stone-400">
                    Retain facts, preferences, and stack decisions across all separate conversation threads.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('enableLongTermMemory')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.enableLongTermMemory ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.enableLongTermMemory ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block text-sm">
                    Automatically Update Conflicting Memories
                  </span>
                  <p className="text-stone-500 dark:text-stone-400">
                    When you state a change (e.g. MongoDB ➔ PostgreSQL), automatically supersede older records.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('autoUpdateConflicts')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.autoUpdateConflicts ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.autoUpdateConflicts ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block text-sm">
                    Show Memory Sources & Provenance
                  </span>
                  <p className="text-stone-500 dark:text-stone-400">
                    Tag memory cards and graph nodes with the originating conversation name and timestamp.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('showSources')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.showSources ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.showSources ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block text-sm">
                    Show "Why did I say this?" Explanations
                  </span>
                  <p className="text-stone-500 dark:text-stone-400">
                    Expose the exact memory ID, status, and confidence score under AI generated answers.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('showExplanations')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.showExplanations ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.showExplanations ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/5 pb-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">Privacy & Account Sandboxing</h3>
            </div>

            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-xs text-stone-700 dark:text-stone-300 leading-relaxed space-y-1">
              <p className="font-bold text-orange-600 dark:text-orange-400">
                ✓ Your memories belong exclusively to you.
              </p>
              <p>
                All episodic facts, graph relations, and historical records are isolated per account and never shared with other tenants or used to train public models.
              </p>
            </div>
          </div>

          {/* Data Export & Reset */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-orange-100 dark:border-white/5 pb-3">
              <Server className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">Data Portability & Simulation Tools</h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportMemoryJson}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Memories (JSON)</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Reset simulation to default initial state?")) {
                    resetMemoryData();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Hackathon Demo State</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
