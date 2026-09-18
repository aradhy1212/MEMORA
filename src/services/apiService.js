const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('memora_jwt_token') || '';
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('memora_jwt_token', token);
    } else {
      localStorage.removeItem('memora_jwt_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`[MEMORA API] ${options.method || 'GET'} ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  // Auth
  async login(email = 'rahul@memora.ai', password = 'memora2026') {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  // Chat
  async sendChatMessage(message, conversationId = null) {
    return await this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      })
    });
  }

  // Memories
  async getMemories(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/memories${queryStr}`);
  }

  async getMemory(id) {
    return await this.request(`/memories/${id}`);
  }

  async createMemory(memoryData) {
    return await this.request('/memories', {
      method: 'POST',
      body: JSON.stringify(memoryData)
    });
  }

  async deleteMemory(id) {
    return await this.request(`/memories/${id}`, {
      method: 'DELETE'
    });
  }

  async getMemoryHistory() {
    return await this.request('/memories/history');
  }

  async getMemoryGraph() {
    return await this.request('/memories/graph');
  }

  // Conversations
  async getConversations() {
    return await this.request('/conversations');
  }

  async createConversation(title = 'New Conversation') {
    return await this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async updateConversation(id, updates) {
    return await this.request(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteConversation(id) {
    return await this.request(`/conversations/${id}`, {
      method: 'DELETE'
    });
  }

  // Dashboard
  async getDashboardStats() {
    return await this.request('/dashboard/stats');
  }

  async getDashboardRecentChanges() {
    return await this.request('/dashboard/recent-changes');
  }

  // Search
  async globalSearch(query) {
    if (!query || !query.trim()) return { memories: [], conversations: [] };
    return await this.request(`/search?q=${encodeURIComponent(query.trim())}`);
  }
}

export const apiService = new ApiService();
