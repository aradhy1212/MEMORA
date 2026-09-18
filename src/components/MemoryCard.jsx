import React from 'react';
import { 
  Database, 
  Code, 
  GraduationCap, 
  Layers, 
  Sparkles
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { MEMORY_STATUSES, MEMORY_CATEGORIES } from '../data/mockMemories';

export const MemoryCard = ({ memory }) => {
  const { setSelectedMemory } = useMemory();
  const statusMeta = MEMORY_STATUSES[memory.status] || MEMORY_STATUSES.CURRENT;
  const categoryMeta = MEMORY_CATEGORIES.find(c => c.id === memory.category) || {
    label: memory.category,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25"
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'DATABASE': return <Database className="w-3.5 h-3.5 text-orange-500" />;
      case 'LANGUAGE': return <Code className="w-3.5 h-3.5 text-amber-500" />;
      case 'PROFILE': return <GraduationCap className="w-3.5 h-3.5 text-orange-600" />;
      case 'PROJECT': return <Layers className="w-3.5 h-3.5 text-amber-600" />;
      case 'EVENT': return <Sparkles className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Database className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div
      onClick={() => setSelectedMemory(memory)}
      className="group relative p-3.5 rounded-2xl bg-[#fffdfa] dark:bg-[#16161d] hover:bg-[#f4ede0] dark:hover:bg-[#1d1d27] border border-[#e8dccb] dark:border-white/10 hover:border-orange-400 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md dark:hover:shadow-orange-950/20"
    >
      {/* Top row: Category Badge & Memory ID */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {getCategoryIcon(memory.category)}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${categoryMeta.bg || 'bg-[#f4ede0] dark:bg-white/5'} ${categoryMeta.color || 'text-stone-500'} border ${categoryMeta.border || 'border-transparent'}`}>
            {categoryMeta.label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors font-medium">
          #{memory.id}
        </span>
      </div>

      {/* Main Subject & Value */}
      <div className="space-y-0.5 mb-2.5">
        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          {memory.subject}
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
            {memory.value}
          </h4>
          <span className="text-[10px] font-mono text-stone-400 shrink-0 font-medium">
            {Math.round(memory.confidence * 100)}% conf
          </span>
        </div>
      </div>

      {/* Attribute descriptor */}
      <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium pb-2 mb-2 border-b border-[#ebdcc9] dark:border-white/5">
        <span className="text-stone-400">Attribute:</span> {memory.attribute}
      </div>

      {/* Bottom row: Status badge & supersedes link */}
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusMeta.dotColor}`}></span>
          <span className={`font-bold uppercase text-[10px] ${statusMeta.textColor}`}>
            {statusMeta.label}
          </span>
        </div>

        {memory.supersedes && (
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-semibold bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
            supersedes #{memory.supersedes}
          </span>
        )}

        {memory.supersededBy && (
          <span className="text-[10px] text-rose-600 dark:text-rose-300 font-mono font-semibold bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/25">
            superseded by #{memory.supersededBy}
          </span>
        )}
      </div>
    </div>
  );
};
