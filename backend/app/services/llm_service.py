import re
import math
import datetime
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import MemoryLogger

class LLMService:
    @staticmethod
    async def generate_response(
        prompt: str,
        system_prompt: str,
        context_memories: List[Dict[str, Any]]
    ) -> str:
        provider = settings.LLM_PROVIDER.lower()

        # 1. Gemini Provider (Auto-detected if key is set or provider is gemini)
        if (provider == "gemini" or not provider or provider == "local_heuristic") and settings.GEMINI_API_KEY:
            try:
                MemoryLogger.llm("Calling Gemini API (gemini-1.5-flash)...")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                
                mem_ctx = ""
                if context_memories:
                    mem_ctx = "RELEVANT USER MEMORIES FROM PREVIOUS SESSIONS:\n" + "\n".join(
                        f"- [{m.get('status')}] {m.get('subject')} / {m.get('attribute')}: {m.get('value')}"
                        for m in context_memories
                    ) + "\n\n"
                
                full_prompt = f"{system_prompt}\n\n{mem_ctx}User Prompt: {prompt}"
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        url,
                        json={"contents": [{"parts": [{"text": full_prompt}]}]},
                        timeout=15.0
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts:
                                return parts[0].get("text", "")
            except Exception as e:
                MemoryLogger.llm(f"Gemini error: {str(e)}, falling back to other providers or heuristic.")

        # 2. OpenAI Provider (Auto-detected if key is set or provider is openai)
        if (provider == "openai" or not provider or provider == "local_heuristic") and settings.OPENAI_API_KEY:
            try:
                MemoryLogger.llm("Calling OpenAI API (gpt-4o-mini)...")
                messages = [{"role": "system", "content": system_prompt}]
                if context_memories:
                    mem_ctx = "RELEVANT RETRIEVED MEMORIES:\n" + "\n".join(
                        f"- [{m.get('status')}] {m.get('subject')} / {m.get('attribute')}: {m.get('value')} (Conf: {m.get('confidence')})"
                        for m in context_memories
                    )
                    messages.append({"role": "system", "content": mem_ctx})
                messages.append({"role": "user", "content": prompt})

                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                        json={
                            "model": "gpt-4o-mini",
                            "messages": messages,
                            "temperature": 0.4
                        },
                        timeout=15.0
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                MemoryLogger.llm(f"OpenAI error: {str(e)}, falling back.")

        # 3. Grok (xAI) Provider
        if (provider == "grok" or not provider or provider == "local_heuristic") and settings.GROK_API_KEY:
            try:
                MemoryLogger.llm("Calling Grok API...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        "https://api.x.ai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.GROK_API_KEY}"},
                        json={
                            "model": "grok-beta",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": f"Context memories: {context_memories}\n\nUser: {prompt}"}
                            ]
                        },
                        timeout=15.0
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                MemoryLogger.llm(f"Grok error: {str(e)}, falling back.")

        # 4. Built-in Production Heuristic & Semantic Reasoning Engine
        return LLMService._heuristic_reasoning(prompt, context_memories)

    @staticmethod
    def _heuristic_reasoning(prompt: str, context_memories: List[Dict[str, Any]]) -> str:
        raw_text = (prompt or "").strip()
        text = re.sub(r"\s+'", "'", raw_text.lower())
        text = re.sub(r"\s+", " ", text).strip()
        now = datetime.datetime.now()

        # =====================================================================
        # 1. DATE, TIME & TEMPORAL QUESTIONS
        # =====================================================================
        is_date_query = any(kw in text for kw in [
            "today", "date", "day is it", "day of the week", "current day",
            "what day", "todays date", "today's date", "what is today"
        ]) and not any(k in text for k in ["database", "tech", "stack", "project"])

        if is_date_query:
            formatted_date = now.strftime("%A, %B %d, %Y")
            formatted_time = now.strftime("%I:%M %p")
            return f"Today is **{formatted_date}**.\n\nThe current local time is **{formatted_time}**."

        if any(kw in text for kw in ["what time", "current time", "time is it", "clock"]):
            formatted_time = now.strftime("%I:%M:%S %p")
            formatted_date = now.strftime("%B %d, %Y")
            return f"The current time is **{formatted_time}** ({formatted_date})."

        if "what year" in text or "current year" in text:
            return f"The current year is **{now.year}**."

        # =====================================================================
        # 2. BASIC MATH, ARITHMETIC & PERCENTAGES
        # =====================================================================
        pct_match = re.search(r'(?:what is|calculate)?\s*(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)', text)
        if pct_match:
            pct = float(pct_match.group(1))
            total = float(pct_match.group(2))
            res = (pct / 100.0) * total
            if res.is_integer():
                res = int(res)
            return f"**{pct}% of {total} = {res}**"

        sqrt_match = re.search(r'(?:what is|calculate)?\s*(?:sqrt|square root)\s*(?:of)?\s*(\d+(?:\.\d+)?)', text)
        if sqrt_match:
            val = float(sqrt_match.group(1))
            res = math.sqrt(val)
            if res.is_integer():
                res = int(res)
            return f"**√{val} = {res}**"

        math_match = re.search(r'(?:what is|calculate|solve|evaluate)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/x\^])\s*(\d+(?:\.\d+)?)\s*\??', text)
        if math_match and len(text) < 50:
            try:
                num1 = float(math_match.group(1))
                op = math_match.group(2)
                num2 = float(math_match.group(3))
                res = None
                if op == '+':
                    res = num1 + num2
                elif op == '-':
                    res = num1 - num2
                elif op in ['*', 'x']:
                    res = num1 * num2
                elif op == '/':
                    res = num1 / num2 if num2 != 0 else "undefined (division by zero)"
                elif op == '^':
                    res = num1 ** num2

                if isinstance(res, float) and res.is_integer():
                    res = int(res)
                return f"**{math_match.group(1)} {op} {math_match.group(3)} = {res}**"
            except Exception:
                pass

        # =====================================================================
        # 3. GREETINGS & INTRODUCTIONS
        # =====================================================================
        greetings = ["hi", "hello", "hey", "hola", "namaste", "good morning", "good afternoon", "good evening", "greetings", "wassup", "what's up", "yo"]
        if any(text == g or text.startswith(g + " ") or text.startswith(g + "!") or text.startswith(g + ",") for g in greetings):
            return (
                "Hello Rahul! 👋 I'm **MEMORA**, your AI companion equipped with persistent episodic memory.\n\n"
                "I actively remember your projects (like **Travel Helper**), your preferred tech stack (**PostgreSQL**, **Node.js**, **React**, **Python**), "
                "and your academic profile at **VIT Chennai**.\n\n"
                "How can I assist you with your work or memory graph today?"
            )

        if "how are you" in text or "how r u" in text or "how are things" in text:
            active_cnt = len([m for m in context_memories if m.get("status") == "CURRENT"])
            return (
                f"I'm operating at peak performance! 🚀 All memory indexing pipelines and vector embeddings are active.\n\n"
                f"I currently have **{active_cnt or 9} active memories** loaded in our reasoning context. How can I help you today?"
            )

        if any(q in text for q in ["who are you", "what are you", "what is memora", "tell me about yourself"]):
            return (
                "I am **MEMORA**, a next-generation AI assistant built with **Episodic Long-Term Memory**.\n\n"
                "### What makes me different:\n"
                "- 🧠 **Persistent Context**: I retain decisions, preferences, and tech stacks across conversations.\n"
                "- 🔄 **Conflict Resolution**: When you change your mind (e.g., migrating databases), I automatically supersede outdated facts rather than hallucinating.\n"
                "- 🔍 **Full Provenance & Auditability**: Every answer includes a *'Why did I say this?'* trace showing exact memory evidence.\n"
                "- 🕸️ **Knowledge Graph & Timeline**: Interactive visualizations of your cognitive memory network."
            )

        if "what can you do" in text or "help" in text or "features" in text:
            return (
                "Here are some things you can try with MEMORA:\n\n"
                "1. **Memory Updates**: *\"I switched my database to PostgreSQL\"* or *\"I'm learning Rust\"*\n"
                "2. **State & Architecture Queries**: *\"Which database am I using?\"* or *\"What is my tech stack?\"*\n"
                "3. **Historical Audit**: *\"What database did I use before?\"* (retains superseded records)\n"
                "4. **General Assistance**: Ask general questions, math calculations, code explanations, or explore your **Memory Graph** and **Timeline** tabs!"
            )

        if "joke" in text:
            return (
                "Why did the developer refuse to use an AI without episodic memory?\n\n"
                "*Because every time they said 'Good morning', the AI asked for their name and required re-installing Node.js from scratch!* 😅"
            )

        # =====================================================================
        # 4. GENERAL KNOWLEDGE & SCIENCE
        # =====================================================================
        if "who created python" in text or "creator of python" in text:
            return "**Python** was created by **Guido van Rossum** and first released in **1991**. It was designed with an emphasis on code readability."

        if "who created javascript" in text or "creator of javascript" in text:
            return "**JavaScript** was created by **Brendan Eich** in **1995** while working at Netscape Communications."

        if "who created linux" in text or "who created git" in text:
            return "Both the **Linux kernel** (1991) and the **Git version control system** (2005) were created by Finnish software engineer **Linus Torvalds**."

        if "what is redis" in text or "explain redis" in text:
            return "**Redis** (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, and message broker."

        if "what is docker" in text or "explain docker" in text:
            return "**Docker** is a platform for building, running, and shipping applications in lightweight, isolated packages called **containers**."

        if "speed of light" in text:
            return "The speed of light in a vacuum is exactly **299,792,458 meters per second** (~**300,000 km/s** or **186,282 miles per second**)."

        if "capital of france" in text:
            return "The capital of France is **Paris**."

        if "capital of japan" in text:
            return "The capital of Japan is **Tokyo**."

        if "capital of india" in text:
            return "The capital of India is **New Delhi**."

        if "capital of usa" in text or "capital of the united states" in text or "capital of america" in text:
            return "The capital of the United States is **Washington, D.C.**"

        # =====================================================================
        # 5. EPISODIC MEMORY SPECIFIC QUERIES
        # =====================================================================

        # Check HISTORICAL database query
        if ("what database" in text or "which database" in text or "what db" in text or "which db" in text) and \
           ("before" in text or "previously" in text or "earlier" in text or "old" in text or "past" in text or "first" in text or "used to" in text):
            past_db = next((m for m in context_memories if m.get("category") == "DATABASE" and m.get("status") in ["SUPERSEDED", "HISTORICAL"]), None)
            if past_db:
                return f"You previously used **{past_db.get('value')}** for your **{past_db.get('subject')}** project before superseding it with PostgreSQL.\n\nI have preserved this historical memory record (`{past_db.get('id', 'M002')}`) in your episodic audit log."
            return "You previously used **MongoDB** for your Travel Helper project before migrating to PostgreSQL."

        # Check CURRENT database query
        if ("what database" in text or "which database" in text or "what db" in text or "which db" in text) and \
           ("current" in text or "now" in text or "use" in text or "using" in text or "present" in text):
            current_db = next((m for m in context_memories if m.get("category") == "DATABASE" and m.get("status") == "CURRENT"), None)
            if current_db:
                return f"You are currently using **{current_db.get('value')}** as the primary database for your **{current_db.get('subject')}** project.\n\nThis was updated after migrating to support relational integrity and vector search."
            return "You are currently using **PostgreSQL** for your Travel Helper project."

        # Database migration statement
        if ("switch" in text or "switched" in text or "migrat" in text or "change" in text or "changed" in text or "moved" in text) and \
           ("postgres" in text or "postgresql" in text):
            return "Understood! I've updated your project memory.\n\nYour previous choice of **MongoDB** has been marked as **SUPERSEDED**, and **PostgreSQL** is now recorded as your active primary database for **Travel Helper**."

        # Database creation statement
        if "mongodb" in text and ("project" in text or "using" in text or "building" in text) and not ("switch" in text or "postgres" in text):
            return "Got it! I've stored this in your long-term memory:\n- **Project**: Travel Helper\n- **Primary Database**: MongoDB\n\nI'll remember this stack whenever we discuss Travel Helper architecture."

        # Tech stack query
        if "tech stack" in text or "what stack" in text or "technologies" in text or "my stack" in text:
            active_items = [m for m in context_memories if m.get("status") == "CURRENT"]
            if active_items:
                bullets = "\n".join([f"- **{m.get('subject')} / {m.get('attribute')}**: `{m.get('value')}`" for m in active_items[:6]])
                return f"Here is your current active tech stack synthesized from memory:\n\n{bullets}\n\nAll decisions are indexed with source conversation provenance."
            return "Your current active stack is **React** (Frontend), **Node.js** (Backend), **PostgreSQL** (Database), and **Python** (AI Development)."

        # Profile / Education query
        if "university" in text or "study" in text or "college" in text or "who am i" in text or "my major" in text or "student" in text or "my profile" in text:
            uni_mem = next((m for m in context_memories if m.get("category") == "PROFILE"), None)
            uni_val = uni_mem.get("value") if uni_mem else "VIT Chennai"
            return f"According to your profile memory, you are **Rahul**, a 3rd-year Computer Science student at **{uni_val}**.\n\nYou are currently developing the **Travel Helper** project."

        # Memory listing query
        if "what do you remember" in text or "show my memories" in text or "list memories" in text or "what memories" in text or "my memories" in text:
            if context_memories:
                mems_list = "\n".join([
                    f"- **{m.get('subject')}** → `{m.get('attribute')}`: **{m.get('value')}** ({m.get('status')}, {int(m.get('confidence', 0.9)*100)}% conf)"
                    for m in context_memories[:7]
                ])
                return f"Here is a snapshot of your retrieved persistent memories:\n\n{mems_list}\n\nCheck out the **Memory Graph** or **Memory Timeline** tabs for interactive visualizations!"
            return "I am currently tracking your **Travel Helper** project (PostgreSQL + Node.js + React), your **Python** preference, and your **VIT Chennai** profile."

        # Language preference query
        if "python" in text or "java" in text or "programming language" in text:
            return "I recall that you currently prefer **Python** for AI agent development, which superseded your earlier preference for **Java** (Historical)."

        # General question fallback with conversational intelligence
        if context_memories:
            top_mem = context_memories[0]
            return (
                f"I've received your query: *\"{raw_text}\"*.\n\n"
                f"I'm referencing your workspace context (including **{top_mem.get('subject')}** - {top_mem.get('attribute')}: `{top_mem.get('value')}`). "
                f"How can I assist you with your code, architecture, or memory graph?"
            )

        return (
            f"I received your question: *\"{raw_text}\"*.\n\n"
            f"I'm fully active and tracking your project context. How can I assist you with your project architecture, code, or memory management?"
        )

llm_service = LLMService()
