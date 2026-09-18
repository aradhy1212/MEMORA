from sqlalchemy import Column, String, DateTime, Float, JSON, Text
from datetime import datetime
from app.database.postgres import Base

class Memory(Base):
    __tablename__ = "memories"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)

    category = Column(String, index=True, nullable=False)  # DATABASE, PROJECT, LANGUAGE, etc.
    subject = Column(String, nullable=False)               # Travel Helper, User Profile
    attribute = Column(String, nullable=False)             # Primary Database, Preferred Language
    value = Column(String, nullable=False)                 # PostgreSQL, Python

    status = Column(String, index=True, default="CURRENT") # CURRENT, SUPERSEDED, HISTORICAL, TEMPORARY, EXPIRED
    confidence = Column(Float, default=0.95)
    importance = Column(Float, default=0.85)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)

    source_conversation_id = Column(String, nullable=True)
    source_conversation_title = Column(String, nullable=True)
    source_message_id = Column(String, nullable=True)

    supersedes_memory_id = Column(String, nullable=True)
    superseded_by_memory_id = Column(String, nullable=True)

    embedding_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    meta = Column(JSON, nullable=True)
