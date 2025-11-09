"""AI-powered data extraction service using Google Vertex AI."""

from app.core.config import settings
from app.schemas.crm import ExtractedData
import json
import re
import os


class AIExtractionService:
    """Service for extracting structured data from text using Gemini."""

    def __init__(self):
        """Initialize Vertex AI lazily."""
        self._model = None
        self._initialized = False
        self._credentials_available = self._check_credentials()

    def _check_credentials(self) -> bool:
        """Check if Google Cloud credentials are available."""
        if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
            return True
        try:
            import google.auth
            google.auth.default()
            return True
        except Exception:
            return False

    @property
    def model(self):
        """Get or create Vertex AI model."""
        if self._model is None and not self._initialized:
            if not self._credentials_available:
                print("[WARNING] Google Cloud not configured. AI extraction will use fallback.")
                self._initialized = True
                return None
            
            try:
                import vertexai
                from vertexai.generative_models._generative_models import _GenerativeModel as GenerativeModel
                from google.oauth2 import service_account
                import json
                
                # Load credentials from service account file
                credentials = None
                project_id = settings.GOOGLE_CLOUD_PROJECT
                
                if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
                    credentials = service_account.Credentials.from_service_account_file(
                        settings.GOOGLE_APPLICATION_CREDENTIALS
                    )
                    # Extract project_id from service account file if not in settings
                    if not project_id:
                        with open(settings.GOOGLE_APPLICATION_CREDENTIALS, 'r') as f:
                            service_account_info = json.load(f)
                            project_id = service_account_info.get('project_id', '')
                            print(f"[INFO] Using project_id from service account: {project_id}")
                
                if not project_id:
                    raise ValueError("GOOGLE_CLOUD_PROJECT not found in settings or service account file")
                
                vertexai.init(
                    project=project_id,
                    location=settings.VERTEX_AI_LOCATION,
                    credentials=credentials,
                )
                self._model = GenerativeModel(settings.VERTEX_AI_MODEL)
                self._initialized = True
                print(f"[SUCCESS] Vertex AI initialized successfully with project: {project_id}")
            except Exception as e:
                print(f"[WARNING] Could not initialize Vertex AI: {e}")
                self._initialized = True
                return None
        return self._model

    def extract_from_text(self, text: str, source_type: str = "email") -> ExtractedData:
        """Extract structured CRM data from text.

        Args:
            text: The text content to extract from
            source_type: Type of source (email, call, voice_note)

        Returns:
            ExtractedData with extracted fields
        """
        if not self._credentials_available or self.model is None:
            print("⚠️  Using fallback extraction (Google Cloud not configured)")
            return self._fallback_extraction(text, source_type)

        prompt = self._build_extraction_prompt(text, source_type)

        try:
            response = self.model.generate_content(prompt)
            extracted_data = self._parse_response(response.text)
            return extracted_data
        except Exception as e:
            print(f"Error extracting data: {e}")
            return self._fallback_extraction(text, source_type)

    def _fallback_extraction(self, text: str, source_type: str) -> ExtractedData:
        """Simple rule-based extraction when AI is not available."""
        import re
        
        data = ExtractedData()
        
        # Extract all emails and use first one as contact
        emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        if emails:
            data.contact_email = emails[0]
        
        # Extract names before email addresses (common pattern: "Name (email@domain.com)")
        name_email_match = re.search(r'([A-Z][a-z]+ [A-Z][a-z]+)[,\s]*\(?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\)?', text, re.IGNORECASE)
        if name_email_match:
            data.contact_name = name_email_match.group(1).strip()
            data.contact_email = name_email_match.group(2)
        
        # Extract company names (look for "at CompanyName" or "CompanyName Corp/Inc/LLC")
        company_match = re.search(r'at ([A-Z][A-Za-z0-9\s]+(?:Corp|Inc|LLC|Ltd|Limited)?)', text)
        if company_match:
            data.company_name = company_match.group(1).strip()
        
        # Extract phone
        phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        if phone_match:
            data.contact_phone = phone_match.group()
        
        # Extract money amounts for deals
        money_matches = re.findall(r'\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', text)
        if money_matches:
            # Use the largest amount found
            amounts = [float(m.replace(',', '')) for m in money_matches]
            data.deal_value = max(amounts)
            data.deal_title = f"{data.company_name or 'Potential'} Deal - ${max(amounts):,.0f}"
        
        # Extract action items (look for "next step", "action item", "to-do")
        action_patterns = [
            r'(?:next step|action item|to-do|follow[- ]up):\s*([^\n.]+)',
            r'(?:will|need to|should)\s+([^\n.]{10,80})',
        ]
        actions = []
        for pattern in action_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            actions.extend(matches[:2])  # Limit to 2 per pattern
        if actions:
            data.next_step = "; ".join(actions[:3])  # Max 3 action items
        
        # Better summary for meeting transcripts
        if source_type == "call":
            # Try to extract key points
            sentences = re.split(r'[.!?]+', text)
            important_sentences = [s.strip() for s in sentences if len(s.strip()) > 50 and any(keyword in s.lower() for keyword in ['need', 'want', 'budget', 'timeline', 'looking for', 'interested'])]
            if important_sentences:
                data.summary = ". ".join(important_sentences[:3]) + "."
            else:
                data.summary = text[:200] + "..." if len(text) > 200 else text
        else:
            data.summary = text[:150] + "..." if len(text) > 150 else text
        
        # Sentiment analysis (simple keyword-based)
        positive_words = ['great', 'excellent', 'perfect', 'looking forward', 'excited', 'interested']
        negative_words = ['concern', 'worried', 'problem', 'issue', 'unfortunately', 'difficult']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            data.sentiment = "positive"
        elif negative_count > positive_count:
            data.sentiment = "negative"
        else:
            data.sentiment = "neutral"
        
        return data

    def _build_extraction_prompt(self, text: str, source_type: str) -> str:
        """Build the prompt for extraction."""
        return f"""You are a CRM data extraction AI. Extract structured information from the following {source_type}.

Extract these fields if present:
- contact_name: Full name of the person
- contact_email: Email address
- contact_phone: Phone number
- contact_title: Job title or role
- company_name: Company name
- company_website: Company website
- deal_title: Name or description of the deal/opportunity
- deal_value: Numeric value of the deal (extract number only)
- next_step: What needs to happen next
- next_step_date: When the next step should happen (format: YYYY-MM-DD)
- summary: Brief summary of the conversation/email
- sentiment: Overall sentiment (positive, neutral, or negative)
- entities: Key topics, products, or terms mentioned (as a comma-separated list)

Text to analyze:
{text}

Return your response as a JSON object with only the fields you found. Use null for missing fields.
Example format:
{{
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "company_name": "Acme Corp",
    "deal_value": 50000,
    "summary": "Discussion about Q1 pricing",
    "sentiment": "positive",
    "entities": ["pricing", "Q1", "contract"]
}}

JSON Response:"""

    def _parse_response(self, response_text: str) -> ExtractedData:
        """Parse the AI response into ExtractedData."""
        try:
            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                json_str = json_match.group()
                data = json.loads(json_str)
                
                # Convert entities from comma-separated string to list if needed
                if isinstance(data.get('entities'), str):
                    data['entities'] = [e.strip() for e in data['entities'].split(',') if e.strip()]
                
                return ExtractedData(**data)
            else:
                print(f"No JSON found in response: {response_text}")
                return ExtractedData()
        except Exception as e:
            print(f"Error parsing response: {e}")
            print(f"Response text: {response_text}")
            return ExtractedData()


# Global instance
ai_service = AIExtractionService()

