"""Session management for storing OAuth tokens."""

from typing import Dict, Optional
from datetime import datetime, timedelta
import uuid

# Simple in-memory session store (use Redis or database in production)
_sessions: Dict[str, Dict] = {}


class SessionManager:
    """Manage user sessions and OAuth tokens."""
    
    @staticmethod
    def create_session(user_id: str = None) -> str:
        """Create a new session and return session ID."""
        session_id = str(uuid.uuid4())
        _sessions[session_id] = {
            'user_id': user_id or str(uuid.uuid4()),
            'created_at': datetime.now(),
            'credentials': None,
            'state': None,
        }
        return session_id
    
    @staticmethod
    def get_session(session_id: str) -> Optional[Dict]:
        """Get session data."""
        return _sessions.get(session_id)
    
    @staticmethod
    def update_session(session_id: str, data: Dict):
        """Update session data."""
        if session_id in _sessions:
            _sessions[session_id].update(data)
    
    @staticmethod
    def set_credentials(session_id: str, credentials):
        """Store OAuth credentials in session."""
        if session_id in _sessions:
            _sessions[session_id]['credentials'] = credentials
    
    @staticmethod
    def get_credentials(session_id: str):
        """Get OAuth credentials from session."""
        session = _sessions.get(session_id)
        return session['credentials'] if session else None
    
    @staticmethod
    def delete_session(session_id: str):
        """Delete a session."""
        _sessions.pop(session_id, None)
    
    @staticmethod
    def cleanup_old_sessions(max_age_hours: int = 24):
        """Remove sessions older than max_age_hours."""
        now = datetime.now()
        expired = [
            sid for sid, data in _sessions.items()
            if now - data['created_at'] > timedelta(hours=max_age_hours)
        ]
        for sid in expired:
            del _sessions[sid]


session_manager = SessionManager()

