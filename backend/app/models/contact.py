"""Contact data model."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class Contact(BaseModel):
    """Contact model."""

    id: str
    name: str
    email: Optional[str] = None  # Changed from EmailStr to be more flexible
    phone: Optional[str] = None
    company: Optional[str] = None  # Changed from company_id to company (name)
    title: Optional[str] = None
    status: Optional[str] = "Active"  # Added status field
    source: str  # email, voice, manual, Salesforce, HubSpot, etc.
    created_at: str  # Changed to str for ISO format
    
    class Config:
        extra = "allow"  # Allow extra fields from JSON


class ContactCreate(BaseModel):
    """Contact creation model."""

    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_id: Optional[str] = None
    title: Optional[str] = None
    source: str = "manual"


class ContactUpdate(BaseModel):
    """Contact update model."""

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_id: Optional[str] = None
    title: Optional[str] = None



