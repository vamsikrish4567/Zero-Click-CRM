"""Email parsing service."""

import email
from email import policy
from typing import Optional


class EmailParserService:
    """Service for parsing email content."""

    def parse_email(self, email_content: str) -> dict:
        """Parse email content and extract relevant information.

        Args:
            email_content: Raw email content

        Returns:
            Dictionary with parsed email data
        """
        try:
            msg = email.message_from_string(email_content, policy=policy.default)
            
            # Extract body
            body = self._get_email_body(msg)
            
            return {
                "from": msg.get("From", ""),
                "to": msg.get("To", ""),
                "subject": msg.get("Subject", ""),
                "date": msg.get("Date", ""),
                "body": body,
            }
        except Exception as e:
            print(f"Error parsing email: {e}")
            return {"body": email_content}

    def _get_email_body(self, msg) -> str:
        """Extract email body from message."""
        body = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                
                # Skip attachments
                if "attachment" in content_disposition:
                    continue
                
                # Get text content
                if content_type == "text/plain":
                    body = part.get_payload(decode=True).decode()
                    break
                elif content_type == "text/html" and not body:
                    # Fallback to HTML if no plain text
                    body = part.get_payload(decode=True).decode()
        else:
            body = msg.get_payload(decode=True).decode()
        
        return body


# Global instance
email_parser = EmailParserService()




