from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.memory import Memory
from app.core.security import get_password_hash
from app.database.qdrant import vector_store
from app.services.embedding_service import embedding_service
from app.core.logging import MemoryLogger

async def seed_database(db: AsyncSession):
    # Check if user already seeded
    res = await db.execute(select(User).where(User.id == "user_rahul_01"))
    existing_user = res.scalar_one_or_none()
    if existing_user:
        return

    MemoryLogger.store("Seeding initial database with Rahul demo persona & episodic memories...")

    now = datetime.utcnow()

    # 1. Create Default User
    rahul = User(
        id="user_rahul_01",
        name="Rahul Sharma",
        email="rahul@memora.ai",
        password_hash=get_password_hash("memora2026"),
        created_at=now - timedelta(days=30)
    )
    db.add(rahul)

    # 2. Seed Conversations
    conv1 = Conversation(
        id="conv-1",
        user_id="user_rahul_01",
        title="Travel Helper Project",
        preview="I've switched the project database from MongoDB to PostgreSQL.",
        pinned=True,
        created_at=now - timedelta(days=2)
    )
    conv2 = Conversation(
        id="conv-2",
        user_id="user_rahul_01",
        title="Database Migration",
        preview="Comparing MongoDB aggregation pipelines vs PostgreSQL JSONB indexing.",
        pinned=False,
        created_at=now - timedelta(days=5)
    )
    conv3 = Conversation(
        id="conv-3",
        user_id="user_rahul_01",
        title="Hackathon Planning",
        preview="Preparing slides and architecture demo for HackClub AI Persistent Memory track.",
        pinned=False,
        created_at=now - timedelta(days=6)
    )
    conv4 = Conversation(
        id="conv-4",
        user_id="user_rahul_01",
        title="Project Discussion",
        preview="Switched primary language preference from Java to Python for AI agent development.",
        pinned=False,
        created_at=now - timedelta(days=7)
    )
    db.add_all([conv1, conv2, conv3, conv4])

    # 3. Seed Initial Messages in conv1
    msg1 = Message(
        id="msg-1",
        conversation_id="conv-1",
        user_id="user_rahul_01",
        role="user",
        content="I'm building my Travel Helper project using Node.js and MongoDB.",
        created_at=now - timedelta(days=2, hours=4)
    )
    msg2 = Message(
        id="msg-2",
        conversation_id="conv-1",
        user_id="user_rahul_01",
        role="assistant",
        content="Got it! I've stored this in your long-term memory:\n- **Project**: Travel Helper\n- **Backend**: Node.js (Express)\n- **Database**: MongoDB\n\nI'll remember this stack whenever we discuss Travel Helper architecture or queries.",
        memory_event={
            "type": "CREATED",
            "title": "Memory Created",
            "memoryId": "M002",
            "category": "DATABASE",
            "attribute": "Primary Database",
            "value": "MongoDB",
            "status": "CURRENT",
            "confidence": 0.92
        },
        evidence={
            "memoryUsedId": "M002",
            "memorySubject": "Travel Helper",
            "attribute": "Primary Database",
            "value": "MongoDB",
            "status": "CURRENT",
            "confidence": "92%",
            "source": "Current Conversation",
            "reason": "Direct statement of project technology stack during initial session."
        },
        created_at=now - timedelta(days=2, hours=4)
    )
    msg3 = Message(
        id="msg-3",
        conversation_id="conv-1",
        user_id="user_rahul_01",
        role="user",
        content="I've switched the project database from MongoDB to PostgreSQL.",
        created_at=now - timedelta(days=1, hours=2)
    )
    msg4 = Message(
        id="msg-4",
        conversation_id="conv-1",
        user_id="user_rahul_01",
        role="assistant",
        content="Understood! I've updated your project memory. \n\nYour previous choice of **MongoDB** has been marked as **SUPERSEDED**, and **PostgreSQL** is now your active database for **Travel Helper**.",
        memory_event={
            "type": "UPDATED",
            "title": "Memory Updated",
            "memoryId": "M003",
            "previousMemoryId": "M002",
            "category": "DATABASE",
            "attribute": "Primary Database",
            "previousValue": "MongoDB",
            "newValue": "PostgreSQL",
            "status": "CURRENT",
            "confidence": 0.96
        },
        evidence={
            "memoryUsedId": "M003",
            "memorySubject": "Travel Helper",
            "attribute": "Primary Database",
            "value": "PostgreSQL",
            "status": "CURRENT",
            "confidence": "96%",
            "source": "Conversation: Database Migration",
            "previousMemory": "M002 → MongoDB (SUPERSEDED)",
            "reason": "User explicitly stated migration from MongoDB to PostgreSQL. Resolves schema conflict."
        },
        created_at=now - timedelta(days=1, hours=2)
    )
    db.add_all([msg1, msg2, msg3, msg4])

    # 4. Seed Required Memories M001 to M007
    seed_memories = [
        Memory(
            id="M001",
            user_id="user_rahul_01",
            category="LANGUAGE",
            subject="Programming Language",
            attribute="Preferred Language",
            value="Python",
            status="CURRENT",
            confidence=0.98,
            importance=0.88,
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=7),
            valid_from=now - timedelta(days=7),
            source_conversation_id="conv-4",
            source_conversation_title="Project Discussion",
            supersedes_memory_id="M007",
            notes="Switched preference from Java to Python for rapid prototyping and AI ecosystem."
        ),
        Memory(
            id="M002",
            user_id="user_rahul_01",
            category="DATABASE",
            subject="Travel Helper",
            attribute="Primary Database",
            value="MongoDB",
            status="SUPERSEDED",
            confidence=0.92,
            importance=0.90,
            created_at=now - timedelta(days=20),
            updated_at=now - timedelta(days=1),
            valid_from=now - timedelta(days=20),
            valid_until=now - timedelta(days=1),
            source_conversation_id="conv-2",
            source_conversation_title="Database Migration",
            superseded_by_memory_id="M003",
            notes="Original document database chosen at project inception."
        ),
        Memory(
            id="M003",
            user_id="user_rahul_01",
            category="DATABASE",
            subject="Travel Helper",
            attribute="Primary Database",
            value="PostgreSQL",
            status="CURRENT",
            confidence=0.96,
            importance=0.95,
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(days=1),
            valid_from=now - timedelta(days=1),
            source_conversation_id="conv-2",
            source_conversation_title="Database Migration",
            supersedes_memory_id="M002",
            notes="Migrated to PostgreSQL for relational integrity, JSONB support and pgvector indexing."
        ),
        Memory(
            id="M004",
            user_id="user_rahul_01",
            category="PROJECT",
            subject="Travel Helper",
            attribute="Project Status",
            value="Active Development",
            status="CURRENT",
            confidence=0.99,
            importance=0.90,
            created_at=now - timedelta(days=15),
            updated_at=now - timedelta(days=1),
            valid_from=now - timedelta(days=15),
            source_conversation_id="conv-1",
            source_conversation_title="Travel Helper Project",
            notes="Core hackathon and portfolio application helping travelers organize itineraries."
        ),
        Memory(
            id="M005",
            user_id="user_rahul_01",
            category="BACKEND",
            subject="Travel Helper",
            attribute="Backend Runtime",
            value="Node.js (Express)",
            status="CURRENT",
            confidence=0.95,
            importance=0.85,
            created_at=now - timedelta(days=14),
            updated_at=now - timedelta(days=14),
            valid_from=now - timedelta(days=14),
            source_conversation_id="conv-1",
            source_conversation_title="Travel Helper Project",
            notes="Async REST API service handling itinerary curation and user sessions."
        ),
        Memory(
            id="M006",
            user_id="user_rahul_01",
            category="FRONTEND",
            subject="Travel Helper",
            attribute="UI Framework",
            value="React",
            status="CURRENT",
            confidence=0.97,
            importance=0.85,
            created_at=now - timedelta(days=14),
            updated_at=now - timedelta(days=14),
            valid_from=now - timedelta(days=14),
            source_conversation_id="conv-1",
            source_conversation_title="Travel Helper Project",
            notes="Single Page Application styled with warm aesthetic tokens."
        ),
        Memory(
            id="M007",
            user_id="user_rahul_01",
            category="LANGUAGE",
            subject="Programming Language",
            attribute="Preferred Language",
            value="Java",
            status="HISTORICAL",
            confidence=0.88,
            importance=0.70,
            created_at=now - timedelta(days=60),
            updated_at=now - timedelta(days=7),
            valid_from=now - timedelta(days=60),
            valid_until=now - timedelta(days=7),
            source_conversation_id="conv-4",
            source_conversation_title="Project Discussion",
            superseded_by_memory_id="M001",
            notes="Used in early academic coursework; superseded by Python preference."
        ),
        Memory(
            id="M008",
            user_id="user_rahul_01",
            category="EVENT",
            subject="HackClub Hackathon",
            attribute="Track & Focus",
            value="AI Persistent Memory Track",
            status="TEMPORARY",
            confidence=0.94,
            importance=0.80,
            created_at=now - timedelta(hours=18),
            updated_at=now - timedelta(hours=18),
            valid_from=now - timedelta(hours=18),
            valid_until=now + timedelta(hours=24),
            source_conversation_id="conv-3",
            source_conversation_title="Hackathon Planning",
            notes="Active submission window ends in 24 hours."
        ),
        Memory(
            id="M009",
            user_id="user_rahul_01",
            category="PROFILE",
            subject="Education",
            attribute="University",
            value="VIT Chennai",
            status="CURRENT",
            confidence=0.99,
            importance=0.95,
            created_at=now - timedelta(days=90),
            updated_at=now - timedelta(days=90),
            valid_from=now - timedelta(days=90),
            source_conversation_id="conv-0",
            source_conversation_title="Initial Onboarding",
            notes="3rd Year Computer Science and Engineering undergrad."
        )
    ]

    for m in seed_memories:
        db.add(m)
        # Seed vector into vector store
        text = f"{m.subject} {m.attribute} is {m.value} ({m.category})"
        vec = await embedding_service.get_embedding(text)
        await vector_store.upsert(
            memory_id=m.id,
            vector=vec,
            payload={
                "memory_id": m.id,
                "user_id": m.user_id,
                "category": m.category,
                "subject": m.subject,
                "attribute": m.attribute,
                "value": m.value,
                "status": m.status,
                "confidence": m.confidence,
                "importance": m.importance
            }
        )

    await db.commit()
    MemoryLogger.store("Seeding complete! 9 memories, 4 conversations indexed.")
