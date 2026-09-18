import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Brain, 
  TrendingUp, 
  CheckCircle2, 
  History, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  RotateCcw, 
  Activity 
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { apiService } from '../services/apiService';

export const Dashboard = () => {
  const { 
    memories, 
    setActiveView, 
    setSelectedMemory, 
    exportMemoryJson, 
    resetMemoryData 
  } = useMemory();

  const [backendStats, setBackendStats] = useState(null);
  const [backendChanges, setBackendChanges] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, changes] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getDashboardRecentChanges()
        ]);
        if (stats) setBackendStats(stats);
        if (changes) setBackendChanges(changes);
      } catch {
        // use local memory calculations
      }
    };
    fetchDashboardData();
  }, [memories]);

  const currentCount = backendStats ? backendStats.active_memories : memories.filter(m => m.status === 'CURRENT').length;
  const supersededCount = backendStats ? backendStats.updated_memories : memories.filter(m => m.status === 'SUPERSEDED').length;
  const historicalCount = backendStats ? backendStats.historical_memories : memories.filter(m => m.status === 'HISTORICAL').length;
  const temporaryCount = backendStats ? backendStats.temporary_memories : memories.filter(m => m.status === 'TEMPORARY').length;
  const avgConfidence = backendStats ? backendStats.mean_confidence : Math.round(
    (memories.reduce((acc, m) => acc + (m.confidence || 0.95), 0) / (memories.length || 1)) * 100
  );

  const recentMutations = backendChanges.length > 0 ? backendChanges : [
    {
      subject: "Database Migration",
      category: "DATABASE",
      from: "MongoDB",
      to: "PostgreSQL",
      status: "SUPERSEDED",
      time: "Today, 10:14 AM",
      memoryId: "M003"
    },
    {
      subject: "Primary Language",
      category: "LANGUAGE",
      from: "Java",
      to: "Python",
      status: "CURRENT",
      time: "Yesterday",
      memoryId: "M001"
    },
    {
      subject: "Project Phase",
      category: "PROJECT",
      from: "Planning & Design",
      to: "Active Development",
      status: "CURRENT",
      time: "Sep 16",
      memoryId: "M004"
    }
  ];

  const activityData = [
    { day: "Mon", count: 4, height: "45%" },
    { day: "Tue", count: 7, height: "70%" },
    { day: "Wed", count: 3, height: "35%" },
    { day: "Thu", count: 9, height: "90%" },
    { day: "Fri", count: 12, height: "100%" },
    { day: "Sat", count: 6, height: "60%" },
    { day: "Sun", count: 8, height: "80%" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8f5]/60 dark:bg-[#0e0e12] overflow-hidden">
      {/* Header */}
      <div className="h-14 px-6 border-b border-orange-200/50 dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-[#121217]/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
              MEMORA Analytics & Health Dashboard
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Real-time monitoring of episodic memory retention, mutation rate and confidence metrics
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportMemoryJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-[#181820] hover:bg-orange-100 dark:hover:bg-white/10 text-xs font-semibold text-stone-700 dark:text-stone-200 border border-orange-200/80 dark:border-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button
            onClick={() => {
              if (confirm("Reset simulation to default initial memories and conversations?")) {
                resetMemoryData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#181820] hover:bg-rose-500/10 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-rose-500 border border-stone-200 dark:border-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset State</span>
          </button>
        </div>
      </div>

      {/* Scrollable Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Memories</span>
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900 dark:text-white">{currentCount}</span>
                <span className="text-xs font-bold text-orange-500">Live in Reasoning</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-orange-100 dark:bg-black/40 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Updated / Superseded</span>
                <History className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900 dark:text-white">{supersededCount}</span>
                <span className="text-xs font-bold text-amber-500">Resolved Conflicts</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-stone-100 dark:bg-black/40 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Historical Context</span>
                <Clock className="w-4 h-4 text-stone-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900 dark:text-white">{historicalCount}</span>
                <span className="text-xs font-bold text-stone-500">Past Knowledge</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-stone-100 dark:bg-black/40 overflow-hidden">
                <div className="h-full bg-stone-400 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-stone-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Temporary Context</span>
                <Sparkles className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900 dark:text-white">{temporaryCount}</span>
                <span className="text-xs font-bold text-rose-500">24h Ephemeral</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-stone-100 dark:bg-black/40 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          {/* Charts & Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Activity Chart */}
            <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Episodic Memory Activity & Ingestion
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Weekly rate of verified facts extracted and stored across conversations
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-300 bg-orange-500/15 px-2.5 py-1 rounded-full border border-orange-500/30">
                  +34% this week
                </span>
              </div>

              {/* Bar Chart Visualizer with Warm Gradient Bars */}
              <div className="pt-6 pb-2">
                <div className="flex items-end justify-between gap-3 h-44 px-2">
                  {activityData.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {item.count} facts
                      </span>
                      <div 
                        className="w-full max-w-[40px] bg-gradient-to-t from-orange-500 via-amber-500 to-rose-400 group-hover:from-orange-400 group-hover:to-amber-400 rounded-t-xl transition-all duration-300 shadow-md shadow-orange-500/20"
                        style={{ height: item.height }}
                      />
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 mt-1">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health & Confidence Gauge */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  Reasoning Quality & Confidence
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Mean verification score across active memory nodes
                </p>
              </div>

              <div className="py-4 text-center">
                <div className="inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-rose-500/15 border-2 border-orange-500/35">
                  <div className="text-center">
                    <span className="text-4xl font-black text-stone-900 dark:text-white font-mono">{avgConfidence}%</span>
                    <span className="block text-[11px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mt-1">High Fidelity</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Conflict Auto-Resolution</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">Enabled</span>
                </div>
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Provenance Auditing</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">100% Traceable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Memory Evolutions Section */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#16161d] border border-orange-200/60 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Recent Memory Changes & Evolutions
              </h3>
              <button
                onClick={() => setActiveView('timeline')}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1"
              >
                <span>Full Audit Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentMutations.map((mut, idx) => {
                const targetMem = memories.find(m => m.id === mut.memoryId);
                return (
                  <div
                    key={idx}
                    onClick={() => targetMem && setSelectedMemory(targetMem)}
                    className="p-4 rounded-2xl bg-orange-50/30 dark:bg-[#0c0c10] border border-orange-200/60 dark:border-white/5 hover:border-orange-500/40 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-300 border border-orange-500/25">
                        {mut.category || 'DATABASE'}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{mut.time}</span>
                    </div>

                    <h4 className="font-bold text-xs text-stone-900 dark:text-white">{mut.subject}</h4>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-rose-400 line-through truncate">{mut.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="text-orange-600 dark:text-orange-400 font-bold truncate">{mut.to}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
