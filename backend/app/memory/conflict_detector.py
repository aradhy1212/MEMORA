from typing import Optional, List, Dict, Any
from app.models.memory import Memory
from app.core.logging import MemoryLogger

class ConflictDetector:
    @staticmethod
    def detect_conflict(
        new_candidate: Dict[str, Any],
        existing_memories: List[Memory]
    ) -> Optional[Memory]:
        """
        Inspects existing CURRENT memories for the same user.
        If a memory exists with matching subject and attribute but a different value,
        a contradiction is flagged for superseding.
        """
        cand_subject = new_candidate.get("subject", "").lower().strip()
        cand_attr = new_candidate.get("attribute", "").lower().strip()
        cand_val = new_candidate.get("value", "").lower().strip()

        for mem in existing_memories:
            if mem.status != "CURRENT":
                continue

            mem_subject = mem.subject.lower().strip()
            mem_attr = mem.attribute.lower().strip()
            mem_val = mem.value.lower().strip()

            # Subject + Attribute Match (e.g. Travel Helper / Primary Database)
            is_same_attribute = (
                (cand_subject == mem_subject or cand_subject in mem_subject or mem_subject in cand_subject) and
                (cand_attr == mem_attr or cand_attr in mem_attr or mem_attr in cand_attr)
            )

            # Category match fallback for single-entity preferences (e.g. Language / Preferred Language)
            if not is_same_attribute and new_candidate.get("category") == mem.category and new_candidate.get("category") in ["DATABASE", "LANGUAGE"]:
                is_same_attribute = True

            if is_same_attribute:
                if cand_val != mem_val:
                    MemoryLogger.conflict(
                        f"CONTRADICTION DETECTED! Old #{mem.id} ({mem.value}) contradicts new value '{new_candidate.get('value')}'. Triggering superseding workflow."
                    )
                    return mem
                else:
                    # Same fact repeated -> Reinforcement candidate!
                    return None

        return None

conflict_detector = ConflictDetector()
