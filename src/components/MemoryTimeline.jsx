import React from 'react';
import { 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Database, 
  Code, 
  Layers, 
  History, 
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { MEMORY_STATUSES } from '../data/mockMemories';

export const MemoryTimeline = () => {
  const { memories, setSelectedMemory } = useMemory();

  const timelineGroups = [
    {
      period: "Today (Sep 18, 2026)",
      events: [
        {
          id: "EV-001",
          type: "SUPERSEDED",
          category: "DATABASE",
          title: "Primary Database Migrated",
          subject: "Travel Helper",
          change: "MongoDB → PostgreSQL",
          description: "Database switched to PostgreSQL for relational booking transactions and pgvector embeddings. Old fact M002 marked as SUPERSEDED.",
          memoryId: "M003",
          supersedesId: "M002",
          time: "10:14 AM",
          status: "CURRENT",
          dotColor: "bg-orange-500"
        },
        {
          id: "EV-002",
          type: "STATUS_UPDATE",
          category: "PROJECT",
          title: "Project Milestone Updated",
          subject: "Travel Helper",
          change: "Planning → Active Development",
          description: "Transitioned status of Travel Helper from initial wireframing to active core development sprint.",
          memoryId: "M004",
          time: "09:00 AM",
          status: "CURRENT",
          dotColor: "bg-amber-500"
        }
      ]
    },
    {
      period: "Yesterday (Sep 17, 2026)",
      events: [
        {
          id: "EV-003",
          type: "PREFERENCE_EVOLUTION",
          category: "LANGUAGE",
          title: "Language Preference Shift",
          subject: "User Profile",
          change: "Java → Python",
          description: "Switched primary language preference to Python for AI agent framework development and async FastAPIs.",
          memoryId: "M001",
          supersedesId: "M007",
          time: "02:20 PM",
          status: "CURRENT",
          dotColor: "bg-orange-400"
        },
        {
          id: "EV-004",
          type: "EVENT_ENROLL",
          category: "EVENT",
          title: "Hackathon Track Enrolled",
          subject: "HackClub Hackathon",
          change: "Persistent Memory Track",
          description: "Set 24h temporary context window for Hackathon submission deliverables.",
          memoryId: "M008",
          time: "06:00 PM",
          status: "TEMPORARY",
          dotColor: "bg-rose-500"
        }
      ]
    },
    {
      period: "Last Week (Sep 10 - Sep 16, 2026)",
      events: [
        {
          id: "EV-005",
          type: "TECH_STACK",
          category: "BACKEND",
          title: "Backend Framework Selected",
          subject: "Travel Helper",
          change: "Node.js (Express)",
          description: "Established Express.js server foundation for routing and API management.",
          memoryId: "M005",
          time: "Sep 12",
          status: "CURRENT",
          dotColor: "bg-amber-500"
        },
        {
          id: "EV-006",
          type: "TECH_STACK",
          category: "FRONTEND",
          title: "Frontend Stack Declared",
          subject: "Travel Helper",
          change: "React + Warm Tokens",
          description: "Configured React SPA frontend with custom warm aesthetic utility styling tokens.",
          memoryId: "M006",
          time: "Sep 12",
          status: "CURRENT",
          dotColor: "bg-orange-400"
        },
        {
          id: "EV-007",
          type: "INITIAL_DATABASE",
          category: "DATABASE",
          title: "Initial Document Store Declared",
          subject: "Travel Helper",
          change: "MongoDB",
          description: "Initial schema-less document storage configured for travel place prototypes.",
          memoryId: "M002",
          time: "Sep 10",
          status: "SUPERSEDED",
          dotColor: "bg-rose-500"
        }
      ]
    },
    {
      period: "Earlier (Academic Inception)",
      events: [
        {
          id: "EV-008",
          type: "HISTORICAL_PREF",
          category: "LANGUAGE",
          title: "Initial Academic Language",
          subject: "User Profile",
          change: "Java",
          description: "Initial programming coursework at VIT Chennai.",
          memoryId: "M007",
          time: "Aug 15",
          status: "HISTORICAL",
          dotColor: "bg-stone-500"
        },
        {
          id: "EV-009",
          type: "PROFILE_INIT",
          category: "PROFILE",
          title: "User Profile Initialized",
          subject: "Rahul Sharma",
          change: "VIT Chennai · CSE Undergrad",
          description: "Persistent persona grounding initialized in episodic knowledge base.",
          memoryId: "M009",
          time: "Aug 01",
          status: "CURRENT",
          dotColor: "bg-orange-600"
        }
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf8f5]/60 dark:bg-[#0e0e12] overflow-hidden">
      {/* Header */}
      <div className="h-14 px-6 border-b border-orange-200/50 dark:border-white/10 flex items-center justify-between bg-white/70 dark:bg-[#121217]/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
              Memory Evolution Timeline
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Audit log tracking memory creation, conflict resolution and superseding events over time
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {timelineGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              {/* Period Header */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {group.period}
                </h3>
                <div className="flex-1 h-px bg-orange-200/50 dark:bg-white/10 ml-2"></div>
              </div>

              {/* Vertical list of events */}
              <div className="relative pl-6 border-l-2 border-orange-200 dark:border-orange-500/20 space-y-4 ml-2">
                {group.events.map((ev) => {
                  const targetMem = memories.find(m => m.id === ev.memoryId);
                  const statusInfo = MEMORY_STATUSES[ev.status] || MEMORY_STATUSES.CURRENT;

                  return (
                    <div 
                      key={ev.id}
                      className="relative group p-4 rounded-2xl bg-white dark:bg-[#16161d] hover:bg-orange-50/50 dark:hover:bg-[#1c1c26] border border-orange-200/60 dark:border-white/10 hover:border-orange-400/50 transition-all shadow-sm"
                    >
                      {/* Left Dot Indicator */}
                      <span className={`absolute -left-[31px] top-5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0e0e12] ${ev.dotColor} shadow-md`}></span>

                      {/* Event Header */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-white">
                            {ev.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-50 dark:bg-white/5 text-stone-600 dark:text-stone-400 font-semibold">
                            #{ev.memoryId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusInfo.bgBadge}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono font-medium">
                            {ev.time}
                          </span>
                        </div>
                      </div>

                      {/* Mutation Diff in Warm Orange */}
                      <div className="p-2 rounded-xl bg-orange-50/60 dark:bg-[#0c0c10] border border-orange-200/60 dark:border-white/5 font-mono text-xs font-bold text-orange-700 dark:text-orange-300 my-2">
                        {ev.change}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                        {ev.description}
                      </p>

                      {/* Inspect Link */}
                      {targetMem && (
                        <div className="mt-3 pt-2 border-t border-orange-100 dark:border-white/5 flex items-center justify-end">
                          <button
                            onClick={() => setSelectedMemory(targetMem)}
                            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1"
                          >
                            <span>Inspect Memory Telemetry</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
