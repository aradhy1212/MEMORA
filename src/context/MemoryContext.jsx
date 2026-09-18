import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/apiService';
import { INITIAL_MEMORIES } from '../data/mockMemories';
import { INITIAL_CONVERSATIONS } from '../data/mockConversations';
import { MockMemoryService } from '../services/mockMemoryService';

const MemoryContext = createContext(null);

// Helper to normalize memory structure between backend and frontend
export const normalizeMemory = (m) => ({
  id: m.id,
  userId: m.userId || m.user_id || 'user_rahul_01',
  user_id: m.user_id || m.userId || 'user_rahul_01',
  category: m.category || 'PROJECT',
  subject: m.subject || 'Memory',
  attribute: m.attribute || 'Attribute',
  value: m.value || '',
  status: m.status || 'CURRENT',
  confidence: m.confidence !== undefined ? m.confidence : 0.95,
  importance: m.importance !== undefined ? m.importance : 0.85,
  createdAt: m.createdAt || m.created_at || new Date().toISOString(),
  created_at: m.created_at || m.createdAt || new Date().toISOString(),
  updatedAt: m.updatedAt || m.updated_at || new Date().toISOString(),
  updated_at: m.updated_at || m.updatedAt || new Date().toISOString(),
  sourceConversation: m.sourceConversation || m.source_conversation_title || 'Database Migration',
  source_conversation_title: m.source_conversation_title || m.sourceConversation || 'Database Migration',
  sourceConversationId: m.sourceConversationId || m.source_conversation_id || null,
  source_conversation_id: m.source_conversation_id || m.sourceConversationId || null,
  supersedes: m.supersedes || m.supersedes_memory_id || null,
  supersedes_memory_id: m.supersedes_memory_id || m.supersedes || null,
  supersededBy: m.supersededBy || m.superseded_by_memory_id || null,
  superseded_by_memory_id: m.superseded_by_memory_id || m.supersededBy || null,
  notes: m.notes || '',
  valid_until: m.valid_until || m.expiresAt || null,
  expiresAt: m.expiresAt || m.valid_until || null,
});

export const MemoryProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('memora_theme');
    return saved || 'dark';
  });

  // Active view: 'chat' | 'graph' | 'timeline' | 'dashboard' | 'settings'
  const [activeView, setActiveView] = useState('chat');

  // Memories & Conversations State
  const [memories, setMemories] = useState(() => INITIAL_MEMORIES.map(normalizeMemory));
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState('conv-1');

  // Backend sync status
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // UI Panels
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // App Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('memora_settings');
    return saved ? JSON.parse(saved) : {
      enableLongTermMemory: true,
      autoUpdateConflicts: true,
      showSources: true,
      showExplanations: true,
      privacyIsolated: true,
      soundFeedback: true
    };
  });

  // Persist Theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('memora_theme', theme);
  }, [theme]);

  // Initial Data Load from Backend
  const refreshBackendData = useCallback(async () => {
    try {
      // Attempt login / auth
      await apiService.login().catch(() => {});
      
      const [backendMems, backendConvs] = await Promise.all([
        apiService.getMemories(),
        apiService.getConversations()
      ]);

      if (backendMems && backendMems.length > 0) {
        setMemories(backendMems.map(normalizeMemory));
      }
      if (backendConvs && backendConvs.length > 0) {
        // Map backend format to frontend format
        const formattedConvs = backendConvs.map(c => ({
          id: c.id,
          title: c.title,
          timeAgo: 'Recently',
          timestamp: c.created_at,
          pinned: c.pinned,
          preview: c.preview || 'Start a conversation...',
          messages: (c.messages || []).map(m => ({
            id: m.id,
            sender: m.role === 'user' ? 'user' : 'ai',
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: m.content,
            memoryEvent: m.memory_event,
            evidence: m.evidence
          }))
        }));
        setConversations(formattedConvs);
        if (formattedConvs.length > 0 && !activeConversationId) {
          setActiveConversationId(formattedConvs[0].id);
        }
      }
      setIsBackendConnected(true);
    } catch (e) {
      console.log("[MEMORA] Backend offline or initializing, running in standalone mode with mock store.");
      setIsBackendConnected(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  // Helper getters
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMemoriesCount = memories.filter(m => m.status === 'CURRENT').length;

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ff6b35', '#f97316', '#fb923c', '#ea580c']
      });
    } catch {
      // ignore
    }
  };

  /**
   * Send a chat message - Connected to FastAPI /api/chat
   */
  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: timeString,
      text: text.trim()
    };

    // Optimistically update conversation
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            preview: text.trim(),
            timeAgo: 'Just now',
            messages: [...(conv.messages || []), userMessage]
          };
        }
        return conv;
      });
    });

    try {
      // Call Backend REST API
      const backendResponse = await apiService.sendChatMessage(text.trim(), activeConversationId);
      
      const aiMessage = {
        id: backendResponse.message_id || `msg-ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: backendResponse.answer,
        memoryEvent: backendResponse.memory_event || null,
        evidence: settings.showExplanations ? backendResponse.evidence : null
      };

      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              preview: text.trim(),
              messages: [...(conv.messages || []), aiMessage]
            };
          }
          return conv;
        });
      });

      setIsBackendConnected(true);

      // If memory mutated, trigger celebration and refresh live memories from backend
      if (backendResponse.memory_event) {
        triggerCelebration();
        const updatedMems = await apiService.getMemories().catch(() => null);
        if (updatedMems) {
          setMemories(updatedMems.map(normalizeMemory));
        }
      }
    } catch (e) {
      console.warn("[MEMORA] Backend request failed, utilizing local cognitive store fallback:", e);
      // Fallback local memory processing if backend is unreachable
      const { replyText, memoryEvent, evidence, memoryMutation } = MockMemoryService.processMessage(text, memories);
      
      const aiMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        memoryEvent: memoryEvent || null,
        evidence: settings.showExplanations ? evidence : null
      };

      if (memoryMutation && memoryMutation.action === 'SUPERSEDE_DATABASE') {
        setMemories(prev => {
          return prev.map(m => {
            if (m.category === 'DATABASE' && m.status === 'CURRENT') {
              return { ...m, status: 'SUPERSEDED', supersededBy: memoryMutation.newMemory.id, updatedAt: new Date().toISOString() };
            }
            return m;
          }).concat(memoryMutation.newMemory);
        });
        triggerCelebration();
      }

      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              preview: text.trim(),
              messages: [...(conv.messages || []), aiMessage]
            };
          }
          return conv;
        });
      });
    }
  };

  /**
   * 1-Click Interactive Hackathon Demo Steps
   */
  const runDemoStep = (stepNumber) => {
    setActiveView('chat');
    switch (stepNumber) {
      case 1:
        sendMessage("My Travel Helper project uses MongoDB.");
        break;
      case 2:
        sendMessage("I switched the project database from MongoDB to PostgreSQL.");
        break;
      case 3:
        sendMessage("Which database am I currently using?");
        break;
      case 4:
        sendMessage("What database did I use before?");
        break;
      case 5:
        sendMessage("What is my current complete tech stack?");
        break;
      default:
        break;
    }
  };

  /**
   * Create New Chat - Connected to Backend
   */
  const createNewChat = async () => {
    try {
      const newConv = await apiService.createConversation("New Conversation");
      const formatted = {
        id: newConv.id,
        title: newConv.title,
        timeAgo: 'Just now',
        timestamp: newConv.created_at,
        pinned: false,
        preview: 'Start a conversation with persistent memory...',
        messages: (newConv.messages || []).map(m => ({
          id: m.id,
          sender: m.role === 'user' ? 'user' : 'ai',
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: m.content,
          evidence: m.evidence
        }))
      };
      setConversations(prev => [formatted, ...prev]);
      setActiveConversationId(newConv.id);
    } catch {
      const newId = `conv-${Date.now()}`;
      const fallbackConv = {
        id: newId,
        title: "New Conversation",
        timeAgo: "Just now",
        timestamp: new Date().toISOString(),
        pinned: false,
        preview: "Start a new conversation with persistent memory...",
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "Hello Rahul! 👋 I have **12 active memories** loaded from your previous sessions, including your **Travel Helper** stack and **Python** preference.\n\nWhat would you like to build or discuss today?",
            evidence: {
              memoryUsedId: "M004, M009",
              memorySubject: "Rahul",
              attribute: "Profile & Active Project",
              value: "VIT Chennai / Travel Helper",
              status: "CURRENT",
              confidence: "99%",
              source: "Episodic Knowledge Base",
              reason: "Initialized new session context with verified user persona."
            }
          }
        ]
      };
      setConversations(prev => [fallbackConv, ...prev]);
      setActiveConversationId(newId);
    }
    setActiveView('chat');
  };

  const renameConversation = async (id, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c));
    await apiService.updateConversation(id, { title: newTitle.trim() }).catch(() => {});
  };

  const deleteConversation = async (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeConversationId === id && filtered.length > 0) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
    await apiService.deleteConversation(id).catch(() => {});
  };

  const togglePinConversation = async (id) => {
    const conv = conversations.find(c => c.id === id);
    const newPinned = conv ? !conv.pinned : true;
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: newPinned } : c));
    await apiService.updateConversation(id, { pinned: newPinned }).catch(() => {});
  };

  const resetMemoryData = async () => {
    setMemories(INITIAL_MEMORIES);
    setConversations(INITIAL_CONVERSATIONS);
    setActiveConversationId('conv-1');
  };

  const exportMemoryJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `memora_memories_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <MemoryContext.Provider
      value={{
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        memories,
        setMemories,
        conversations,
        activeConversationId,
        setActiveConversationId,
        activeConversation,
        activeMemoriesCount,
        isMemoryPanelOpen,
        setIsMemoryPanelOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        selectedMemory,
        setSelectedMemory,
        isSearchOpen,
        setIsSearchOpen,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        settings,
        setSettings,
        isBackendConnected,
        sendMessage,
        runDemoStep,
        createNewChat,
        renameConversation,
        deleteConversation,
        togglePinConversation,
        resetMemoryData,
        exportMemoryJson,
        refreshBackendData
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};
