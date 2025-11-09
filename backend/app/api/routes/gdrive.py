"""Google Drive API routes."""

from fastapi import APIRouter, HTTPException, Query, Request, Response, Cookie
from fastapi.responses import RedirectResponse
from typing import List, Dict, Optional
from app.services.google_drive import gdrive_service
from app.services.ai_extraction import ai_service
from app.schemas.crm import UploadResponse
from app.core.session import session_manager
from pydantic import BaseModel

router = APIRouter()


class GDriveFile(BaseModel):
    """Google Drive file model."""
    id: str
    name: str
    mimeType: str
    size: Optional[str] = None
    modifiedTime: str
    webViewLink: Optional[str] = None
    thumbnailLink: Optional[str] = None
    isDemo: Optional[bool] = False


class GDriveAuthResponse(BaseModel):
    """Google Drive auth response."""
    authorization_url: str
    message: str
    session_id: str


@router.get("/auth")
async def get_auth_url(response: Response) -> GDriveAuthResponse:
    """Get Google Drive OAuth2 authorization URL."""
    try:
        # Create a new session
        session_id = session_manager.create_session()
        
        # Get auth URL
        auth_url, state = gdrive_service.get_authorization_url(session_id)
        
        # Store state in session
        session_manager.update_session(session_id, {'state': state})
        
        # Set session cookie
        response.set_cookie(
            key="gdrive_session",
            value=session_id,
            httponly=True,
            max_age=3600,  # 1 hour
            samesite='lax'
        )
        
        return GDriveAuthResponse(
            authorization_url=auth_url,
            message="Open this URL in your browser to authorize access",
            session_id=session_id
        )
    except Exception as e:
        import traceback
        print(f"Error in get_auth_url: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating auth URL: {str(e)}")


@router.get("/callback")
async def oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    gdrive_session: Optional[str] = Cookie(None)
):
    """Handle OAuth2 callback from Google."""
    try:
        # Verify session
        if not gdrive_session:
            return RedirectResponse(
                url="http://localhost:5173/upload?error=no_session",
                status_code=302
            )
        
        session_data = session_manager.get_session(gdrive_session)
        if not session_data:
            return RedirectResponse(
                url="http://localhost:5173/upload?error=invalid_session",
                status_code=302
            )
        
        # Verify state
        if session_data.get('state') != state:
            return RedirectResponse(
                url="http://localhost:5173/upload?error=state_mismatch",
                status_code=302
            )
        
        # Check if this is demo mode
        if code == "demo_code":
            print("⚠️  Demo mode OAuth callback - simulating successful auth")
            # Store a demo flag in session
            session_manager.update_session(gdrive_session, {'credentials': 'demo', 'demo_mode': True})
            return RedirectResponse(
                url="http://localhost:5173/upload?connected=true&demo=true",
                status_code=302
            )
        
        # Real OAuth: Exchange code for credentials
        credentials = gdrive_service.get_credentials_from_code(code)
        
        # Store credentials in session
        session_manager.set_credentials(gdrive_session, credentials)
        
        # Redirect back to frontend
        return RedirectResponse(
            url="http://localhost:5173/upload?connected=true",
            status_code=302
        )
    except Exception as e:
        print(f"OAuth callback error: {e}")
        return RedirectResponse(
            url=f"http://localhost:5173/upload?error={str(e)}",
            status_code=302
        )


@router.get("/files", response_model=List[GDriveFile])
async def list_files(
    folder_id: Optional[str] = Query(None, description="Folder ID to list files from"),
    file_types: Optional[str] = Query(None, description="Comma-separated MIME types"),
    gdrive_session: Optional[str] = Cookie(None)
):
    """List files from Google Drive.
    
    Requires authentication via OAuth2.
    """
    try:
        # Get credentials from session
        credentials = None
        if gdrive_session:
            credentials = session_manager.get_credentials(gdrive_session)
        
        mime_types = None
        if file_types:
            mime_types = [ft.strip() for ft in file_types.split(',')]
        
        files = gdrive_service.list_files(
            credentials=credentials,
            folder_id=folder_id,
            mime_types=mime_types
        )
        
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


@router.post("/import/{file_id}", response_model=UploadResponse)
async def import_file(
    file_id: str,
    gdrive_session: Optional[str] = Cookie(None)
):
    """Import a file from Google Drive and process it with AI.
    
    Args:
        file_id: Google Drive file ID
        
    Returns:
        Upload response with extracted CRM data
    """
    try:
        # Get credentials from session
        credentials = None
        if gdrive_session:
            credentials = session_manager.get_credentials(gdrive_session)
        
        # For demo files, get mock content
        if file_id.startswith("mock-"):
            content = gdrive_service.get_mock_file_content(file_id)
        else:
            # Download actual file from Google Drive
            if not credentials:
                raise HTTPException(
                    status_code=401,
                    detail="Not authenticated. Please connect your Google Drive first."
                )
            
            try:
                content_bytes = gdrive_service.download_file(file_id, credentials)
                content = content_bytes.decode('utf-8')
            except Exception as e:
                # Try exporting as Google Doc
                try:
                    content_bytes = gdrive_service.export_google_doc(file_id, 'text/plain', credentials)
                    content = content_bytes.decode('utf-8')
                except Exception:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Could not download or export file: {str(e)}"
                    )
        
        # Extract structured data using AI
        extracted = ai_service.extract_from_text(content, source_type="call")
        
        # TODO: Create CRM entities (contacts, companies, deals)
        # For now, just return the extracted data
        
        return UploadResponse(
            success=True,
            message=f"File imported successfully from Google Drive",
            extracted_data=extracted,
            contact_id=None,
            company_id=None,
            interaction_id=None,
            deal_id=None,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing file: {str(e)}")


@router.get("/status")
async def get_connection_status(gdrive_session: Optional[str] = Cookie(None)):
    """Get Google Drive connection status."""
    connected = False
    if gdrive_session:
        credentials = session_manager.get_credentials(gdrive_session)
        connected = credentials is not None
    
    return {
        "connected": connected,
        "mode": "oauth" if connected else "demo",
        "message": "Connected to Google Drive" if connected else "Using demo mode. Connect your Google account for full access.",
        "files_available": 4 if not connected else "unknown"
    }


@router.post("/disconnect")
async def disconnect(
    response: Response,
    gdrive_session: Optional[str] = Cookie(None)
):
    """Disconnect from Google Drive."""
    if gdrive_session:
        session_manager.delete_session(gdrive_session)
        response.delete_cookie("gdrive_session")
    
    return {"message": "Disconnected from Google Drive", "success": True}

