"""User credentials-based Google Drive routes."""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from pydantic import BaseModel
from app.services.user_google_drive import user_gdrive_service
from app.services.ai_extraction import ai_service
from app.schemas.crm import UploadResponse


router = APIRouter()


class UserCredentials(BaseModel):
    """User Google credentials."""
    credentials_json: str
    folder_id: str = None


class GDriveFile(BaseModel):
    """Google Drive file model."""
    id: str
    name: str
    mimeType: str
    size: str = None
    modifiedTime: str
    webViewLink: str = None


@router.post("/connect")
async def connect_with_credentials(credentials: UserCredentials):
    """Connect to Google Drive using user-provided credentials.
    
    Args:
        credentials: User's Google API credentials JSON
        
    Returns:
        Success status
    """
    try:
        # Test authentication
        is_valid = user_gdrive_service.authenticate_with_json(credentials.credentials_json)
        
        if not is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials. Please check your Google API credentials."
            )
        
        return {
            "success": True,
            "message": "Successfully connected to Google Drive",
            "connected": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect: {str(e)}"
        )


@router.post("/list-files")
async def list_user_files(credentials: UserCredentials) -> List[GDriveFile]:
    """List files from user's Google Drive.
    
    Args:
        credentials: User's Google API credentials JSON
        
    Returns:
        List of files
    """
    try:
        files = user_gdrive_service.list_files_with_credentials(
            credentials.credentials_json,
            folder_id=credentials.folder_id
        )
        return files
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list files: {str(e)}"
        )


@router.post("/import-file")
async def import_user_file(
    file_id: str,
    credentials_json: str
) -> UploadResponse:
    """Import a file using user credentials.
    
    Args:
        file_id: Google Drive file ID
        credentials_json: User's credentials
        
    Returns:
        Upload response with extracted data
    """
    try:
        # Download file
        content_bytes = user_gdrive_service.download_file_with_credentials(
            credentials_json,
            file_id
        )
        
        content = content_bytes.decode('utf-8')
        
        # Extract with AI
        extracted = ai_service.extract_from_text(content, source_type="call")
        
        return UploadResponse(
            success=True,
            message="File imported and processed successfully",
            extracted_data=extracted,
            contact_id=None,
            company_id=None,
            interaction_id=None,
            deal_id=None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to import file: {str(e)}"
        )


