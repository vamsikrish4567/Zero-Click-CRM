"""Google Drive integration service."""

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from app.core.config import settings
import os
import io
from typing import List, Dict, Optional


class GoogleDriveService:
    """Service for Google Drive integration."""

    def __init__(self):
        """Initialize Google Drive service."""
        self.scopes = [
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
        ]
        self.redirect_uri = "http://localhost:8000/api/gdrive/callback"
        
    def get_authorization_url(self, session_id: str = None) -> tuple[str, str]:
        """Get Google Drive OAuth2 authorization URL.
        
        Returns:
            Tuple of (authorization_url, state)
        """
        # Check if credentials file exists
        credentials_path = settings.GOOGLE_APPLICATION_CREDENTIALS or "credentials.json"
        
        if not os.path.exists(credentials_path):
            # For demo purposes, return a mock URL and state
            mock_state = "demo_state_" + session_id if session_id else "demo_state_12345"
            mock_url = f"http://localhost:8000/api/gdrive/callback?code=demo_code&state={mock_state}"
            print(f"⚠️  Demo mode: credentials.json not found. Using mock OAuth flow.")
            return (mock_url, mock_state)
        
        try:
            flow = Flow.from_client_secrets_file(
                credentials_path,
                scopes=self.scopes,
                redirect_uri=self.redirect_uri
            )
            
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='consent'
            )
            
            return authorization_url, state
        except Exception as e:
            # If credentials file exists but is invalid, use demo mode
            print(f"⚠️  Error loading credentials: {e}. Using demo mode.")
            mock_state = "demo_state_" + session_id if session_id else "demo_state_12345"
            mock_url = f"http://localhost:8000/api/gdrive/callback?code=demo_code&state={mock_state}"
            return (mock_url, mock_state)
    
    def get_credentials_from_code(self, code: str) -> Credentials:
        """Exchange authorization code for credentials."""
        credentials_path = settings.GOOGLE_APPLICATION_CREDENTIALS or "credentials.json"
        
        flow = Flow.from_client_secrets_file(
            credentials_path,
            scopes=self.scopes,
            redirect_uri=self.redirect_uri
        )
        
        flow.fetch_token(code=code)
        return flow.credentials
    
    def list_files(
        self, 
        credentials: Optional[Credentials] = None,
        folder_id: Optional[str] = None,
        mime_types: Optional[List[str]] = None
    ) -> List[Dict]:
        """List files from Google Drive.
        
        Args:
            credentials: Google OAuth2 credentials
            folder_id: Optional folder ID to list files from
            mime_types: Optional list of MIME types to filter
            
        Returns:
            List of file metadata
        """
        # For demo without OAuth, return mock data
        if credentials is None:
            return self._get_mock_files()
        
        try:
            service = build('drive', 'v3', credentials=credentials)
            
            # Build query
            query_parts = []
            if folder_id:
                query_parts.append(f"'{folder_id}' in parents")
            if mime_types:
                mime_queries = [f"mimeType='{mime}'" for mime in mime_types]
                query_parts.append(f"({' or '.join(mime_queries)})")
            
            query = " and ".join(query_parts) if query_parts else None
            
            results = service.files().list(
                q=query,
                pageSize=50,
                fields="files(id, name, mimeType, size, modifiedTime, webViewLink, thumbnailLink)",
                orderBy="modifiedTime desc"
            ).execute()
            
            return results.get('files', [])
        except Exception as e:
            print(f"Error listing Google Drive files: {e}")
            return self._get_mock_files()
    
    def download_file(
        self, 
        file_id: str, 
        credentials: Optional[Credentials] = None
    ) -> bytes:
        """Download a file from Google Drive.
        
        Args:
            file_id: Google Drive file ID
            credentials: Google OAuth2 credentials
            
        Returns:
            File content as bytes
        """
        if credentials is None:
            raise Exception("Google Drive not authenticated. Please connect first.")
        
        try:
            service = build('drive', 'v3', credentials=credentials)
            
            request = service.files().get_media(fileId=file_id)
            file_buffer = io.BytesIO()
            downloader = MediaIoBaseDownload(file_buffer, request)
            
            done = False
            while not done:
                status, done = downloader.next_chunk()
            
            return file_buffer.getvalue()
        except Exception as e:
            print(f"Error downloading file from Google Drive: {e}")
            raise
    
    def export_google_doc(
        self, 
        file_id: str, 
        mime_type: str = 'text/plain',
        credentials: Optional[Credentials] = None
    ) -> bytes:
        """Export a Google Doc as text.
        
        Args:
            file_id: Google Drive file ID
            mime_type: Export MIME type (default: text/plain)
            credentials: Google OAuth2 credentials
            
        Returns:
            Exported content as bytes
        """
        if credentials is None:
            raise Exception("Google Drive not authenticated. Please connect first.")
        
        try:
            service = build('drive', 'v3', credentials=credentials)
            
            request = service.files().export_media(
                fileId=file_id,
                mimeType=mime_type
            )
            
            file_buffer = io.BytesIO()
            downloader = MediaIoBaseDownload(file_buffer, request)
            
            done = False
            while not done:
                status, done = downloader.next_chunk()
            
            return file_buffer.getvalue()
        except Exception as e:
            print(f"Error exporting Google Doc: {e}")
            raise
    
    def _get_mock_files(self) -> List[Dict]:
        """Return mock Google Drive files for demo purposes."""
        return [
            {
                "id": "mock-1",
                "name": "Sales Call with Acme Corp - Jan 15.txt",
                "mimeType": "text/plain",
                "size": "4521",
                "modifiedTime": "2024-01-15T14:30:00Z",
                "webViewLink": "https://drive.google.com/file/mock-1",
                "isDemo": True
            },
            {
                "id": "mock-2",
                "name": "Q1 Customer Meeting Notes.docx",
                "mimeType": "application/vnd.google-apps.document",
                "size": "12489",
                "modifiedTime": "2024-01-12T10:00:00Z",
                "webViewLink": "https://drive.google.com/file/mock-2",
                "isDemo": True
            },
            {
                "id": "mock-3",
                "name": "Product Demo Transcript - TechCorp.txt",
                "mimeType": "text/plain",
                "size": "8934",
                "modifiedTime": "2024-01-10T16:45:00Z",
                "webViewLink": "https://drive.google.com/file/mock-3",
                "isDemo": True
            },
            {
                "id": "mock-4",
                "name": "Meeting Transcripts",
                "mimeType": "application/vnd.google-apps.folder",
                "modifiedTime": "2024-01-08T09:00:00Z",
                "webViewLink": "https://drive.google.com/folder/mock-4",
                "isDemo": True
            }
        ]
    
    def get_mock_file_content(self, file_id: str) -> str:
        """Get mock file content for demo."""
        mock_contents = {
            "mock-1": """Sales Call with Acme Corp - January 15, 2024

Participants:
- Sarah Chen, VP of Sales at Acme Corp (sarah.chen@acmecorp.com)
- John Smith, Our Sales Rep

Transcript:

John: Hi Sarah, thanks for taking the time to meet today. How are things going at Acme Corp?

Sarah: Hi John! Things are going well. We've been growing rapidly and we're now at about 250 employees. We're really looking to improve our customer relationship management.

John: That's great to hear about the growth! So tell me more about your current CRM challenges.

Sarah: Well, right now we're using spreadsheets and it's become unmanageable. We need something that can handle our growing customer base, track deals, and integrate with our existing tools. We're particularly interested in AI-powered solutions.

John: Perfect, that's exactly what our platform does. We can help automate a lot of that manual data entry. What's your timeline for making a decision?

Sarah: We're looking to have something in place by end of Q1. Our budget is around $75,000 for the first year, including implementation.

John: That works perfectly with our Enterprise plan. I'll send over a detailed proposal by end of this week. Should I include your CTO, Michael Rodriguez, in the next discussion?

Sarah: Yes, please do. His email is m.rodriguez@acmecorp.com. He'll need to sign off on any technical integration.

John: Excellent. I'll schedule a technical demo for next Tuesday at 2 PM. Does that work?

Sarah: Perfect. Looking forward to it!

John: Great! I'll send you the calendar invite and proposal by Friday. Thanks again, Sarah!""",
            "mock-2": "Q1 Customer Meeting Notes - Discussion about product roadmap and feature requests from top 5 customers.",
            "mock-3": "Product Demo Transcript for TechCorp - Demonstrated new AI features and integration capabilities."
        }
        return mock_contents.get(file_id, "Mock file content not available.")


# Global instance
gdrive_service = GoogleDriveService()

