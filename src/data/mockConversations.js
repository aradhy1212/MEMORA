export const INITIAL_CONVERSATIONS = [
  {
    id: "conv-1",
    title: "Travel Helper Project",
    timeAgo: "Just now",
    timestamp: "2026-09-18T10:15:00Z",
    pinned: true,
    preview: "I've switched the project database from MongoDB to PostgreSQL.",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: "10:10 AM",
        text: "I'm building my Travel Helper project using Node.js and MongoDB."
      },
      {
        id: "msg-2",
        sender: "ai",
        timestamp: "10:10 AM",
        text: "Got it! I've stored this in your long-term memory:\n- **Project**: Travel Helper\n- **Backend**: Node.js (Express)\n- **Database**: MongoDB\n\nI'll remember this stack whenever we discuss Travel Helper architecture or queries.",
        memoryEvent: {
          type: "CREATED",
          title: "Memory Created",
          memoryId: "M002",
          category: "DATABASE",
          attribute: "Primary Database",
          value: "MongoDB",
          status: "CURRENT",
          confidence: 0.92
        },
        evidence: {
          memoryUsedId: "M002",
          memorySubject: "Travel Helper",
          attribute: "Primary Database",
          value: "MongoDB",
          status: "CURRENT",
          confidence: "92%",
          source: "Current Conversation",
          reason: "Direct statement of project technology stack during initial session."
        }
      },
      {
        id: "msg-3",
        sender: "user",
        timestamp: "10:14 AM",
        text: "I've switched the project database from MongoDB to PostgreSQL."
      },
      {
        id: "msg-4",
        sender: "ai",
        timestamp: "10:14 AM",
        text: "Understood! I've updated your project memory. \n\nYour previous choice of **MongoDB** has been marked as **SUPERSEDED**, and **PostgreSQL** is now your active database for **Travel Helper**.",
        memoryEvent: {
          type: "UPDATED",
          title: "Memory Updated",
          memoryId: "M003",
          previousMemoryId: "M002",
          category: "DATABASE",
          attribute: "Primary Database",
          previousValue: "MongoDB",
          newValue: "PostgreSQL",
          status: "CURRENT",
          confidence: 0.96
        },
        evidence: {
          memoryUsedId: "M003",
          memorySubject: "Travel Helper",
          attribute: "Primary Database",
          value: "PostgreSQL",
          status: "CURRENT",
          confidence: "96%",
          source: "Conversation: Database Migration",
          previousMemory: "M002 → MongoDB (SUPERSEDED)",
          reason: "User explicitly stated migration from MongoDB to PostgreSQL. Resolves schema conflict."
        }
      }
    ]
  },
  {
    id: "conv-2",
    title: "Database Migration",
    timeAgo: "2 days ago",
    timestamp: "2026-09-16T15:30:00Z",
    pinned: false,
    preview: "Comparing MongoDB aggregation pipelines vs PostgreSQL JSONB indexing.",
    messages: [
      {
        id: "msg-201",
        sender: "user",
        timestamp: "Sep 16, 3:30 PM",
        text: "We need relational transactions for the hotel booking engine in Travel Helper. MongoDB was good for prototyping, but PostgreSQL gives us ACID guarantees and pgvector for AI itineraries."
      },
      {
        id: "msg-202",
        sender: "ai",
        timestamp: "Sep 16, 3:31 PM",
        text: "That is a sound architectural choice. PostgreSQL 16 with `pgvector` will let you store structured relational booking data while keeping vector embeddings for semantic travel search in the same database engine.",
        evidence: {
          memoryUsedId: "M004",
          memorySubject: "Travel Helper",
          attribute: "Architecture Choice",
          value: "PostgreSQL with pgvector",
          status: "CURRENT",
          confidence: "95%",
          source: "Conversation: Database Migration",
          reason: "Identified requirement for ACID transactions and vector storage."
        }
      }
    ]
  },
  {
    id: "conv-3",
    title: "Hackathon Planning",
    timeAgo: "5 days ago",
    timestamp: "2026-09-13T18:00:00Z",
    pinned: false,
    preview: "Preparing slides and architecture demo for HackClub AI Persistent Memory track.",
    messages: [
      {
        id: "msg-301",
        sender: "user",
        timestamp: "Sep 13, 6:00 PM",
        text: "We are submitting our project to the HackClub Hackathon under the Persistent Memory Track. What should our key demo showcase?"
      },
      {
        id: "msg-302",
        sender: "ai",
        timestamp: "Sep 13, 6:01 PM",
        text: "Focus on three core pillars:\n1. **Dynamic Superseding**: Show how memory evolves when the user updates requirements without forgetting past history.\n2. **Transparent Explainability**: Always provide 'Why did I say this?' telemetry so judges see exactly which memory slice drove the output.\n3. **Relational Memory Graph**: Display how entities link across time.",
        evidence: {
          memoryUsedId: "M008",
          memorySubject: "HackClub Hackathon",
          attribute: "Track & Focus",
          value: "AI Persistent Memory Track",
          status: "TEMPORARY",
          confidence: "94%",
          source: "Conversation: Hackathon Planning",
          reason: "Active submission deadline guidance."
        }
      }
    ]
  },
  {
    id: "conv-4",
    title: "Project Discussion",
    timeAgo: "1 week ago",
    timestamp: "2026-09-11T12:00:00Z",
    pinned: false,
    preview: "Switched primary language preference from Java to Python for AI agent development.",
    messages: [
      {
        id: "msg-401",
        sender: "user",
        timestamp: "Sep 11, 12:00 PM",
        text: "I used to write mostly Java for college courses, but I've now completely switched my preferred language to Python for agentic workflows and FastAPI."
      },
      {
        id: "msg-402",
        sender: "ai",
        timestamp: "Sep 11, 12:01 PM",
        text: "Noted! I have updated your developer profile memory. Your previous preference for **Java** (M007) is now **HISTORICAL**, and **Python** (M001) is your primary language.",
        memoryEvent: {
          type: "UPDATED",
          title: "Memory Preference Evolved",
          memoryId: "M001",
          previousMemoryId: "M007",
          category: "LANGUAGE",
          attribute: "Preferred Language",
          previousValue: "Java",
          newValue: "Python",
          status: "CURRENT",
          confidence: 0.98
        },
        evidence: {
          memoryUsedId: "M001",
          memorySubject: "Programming Language",
          attribute: "Preferred Language",
          value: "Python",
          status: "CURRENT",
          confidence: "98%",
          source: "Conversation: Project Discussion",
          previousMemory: "M007 → Java (HISTORICAL)",
          reason: "Explicit preference override stated by user."
        }
      }
    ]
  }
];
