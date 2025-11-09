"""Alternative Google Drive authentication using user-provided credentials."""

from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import json
import io
from typing import List, Dict, Optional


class UserGoogleDriveService:
    """Google Drive service using user-provided credentials."""
    
    def __init__(self):
        self.scopes = [
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
        ]
    
    def authenticate_with_json(self, credentials_json: str) -> bool:
        """Authenticate using user-provided credentials JSON.
        
        Args:
            credentials_json: JSON string of Google credentials
            
        Returns:
            True if authentication successful
        """
        try:
            creds_dict = json.loads(credentials_json)
            
            # Try service account credentials
            if 'type' in creds_dict and creds_dict['type'] == 'service_account':
                credentials = service_account.Credentials.from_service_account_info(
                    creds_dict,
                    scopes=self.scopes
                )
            else:
                # OAuth credentials
                credentials = Credentials.from_authorized_user_info(
                    creds_dict,
                    scopes=self.scopes
                )
            
            # Test the credentials
            service = build('drive', 'v3', credentials=credentials)
            service.files().list(pageSize=1).execute()
            
            return True
        except Exception as e:
            print(f"Authentication failed: {e}")
            return False
    
    def list_files_with_credentials(
        self, 
        credentials_json: str,
        folder_id: Optional[str] = None,
        max_results: int = 50
    ) -> List[Dict]:
        """List files using provided credentials.
        
        Args:
            credentials_json: JSON string of Google credentials
            folder_id: Optional folder ID to list from
            max_results: Maximum number of files to return
            
        Returns:
            List of file metadata
        """
        try:
            creds_dict = json.loads(credentials_json)
            
            if 'type' in creds_dict and creds_dict['type'] == 'service_account':
                credentials = service_account.Credentials.from_service_account_info(
                    creds_dict,
                    scopes=self.scopes
                )
            else:
                credentials = Credentials.from_authorized_user_info(
                    creds_dict,
                    scopes=self.scopes
                )
            
            service = build('drive', 'v3', credentials=credentials)
            
            query_parts = []
            if folder_id:
                query_parts.append(f"'{folder_id}' in parents")
            
            query = " and ".join(query_parts) if query_parts else None
            
            results = service.files().list(
                q=query,
                pageSize=max_results,
                fields="files(id, name, mimeType, size, modifiedTime, webViewLink)",
                orderBy="modifiedTime desc"
            ).execute()
            
            return results.get('files', [])
        except Exception as e:
            print(f"Error listing files: {e}")
            raise
    
    def download_file_with_credentials(
        self,
        credentials_json: str,
        file_id: str
    ) -> bytes:
        """Download file using provided credentials.
        
        Args:
            credentials_json: JSON string of Google credentials
            file_id: Google Drive file ID
            
        Returns:
            File content as bytes
        """
        try:
            creds_dict = json.loads(credentials_json)
            
            if 'type' in creds_dict and creds_dict['type'] == 'service_account':
                credentials = service_account.Credentials.from_service_account_info(
                    creds_dict,
                    scopes=self.scopes
                )
            else:
                credentials = Credentials.from_authorized_user_info(
                    creds_dict,
                    scopes=self.scopes
                )
            
            service = build('drive', 'v3', credentials=credentials)
            
            request = service.files().get_media(fileId=file_id)
            file_buffer = io.BytesIO()
            downloader = MediaIoBaseDownload(file_buffer, request)
            
            done = False
            while not done:
                status, done = downloader.next_chunk()
            
            return file_buffer.getvalue()
        except Exception as e:
            print(f"Error downloading file: {e}")
            raise


user_gdrive_service = UserGoogleDriveService()


