import React from 'react';
import { MemoryProvider, useMemory } from './context/MemoryContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { MemoryPanel } from './components/MemoryPanel';
import { MemoryGraph } from './components/MemoryGraph';
import { MemoryTimeline } from './components/MemoryTimeline';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { MemoryDetail } from './components/MemoryDetail';
import { GlobalSearch } from './components/GlobalSearch';

const AppContent = () => {
  const { activeView } = useMemory();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#fbf8f2] dark:bg-[#090b0f] text-stone-900 dark:text-slate-100 antialiased font-sans">
      {/* Top Application Header */}
      <Header />

      {/* Main 3-Part Desktop Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center / Main View Area */}
        <main className="flex-1 flex overflow-hidden relative">
          {activeView === 'chat' && (
            <>
              <ChatWindow />
              <MemoryPanel />
            </>
          )}

          {activeView === 'graph' && <MemoryGraph />}
          {activeView === 'timeline' && <MemoryTimeline />}
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'settings' && <Settings />}
        </main>
      </div>

      {/* Modals & Overlays */}
      <MemoryDetail />
      <GlobalSearch />
    </div>
  );
};

export default function App() {
  return (
    <MemoryProvider>
      <AppContent />
    </MemoryProvider>
  );
}
