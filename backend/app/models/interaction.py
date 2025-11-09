"""Interaction data model."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class Interaction(BaseModel):
    """Interaction model."""

    id: str
    contact_id: str
    type: str  # email, call, voice_note, meeting
    date: datetime
    summary: str
    raw_content: Optional[str] = None
    sentiment: Optional[str] = None  # positive, neutral, negative
    extracted_entities: List[str] = []
    created_at: datetime


class InteractionCreate(BaseModel):
    """Interaction creation model."""

    contact_id: str
    type: str
    summary: str
    raw_content: Optional[str] = None
    sentiment: Optional[str] = None
    extracted_entities: List[str] = []




