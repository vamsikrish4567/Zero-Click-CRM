"""Company data model."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Company(BaseModel):
    """Company model."""

    id: str
    name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CompanyCreate(BaseModel):
    """Company creation model."""

    name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None


class CompanyUpdate(BaseModel):
    """Company update model."""

    name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None




