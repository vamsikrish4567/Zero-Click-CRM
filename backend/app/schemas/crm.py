"""CRM-related schemas."""

from typing import Optional, List
from pydantic import BaseModel


class ExtractedData(BaseModel):
    """Schema for AI-extracted data."""

    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_title: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    deal_title: Optional[str] = None
    deal_value: Optional[float] = None
    next_step: Optional[str] = None
    next_step_date: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    entities: List[str] = []


class UploadResponse(BaseModel):
    """Response for file upload."""

    success: bool
    message: str
    extracted_data: Optional[ExtractedData] = None
    contact_id: Optional[str] = None
    company_id: Optional[str] = None
    interaction_id: Optional[str] = None
    deal_id: Optional[str] = None


class SearchQuery(BaseModel):
    """Natural language search query."""

    query: str
    limit: int = 10


class SearchResult(BaseModel):
    """Search result."""

    type: str  # contact, company, interaction, deal
    id: str
    title: str
    description: str
    relevance_score: float




