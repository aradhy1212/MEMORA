from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.memory import Memory
from app.database.qdrant import vector_store
from app.services.embedding_service import embedding_service
from app.core.logging import MemoryLogger

class MemoryRetriever:
    @staticmethod
    async def retrieve_memories(
        db: AsyncSession,
        user_id: str,
        query: str,
        limit: int = 6
    ) -> List[Memory]:
        """
        Hybrid Semantic + Currentness + Confidence + Importance Retrieval.
        Enforces strict user isolation.
        """
        # 1. Fetch all user memories from PostgreSQL
        res = await db.execute(select(Memory).where(Memory.user_id == user_id))
        user_memories = res.scalars().all()
        if not user_memories:
            return []

        # 2. Get Query Vector and perform Semantic Search in Qdrant/Vector Store
        q_vector = await embedding_service.get_embedding(query)
        vector_hits = await vector_store.search(
            query_vector=q_vector,
            user_id=user_id,
            limit=15
        )

        vector_scores: Dict[str, float] = {
            hit["memory_id"]: hit["score"] for hit in vector_hits if hit.get("memory_id")
        }

        # Check for direct keyword matches (e.g. database, python, travel helper)
        q_lower = query.lower()
        is_asking_historical = any(w in q_lower for w in ["before", "previously", "earlier", "old", "past", "history"])
        is_asking_current = any(w in q_lower for w in ["current", "currently", "now", "using", "latest"])

        scored_memories: List[Tuple[Memory, float]] = []

        for mem in user_memories:
            # Base semantic relevance score (0.0 to 1.0)
            semantic_score = vector_scores.get(mem.id, 0.4)
            
            # Boost if exact attribute or subject keywords appear
            if mem.subject.lower() in q_lower or mem.attribute.lower() in q_lower or mem.value.lower() in q_lower or mem.category.lower() in q_lower:
                semantic_score = max(semantic_score, 0.85)

            # Currentness Weight
            if mem.status == "CURRENT":
                currentness_weight = 1.0
                if is_asking_current:
                    currentness_weight = 1.3
            elif mem.status == "SUPERSEDED":
                currentness_weight = 1.4 if is_asking_historical else 0.3
            elif mem.status == "HISTORICAL":
                currentness_weight = 1.3 if is_asking_historical else 0.4
            elif mem.status == "TEMPORARY":
                currentness_weight = 0.85
            else:  # EXPIRED
                currentness_weight = 0.05

            # Final composite score
            final_score = (
                (semantic_score * 0.45) +
                (currentness_weight * 0.30) +
                ((mem.confidence or 0.95) * 0.15) +
                ((mem.importance or 0.85) * 0.10)
            )

            scored_memories.append((mem, final_score))

        # Sort by final hybrid score descending
        scored_memories.sort(key=lambda x: x[1], reverse=True)
        top_memories = [item[0] for item in scored_memories[:limit]]

        MemoryLogger.retrieve(
            f"Retrieved {len(top_memories)} memories for user {user_id}. Top: {', '.join([f'#{m.id} ({m.value}, status={m.status})' for m in top_memories[:3]])}"
        )

        return top_memories

memory_retriever = MemoryRetriever()
