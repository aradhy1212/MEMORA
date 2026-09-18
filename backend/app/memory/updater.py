import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.memory import Memory
from app.models.memory_history import MemoryHistory
from app.database.qdrant import vector_store
from app.services.embedding_service import embedding_service
from app.core.logging import MemoryLogger

class MemoryUpdater:
    @staticmethod
    async def process_memory_candidate(
        db: AsyncSession,
        user_id: str,
        candidate: Dict[str, Any],
        conflicted_memory: Optional[Memory],
        conversation_id: Optional[str] = None,
        conversation_title: Optional[str] = "Travel Helper Project",
        message_id: Optional[str] = None
    ) -> Tuple[Memory, Optional[Dict[str, Any]]]:
        """
        Atomically creates or supersedes a memory entity, writes audit history,
        and indexes the embedding in Qdrant.
        """
        now = datetime.utcnow()
        
        # Get count to generate clean ID (e.g. M003)
        res = await db.execute(select(Memory).where(Memory.user_id == user_id))
        all_user_memories = res.scalars().all()
        mem_num = len(all_user_memories) + 1
        new_memory_id = f"M{str(mem_num).padStart(3, '0') if hasattr(str(mem_num), 'padStart') else str(mem_num).zfill(3)}"

        memory_event = None

        if conflicted_memory:
            # SUPERSEDING WORKFLOW
            MemoryLogger.supersede(
                f"Superseding #{conflicted_memory.id} ({conflicted_memory.value}) with #{new_memory_id} ({candidate['value']})"
            )
            
            conflicted_memory.status = "SUPERSEDED"
            conflicted_memory.superseded_by_memory_id = new_memory_id
            conflicted_memory.valid_until = now
            conflicted_memory.updated_at = now
            
            # History log for old memory
            hist_old = MemoryHistory(
                id=str(uuid.uuid4()),
                memory_id=conflicted_memory.id,
                user_id=user_id,
                action="SUPERSEDED",
                previous_value=conflicted_memory.value,
                new_value=candidate["value"],
                reason=f"Superseded by #{new_memory_id} per user update.",
                source_conversation_id=conversation_id,
                created_at=now
            )
            db.add(hist_old)

            # Create new memory
            new_memory = Memory(
                id=new_memory_id,
                user_id=user_id,
                category=candidate["category"],
                subject=candidate["subject"],
                attribute=candidate["attribute"],
                value=candidate["value"],
                status="CURRENT",
                confidence=candidate.get("confidence", 0.96),
                importance=candidate.get("importance", 0.95),
                created_at=now,
                updated_at=now,
                valid_from=now,
                valid_until=now + timedelta(days=1) if candidate.get("is_temporary") else None,
                source_conversation_id=conversation_id,
                source_conversation_title=conversation_title,
                source_message_id=message_id,
                supersedes_memory_id=conflicted_memory.id,
                superseded_by_memory_id=None,
                notes=f"Updated from previous choice of {conflicted_memory.value}."
            )
            db.add(new_memory)

            # History log for new memory
            hist_new = MemoryHistory(
                id=str(uuid.uuid4()),
                memory_id=new_memory_id,
                user_id=user_id,
                action="CREATED_SUPERSEDING",
                previous_value=conflicted_memory.value,
                new_value=candidate["value"],
                reason=f"New verified state superseding #{conflicted_memory.id}.",
                source_conversation_id=conversation_id,
                created_at=now
            )
            db.add(hist_new)

            memory_event = {
                "type": "UPDATED",
                "title": "Memory Updated",
                "memoryId": new_memory_id,
                "previousMemoryId": conflicted_memory.id,
                "category": candidate["category"],
                "attribute": candidate["attribute"],
                "previousValue": conflicted_memory.value,
                "newValue": candidate["value"],
                "status": "CURRENT",
                "confidence": candidate.get("confidence", 0.96)
            }

        else:
            # NEW MEMORY CREATION
            MemoryLogger.store(f"Creating new memory #{new_memory_id}: {candidate['attribute']} = {candidate['value']}")
            new_memory = Memory(
                id=new_memory_id,
                user_id=user_id,
                category=candidate["category"],
                subject=candidate["subject"],
                attribute=candidate["attribute"],
                value=candidate["value"],
                status="TEMPORARY" if candidate.get("is_temporary") else "CURRENT",
                confidence=candidate.get("confidence", 0.94),
                importance=candidate.get("importance", 0.85),
                created_at=now,
                updated_at=now,
                valid_from=now,
                valid_until=now + timedelta(days=1) if candidate.get("is_temporary") else None,
                source_conversation_id=conversation_id,
                source_conversation_title=conversation_title,
                source_message_id=message_id,
                supersedes_memory_id=None,
                superseded_by_memory_id=None,
                notes=f"Initial record captured for {candidate['subject']}."
            )
            db.add(new_memory)

            hist = MemoryHistory(
                id=str(uuid.uuid4()),
                memory_id=new_memory_id,
                user_id=user_id,
                action="CREATED",
                previous_value=None,
                new_value=candidate["value"],
                reason="Initial extraction from user statement.",
                source_conversation_id=conversation_id,
                created_at=now
            )
            db.add(hist)

            memory_event = {
                "type": "CREATED",
                "title": "New Memory Created",
                "memoryId": new_memory_id,
                "previousMemoryId": None,
                "category": candidate["category"],
                "attribute": candidate["attribute"],
                "value": candidate["value"],
                "status": "CURRENT",
                "confidence": candidate.get("confidence", 0.94)
            }

        await db.commit()
        await db.refresh(new_memory)

        # Generate embedding and upsert to Qdrant Vector Store
        text_for_embedding = f"{new_memory.subject} {new_memory.attribute} is {new_memory.value} ({new_memory.category})"
        vector = await embedding_service.get_embedding(text_for_embedding)
        await vector_store.upsert(
            memory_id=new_memory.id,
            vector=vector,
            payload={
                "memory_id": new_memory.id,
                "user_id": user_id,
                "category": new_memory.category,
                "subject": new_memory.subject,
                "attribute": new_memory.attribute,
                "value": new_memory.value,
                "status": new_memory.status,
                "confidence": new_memory.confidence,
                "importance": new_memory.importance
            }
        )

        return new_memory, memory_event

memory_updater = MemoryUpdater()
