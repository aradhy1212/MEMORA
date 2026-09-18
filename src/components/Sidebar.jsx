import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Network, 
  Clock, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  MoreVertical, 
  Pin, 
  Trash2, 
  Edit3, 
  GraduationCap, 
  X,
  Database,
  ArrowRightLeft,
  HelpCircle,
  History as HistoryIcon
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const Sidebar = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    activeView, 
    setActiveView, 
    createNewChat, 
    renameConversation, 
    deleteConversation, 
    togglePinConversation,
    setIsSearchOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    runDemoStep,
  } = useMemory();

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id) => {
    renameConversation(id, editTitle);
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:static top-0 bottom-0 left-0 w-72 bg-[#faf6ef] dark:bg-[#0f0f14] border-r border-[#e8dccb] dark:border-white/10 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Top Header */}
        <div className="p-4 border-b border-[#e8dccb] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
              <span className="font-extrabold text-sm">M</span>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-stone-900 dark:text-white">MEMORA AI</h1>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">Persistent Episodic Memory</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-[#ede3d2] dark:hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              createNewChat();
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-400 hover:via-amber-400 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Primary Navigation Links */}
        <div className="px-3 py-1 space-y-0.5">
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#f2e9dc] dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-orange-500" />
              <span>Search Memory</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono bg-[#ede3d2] dark:bg-white/5 px-1.5 py-0.5 rounded">⌘K</span>
          </button>

          <button
            onClick={() => {
              setActiveView('graph');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'graph'
                ? 'bg-[#ede3d2] text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 border border-orange-500/30'
                : 'text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#f2e9dc] dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Network className="w-4 h-4 text-amber-500" />
              <span>Memory Graph</span>
            </div>
            <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">Relational</span>
          </button>

          <button
            onClick={() => {
              setActiveView('timeline');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'timeline'
                ? 'bg-[#ede3d2] text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 border border-orange-500/30'
                : 'text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#f2e9dc] dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Memory Timeline</span>
            </div>
            <span className="text-[10px] text-stone-500">Audit</span>
          </button>

          <button
            onClick={() => {
              setActiveView('dashboard');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'dashboard'
                ? 'bg-[#ede3d2] text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 border border-orange-500/30'
                : 'text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#f2e9dc] dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              <span>Dashboard & Analytics</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveView('settings');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'settings'
                ? 'bg-[#ede3d2] text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 border border-orange-500/30'
                : 'text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#f2e9dc] dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SettingsIcon className="w-4 h-4 text-stone-500" />
              <span>Settings & Privacy</span>
            </div>
          </button>
        </div>

        {/* Quick Test Actions in Creamy Card */}
        <div className="mx-3 my-2 p-2.5 rounded-2xl bg-[#f3ecd9] dark:bg-[#181822] border border-[#e8dccb] dark:border-orange-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
              Quick Memory Actions
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => runDemoStep(1)}
              className="px-2 py-1.5 rounded-xl bg-[#fffdfa] dark:bg-[#121217] border border-[#e8dccb] dark:border-white/5 hover:border-orange-400 text-[11px] text-left font-semibold text-stone-700 dark:text-stone-200 hover:text-orange-600 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Set MongoDB memory"
            >
              <Database className="w-3 h-3 text-orange-500 shrink-0" />
              <span className="truncate">Set Mongo</span>
            </button>

            <button
              onClick={() => runDemoStep(2)}
              className="px-2 py-1.5 rounded-xl bg-[#fffdfa] dark:bg-[#121217] border border-[#e8dccb] dark:border-white/5 hover:border-amber-400 text-[11px] text-left font-semibold text-stone-700 dark:text-stone-200 hover:text-amber-600 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Switch to Postgres & Supersede"
            >
              <ArrowRightLeft className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">Switch PG</span>
            </button>

            <button
              onClick={() => runDemoStep(3)}
              className="px-2 py-1.5 rounded-xl bg-[#fffdfa] dark:bg-[#121217] border border-[#e8dccb] dark:border-white/5 hover:border-emerald-400 text-[11px] text-left font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Query active database"
            >
              <HelpCircle className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">Query DB</span>
            </button>

            <button
              onClick={() => runDemoStep(4)}
              className="px-2 py-1.5 rounded-xl bg-[#fffdfa] dark:bg-[#121217] border border-[#e8dccb] dark:border-white/5 hover:border-rose-400 text-[11px] text-left font-semibold text-stone-700 dark:text-stone-200 hover:text-rose-600 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Query historical memory"
            >
              <HistoryIcon className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="truncate">Past DB</span>
            </button>
          </div>
        </div>

        {/* Recent Conversations List Header */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Recent Conversations
          </span>
          <span className="text-[11px] text-orange-600 font-mono font-bold">
            {conversations.length}
          </span>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {conversations.map((conv) => {
            const isActive = activeConversationId === conv.id && activeView === 'chat';
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setActiveView('chat');
                  setIsSidebarOpen(false);
                }}
                className={`group relative rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ede3d2] text-orange-800 dark:bg-orange-500/15 dark:text-orange-300 font-semibold border border-orange-400/40'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-[#f2e9dc] dark:hover:bg-white/5 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-600' : 'text-stone-400'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(conv.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#fffdfa] dark:bg-black/50 border border-orange-500 rounded px-1.5 py-0.5 text-xs text-stone-900 dark:text-white outline-none w-full"
                      />
                    ) : (
                      <span className="truncate font-semibold text-stone-800 dark:text-stone-200">
                        {conv.title}
                      </span>
                    )}
                  </div>

                  {/* Pin badge or Menu */}
                  <div className="flex items-center gap-1 shrink-0">
                    {conv.pinned && <Pin className="w-3 h-3 text-orange-500 rotate-45" />}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#ede3d2] dark:hover:bg-white/10 rounded transition-opacity"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-stone-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 mt-1 pl-5.5">
                  <span className="truncate max-w-[130px]">{conv.preview}</span>
                  <span className="shrink-0">{conv.timeAgo}</span>
                </div>

                {/* Dropdown 3-dot Menu */}
                {activeMenuId === conv.id && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-8 w-36 bg-[#fffdfa] dark:bg-[#1c1c26] border border-[#e8dccb] dark:border-white/10 rounded-2xl shadow-xl p-1 z-30 space-y-0.5"
                  >
                    <button
                      onClick={(e) => handleStartRename(conv, e)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-stone-700 dark:text-stone-200 hover:bg-[#f2e9dc] dark:hover:bg-white/5 font-medium"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={() => {
                        togglePinConversation(conv.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-stone-700 dark:text-stone-200 hover:bg-[#f2e9dc] dark:hover:bg-white/5 font-medium"
                    >
                      <Pin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{conv.pinned ? 'Unpin' : 'Pin to top'}</span>
                    </button>
                    <button
                      onClick={() => {
                        deleteConversation(conv.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-500/10 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-[#e8dccb] dark:border-white/10 bg-[#f4ede0]/80 dark:bg-[#0a0a0e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-orange-500/20">
                  RS
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 border-2 border-white dark:border-[#0c1017] rounded-full"></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs text-stone-900 dark:text-white truncate">Rahul Sharma</span>
                </div>
                <p className="text-[10px] text-stone-600 dark:text-stone-400 truncate flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-orange-500" /> VIT Chennai · CSE
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveView('settings');
                setIsSidebarOpen(false);
              }}
              className="p-1.5 rounded-lg text-stone-500 hover:text-orange-600 dark:hover:text-orange-300 hover:bg-[#ede3d2] dark:hover:bg-white/5 transition-colors"
              title="Memory settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
