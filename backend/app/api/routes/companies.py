"""Companies API routes."""

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.company import Company, CompanyCreate, CompanyUpdate
from datetime import datetime
import uuid
import json
from pathlib import Path

router = APIRouter()

# Path to data directory
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"


def load_companies_from_connectors():
    """Load unique companies from all connected CRM connectors."""
    companies_dict = {}
    
    for connector_id in ["salesforce", "hubspot", "pipedrive", "zoho", "monday", "zendesk"]:
        file_path = DATA_DIR / f"{connector_id}.json"
        
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                if data.get("connected") and data.get("contacts"):
                    for contact in data["contacts"]:
                        company_name = contact.get("company")
                        if company_name and company_name not in companies_dict:
                            companies_dict[company_name] = {
                                "id": str(uuid.uuid4()),
                                "name": company_name,
                                "website": f"https://{company_name.lower().replace(' ', '')}.com",
                                "industry": "Technology",
                                "size": "Unknown",
                                "source": data["name"],
                                "created_at": contact.get("created_at", datetime.now().isoformat()),
                                "updated_at": datetime.now().isoformat()
                            }
            except Exception as e:
                print(f"Error loading companies from {connector_id}: {e}")
    
    return list(companies_dict.values())


@router.get("", response_model=List[Company])
@router.get("/", response_model=List[Company])
async def list_companies(limit: int = 100, offset: int = 0):
    """List all companies from connected CRMs."""
    try:
        companies = load_companies_from_connectors()
        # Apply pagination
        return companies[offset:offset + limit]
    except Exception as e:
        print(f"Error listing companies: {e}")
        return []


@router.get("/{company_id}", response_model=Company)
async def get_company(company_id: str):
    """Get a specific company."""
    query = f"""
        SELECT *
        FROM `{db.get_table_id('companies')}`
        WHERE id = '{company_id}'
    """
    try:
        results = db.query(query)
        companies = [dict(row) for row in results]
        if not companies:
            raise HTTPException(status_code=404, detail="Company not found")
        return companies[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Company)
async def create_company(company: CompanyCreate):
    """Create a new company."""
    company_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    row = {
        "id": company_id,
        "name": company.name,
        "website": company.website,
        "industry": company.industry,
        "size": company.size,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    try:
        db.insert_rows("companies", [row])
        return Company(**row, created_at=now, updated_at=now)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{company_id}", response_model=Company)
async def update_company(company_id: str, company: CompanyUpdate):
    """Update a company."""
    # TODO: Implement update logic
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/{company_id}")
async def delete_company(company_id: str):
    """Delete a company."""
    # TODO: Implement delete logic
    raise HTTPException(status_code=501, detail="Not implemented")



