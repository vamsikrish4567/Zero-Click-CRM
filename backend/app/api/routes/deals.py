"""Deals API routes."""

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.deal import Deal, DealCreate, DealUpdate
from app.core.database import db
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/", response_model=List[Deal])
async def list_deals(
    stage: str = None,
    limit: int = 100,
    offset: int = 0
):
    """List deals, optionally filtered by stage."""
    where_clause = f"WHERE stage = '{stage}'" if stage else ""
    query = f"""
        SELECT *
        FROM `{db.get_table_id('deals')}`
        {where_clause}
        ORDER BY updated_at DESC
        LIMIT {limit}
        OFFSET {offset}
    """
    try:
        results = db.query(query)
        deals = [dict(row) for row in results]
        return deals
    except Exception as e:
        return []


@router.get("/{deal_id}", response_model=Deal)
async def get_deal(deal_id: str):
    """Get a specific deal."""
    query = f"""
        SELECT *
        FROM `{db.get_table_id('deals')}`
        WHERE id = '{deal_id}'
    """
    try:
        results = db.query(query)
        deals = [dict(row) for row in results]
        if not deals:
            raise HTTPException(status_code=404, detail="Deal not found")
        return deals[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Deal)
async def create_deal(deal: DealCreate):
    """Create a new deal."""
    deal_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    row = {
        "id": deal_id,
        "contact_id": deal.contact_id,
        "company_id": deal.company_id,
        "title": deal.title,
        "value": deal.value,
        "stage": deal.stage,
        "next_step": deal.next_step,
        "next_step_date": deal.next_step_date.isoformat() if deal.next_step_date else None,
        "last_interaction": None,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    try:
        db.insert_rows("deals", [row])
        return Deal(**row, created_at=now, updated_at=now)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{deal_id}", response_model=Deal)
async def update_deal(deal_id: str, deal: DealUpdate):
    """Update a deal."""
    # TODO: Implement update logic
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{deal_id}")
async def delete_deal(deal_id: str):
    """Delete a deal."""
    # TODO: Implement delete logic
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/at-risk")
async def get_at_risk_deals(days: int = 14):
    """Get deals at risk (no activity in specified days)."""
    # TODO: Implement risk detection logic
    return {"message": "Not implemented", "days": days}




