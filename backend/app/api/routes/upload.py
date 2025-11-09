"""Upload and processing API routes."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.crm import UploadResponse, ExtractedData
from app.services.ai_extraction import ai_service
from app.services.voice_processing import voice_service
from app.services.email_parser import email_parser
from app.models.contact import ContactCreate
from app.models.company import CompanyCreate
from app.models.interaction import InteractionCreate
from app.models.deal import DealCreate
from app.api.routes import contacts, companies, interactions, deals
import uuid

router = APIRouter()


@router.post("/email", response_model=UploadResponse)
async def upload_email(content: str = Form(...)):
    """Upload and process an email."""
    try:
        # Parse email
        parsed = email_parser.parse_email(content)
        
        # Extract structured data using AI
        extracted = ai_service.extract_from_text(parsed["body"], source_type="email")
        
        # Auto-create entities
        contact_id = None
        company_id = None
        interaction_id = None
        deal_id = None
        
        # Create company if extracted
        if extracted.company_name:
            company = CompanyCreate(
                name=extracted.company_name,
                website=extracted.company_website,
            )
            created_company = await companies.create_company(company)
            company_id = created_company.id
        
        # Create contact if extracted
        if extracted.contact_name:
            contact = ContactCreate(
                name=extracted.contact_name,
                email=extracted.contact_email,
                phone=extracted.contact_phone,
                company_id=company_id,
                title=extracted.contact_title,
                source="email",
            )
            created_contact = await contacts.create_contact(contact)
            contact_id = created_contact.id
        
        # Create interaction if we have a contact
        if contact_id and extracted.summary:
            interaction = InteractionCreate(
                contact_id=contact_id,
                type="email",
                summary=extracted.summary,
                raw_content=parsed["body"],
                sentiment=extracted.sentiment,
                extracted_entities=extracted.entities,
            )
            created_interaction = await interactions.create_interaction(interaction)
            interaction_id = created_interaction.id
        
        # Create deal if extracted
        if contact_id and extracted.deal_title:
            deal = DealCreate(
                contact_id=contact_id,
                company_id=company_id,
                title=extracted.deal_title,
                value=extracted.deal_value,
                next_step=extracted.next_step,
            )
            created_deal = await deals.create_deal(deal)
            deal_id = created_deal.id
        
        return UploadResponse(
            success=True,
            message="Email processed successfully",
            extracted_data=extracted,
            contact_id=contact_id,
            company_id=company_id,
            interaction_id=interaction_id,
            deal_id=deal_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing email: {str(e)}")


@router.post("/voice", response_model=UploadResponse)
async def upload_voice(
    file: UploadFile = File(...),
    audio_format: str = Form("mp3")
):
    """Upload and process a voice recording."""
    try:
        # Read audio file
        audio_content = await file.read()
        
        # Transcribe voice to text
        transcript = voice_service.transcribe_audio(audio_content, audio_format)
        
        # Extract structured data using AI
        extracted = ai_service.extract_from_text(transcript, source_type="voice_note")
        
        # Auto-create entities (similar to email processing)
        contact_id = None
        company_id = None
        interaction_id = None
        deal_id = None
        
        # Create company if extracted
        if extracted.company_name:
            company = CompanyCreate(
                name=extracted.company_name,
                website=extracted.company_website,
            )
            created_company = await companies.create_company(company)
            company_id = created_company.id
        
        # Create contact if extracted
        if extracted.contact_name:
            contact = ContactCreate(
                name=extracted.contact_name,
                email=extracted.contact_email,
                phone=extracted.contact_phone,
                company_id=company_id,
                title=extracted.contact_title,
                source="voice",
            )
            created_contact = await contacts.create_contact(contact)
            contact_id = created_contact.id
        
        # Create interaction
        if contact_id and extracted.summary:
            interaction = InteractionCreate(
                contact_id=contact_id,
                type="voice_note",
                summary=extracted.summary,
                raw_content=transcript,
                sentiment=extracted.sentiment,
                extracted_entities=extracted.entities,
            )
            created_interaction = await interactions.create_interaction(interaction)
            interaction_id = created_interaction.id
        
        # Create deal if extracted
        if contact_id and extracted.deal_title:
            deal = DealCreate(
                contact_id=contact_id,
                company_id=company_id,
                title=extracted.deal_title,
                value=extracted.deal_value,
                next_step=extracted.next_step,
            )
            created_deal = await deals.create_deal(deal)
            deal_id = created_deal.id
        
        return UploadResponse(
            success=True,
            message="Voice note processed successfully",
            extracted_data=extracted,
            contact_id=contact_id,
            company_id=company_id,
            interaction_id=interaction_id,
            deal_id=deal_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing voice: {str(e)}")


@router.post("/transcript", response_model=UploadResponse)
async def upload_transcript(content: str = Form(...)):
    """Upload and process a call/meeting transcript."""
    try:
        # Extract structured data using AI
        extracted = ai_service.extract_from_text(content, source_type="call")
        
        # Auto-create entities (similar to email processing)
        contact_id = None
        company_id = None
        interaction_id = None
        deal_id = None
        
        # Create company if extracted
        if extracted.company_name:
            company = CompanyCreate(
                name=extracted.company_name,
                website=extracted.company_website,
            )
            created_company = await companies.create_company(company)
            company_id = created_company.id
        
        # Create contact if extracted
        if extracted.contact_name:
            contact = ContactCreate(
                name=extracted.contact_name,
                email=extracted.contact_email,
                phone=extracted.contact_phone,
                company_id=company_id,
                title=extracted.contact_title,
                source="call",
            )
            created_contact = await contacts.create_contact(contact)
            contact_id = created_contact.id
        
        # Create interaction
        if contact_id and extracted.summary:
            interaction = InteractionCreate(
                contact_id=contact_id,
                type="call",
                summary=extracted.summary,
                raw_content=content,
                sentiment=extracted.sentiment,
                extracted_entities=extracted.entities,
            )
            created_interaction = await interactions.create_interaction(interaction)
            interaction_id = created_interaction.id
        
        # Create deal if extracted
        if contact_id and extracted.deal_title:
            deal = DealCreate(
                contact_id=contact_id,
                company_id=company_id,
                title=extracted.deal_title,
                value=extracted.deal_value,
                next_step=extracted.next_step,
            )
            created_deal = await deals.create_deal(deal)
            deal_id = created_deal.id
        
        return UploadResponse(
            success=True,
            message="Transcript processed successfully",
            extracted_data=extracted,
            contact_id=contact_id,
            company_id=company_id,
            interaction_id=interaction_id,
            deal_id=deal_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing transcript: {str(e)}")




