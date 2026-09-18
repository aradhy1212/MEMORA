import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.postgres import get_db
from app.models.memory import Memory
from app.models.memory_history import MemoryHistory
from app.schemas.memory import MemoryResponse, MemoryCreate, MemoryUpdate, MemoryGraphResponse, MemoryHistoryResponse, GraphNode, GraphEdge
from app.core.security import get_current_user_id
from app.database.qdrant import vector_store
from app.services.embedding_service import embedding_service

router = APIRouter(prefix="/memories", tags=["Memory Management & Graph"])

@router.get("", response_model=List[MemoryResponse])
async def get_memories(
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    query = select(Memory).where(Memory.user_id == user_id)

    if status and status != "ALL":
        query = query.where(Memory.status == status)
    if category and category != "ALL":
        query = query.where(Memory.category == category)

    res = await db.execute(query.order_by(desc(Memory.created_at)))
    memories = res.scalars().all()

    if search and search.strip():
        q = search.lower().strip()
        memories = [
            m for m in memories
            if q in m.subject.lower() or q in m.attribute.lower() or q in m.value.lower() or q in m.category.lower() or q in m.id.lower()
        ]

    return memories

@router.get("/graph", response_model=MemoryGraphResponse)
async def get_memory_graph(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Memory).where(Memory.user_id == user_id))
    memories = res.scalars().all()

    nodes: List[GraphNode] = [
        GraphNode(id="user", label="Rahul (User)", type="user", category="USER", color="#f97316", val=24),
        GraphNode(id="project-travel", label="Travel Helper", type="project", category="PROJECT", color="#f59e0b", val=20),
        GraphNode(id="uni-vit", label="VIT Chennai", type="profile", category="PROFILE", color="#ea580c", val=14),
        GraphNode(id="hackathon", label="HackClub 2026", type="event", category="EVENT", color="#e0533c", val=14)
    ]

    links: List[GraphEdge] = [
        GraphEdge(source="user", target="project-travel", label="Working On", relationship="owns"),
        GraphEdge(source="user", target="uni-vit", label="Studies At", relationship="education"),
        GraphEdge(source="user", target="hackathon", label="Participates", relationship="event")
    ]

    for mem in memories:
        target_parent = "project-travel"
        if mem.category in ["LANGUAGE", "PROFILE"]:
            target_parent = "user"
        elif mem.category == "EVENT":
            target_parent = "hackathon"

        node_id = f"node-{mem.id}"
        is_current = mem.status == "CURRENT"
        is_superseded = mem.status == "SUPERSEDED"

        node_color = "#10b981" if is_current else "#f43f5e" if is_superseded else "#a8a29e"

        nodes.append(GraphNode(
            id=node_id,
            memoryId=mem.id,
            label=f"{mem.attribute}: {mem.value}",
            status=mem.status,
            category=mem.category,
            confidence=mem.confidence,
            color=node_color,
            type="memory",
            val=14 if is_current else 10
        ))

        links.append(GraphEdge(
            source=target_parent,
            target=node_id,
            label=mem.attribute,
            status=mem.status,
            dashed=is_superseded
        ))

        if mem.supersedes_memory_id:
            links.append(GraphEdge(
                source=node_id,
                target=f"node-{mem.supersedes_memory_id}",
                label="Supersedes",
                type="supersede",
                dashed=True
            ))

    return MemoryGraphResponse(nodes=nodes, links=links)

@router.get("/history", response_model=List[MemoryHistoryResponse])
async def get_memory_history(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(MemoryHistory).where(MemoryHistory.user_id == user_id).order_by(desc(MemoryHistory.created_at))
    )
    return res.scalars().all()

@router.get("/{id}", response_model=MemoryResponse)
async def get_memory(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Memory).where(Memory.id == id, Memory.user_id == user_id))
    memory = res.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory

@router.post("", response_model=MemoryResponse)
async def create_memory(
    mem_in: MemoryCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Memory).where(Memory.user_id == user_id))
    count = len(res.scalars().all()) + 1
    new_id = f"M{str(count).zfill(3)}"

    new_memory = Memory(
        id=new_id,
        user_id=user_id,
        category=mem_in.category.upper(),
        subject=mem_in.subject,
        attribute=mem_in.attribute,
        value=mem_in.value,
        status=mem_in.status,
        confidence=mem_in.confidence,
        importance=mem_in.importance,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        valid_from=datetime.utcnow(),
        valid_until=mem_in.valid_until,
        source_conversation_id=mem_in.source_conversation_id,
        source_conversation_title=mem_in.source_conversation_title,
        notes=mem_in.notes
    )
    db.add(new_memory)
    await db.commit()
    await db.refresh(new_memory)

    # Index vector
    text = f"{new_memory.subject} {new_memory.attribute} is {new_memory.value}"
    vec = await embedding_service.get_embedding(text)
    await vector_store.upsert(
        memory_id=new_memory.id,
        vector=vec,
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

    return new_memory

@router.delete("/{id}")
async def delete_memory(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Memory).where(Memory.id == id, Memory.user_id == user_id))
    mem = res.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    await db.delete(mem)
    await db.commit()
    return {"status": "deleted", "id": id}
