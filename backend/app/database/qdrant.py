import numpy as np
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import MemoryLogger

class VectorStore:
    def __init__(self):
        self.client = None
        self.is_qdrant_connected = False
        self.local_vectors: List[Dict[str, Any]] = []
        self._init_client()

    def _init_client(self):
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.http.models import Distance, VectorParams

            if settings.QDRANT_URL:
                self.client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None,
                    timeout=2.0
                )
                # Test connection
                self.client.get_collections()
                self.is_qdrant_connected = True
                
                # Ensure collection exists
                collections = [c.name for c in self.client.get_collections().collections]
                if settings.QDRANT_COLLECTION_NAME not in collections:
                    self.client.create_collection(
                        collection_name=settings.QDRANT_COLLECTION_NAME,
                        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                    )
                MemoryLogger.store(f"Connected to Qdrant at {settings.QDRANT_URL}")
        except Exception as e:
            self.is_qdrant_connected = False
            MemoryLogger.store(f"Using In-Memory Vector Store fallback (Qdrant offline or standalone mode)")

    async def upsert(self, memory_id: str, vector: List[float], payload: Dict[str, Any]):
        if self.is_qdrant_connected and self.client:
            try:
                from qdrant_client.http.models import PointStruct
                # Integer hash or uuid for point id
                point_id = abs(hash(memory_id)) % (10 ** 12)
                self.client.upsert(
                    collection_name=settings.QDRANT_COLLECTION_NAME,
                    points=[
                        PointStruct(
                            id=point_id,
                            vector=vector,
                            payload=payload
                        )
                    ]
                )
                return
            except Exception as e:
                MemoryLogger.store(f"Qdrant upsert fallback: {str(e)}")

        # Local in-memory index fallback
        # Remove old if exists
        self.local_vectors = [v for v in self.local_vectors if v.get("memory_id") != memory_id]
        self.local_vectors.append({
            "memory_id": memory_id,
            "vector": vector,
            "payload": payload
        })

    async def search(self, query_vector: List[float], user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        results = []

        if self.is_qdrant_connected and self.client:
            try:
                from qdrant_client.http.models import Filter, FieldCondition, MatchValue
                search_result = self.client.search(
                    collection_name=settings.QDRANT_COLLECTION_NAME,
                    query_vector=query_vector,
                    query_filter=Filter(
                        must=[
                            FieldCondition(
                                key="user_id",
                                match=MatchValue(value=user_id)
                            )
                        ]
                    ),
                    limit=limit
                )
                for hit in search_result:
                    results.append({
                        "memory_id": hit.payload.get("memory_id"),
                        "score": hit.score,
                        "payload": hit.payload
                    })
                return results
            except Exception as e:
                MemoryLogger.retrieve(f"Qdrant search fallback: {str(e)}")

        # Local Cosine Similarity fallback with strict user isolation
        q_vec = np.array(query_vector, dtype=float)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            q_norm = 1.0

        scored = []
        for item in self.local_vectors:
            payload = item.get("payload", {})
            # STRICT USER ISOLATION CHECK
            if payload.get("user_id") != user_id:
                continue

            v = np.array(item.get("vector", []), dtype=float)
            v_norm = np.linalg.norm(v)
            if v_norm == 0:
                v_norm = 1.0

            sim = float(np.dot(q_vec, v) / (q_norm * v_norm))
            scored.append({
                "memory_id": item.get("memory_id"),
                "score": sim,
                "payload": payload
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:limit]

vector_store = VectorStore()
