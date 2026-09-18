import React, { useState } from 'react';
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  History, 
  ExternalLink,
  FileText
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const MemoryEvidence = ({ evidence }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedMemory, memories } = useMemory();

  if (!evidence) return null;

  const targetMemory = memories.find(m => m.id === evidence.memoryUsedId) || {
    id: evidence.memoryUsedId,
    subject: evidence.memorySubject || 'Context Memory',
    attribute: evidence.attribute || 'Attribute',
    value: evidence.value,
    status: evidence.status || 'CURRENT',
    confidence: parseFloat(evidence.confidence) / 100 || 0.96,
    sourceConversation: evidence.source,
    supersedes: evidence.previousMemory ? 'M002' : null
  };

  return (
    <div className="mt-2 text-xs select-none">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-orange-600 dark:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 transition-all font-semibold"
      >
        <Brain className="w-3.5 h-3.5 animate-pulse-slow text-orange-500" />
        <span>Why did I say this?</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expanded Explainability Panel */}
      {isOpen && (
        <div className="mt-2 p-3.5 rounded-2xl bg-white dark:bg-[#15151c] border border-orange-200/80 dark:border-orange-500/25 shadow-lg dark:shadow-orange-950/20 max-w-lg space-y-3 animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/5 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Explainability & Provenance Telemetry
              </span>
            </div>
            <button
              onClick={() => setSelectedMemory(targetMemory)}
              className="text-[11px] text-orange-500 hover:text-orange-400 flex items-center gap-1 font-semibold"
            >
              <span>Full Record</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Key-Value Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-[#1a1a24] border border-orange-200/60 dark:border-white/5">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-bold">
                Memory Node Used
              </span>
              <span className="font-mono font-extrabold text-orange-600 dark:text-orange-400 text-xs">
                #{evidence.memoryUsedId}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-[#1a1a24] border border-orange-200/60 dark:border-white/5">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-bold">
                Status & Confidence
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">
                  {evidence.status || 'CURRENT'} ({evidence.confidence})
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-[#1a1a24] border border-orange-200/60 dark:border-white/5 col-span-2">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-bold">
                Extracted Fact / Value
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100 font-mono text-xs">
                {evidence.attribute ? `${evidence.attribute} = ` : ''}{evidence.value}
              </span>
            </div>

            {evidence.previousMemory && (
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-rose-400" />
                  <div>
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-bold">
                      Previous Superseded Memory
                    </span>
                    <span className="font-mono text-rose-300 font-semibold">
                      {evidence.previousMemory}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-[#1a1a24] border border-orange-200/60 dark:border-white/5 col-span-2">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-bold">
                Source Provenance
              </span>
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-200 mt-0.5 font-medium">
                <FileText className="w-3 h-3 text-amber-500" />
                <span className="truncate">{evidence.source}</span>
              </div>
            </div>

            {evidence.reason && (
              <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-[#1a1a24] border border-orange-200/60 dark:border-white/5 col-span-2">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-bold">
                  Inference Rationale
                </span>
                <p className="text-stone-700 dark:text-stone-300 mt-0.5 leading-relaxed">
                  {evidence.reason}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
