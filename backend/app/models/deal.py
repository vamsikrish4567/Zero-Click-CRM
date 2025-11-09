"""Deal data model."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Deal(BaseModel):
    """Deal model."""

    id: str
    contact_id: str
    company_id: Optional[str] = None
    title: str
    value: Optional[float] = None
    stage: str  # discovery, proposal, negotiation, closed_won, closed_lost
    next_step: Optional[str] = None
    next_step_date: Optional[datetime] = None
    last_interaction: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class DealCreate(BaseModel):
    """Deal creation model."""

    contact_id: str
    company_id: Optional[str] = None
    title: str
    value: Optional[float] = None
    stage: str = "discovery"
    next_step: Optional[str] = None
    next_step_date: Optional[datetime] = None


class DealUpdate(BaseModel):
    """Deal update model."""

    title: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    next_step: Optional[str] = None
    next_step_date: Optional[datetime] = None




