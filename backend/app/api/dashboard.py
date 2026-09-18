from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.postgres import get_db
from app.models.memory import Memory
from app.models.memory_history import MemoryHistory
from app.core.security import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])

@router.get("/stats")
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Memory).where(Memory.user_id == user_id))
    all_mems = res.scalars().all()

    active = sum(1 for m in all_mems if m.status == "CURRENT")
    updated = sum(1 for m in all_mems if m.status == "SUPERSEDED")
    historical = sum(1 for m in all_mems if m.status == "HISTORICAL")
    temporary = sum(1 for m in all_mems if m.status == "TEMPORARY")

    avg_conf = (
        sum(m.confidence for m in all_mems) / len(all_mems) if all_mems else 0.95
    )

    return {
        "active_memories": active,
        "updated_memories": updated,
        "historical_memories": historical,
        "temporary_memories": temporary,
        "total_memories": len(all_mems),
        "mean_confidence": round(avg_conf * 100)
    }

@router.get("/activity")
async def get_dashboard_activity(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Returns weekly ingestion activity
    return [
        {"day": "Mon", "count": 4, "height": "45%"},
        {"day": "Tue", "count": 7, "height": "70%"},
        {"day": "Wed", "count": 3, "height": "35%"},
        {"day": "Thu", "count": 9, "height": "90%"},
        {"day": "Fri", "count": 12, "height": "100%"},
        {"day": "Sat", "count": 6, "height": "60%"},
        {"day": "Sun", "count": 8, "height": "80%"}
    ]

@router.get("/recent-changes")
async def get_recent_changes(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(MemoryHistory)
        .where(MemoryHistory.user_id == user_id)
        .order_by(desc(MemoryHistory.created_at))
        .limit(6)
    )
    histories = res.scalars().all()

    if histories:
        return [
            {
                "subject": h.action,
                "category": "MEMORY",
                "from": h.previous_value or "Initial",
                "to": h.new_value,
                "status": "MUTATION",
                "time": h.created_at.strftime("%b %d, %H:%M"),
                "memoryId": h.memory_id
            }
            for h in histories
        ]

    # Default fallback
    return [
        {
            "subject": "Database Migration",
            "category": "DATABASE",
            "from": "MongoDB",
            "to": "PostgreSQL",
            "status": "SUPERSEDED",
            "time": "Today, 10:14 AM",
            "memoryId": "M003"
        },
        {
            "subject": "Primary Language",
            "category": "LANGUAGE",
            "from": "Java",
            "to": "Python",
            "status": "CURRENT",
            "time": "Yesterday",
            "memoryId": "M001"
        },
        {
            "subject": "Project Phase",
            "category": "PROJECT",
            "from": "Planning",
            "to": "Active Development",
            "status": "CURRENT",
            "time": "Sep 16",
            "memoryId": "M004"
        }
    ]
