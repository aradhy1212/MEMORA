import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.postgres import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import ConversationResponse, ConversationCreate, ConversationUpdate, MessageResponse
from app.core.security import get_current_user_id

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationResponse])
async def get_conversations(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(desc(Conversation.pinned), desc(Conversation.updated_at))
    )
    convs = res.scalars().all()

    # Attach messages
    output = []
    for c in convs:
        m_res = await db.execute(
            select(Message)
            .where(Message.conversation_id == c.id)
            .order_by(Message.created_at)
        )
        msgs = m_res.scalars().all()
        c_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "title": c.title,
            "preview": c.preview,
            "pinned": c.pinned,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "messages": msgs
        }
        output.append(c_dict)

    return output

@router.post("", response_model=ConversationResponse)
async def create_conversation(
    conv_in: ConversationCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    conv_id = f"conv-{uuid.uuid4().hex[:6]}"
    now = datetime.utcnow()
    new_conv = Conversation(
        id=conv_id,
        user_id=user_id,
        title=conv_in.title or "New Conversation",
        preview="Start a conversation with persistent memory...",
        created_at=now,
        updated_at=now
    )
    db.add(new_conv)

    # Initial Welcome message
    welcome_msg = Message(
        id=f"msg-{uuid.uuid4().hex[:8]}",
        conversation_id=conv_id,
        user_id=user_id,
        role="assistant",
        content="Hello Rahul! 👋 I have your **active episodic memories** loaded, including your **Travel Helper** stack and **Python** preference.\n\nWhat would you like to build or discuss today?",
        evidence={
            "memoryUsedId": "M004, M009",
            "memorySubject": "Rahul",
            "attribute": "Profile & Active Project",
            "value": "VIT Chennai / Travel Helper",
            "status": "CURRENT",
            "confidence": "99%",
            "source": "Episodic Knowledge Base",
            "reason": "Initialized new session context with verified user persona."
        },
        created_at=now
    )
    db.add(welcome_msg)
    await db.commit()

    return {
        "id": new_conv.id,
        "user_id": new_conv.user_id,
        "title": new_conv.title,
        "preview": new_conv.preview,
        "pinned": new_conv.pinned,
        "created_at": new_conv.created_at,
        "updated_at": new_conv.updated_at,
        "messages": [welcome_msg]
    }

@router.patch("/{id}", response_model=ConversationResponse)
async def update_conversation(
    id: str,
    conv_in: ConversationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Conversation).where(Conversation.id == id, Conversation.user_id == user_id))
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conv_in.title is not None:
        conv.title = conv_in.title
    if conv_in.pinned is not None:
        conv.pinned = conv_in.pinned
    conv.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(conv)

    m_res = await db.execute(select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at))
    msgs = m_res.scalars().all()

    return {
        "id": conv.id,
        "user_id": conv.user_id,
        "title": conv.title,
        "preview": conv.preview,
        "pinned": conv.pinned,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "messages": msgs
    }

@router.delete("/{id}")
async def delete_conversation(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Conversation).where(Conversation.id == id, Conversation.user_id == user_id))
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Delete messages
    m_res = await db.execute(select(Message).where(Message.conversation_id == id))
    for m in m_res.scalars().all():
        await db.delete(m)

    await db.delete(conv)
    await db.commit()
    return {"status": "deleted", "id": id}

@router.get("/{id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Message)
        .where(Message.conversation_id == id, Message.user_id == user_id)
        .order_by(Message.created_at)
    )
    return res.scalars().all()
