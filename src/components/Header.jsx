import React from 'react';
import { 
  Brain, 
  Search, 
  Sun, 
  Moon, 
  PanelRightClose, 
  PanelRightOpen, 
  Menu, 
  Network, 
  Clock, 
  LayoutDashboard, 
  MessageSquare, 
  Settings as SettingsIcon
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';

export const Header = () => {
  const { 
    theme, 
    toggleTheme, 
    activeView, 
    setActiveView, 
    activeMemoriesCount,
    isBackendConnected,
    isMemoryPanelOpen, 
    setIsMemoryPanelOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsSearchOpen,
  } = useMemory();

  const navItems = [
    { id: 'chat', label: 'Chat Studio', icon: MessageSquare },
    { id: 'graph', label: 'Memory Graph', icon: Network },
    { id: 'timeline', label: 'Memory Timeline', icon: Clock },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="h-14 border-b border-[#e8dccb] dark:border-orange-500/10 bg-[#fbf8f2]/95 dark:bg-[#121217]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-[#ede4d3] dark:hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={() => setActiveView('chat')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 p-[1.5px] shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-[#0e0e12] flex items-center justify-center">
              <Brain className="w-4 h-4 text-orange-400 animate-pulse-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-stone-900 dark:text-white text-base">MEMORA</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                PRO MEMORY
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:block">
              An AI that remembers, learns and evolves
            </p>
          </div>
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <div className="hidden md:flex items-center bg-[#f4ede0] dark:bg-[#181820] p-1 rounded-xl border border-[#e8dccb] dark:border-white/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-700 dark:text-orange-300 shadow-sm border border-orange-500/30'
                  : 'text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200 hover:bg-[#ede4d3]/70 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Search, Memory Beacon, Theme Toggle, Panel Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-stone-700 dark:text-stone-300 bg-[#f4ede0] dark:bg-[#181820] hover:bg-[#ede4d3] dark:hover:bg-white/10 border border-[#e8dccb] dark:border-white/5 hover:border-orange-400/40 transition-colors"
          title="Search memories & conversations (Cmd/Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-orange-500" />
          <span className="hidden xl:inline">Search memories...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-[#fffdfa] dark:bg-[#0e0e12] rounded text-[10px] text-stone-500 border border-[#e8dccb] dark:border-white/10">
            ⌘K
          </kbd>
        </button>

        {/* Live Backend Connection Indicator */}
        <div 
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
            isBackendConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
          }`}
          title={isBackendConnected ? "Connected to FastAPI Backend (port 8000)" : "Connecting to FastAPI Backend..."}
        >
          <span className="relative flex h-2 w-2">
            {isBackendConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
            {isBackendConnected ? 'API Live' : 'API Standby'}
          </span>
        </div>

        {/* Live Memory Beacon */}
        <div 
          onClick={() => {
            setActiveView('chat');
            setIsMemoryPanelOpen(true);
          }}
          className="cursor-pointer hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-700 dark:text-orange-300 text-xs font-semibold hover:bg-orange-500/20 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>{activeMemoriesCount} Active Memories</span>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-[#ede4d3] dark:hover:bg-white/5 border border-transparent hover:border-orange-300/30 transition-colors"
          title={theme === 'dark' ? 'Switch to Creamy Light Mode' : 'Switch to Warm Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-orange-600" />}
        </button>

        {/* Memory Panel Toggle Button */}
        <button
          onClick={() => setIsMemoryPanelOpen(!isMemoryPanelOpen)}
          className={`p-2 rounded-lg border transition-colors ${
            isMemoryPanelOpen
              ? 'text-orange-600 bg-orange-500/15 border-orange-500/35 shadow-sm'
              : 'text-stone-700 dark:text-stone-400 hover:bg-[#f4ede0] dark:hover:bg-white/5 border-[#e8dccb] dark:border-white/10'
          }`}
          title={isMemoryPanelOpen ? 'Collapse Memory Inspector' : 'Expand Memory Inspector'}
        >
          {isMemoryPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
