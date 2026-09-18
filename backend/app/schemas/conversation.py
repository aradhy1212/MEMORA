from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None

class MessageCreate(BaseModel):
    content: str
    role: str = "user"

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    role: str
    content: str
    memory_event: Optional[Any] = None
    evidence: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    preview: Optional[str] = None
    pinned: bool = False
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageResponse]] = []

    class Config:
        from_attributes = True
