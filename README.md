# 🧠 MEMORA — Episodic Long-Term Memory AI

> An AI assistant that doesn't just answer — it remembers, learns, updates, and explains.

MEMORA is an AI chatbot designed with **episodic long-term memory**. Instead of treating every conversation as a fresh session, MEMORA stores important information about the user, retrieves relevant memories when answering questions, detects changes in previously stored information, and maintains the history of those changes.

The project combines a modern React interface with a FastAPI backend, persistent databases, vector search, and configurable LLM providers.

---

## ✨ What Makes MEMORA Different?

Traditional AI chatbots mainly focus on the current conversation.

MEMORA introduces a persistent memory layer that allows the system to:

- 🧠 Remember important information across conversations
- 🔄 Update memories when information changes
- ⚔️ Detect conflicts between old and new information
- 🕐 Maintain historical memory states
- 🔍 Retrieve relevant memories while answering questions
- 📜 Track memory provenance and evidence
- 🕸️ Visualize memories through a knowledge graph
- 📊 Provide memory statistics through a dashboard
- 🔎 Search across memories and conversations
- 🔐 Authenticate users using JWT
- 🌗 Support light and dark themes
- 🛡️ Fall back to a local memory system when the backend is unavailable

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       User              │
                    │    Chat Interface       │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │    React Frontend       │
                    │                         │
                    │  Chat │ Memory │ Graph │
                    │  Timeline │ Dashboard  │
                    └───────────┬─────────────┘
                                │
                         REST API / HTTP
                                │
                                ▼
                    ┌─────────────────────────┐
                    │      FastAPI Backend    │
                    │                         │
                    │ Authentication          │
                    │ Chat Processing         │
                    │ Memory Management       │
                    │ Conversations           │
                    │ Search                  │
                    │ Dashboard               │
                    └───────┬─────────┬───────┘
                            │         │
                ┌───────────┘         └────────────┐
                ▼                                  ▼
       ┌─────────────────┐                ┌─────────────────┐
       │ SQL Database    │                │ Qdrant          │
       │                 │                │ Vector Database │
       │ Users           │                │                 │
       │ Memories        │                │ Semantic Search │
       │ Conversations   │                │ Embeddings      │
       │ Messages        │                └─────────────────┘
       └─────────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │ LLM Provider Layer  │
                  │                     │
                  │ Gemini              │
                  │ OpenAI              │
                  │ Grok                │
                  │ Local Heuristic     │
                  └─────────────────────┘
