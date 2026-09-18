import React from 'react';
import { Sparkles, ArrowDown, Database, CheckCircle2, History, ExternalLink } from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const MemoryUpdateCard = ({ event }) => {
  const { setSelectedMemory, memories } = useMemory();

  if (!event) return null;

  const isUpdated = event.type === 'UPDATED';
  const targetMemory = memories.find(m => m.id === event.memoryId) || {
    id: event.memoryId,
    category: event.category,
    subject: 'Travel Helper',
    attribute: event.attribute,
    value: event.newValue || event.value,
    status: 'CURRENT',
    confidence: event.confidence || 0.96
  };

  return (
    <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#1c1412] via-[#1a1820] to-[#16161d] border border-orange-500/35 text-white shadow-xl shadow-orange-950/30 max-w-xl animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-tight text-orange-300">
              {isUpdated ? '⚡ MEMORY EVOLUTION TRIGGERED' : '🧠 NEW LONG-TERM MEMORY STORED'}
            </span>
            <p className="text-[10px] text-stone-400 font-medium">
              {event.attribute} · {event.category}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedMemory(targetMemory)}
          className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 hover:underline"
        >
          <span>Inspect Telemetry</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Evolution Flow */}
      {isUpdated ? (
        <div className="space-y-2 bg-[#0e0e12]/90 rounded-xl p-3 border border-orange-500/15 font-mono text-xs">
          {/* Previous Value */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-[10px] text-rose-300 uppercase tracking-wider block font-sans font-bold">Previous Value</span>
                <span className="font-semibold text-rose-200">{event.previousValue}</span>
              </div>
            </div>
            <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              ● SUPERSEDED
            </span>
          </div>

          {/* Transition Arrow */}
          <div className="flex items-center justify-center py-0.5 text-stone-500">
            <div className="flex items-center gap-2">
              <span className="h-px w-12 bg-orange-500/20"></span>
              <ArrowDown className="w-4 h-4 text-orange-400 animate-bounce" />
              <span className="h-px w-12 bg-orange-500/20"></span>
            </div>
          </div>

          {/* New Current Value */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/15 border border-orange-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[10px] text-orange-300 uppercase tracking-wider block font-sans font-bold">Current Value</span>
                <span className="font-bold text-orange-200">{event.newValue}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-orange-300/80 font-sans font-medium">Confidence: {Math.round((event.confidence || 0.96) * 100)}%</span>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-orange-500/25 text-orange-300 border border-orange-500/40">
                ● CURRENT
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-orange-400" />
            <div>
              <span className="text-[10px] text-stone-400 font-sans uppercase font-bold">Captured Fact</span>
              <p className="font-semibold text-orange-200">{event.attribute}: <span className="text-white font-bold">{event.value}</span></p>
            </div>
          </div>
          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
            ● CURRENT (92%)
          </span>
        </div>
      )}
    </div>
  );
};
