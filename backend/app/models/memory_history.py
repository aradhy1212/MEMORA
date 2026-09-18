from sqlalchemy import Column, String, DateTime, JSON, Text
from datetime import datetime
from app.database.postgres import Base

class MemoryHistory(Base):
    __tablename__ = "memory_history"

    id = Column(String, primary_key=True, index=True)
    memory_id = Column(String, index=True, nullable=False)
    user_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False)  # 'CREATED', 'SUPERSEDED', 'UPDATED', 'DECAYED', 'REINFORCED'
    previous_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    reason = Column(Text, nullable=True)
    source_conversation_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
