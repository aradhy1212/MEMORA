from datetime import datetime, timedelta
from typing import List
from app.models.memory import Memory
from app.core.logging import MemoryLogger

class MemoryDecay:
    @staticmethod
    def apply_decay(memories: List[Memory]) -> List[Memory]:
        """
        Checks for expired temporary memories and updates status to EXPIRED.
        """
        now = datetime.utcnow()
        for mem in memories:
            if mem.status == "TEMPORARY" and mem.valid_until and mem.valid_until < now:
                mem.status = "EXPIRED"
                MemoryLogger.store(f"Memory #{mem.id} ({mem.value}) has expired.")
        return memories

    @staticmethod
    def reinforce(memory: Memory):
        """
        Reinforces memory confidence when repeatedly validated by user.
        """
        old_conf = memory.confidence
        memory.confidence = min(0.99, round(memory.confidence + 0.03, 2))
        memory.updated_at = datetime.utcnow()
        MemoryLogger.store(f"Memory #{memory.id} reinforced: confidence {old_conf} -> {memory.confidence}")

memory_decay = MemoryDecay()
