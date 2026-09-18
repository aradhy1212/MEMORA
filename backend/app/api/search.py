from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.postgres import get_db
from app.models.memory import Memory
from app.models.conversation import Conversation
from app.models.message import Message
from app.core.security import get_current_user_id

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("")
async def global_search(
    q: str = Query(..., min_length=1),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    query_str = q.lower().strip()

    # 1. Search memories
    res_m = await db.execute(select(Memory).where(Memory.user_id == user_id))
    all_mems = res_m.scalars().all()

    matched_memories = [
        {
            "id": m.id,
            "category": m.category,
            "subject": m.subject,
            "attribute": m.attribute,
            "value": m.value,
            "status": m.status,
            "confidence": m.confidence,
            "sourceConversation": m.source_conversation_title or "Direct Capture",
            "notes": m.notes
        }
        for m in all_mems
        if query_str in m.subject.lower()
        or query_str in m.attribute.lower()
        or query_str in m.value.lower()
        or query_str in m.category.lower()
        or query_str in m.id.lower()
        or (m.notes and query_str in m.notes.lower())
    ]

    current_memories = [m for m in matched_memories if m["status"] == "CURRENT"]
    historical_memories = [m for m in matched_memories if m["status"] in ["SUPERSEDED", "HISTORICAL"]]

    # 2. Search conversations
    res_c = await db.execute(select(Conversation).where(Conversation.user_id == user_id))
    all_convs = res_c.scalars().all()

    matched_convs = [
        {
            "id": c.id,
            "title": c.title,
            "preview": c.preview or "",
            "timeAgo": "Recently",
            "created_at": c.created_at
        }
        for c in all_convs
        if query_str in c.title.lower() or (c.preview and query_str in c.preview.lower())
    ]

    return {
        "query": q,
        "memories": matched_memories,
        "current_memories": current_memories,
        "historical_memories": historical_memories,
        "conversations": matched_convs
    }
