import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.postgres import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.memory import Memory
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.security import get_current_user_id
from app.memory.extractor import memory_extractor
from app.memory.classifier import memory_classifier
from app.memory.conflict_detector import conflict_detector
from app.memory.updater import memory_updater
from app.memory.retriever import memory_retriever
from app.memory.provenance import memory_provenance
from app.services.llm_service import llm_service
from app.core.logging import MemoryLogger

router = APIRouter(prefix="/chat", tags=["Chat & Reasoning Engine"])

@router.post("", response_model=ChatResponse)
async def process_chat(
    req: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.utcnow()
    
    # 1. Get or create conversation
    conv_id = req.conversation_id
    conversation = None
    if conv_id:
        res = await db.execute(select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == user_id))
        conversation = res.scalar_one_or_none()

    if not conversation:
        conv_id = f"conv-{uuid.uuid4().hex[:6]}"
        conversation = Conversation(
            id=conv_id,
            user_id=user_id,
            title="Travel Helper Project" if "travel helper" in req.message.lower() else "New Conversation",
            preview=req.message[:50],
            created_at=now
        )
        db.add(conversation)
        await db.commit()

    # 2. Save User Message
    user_msg_id = f"msg-{uuid.uuid4().hex[:8]}"
    user_msg = Message(
        id=user_msg_id,
        conversation_id=conv_id,
        user_id=user_id,
        role="user",
        content=req.message,
        created_at=now
    )
    db.add(user_msg)
    await db.commit()

    # 3. Memory Extraction & Classification
    candidate = await memory_extractor.extract_candidate(req.message)
    memory_event = None
    new_or_updated_memory = None

    if candidate:
        classified = memory_classifier.classify(candidate)
        
        # 4. Fetch existing memories to detect contradictions
        res_mem = await db.execute(select(Memory).where(Memory.user_id == user_id))
        existing_mems = res_mem.scalars().all()

        conflicted = conflict_detector.detect_conflict(classified, existing_mems)

        # 5. Process memory mutation (Create / Supersede / Log history / Vector index)
        new_or_updated_memory, memory_event = await memory_updater.process_memory_candidate(
            db=db,
            user_id=user_id,
            candidate=classified,
            conflicted_memory=conflicted,
            conversation_id=conv_id,
            conversation_title=conversation.title,
            message_id=user_msg_id
        )

    # 6. Hybrid Memory Retrieval for Reasoning
    retrieved_memories = await memory_retriever.retrieve_memories(
        db=db,
        user_id=user_id,
        query=req.message,
        limit=6
    )

    memories_payload = [
        {
            "id": m.id,
            "category": m.category,
            "subject": m.subject,
            "attribute": m.attribute,
            "value": m.value,
            "status": m.status,
            "confidence": m.confidence,
            "importance": m.importance,
            "supersedes": m.supersedes_memory_id,
            "sourceConversation": m.source_conversation_title
        }
        for m in retrieved_memories
    ]

    # 7. Generate Answer via LLM Service
    system_prompt = (
        "You are MEMORA, an empathetic, intelligent personal AI companion with persistent episodic memory. "
        "Your principal superpower is that you remember user preferences, tech stack choices, and past history. "
        "When answering, naturally ground your response in the user's verified persistent memories. "
        "If they ask about past vs current state, clearly distinguish active choices from superseded history."
    )

    ai_reply = await llm_service.generate_response(
        prompt=req.message,
        system_prompt=system_prompt,
        context_memories=memories_payload
    )

    # 8. Build Explainability Telemetry (Why did I say this?)
    evidence = None
    if retrieved_memories:
        top_mem = retrieved_memories[0]
        # If user asked about previous/historical database
        q_lower = req.message.lower()
        if any(w in q_lower for w in ["before", "previously", "earlier", "old", "past"]):
            hist_mem = next((m for m in retrieved_memories if m.status in ["SUPERSEDED", "HISTORICAL"]), None)
            if hist_mem:
                top_mem = hist_mem

        superseded_item = None
        if top_mem.supersedes_memory_id:
            res_sup = await db.execute(select(Memory).where(Memory.id == top_mem.supersedes_memory_id))
            superseded_item = res_sup.scalar_one_or_none()

        evidence = memory_provenance.build_evidence(top_mem, req.message, superseded_item)

    # 9. Save Assistant Message
    ai_msg_id = f"msg-{uuid.uuid4().hex[:8]}"
    ai_msg = Message(
        id=ai_msg_id,
        conversation_id=conv_id,
        user_id=user_id,
        role="assistant",
        content=ai_reply,
        memory_event=memory_event,
        evidence=evidence,
        created_at=datetime.utcnow()
    )
    db.add(ai_msg)

    # Update conversation preview
    conversation.preview = req.message[:60]
    conversation.updated_at = datetime.utcnow()
    await db.commit()

    return ChatResponse(
        conversation_id=conv_id,
        message_id=ai_msg_id,
        answer=ai_reply,
        memory_event=memory_event,
        evidence=evidence,
        memory_used=memories_payload
    )
