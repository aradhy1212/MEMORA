import { INITIAL_MEMORIES } from '../data/mockMemories';

export class MockMemoryService {
  /**
   * Process a user query and determine if memories should be recalled, created, or updated.
   * Returns: { replyText, memoryEvent, evidence, memoryMutation }
   */
  static processMessage(userText, currentMemories) {
    const rawText = (userText || '').trim();
    // Normalize text: lowercase, collapse spaces, normalize contractions
    const text = rawText
      .toLowerCase()
      .replace(/\s+'/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    const now = new Date().toISOString();

    // =====================================================================
    // 1. DATE, TIME & TEMPORAL QUESTIONS
    // =====================================================================
    const isDateQuery = (
      text.includes('today') ||
      text.includes('date') ||
      text.includes('day is it') ||
      text.includes('day of the week') ||
      text.includes('current day') ||
      text.includes('what day') ||
      text.includes('todays date') ||
      text.includes("today's date") ||
      text.includes('what is today')
    ) && !text.includes('database') && !text.includes('tech stack') && !text.includes('project');

    if (isDateQuery) {
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = today.toLocaleDateString('en-US', options);
      const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        replyText: `Today is **${dateStr}**.\n\nThe current local time is **${timeStr}**.`,
        evidence: {
          memoryUsedId: 'SYSTEM_CLOCK',
          memorySubject: 'Temporal Engine',
          attribute: 'Current Date & Time',
          value: dateStr,
          status: 'CURRENT',
          confidence: '100%',
          source: 'System Runtime Clock',
          reason: 'Dynamic real-time clock evaluation.'
        },
        memoryMutation: null
      };
    }

    if (text.includes('what time') || text.includes('current time') || text.includes('time is it') || text.includes('clock')) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return {
        replyText: `The current time is **${timeStr}** (${todayStr}).`,
        evidence: {
          memoryUsedId: 'SYSTEM_CLOCK',
          memorySubject: 'Temporal Engine',
          attribute: 'Current Time',
          value: timeStr,
          status: 'CURRENT',
          confidence: '100%',
          source: 'System Runtime Clock',
          reason: 'Real-time clock evaluation.'
        },
        memoryMutation: null
      };
    }

    if (text.includes('what year') || text.includes('current year')) {
      const yr = new Date().getFullYear();
      return {
        replyText: `The current year is **${yr}**.`,
        evidence: {
          memoryUsedId: 'SYSTEM_CLOCK',
          memorySubject: 'Temporal Engine',
          attribute: 'Current Year',
          value: String(yr),
          status: 'CURRENT',
          confidence: '100%',
          source: 'System Clock',
          reason: 'Calendar query.'
        },
        memoryMutation: null
      };
    }

    // =====================================================================
    // 2. MATH, ARITHMETIC & PERCENTAGES
    // =====================================================================
    // Percentage: "what is 20% of 150" or "15% of 80"
    const percentMatch = text.match(/(?:what is|calculate)?\s*(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/i);
    if (percentMatch) {
      const pct = parseFloat(percentMatch[1]);
      const total = parseFloat(percentMatch[2]);
      const res = (pct / 100) * total;
      return {
        replyText: `**${pct}% of ${total} = ${res}**`,
        evidence: {
          memoryUsedId: 'MATH_EVAL',
          memorySubject: 'Arithmetic Engine',
          attribute: 'Percentage Calculation',
          value: String(res),
          status: 'CURRENT',
          confidence: '100%',
          source: 'Deterministic Math Solver',
          reason: 'Percentage expression calculation.'
        },
        memoryMutation: null
      };
    }

    // Square root: "sqrt of 144" or "square root of 81"
    const sqrtMatch = text.match(/(?:what is|calculate)?\s*(?:sqrt|square root)\s*(?:of)?\s*(\d+(?:\.\d+)?)/i);
    if (sqrtMatch) {
      const val = parseFloat(sqrtMatch[1]);
      const res = Math.sqrt(val);
      return {
        replyText: `**√${val} = ${res}**`,
        evidence: {
          memoryUsedId: 'MATH_EVAL',
          memorySubject: 'Arithmetic Engine',
          attribute: 'Square Root',
          value: String(res),
          status: 'CURRENT',
          confidence: '100%',
          source: 'Deterministic Math Solver',
          reason: 'Square root evaluation.'
        },
        memoryMutation: null
      };
    }

    // Standard Arithmetic: 2 + 2, 50 * 12, 100 / 4, 2^8
    const mathMatch = text.match(/(?:what is|calculate|solve|evaluate)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/x\^])\s*(\d+(?:\.\d+)?)\s*\??/i);
    if (mathMatch && text.length < 50) {
      try {
        const num1 = parseFloat(mathMatch[1]);
        const op = mathMatch[2];
        const num2 = parseFloat(mathMatch[3]);
        let res;
        if (op === '+') res = num1 + num2;
        else if (op === '-') res = num1 - num2;
        else if (op === '*' || op.toLowerCase() === 'x') res = num1 * num2;
        else if (op === '/') res = num2 !== 0 ? num1 / num2 : 'undefined (division by zero)';
        else if (op === '^') res = Math.pow(num1, num2);

        return {
          replyText: `**${mathMatch[1]} ${op} ${mathMatch[3]} = ${res}**`,
          evidence: {
            memoryUsedId: 'MATH_EVAL',
            memorySubject: 'Arithmetic Engine',
            attribute: 'Calculation',
            value: String(res),
            status: 'CURRENT',
            confidence: '100%',
            source: 'Deterministic Math Solver',
            reason: 'Arithmetic expression execution.'
          },
          memoryMutation: null
        };
      } catch (e) {
        // continue
      }
    }

    // =====================================================================
    // 3. EPISODIC MEMORY SPECIFIC QUERIES (Rahul & Travel Helper)
    // =====================================================================

    // Query historical database
    if (
      (text.includes('what database') || text.includes('which database') || text.includes('what db') || text.includes('which db')) &&
      (text.includes('before') || text.includes('previously') || text.includes('earlier') || text.includes('past') || text.includes('old') || text.includes('first'))
    ) {
      const pastDb = currentMemories.find(m => m.category === 'DATABASE' && (m.status === 'SUPERSEDED' || m.status === 'HISTORICAL')) || {
        id: 'M002',
        value: 'MongoDB',
        confidence: 0.92
      };

      return {
        replyText: `You previously used **${pastDb.value}** for your Travel Helper project before superseding it with PostgreSQL.\n\nI have preserved this historical record (\`${pastDb.id}\`) in your episodic memory audit log.`,
        evidence: {
          memoryUsedId: pastDb.id,
          memorySubject: pastDb.subject || 'Travel Helper',
          attribute: pastDb.attribute || 'Primary Database',
          value: pastDb.value,
          status: 'SUPERSEDED',
          confidence: `${Math.round(pastDb.confidence * 100)}%`,
          source: pastDb.sourceConversation || 'Conversation: Database Migration',
          reason: 'Retrieved superseded historical node from episodic memory audit log.'
        },
        memoryMutation: null
      };
    }

    // Query current database
    if (
      (text.includes('which database') || text.includes('what database') || text.includes('which db') || text.includes('what db')) &&
      (text.includes('currently') || text.includes('current') || text.includes('now') || text.includes('using') || text.includes('present') || text.includes('have'))
    ) {
      const currentDb = currentMemories.find(m => m.category === 'DATABASE' && m.status === 'CURRENT') || {
        id: 'M003',
        value: 'PostgreSQL',
        confidence: 0.96
      };

      return {
        replyText: `You are currently using **${currentDb.value}** as the primary database for your **Travel Helper** project.\n\nThis was updated from your previous setup after migrating to support relational transactions and vector search.`,
        evidence: {
          memoryUsedId: currentDb.id,
          memorySubject: currentDb.subject || 'Travel Helper',
          attribute: currentDb.attribute || 'Primary Database',
          value: currentDb.value,
          status: 'CURRENT',
          confidence: `${Math.round(currentDb.confidence * 100)}%`,
          source: currentDb.sourceConversation || 'Conversation: Database Migration',
          previousMemory: 'M002 → MongoDB (SUPERSEDED)',
          reason: 'Queried active working memory store for category: DATABASE with status: CURRENT.'
        },
        memoryMutation: null
      };
    }

    // Switched / Updating database to PostgreSQL
    if (
      (text.includes('switch') || text.includes('switched') || text.includes('migrat') || text.includes('change') || text.includes('changed') || text.includes('moved')) &&
      (text.includes('postgres') || text.includes('postgresql'))
    ) {
      const newMemoryId = `M${String(currentMemories.length + 1).padStart(3, '0')}`;
      
      const newMemory = {
        id: newMemoryId,
        userId: 'user_rahul_01',
        category: 'DATABASE',
        subject: 'Travel Helper',
        attribute: 'Primary Database',
        value: 'PostgreSQL',
        status: 'CURRENT',
        confidence: 0.96,
        createdAt: now,
        updatedAt: now,
        sourceConversation: 'Travel Helper Project',
        supersedes: 'M002',
        supersededBy: null,
        notes: 'Updated database to PostgreSQL per user migration statement.'
      };

      return {
        replyText: `Understood! I've updated your project memory.\n\nYour previous database **MongoDB** (M002) is now marked as **SUPERSEDED**, and **PostgreSQL** (${newMemoryId}) is your active database.`,
        memoryEvent: {
          type: 'UPDATED',
          title: 'Memory Updated',
          memoryId: newMemoryId,
          previousMemoryId: 'M002',
          category: 'DATABASE',
          attribute: 'Primary Database',
          previousValue: 'MongoDB',
          newValue: 'PostgreSQL',
          status: 'CURRENT',
          confidence: 0.96
        },
        evidence: {
          memoryUsedId: newMemoryId,
          memorySubject: 'Travel Helper',
          attribute: 'Primary Database',
          value: 'PostgreSQL',
          status: 'CURRENT',
          confidence: '96%',
          source: 'Current Conversation',
          previousMemory: 'M002 → MongoDB (SUPERSEDED)',
          reason: 'Explicit database switch detected. Automated memory conflict resolution triggered.'
        },
        memoryMutation: {
          action: 'SUPERSEDE_DATABASE',
          targetCategory: 'DATABASE',
          supersedeValue: 'MongoDB',
          newMemory: newMemory
        }
      };
    }

    // User says project uses MongoDB
    if (
      (text.includes('project') || text.includes('uses') || text.includes('building')) &&
      (text.includes('mongodb') || text.includes('mongo')) &&
      !text.includes('switch') && !text.includes('postgres')
    ) {
      return {
        replyText: `Got it! I've recorded a new long-term memory for your project:\n\n- **Project**: Travel Helper\n- **Primary Database**: MongoDB\n- **Confidence**: 92%\n\nI will retain this context across all future sessions.`,
        memoryEvent: {
          type: 'CREATED',
          title: 'New Memory Created',
          memoryId: 'M002',
          category: 'DATABASE',
          attribute: 'Primary Database',
          value: 'MongoDB',
          status: 'CURRENT',
          confidence: 0.92
        },
        evidence: {
          memoryUsedId: 'M002',
          memorySubject: 'Travel Helper',
          attribute: 'Primary Database',
          value: 'MongoDB',
          status: 'CURRENT',
          confidence: '92%',
          source: 'Current Conversation',
          reason: 'Entity extraction: [Subject: Travel Helper, Attribute: Database, Value: MongoDB]'
        },
        memoryMutation: {
          action: 'SET_DATABASE_MONGO'
        }
      };
    }

    // What is my tech stack?
    if (text.includes('tech stack') || text.includes('what stack') || text.includes('technologies') || text.includes('my stack')) {
      const activeMemories = currentMemories.filter(m => m.status === 'CURRENT' && ['DATABASE', 'BACKEND', 'FRONTEND', 'LANGUAGE'].includes(m.category));
      
      const bullets = activeMemories
        .map(m => `- **${m.subject} / ${m.attribute}**: \`${m.value}\` (Confidence: ${Math.round(m.confidence * 100)}%)`)
        .join('\n');

      return {
        replyText: `Here is your current tech stack retrieved from your persistent memory:\n\n${bullets || "- **Database**: PostgreSQL\n- **Backend**: Node.js / Express\n- **Frontend**: React + TailwindCSS\n- **AI**: Python"}\n\nAll decisions are indexed with source conversation provenance.`,
        evidence: {
          memoryUsedId: 'M003, M005, M006, M001',
          memorySubject: 'Developer Profile & Travel Helper',
          attribute: 'Full Tech Stack',
          value: 'React + Node.js + PostgreSQL + Python',
          status: 'CURRENT',
          confidence: '97%',
          source: 'Multi-conversation Aggregate',
          reason: 'Synthesized active stack attributes from episodic memory graph.'
        },
        memoryMutation: null
      };
    }

    // University / Profile query
    if (text.includes('university') || text.includes('college') || text.includes('where do i study') || text.includes('who am i') || text.includes('my profile') || text.includes('my name') || text.includes('my major')) {
      const uniMem = currentMemories.find(m => m.category === 'PROFILE') || { value: 'VIT Chennai', confidence: 0.99 };
      return {
        replyText: `According to your profile memory, you are **Rahul**, a 3rd-year Computer Science student at **${uniMem.value}**.\n\nYou are currently developing the **Travel Helper** application and participating in the HackClub 2026 hackathon.`,
        evidence: {
          memoryUsedId: 'M009',
          memorySubject: 'Rahul',
          attribute: 'University & Profile',
          value: uniMem.value,
          status: 'CURRENT',
          confidence: '99%',
          source: 'Conversation: Initial Onboarding',
          reason: 'Direct user profile retrieval.'
        },
        memoryMutation: null
      };
    }

    // Programming language preferences
    if (text.includes('python') || text.includes('java') || text.includes('favorite language') || text.includes('programming language')) {
      return {
        replyText: `I recall that you currently prefer **Python** (M001, 98% confidence) for AI and backend workflows, which superseded your earlier preference for **Java** (M007, Historical).`,
        evidence: {
          memoryUsedId: 'M001',
          memorySubject: 'Programming Language',
          attribute: 'Preferred Language',
          value: 'Python',
          status: 'CURRENT',
          confidence: '98%',
          source: 'Conversation: Project Discussion',
          previousMemory: 'M007 → Java (HISTORICAL)',
          reason: 'Preference chain evaluation.'
        },
        memoryMutation: null
      };
    }

    // =====================================================================
    // 4. GENERAL KNOWLEDGE, SCIENCE & TECH KNOWLEDGE
    // =====================================================================
    if (text.includes('who created python') || text.includes('creator of python')) {
      return {
        replyText: `**Python** was created by **Guido van Rossum** and first released in **1991**. It was designed with an emphasis on code readability and clean syntax.`,
        evidence: { memoryUsedId: 'KB_TECH', memorySubject: 'Python', attribute: 'Creator', value: 'Guido van Rossum', status: 'CURRENT', confidence: '100%', source: 'Knowledge Base', reason: 'Fact retrieval.' },
        memoryMutation: null
      };
    }

    if (text.includes('who created javascript') || text.includes('creator of javascript')) {
      return {
        replyText: `**JavaScript** was created by **Brendan Eich** in **1995** while working at Netscape Communications. It was famously created in just 10 days!`,
        evidence: { memoryUsedId: 'KB_TECH', memorySubject: 'JavaScript', attribute: 'Creator', value: 'Brendan Eich', status: 'CURRENT', confidence: '100%', source: 'Knowledge Base', reason: 'Fact retrieval.' },
        memoryMutation: null
      };
    }

    if (text.includes('who created linux') || text.includes('who created git')) {
      return {
        replyText: `Both the **Linux kernel** (1991) and the **Git version control system** (2005) were created by Finnish software engineer **Linus Torvalds**.`,
        evidence: { memoryUsedId: 'KB_TECH', memorySubject: 'Linux & Git', attribute: 'Creator', value: 'Linus Torvalds', status: 'CURRENT', confidence: '100%', source: 'Knowledge Base', reason: 'Fact retrieval.' },
        memoryMutation: null
      };
    }

    if (text.includes('what is redis') || text.includes('explain redis')) {
      return {
        replyText: `**Redis** (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, streaming engine, and message broker. It provides sub-millisecond response times because data resides in RAM.`,
        evidence: { memoryUsedId: 'KB_TECH', memorySubject: 'Redis', attribute: 'Definition', value: 'In-memory cache/database', status: 'CURRENT', confidence: '100%', source: 'Knowledge Base', reason: 'Tech definition.' },
        memoryMutation: null
      };
    }

    if (text.includes('what is docker') || text.includes('explain docker')) {
      return {
        replyText: `**Docker** is a platform for building, running, and managing applications in lightweight, isolated packages called **containers**. Containers package code and all its dependencies so the application runs quickly and reliably across computing environments.`,
        evidence: { memoryUsedId: 'KB_TECH', memorySubject: 'Docker', attribute: 'Definition', value: 'Containerization Platform', status: 'CURRENT', confidence: '100%', source: 'Knowledge Base', reason: 'Tech definition.' },
        memoryMutation: null
      };
    }

    if (text.includes('what is recursion') || text.includes('explain recursion')) {
      return {
        replyText: `**Recursion** is a programming technique where a function calls itself to solve smaller instances of the same problem.\n\nEvery recursive function requires:\n1. **Base Case**: The termination condition to prevent infinite loops.\n2. **Recursive Step**: Reducing the problem toward the base case.`,
        evidence: { memoryUsedId: 'KB_CS', memorySubject: 'Computer Science', attribute: 'Recursion', value: 'Self-referencing function', status: 'CURRENT', confidence: '100%', source: 'Knowledge Base', reason: 'CS concept.' },
        memoryMutation: null
      };
    }

    if (text.includes('speed of light')) {
      return {
        replyText: `The speed of light in a vacuum is exactly **299,792,458 meters per second** (approximately **300,000 km/s** or **186,282 miles per second**), denoted by the constant **c**.`,
        evidence: { memoryUsedId: 'KB_PHYSICS', memorySubject: 'Physics', attribute: 'Speed of Light', value: '299,792,458 m/s', status: 'CURRENT', confidence: '100%', source: 'Physical Constants', reason: 'Physics fact.' },
        memoryMutation: null
      };
    }

    if (text.includes('photosynthesis')) {
      return {
        replyText: `**Photosynthesis** is the biological process used by plants, algae, and some bacteria to convert light energy (usually from the Sun) into chemical energy (glucose) using water ($H_2O$) and carbon dioxide ($CO_2$), releasing oxygen ($O_2$) as a byproduct.`,
        evidence: { memoryUsedId: 'KB_BIO', memorySubject: 'Biology', attribute: 'Photosynthesis', value: 'Chemical energy conversion', status: 'CURRENT', confidence: '100%', source: 'Knowledge Base', reason: 'Science query.' },
        memoryMutation: null
      };
    }

    if (text.includes('capital of france')) {
      return {
        replyText: `The capital of France is **Paris**.`,
        evidence: { memoryUsedId: 'KB_GEO', memorySubject: 'Geography', attribute: 'Capital of France', value: 'Paris', status: 'CURRENT', confidence: '100%', source: 'World Atlas', reason: 'Geography fact.' },
        memoryMutation: null
      };
    }

    if (text.includes('capital of japan')) {
      return {
        replyText: `The capital of Japan is **Tokyo**.`,
        evidence: { memoryUsedId: 'KB_GEO', memorySubject: 'Geography', attribute: 'Capital of Japan', value: 'Tokyo', status: 'CURRENT', confidence: '100%', source: 'World Atlas', reason: 'Geography fact.' },
        memoryMutation: null
      };
    }

    if (text.includes('capital of india')) {
      return {
        replyText: `The capital of India is **New Delhi**.`,
        evidence: { memoryUsedId: 'KB_GEO', memorySubject: 'Geography', attribute: 'Capital of India', value: 'New Delhi', status: 'CURRENT', confidence: '100%', source: 'World Atlas', reason: 'Geography fact.' },
        memoryMutation: null
      };
    }

    if (text.includes('capital of usa') || text.includes('capital of the united states') || text.includes('capital of america')) {
      return {
        replyText: `The capital of the United States is **Washington, D.C.**`,
        evidence: { memoryUsedId: 'KB_GEO', memorySubject: 'Geography', attribute: 'Capital of USA', value: 'Washington, D.C.', status: 'CURRENT', confidence: '100%', source: 'World Atlas', reason: 'Geography fact.' },
        memoryMutation: null
      };
    }

    // =====================================================================
    // 5. GREETINGS & INTRODUCTIONS
    // =====================================================================
    const greetings = ["hi", "hello", "hey", "hola", "namaste", "good morning", "good afternoon", "good evening", "greetings", "wassup", "what's up", "yo"];
    if (greetings.some(g => text === g || text.startsWith(g + " ") || text.startsWith(g + "!") || text.startsWith(g + ","))) {
      return {
        replyText: `Hello Rahul! 👋 I'm **MEMORA**, your AI companion equipped with persistent episodic memory.\n\nI actively remember your **Travel Helper** project (PostgreSQL + Node.js + React), your **Python** workflow, and your **VIT Chennai** profile.\n\nHow can I help you today?`,
        evidence: {
          memoryUsedId: 'M004, M009',
          memorySubject: 'Rahul / Persona',
          attribute: 'User Recognition',
          value: 'Rahul (VIT Chennai)',
          status: 'CURRENT',
          confidence: '99%',
          source: 'Episodic User Profile',
          reason: 'Greeting recognition and profile grounding.'
        },
        memoryMutation: null
      };
    }

    if (text.includes('how are you') || text.includes('how r u') || text.includes('how are things')) {
      const activeCnt = currentMemories.filter(m => m.status === 'CURRENT').length;
      return {
        replyText: `I'm doing great and running smoothly! 🚀\n\nI currently have **${activeCnt || 9} active memories** loaded in our reasoning context. How can I assist you with your project or answer any questions?`,
        evidence: {
          memoryUsedId: 'SYSTEM_STATUS',
          memorySubject: 'Memora Engine',
          attribute: 'Health Check',
          value: 'Operational',
          status: 'CURRENT',
          confidence: '100%',
          source: 'System Runtime',
          reason: 'System status check.'
        },
        memoryMutation: null
      };
    }

    if (text.includes('who are you') || text.includes('what are you') || text.includes('what is memora') || text.includes('tell me about yourself')) {
      return {
        replyText: `I am **MEMORA**, a personal AI companion built with **Episodic Long-Term Memory**.\n\n### Core Capabilities:\n- 🧠 **Persistent Context**: Retains your project decisions, preferred stack, and preferences across sessions.\n- 🔄 **Conflict Resolution**: When you change architecture (like switching databases), I supersede past decisions without hallucinating.\n- 🔍 **Explainability**: Every response comes with a *'Why did I say this?'* provenance trail.\n- 🕸️ **Interactive Graph & Timeline**: Visualizes how your memories evolve over time.`,
        evidence: {
          memoryUsedId: 'MEMORA_CORE',
          memorySubject: 'System Specs',
          attribute: 'Architecture',
          value: 'Episodic Long-Term Memory Engine',
          status: 'CURRENT',
          confidence: '100%',
          source: 'System Architecture Document',
          reason: 'System capability explanation.'
        },
        memoryMutation: null
      };
    }

    if (text.includes('joke') || text.includes('tell me a joke')) {
      return {
        replyText: `Why did the developer refuse to use an AI without episodic memory?\n\n*Because every time they said "Good morning", the AI forgot who they were and asked them to re-install Node.js!* 😅`,
        evidence: {
          memoryUsedId: 'KB_HUMOR',
          memorySubject: 'Humor Engine',
          attribute: 'Developer Joke',
          value: 'Node.js memory joke',
          status: 'CURRENT',
          confidence: '100%',
          source: 'Humor Store',
          reason: 'Entertainment query.'
        },
        memoryMutation: null
      };
    }

    // =====================================================================
    // 6. INTELLIGENT GENERAL FALLBACK
    // =====================================================================
    const topCurrent = currentMemories.find(m => m.status === 'CURRENT');
    return {
      replyText: `I received your question: *"${rawText}"*.\n\n` +
        `I am actively grounded in your workspace context (including your **Travel Helper** project with **PostgreSQL**, **Python**, and your **VIT Chennai** profile).\n\n` +
        `You can ask me questions about your architecture, tell me about any changes to your project, ask general programming/math/science questions, or explore your **Memory Graph** and **Timeline** tabs!`,
      evidence: {
        memoryUsedId: topCurrent ? topCurrent.id : 'M003',
        memorySubject: topCurrent ? topCurrent.subject : 'Travel Helper',
        attribute: topCurrent ? topCurrent.attribute : 'Working Context',
        value: topCurrent ? topCurrent.value : 'Active Stack',
        status: 'CURRENT',
        confidence: '95%',
        source: 'Episodic Memory Graph',
        reason: 'Semantic grounding in active user context.'
      },
      memoryMutation: null
    };
  }

  /**
   * Search across memories and conversations
   */
  static search(query, memories, conversations) {
    if (!query || query.trim() === '') return { memories: [], conversations: [] };
    const q = query.toLowerCase().trim();

    const matchedMemories = (memories || []).filter(m => 
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.attribute && m.attribute.toLowerCase().includes(q)) ||
      (m.value && m.value.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q)) ||
      (m.id && m.id.toLowerCase().includes(q)) ||
      (m.notes && m.notes.toLowerCase().includes(q))
    );

    const matchedConversations = (conversations || []).filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.preview && c.preview.toLowerCase().includes(q)) ||
      (c.messages && c.messages.some(m => m.text && m.text.toLowerCase().includes(q)))
    );

    return {
      memories: matchedMemories,
      conversations: matchedConversations
    };
  }

  /**
   * Generates graph nodes and links for MemoryGraph.jsx
   */
  static getGraphData(memories) {
    const nodes = [
      { id: 'user', label: 'Rahul (User)', type: 'user', category: 'USER', val: 24, color: '#8b5cf6' },
      { id: 'project-travel', label: 'Travel Helper', type: 'project', category: 'PROJECT', val: 20, color: '#06b6d4' },
      { id: 'uni-vit', label: 'VIT Chennai', type: 'profile', category: 'PROFILE', val: 14, color: '#a855f7' },
      { id: 'hackathon', label: 'HackClub 2026', type: 'event', category: 'EVENT', val: 14, color: '#f43f5e' },
    ];

    const links = [
      { source: 'user', target: 'project-travel', label: 'Working On', relation: 'owns' },
      { source: 'user', target: 'uni-vit', label: 'Studies At', relation: 'education' },
      { source: 'user', target: 'hackathon', label: 'Participates', relation: 'event' },
    ];

    (memories || []).forEach(mem => {
      let targetParent = 'project-travel';
      if (['LANGUAGE', 'PROFILE'].includes(mem.category)) {
        targetParent = 'user';
      } else if (mem.category === 'EVENT') {
        targetParent = 'hackathon';
      }

      const nodeId = `node-${mem.id}`;
      const isCurrent = mem.status === 'CURRENT';
      const isSuperseded = mem.status === 'SUPERSEDED';

      nodes.push({
        id: nodeId,
        memoryId: mem.id,
        label: `${mem.attribute}: ${mem.value}`,
        value: mem.value,
        status: mem.status,
        category: mem.category,
        confidence: mem.confidence,
        color: isCurrent ? '#10b981' : isSuperseded ? '#f43f5e' : '#94a3b8',
        type: 'memory',
        val: isCurrent ? 14 : 10
      });

      links.push({
        source: targetParent,
        target: nodeId,
        label: mem.attribute,
        status: mem.status,
        dashed: isSuperseded
      });

      if (mem.supersedes) {
        links.push({
          source: nodeId,
          target: `node-${mem.supersedes}`,
          label: 'Supersedes',
          type: 'supersede',
          color: '#f59e0b',
          dashed: true
        });
      }
    });

    return { nodes, links };
  }
}
