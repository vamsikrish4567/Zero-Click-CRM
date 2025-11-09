"""Contacts API routes."""

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.contact import Contact, ContactCreate, ContactUpdate
from datetime import datetime
import uuid
import json
from pathlib import Path

router = APIRouter()

# Path to data directory
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"


def load_contacts_from_connectors():
    """Load contacts from all connected CRM connectors."""
    all_contacts = []
    
    for connector_id in ["salesforce", "hubspot", "pipedrive", "zoho", "monday", "zendesk"]:
        file_path = DATA_DIR / f"{connector_id}.json"
        
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                if data.get("connected") and data.get("contacts"):
                    # Add connector info to each contact
                    for contact in data["contacts"]:
                        # Keep the original source (data source) and add connector name
                        contact_copy = contact.copy()
                        contact_copy["connector"] = data["name"]
                        # If contact doesn't have a source, use connector name
                        if "source" not in contact_copy or not contact_copy["source"]:
                            contact_copy["source"] = data["name"]
                        all_contacts.append(contact_copy)
            except Exception as e:
                print(f"Error loading contacts from {connector_id}: {e}")
    
    # Sort by created_at (most recent first)
    all_contacts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    return all_contacts


@router.get("", response_model=List[Contact])
@router.get("/", response_model=List[Contact])
async def list_contacts(limit: int = 100, offset: int = 0):
    """List all contacts from connected CRMs."""
    try:
        contacts = load_contacts_from_connectors()
        # Apply pagination
        return contacts[offset:offset + limit]
    except Exception as e:
        print(f"Error listing contacts: {e}")
        return []


@router.get("/{contact_id}", response_model=Contact)
async def get_contact(contact_id: str):
    """Get a specific contact."""
    query = f"""
        SELECT *
        FROM `{db.get_table_id('contacts')}`
        WHERE id = '{contact_id}'
    """
    try:
        results = db.query(query)
        contacts = [dict(row) for row in results]
        if not contacts:
            raise HTTPException(status_code=404, detail="Contact not found")
        return contacts[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Contact)
async def create_contact(contact: ContactCreate):
    """Create a new contact."""
    contact_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    row = {
        "id": contact_id,
        "name": contact.name,
        "email": contact.email,
        "phone": contact.phone,
        "company_id": contact.company_id,
        "title": contact.title,
        "source": contact.source,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    try:
        db.insert_rows("contacts", [row])
        return Contact(**row, created_at=now, updated_at=now)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{contact_id}", response_model=Contact)
async def update_contact(contact_id: str, contact: ContactUpdate):
    """Update a contact."""
    # TODO: Implement update logic
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{contact_id}")
async def delete_contact(contact_id: str):
    """Delete a contact."""
    # TODO: Implement delete logic
    raise HTTPException(status_code=501, detail="Not implemented")



