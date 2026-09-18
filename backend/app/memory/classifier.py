from typing import Dict, Any
from app.core.logging import MemoryLogger

class MemoryClassifier:
    VALID_CATEGORIES = [
        "DATABASE", "PROJECT", "BACKEND", "FRONTEND", "LANGUAGE",
        "PROFILE", "EVENT", "DEVOPS", "ARCHITECTURE", "PREFERENCE",
        "TEMPORARY", "OTHER"
    ]

    @staticmethod
    def classify(candidate: Dict[str, Any]) -> Dict[str, Any]:
        category = candidate.get("category", "OTHER").upper()
        if category not in MemoryClassifier.VALID_CATEGORIES:
            category = "OTHER"

        importance = candidate.get("importance", 0.7)
        confidence = candidate.get("confidence", 0.9)
        is_temporary = candidate.get("is_temporary", False)

        status = "TEMPORARY" if is_temporary else "CURRENT"

        MemoryLogger.classify(f"Category={category}, Status={status}, Confidence={confidence}, Importance={importance}")

        return {
            "category": category,
            "subject": candidate.get("subject", "General"),
            "attribute": candidate.get("attribute", "Fact"),
            "value": candidate.get("value", ""),
            "status": status,
            "confidence": confidence,
            "importance": importance,
            "is_temporary": is_temporary
        }

memory_classifier = MemoryClassifier()
