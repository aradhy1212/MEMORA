from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class MemoryBase(BaseModel):
    category: str
    subject: str
    attribute: str
    value: str
    status: str = "CURRENT"
    confidence: float = 0.95
    importance: float = 0.85
    notes: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

class MemoryCreate(MemoryBase):
    valid_until: Optional[datetime] = None
    source_conversation_id: Optional[str] = None
    source_conversation_title: Optional[str] = None
    source_message_id: Optional[str] = None
    supersedes_memory_id: Optional[str] = None

class MemoryUpdate(BaseModel):
    value: Optional[str] = None
    status: Optional[str] = None
    confidence: Optional[float] = None
    importance: Optional[float] = None
    notes: Optional[str] = None
    valid_until: Optional[datetime] = None

class MemoryResponse(MemoryBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    valid_from: datetime
    valid_until: Optional[datetime] = None
    source_conversation_id: Optional[str] = None
    source_conversation_title: Optional[str] = None
    source_message_id: Optional[str] = None
    supersedes_memory_id: Optional[str] = None
    superseded_by_memory_id: Optional[str] = None

    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: str
    label: str
    memoryId: Optional[str] = None
    type: str
    category: Optional[str] = None
    status: Optional[str] = None
    confidence: Optional[float] = None
    color: Optional[str] = None
    val: Optional[int] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    dashed: Optional[bool] = False

class MemoryGraphResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphEdge]

class MemoryHistoryResponse(BaseModel):
    id: str
    memory_id: str
    action: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    source_conversation_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
