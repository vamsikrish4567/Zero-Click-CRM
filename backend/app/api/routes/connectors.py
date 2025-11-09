"""API routes for CRM connectors."""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
import os
from pathlib import Path

router = APIRouter()

# Path to data directory
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"


def load_connector_data(connector_id: str) -> Dict[str, Any]:
    """Load connector data from JSON file."""
    file_path = DATA_DIR / f"{connector_id}.json"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Connector {connector_id} not found")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_connector_data(connector_id: str, data: Dict[str, Any]):
    """Save connector data to JSON file."""
    file_path = DATA_DIR / f"{connector_id}.json"
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@router.get("")
@router.get("/")
async def list_connectors():
    """Get list of all available connectors (CRMs + Data Sources)."""
    connectors = []
    
    # CRM Connectors
    for connector_id in ["salesforce", "hubspot", "pipedrive", "zoho", "monday", "zendesk"]:
        try:
            data = load_connector_data(connector_id)
            connectors.append({
                "id": data["id"],
                "name": data["name"],
                "connected": data["connected"],
                "stats": data["stats"],
                "type": "crm"
            })
        except Exception:
            continue
    
    # Data Source Connectors
    for connector_id in ["gmail", "voice", "transcript", "gdrive"]:
        try:
            data = load_connector_data(connector_id)
            connectors.append({
                "id": data["id"],
                "name": data["name"],
                "connected": data["connected"],
                "stats": data["stats"],
                "type": "datasource"
            })
        except Exception:
            continue
    
    return {"connectors": connectors}


@router.get("/{connector_id}")
async def get_connector(connector_id: str):
    """Get detailed data for a specific connector."""
    return load_connector_data(connector_id)


@router.post("/{connector_id}/connect")
async def connect_connector(connector_id: str):
    """Connect a CRM connector (preserve existing data)."""
    data = load_connector_data(connector_id)
    
    if data["connected"]:
        return {"message": "Already connected", "connector": data}
    
    from datetime import datetime
    import random
    
    # Mark as connected
    data["connected"] = True
    
    # Count existing contacts and deals
    existing_contacts = len(data.get("contacts", []))
    existing_deals = len(data.get("deals", []))
    existing_companies = len(set(c.get("company") for c in data.get("contacts", []) if c.get("company")))
    
    # Update stats to reflect ACTUAL data (not random)
    data["stats"] = {
        "contacts": existing_contacts,
        "deals": existing_deals,
        "companies": existing_companies if existing_companies > 0 else random.randint(30, 100),
        "lastSync": datetime.utcnow().isoformat() + "Z"
    }
    
    # ONLY generate mock data if NO contacts/deals exist
    if existing_contacts == 0:
        data["contacts"] = [
            {
                "id": f"{connector_id}-{i}",
                "name": f"Contact {i}",
                "email": f"contact{i}@example.com",
                "phone": f"(555) {100+i:03d}-{1000+i:04d}",
                "company": f"Company {i}",
                "title": "Manager",
                "status": "Active",
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            for i in range(1, 6)
        ]
        # Update stats with generated contacts
        data["stats"]["contacts"] = 5
    
    if existing_deals == 0:
        data["deals"] = [
            {
                "id": f"{connector_id}-deal-{i}",
                "title": f"Deal {i} - Company {i}",
                "value": random.randint(20000, 150000),
                "stage": random.choice(["discovery", "proposal", "negotiation"]),
                "contact": f"Contact {i}",
                "company": f"Company {i}",
                "closeDate": "2024-02-15"
            }
            for i in range(1, 4)
        ]
        # Update stats with generated deals
        data["stats"]["deals"] = 3
    
    # Preserve existing recentActivity (especially transcript-based activities)
    if not data.get("recentActivity") or not any(activity.get("transcriptId") for activity in data.get("recentActivity", [])):
        data["recentActivity"] = [
            {
                "action": f"{data['name']} connected successfully",
                "detail": f"{data['stats']['contacts']} contacts synced",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        ]
    elif data.get("recentActivity"):
        data["recentActivity"].insert(0, {
            "action": f"{data['name']} connected",
            "detail": f"Synced {data['stats']['contacts']} contacts, {data['stats']['deals']} deals",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "connector": data["name"]
        })
    
    save_connector_data(connector_id, data)
    
    return {"message": "Connected successfully", "connector": data}


@router.post("/{connector_id}/disconnect")
async def disconnect_connector(connector_id: str):
    """Disconnect a CRM connector (preserve data for reconnection)."""
    data = load_connector_data(connector_id)
    
    if not data["connected"]:
        return {"message": "Already disconnected", "connector": data}
    
    # Just mark as disconnected, but KEEP the contacts and deals
    data["connected"] = False
    
    # Update stats to show it's disconnected (but preserve the counts for info)
    # This way when you reconnect, the data is still there
    data["stats"]["lastSync"] = None
    
    # Optional: You can choose to keep or clear recentActivity
    # For now, let's preserve it so you don't lose transcript activities
    # If you want to clear it, uncomment the line below:
    # data["recentActivity"] = []
    
    save_connector_data(connector_id, data)
    
    return {"message": "Disconnected successfully", "connector": data}


@router.get("/{connector_id}/contacts")
async def get_connector_contacts(connector_id: str):
    """Get contacts from a specific connector."""
    data = load_connector_data(connector_id)
    
    if not data["connected"]:
        return {"contacts": []}
    
    return {"contacts": data.get("contacts", [])}


@router.get("/{connector_id}/deals")
async def get_connector_deals(connector_id: str):
    """Get deals from a specific connector."""
    data = load_connector_data(connector_id)
    
    if not data["connected"]:
        return {"deals": []}
    
    return {"deals": data.get("deals", [])}


@router.get("/stats/summary")
async def get_connector_summary():
    """Get aggregate statistics from all connected connectors."""
    total_contacts = 0
    total_deals = 0
    total_companies = 0
    connected_count = 0
    active_connectors = []
    recent_activities = []
    transcripts_with_data_sources = 0
    
    for connector_id in ["salesforce", "hubspot", "pipedrive", "zoho", "monday", "zendesk"]:
        try:
            data = load_connector_data(connector_id)
            
            if data["connected"]:
                connected_count += 1
                total_contacts += data["stats"]["contacts"]
                total_deals += data["stats"]["deals"]
                total_companies += data["stats"]["companies"]
                
                active_connectors.append({
                    "id": data["id"],
                    "name": data["name"],
                    "contacts": data["stats"]["contacts"],
                    "status": "Active"
                })
                
                # Add transcripts from CONNECTED data sources only
                for transcript in data.get("transcripts", []):
                    # Get data source info
                    data_source_id = transcript.get("dataSource", "")
                    data_sources = data.get("dataSources", [])
                    data_source = next((ds for ds in data_sources if ds["id"] == data_source_id), None)
                    
                    # Only show activities from CONNECTED data sources
                    if data_source and data_source.get("connected"):
                        transcripts_with_data_sources += 1
                        
                        activity = {
                            "id": transcript["id"],
                            "type": transcript.get("type", "call"),
                            "title": transcript.get("title", ""),
                            "timestamp": transcript.get("date", ""),
                            "user": transcript.get("participants", [])[0] if transcript.get("participants") else "Unknown",
                            "description": f"{transcript.get('duration', '')} • {len(transcript.get('participants', []))} participants",
                            "connector": data["name"],
                            "connectorId": data["id"],
                            "transcriptId": transcript["id"],
                            "dataSource": data_source_id,
                            "dataSourceName": data_source.get("name", "Unknown"),
                            "dataSourceConnected": True
                        }
                        recent_activities.append(activity)
        except Exception as e:
            print(f"Error loading {connector_id}: {e}")
            continue
    
    # Sort activities by timestamp (most recent first)
    recent_activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return {
        "connectedCount": connected_count,
        "totalConnectors": 6,
        "totalContacts": total_contacts,
        "totalDeals": total_deals,
        "totalCompanies": total_companies,
        "activeConnectors": active_connectors[:3],
        "recentActivities": recent_activities,  # Return ALL activities
        "transcriptsWithDataSources": transcripts_with_data_sources
    }


@router.get("/{connector_id}/transcripts")
async def get_connector_transcripts(connector_id: str):
    """Get all transcripts from a specific CRM connector."""
    data = load_connector_data(connector_id)
    if not data["connected"]:
        raise HTTPException(status_code=400, detail=f"{data['name']} is not connected.")
    return {"transcripts": data.get("transcripts", [])}


@router.get("/{connector_id}/transcripts/{transcript_id}")
async def get_transcript_detail(connector_id: str, transcript_id: str):
    """Get detailed transcript content for AI analysis."""
    data = load_connector_data(connector_id)
    if not data["connected"]:
        raise HTTPException(status_code=400, detail=f"{data['name']} is not connected.")
    
    transcripts = data.get("transcripts", [])
    transcript = next((t for t in transcripts if t["id"] == transcript_id), None)
    
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    
    return transcript


@router.post("/{connector_id}/datasources/{datasource_id}/connect")
async def connect_datasource(connector_id: str, datasource_id: str):
    """Connect a specific data source (emails, calls, meetings, etc.)."""
    data = load_connector_data(connector_id)
    
    # Find the data source
    datasources = data.get("dataSources", [])
    datasource = next((ds for ds in datasources if ds["id"] == datasource_id), None)
    
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    if datasource["connected"]:
        return {"message": f"{datasource['name']} is already connected", "datasource": datasource}
    
    # Connect the data source
    datasource["connected"] = True
    
    # Add activities from this data source to recent activity
    transcripts = data.get("transcripts", [])
    activities_to_add = []
    
    for transcript in transcripts:
        if transcript.get("dataSource") == datasource_id:
            # Check if activity already exists
            existing_activity = next(
                (act for act in data.get("recentActivity", []) if act.get("transcriptId") == transcript["id"]),
                None
            )
            if not existing_activity:
                activities_to_add.append({
                    "action": transcript["title"],
                    "detail": transcript["summary"],
                    "timestamp": transcript["date"],
                    "connector": data["name"],
                    "transcriptId": transcript["id"],
                    "dataSource": datasource_id,
                    "type": transcript["type"]
                })
    
    # Add new activities to the beginning of recentActivity
    if activities_to_add:
        data["recentActivity"] = activities_to_add + data.get("recentActivity", [])
    
    save_connector_data(connector_id, data)
    
    return {
        "message": f"{datasource['name']} connected successfully",
        "datasource": datasource,
        "activitiesAdded": len(activities_to_add)
    }


@router.post("/{connector_id}/datasources/{datasource_id}/disconnect")
async def disconnect_datasource(connector_id: str, datasource_id: str):
    """Disconnect a specific data source."""
    data = load_connector_data(connector_id)
    
    # Find the data source
    datasources = data.get("dataSources", [])
    datasource = next((ds for ds in datasources if ds["id"] == datasource_id), None)
    
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")
    
    if not datasource["connected"]:
        return {"message": f"{datasource['name']} is already disconnected", "datasource": datasource}
    
    # Disconnect the data source
    datasource["connected"] = False
    
    # Remove activities from this data source from recent activity
    data["recentActivity"] = [
        activity for activity in data.get("recentActivity", [])
        if activity.get("dataSource") != datasource_id
    ]
    
    save_connector_data(connector_id, data)
    
    return {
        "message": f"{datasource['name']} disconnected successfully",
        "datasource": datasource
    }



