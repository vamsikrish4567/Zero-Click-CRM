"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import contacts, companies, interactions, deals, upload, connectors, gdrive, agent

app = FastAPI(
    title="Zero-Click CRM API",
    description="AI-powered CRM that updates itself using voice, email, and conversation data",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(contacts.router, prefix="/api/contacts", tags=["contacts"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(interactions.router, prefix="/api/interactions", tags=["interactions"])
app.include_router(deals.router, prefix="/api/deals", tags=["deals"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(connectors.router, prefix="/api/connectors", tags=["connectors"])
app.include_router(gdrive.router, prefix="/api/gdrive", tags=["google-drive"])
app.include_router(agent.router, prefix="/api/agent", tags=["ai-agent"])


@app.get("/")
async def root():
    """Root endpoint."""
    from app.core.database import db
    from app.services.ai_extraction import ai_service
    
    gcloud_status = "✅ Configured" if db._credentials_available else "⚠️  Not configured (see SETUP.md)"
    ai_status = "✅ Configured" if ai_service._credentials_available else "⚠️  Not configured (using fallback)"
    
    return {
        "message": "Zero-Click CRM API",
        "version": "0.1.0",
        "docs": "/api/docs",
        "status": {
            "google_cloud": gcloud_status,
            "ai_extraction": ai_status,
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

