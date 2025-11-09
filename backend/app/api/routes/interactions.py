"""Interactions API routes."""

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.interaction import Interaction, InteractionCreate
from app.core.database import db
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/", response_model=List[Interaction])
async def list_interactions(
    contact_id: str = None,
    limit: int = 100,
    offset: int = 0
):
    """List interactions, optionally filtered by contact."""
    where_clause = f"WHERE contact_id = '{contact_id}'" if contact_id else ""
    query = f"""
        SELECT *
        FROM `{db.get_table_id('interactions')}`
        {where_clause}
        ORDER BY date DESC
        LIMIT {limit}
        OFFSET {offset}
    """
    try:
        results = db.query(query)
        interactions = [dict(row) for row in results]
        return interactions
    except Exception as e:
        return []


@router.get("/{interaction_id}", response_model=Interaction)
async def get_interaction(interaction_id: str):
    """Get a specific interaction."""
    query = f"""
        SELECT *
        FROM `{db.get_table_id('interactions')}`
        WHERE id = '{interaction_id}'
    """
    try:
        results = db.query(query)
        interactions = [dict(row) for row in results]
        if not interactions:
            raise HTTPException(status_code=404, detail="Interaction not found")
        return interactions[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Interaction)
async def create_interaction(interaction: InteractionCreate):
    """Create a new interaction."""
    interaction_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    row = {
        "id": interaction_id,
        "contact_id": interaction.contact_id,
        "type": interaction.type,
        "date": now.isoformat(),
        "summary": interaction.summary,
        "raw_content": interaction.raw_content,
        "sentiment": interaction.sentiment,
        "extracted_entities": interaction.extracted_entities,
        "created_at": now.isoformat(),
    }
    
    try:
        db.insert_rows("interactions", [row])
        return Interaction(**row, date=now, created_at=now)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




