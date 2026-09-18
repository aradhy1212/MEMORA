from pydantic import BaseModel
from typing import Optional, List, Any, Dict

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str

class MemoryEvidenceItem(BaseModel):
    memoryUsedId: str
    memorySubject: Optional[str] = None
    attribute: Optional[str] = None
    value: str
    status: str = "CURRENT"
    confidence: str = "96%"
    source: str
    previousMemory: Optional[str] = None
    reason: Optional[str] = None

class MemoryEventItem(BaseModel):
    type: str  # 'CREATED', 'UPDATED', 'SUPERSEDED'
    title: str
    memoryId: str
    previousMemoryId: Optional[str] = None
    category: str
    attribute: str
    previousValue: Optional[str] = None
    newValue: Optional[str] = None
    value: Optional[str] = None
    status: str
    confidence: float

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    memory_event: Optional[MemoryEventItem] = None
    evidence: Optional[MemoryEvidenceItem] = None
    memory_used: Optional[List[Dict[str, Any]]] = []
