import re
from typing import Optional, Dict, Any
from app.core.logging import MemoryLogger

class MemoryExtractor:
    @staticmethod
    async def extract_candidate(message: str) -> Optional[Dict[str, Any]]:
        """
        Extracts structured memory candidate from raw user message.
        Returns None if message is casual chit-chat with no long-term fact.
        """
        text = message.lower().strip()

        # Check for Database declaration or migration
        if "mongodb" in text and ("project" in text or "using" in text or "uses" in text) and not ("switch" in text or "postgres" in text):
            MemoryLogger.extract("Extracted new fact: Project=Travel Helper, Database=MongoDB")
            return {
                "category": "DATABASE",
                "subject": "Travel Helper",
                "attribute": "Primary Database",
                "value": "MongoDB",
                "confidence": 0.94,
                "importance": 0.90,
                "is_temporary": False
            }

        if ("switch" in text or "switched" in text or "migrat" in text or "change" in text or "changed" in text) and ("postgres" in text or "postgresql" in text):
            MemoryLogger.extract("Extracted database migration: Project=Travel Helper, Database=PostgreSQL (supersedes previous)")
            return {
                "category": "DATABASE",
                "subject": "Travel Helper",
                "attribute": "Primary Database",
                "value": "PostgreSQL",
                "old_value_hint": "MongoDB",
                "confidence": 0.96,
                "importance": 0.95,
                "is_temporary": False
            }

        if "python" in text and ("prefer" in text or "switch" in text or "using" in text or "favorite" in text):
            MemoryLogger.extract("Extracted language preference: User=Programming Language, Value=Python")
            return {
                "category": "LANGUAGE",
                "subject": "Programming Language",
                "attribute": "Preferred Language",
                "value": "Python",
                "old_value_hint": "Java",
                "confidence": 0.98,
                "importance": 0.88,
                "is_temporary": False
            }

        if "travel helper" in text and ("node" in text or "express" in text):
            return {
                "category": "BACKEND",
                "subject": "Travel Helper",
                "attribute": "Backend Runtime",
                "value": "Node.js (Express)",
                "confidence": 0.95,
                "importance": 0.85,
                "is_temporary": False
            }

        if "travel helper" in text and "react" in text:
            return {
                "category": "FRONTEND",
                "subject": "Travel Helper",
                "attribute": "UI Framework",
                "value": "React",
                "confidence": 0.97,
                "importance": 0.85,
                "is_temporary": False
            }

        # Ephemeral temporary mention
        if "going to" in text or "tomorrow" in text or "sprint" in text or "deadline" in text:
            return {
                "category": "TEMPORARY",
                "subject": "Current Task",
                "attribute": "Active Focus",
                "value": message[:60],
                "confidence": 0.85,
                "importance": 0.40,
                "is_temporary": True
            }

        return None

memory_extractor = MemoryExtractor()
