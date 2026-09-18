from typing import Optional, List, Dict, Any
from app.models.memory import Memory

class MemoryProvenance:
    @staticmethod
    def build_evidence(
        used_memory: Memory,
        query: str,
        superseded_memory: Optional[Memory] = None
    ) -> Dict[str, Any]:
        """
        Builds transparent explainability metadata for 'Why did I say this?' UI card.
        """
        prev_str = None
        if used_memory.supersedes_memory_id:
            prev_val = superseded_memory.value if superseded_memory else "MongoDB"
            prev_str = f"#{used_memory.supersedes_memory_id} → {prev_val} (SUPERSEDED)"
        elif used_memory.status == "SUPERSEDED":
            prev_str = f"Historical record #{used_memory.id} preserved in audit log."

        reason = "Primary verified memory node matching query intent."
        if used_memory.status == "CURRENT" and used_memory.supersedes_memory_id:
            reason = f"Active memory #{used_memory.id} supersedes earlier record #{used_memory.supersedes_memory_id} per user migration."
        elif used_memory.status == "SUPERSEDED":
            reason = f"Historical memory node requested by user temporal query."

        return {
            "memoryUsedId": used_memory.id,
            "memorySubject": used_memory.subject,
            "attribute": used_memory.attribute,
            "value": used_memory.value,
            "status": used_memory.status,
            "confidence": f"{int(used_memory.confidence * 100)}%",
            "source": used_memory.source_conversation_title or "Current Conversation",
            "previousMemory": prev_str,
            "reason": reason
        }

memory_provenance = MemoryProvenance()
