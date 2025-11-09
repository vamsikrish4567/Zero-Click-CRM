"""AI Agent API routes for intelligent analysis."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.crm_agent import crm_agent, AgentAnalysis


router = APIRouter()


class AgentRequest(BaseModel):
    """Request for AI Agent analysis."""
    transcript: str
    context: str = "customer_service"  # or "sales", "support", "meeting"


class ChatRequest(BaseModel):
    """Request for chatbot conversation."""
    query: str
    context: dict = {}


@router.post("/analyze", response_model=AgentAnalysis)
async def analyze_with_agent(request: AgentRequest):
    """Analyze transcript with AI Agent and generate comprehensive insights.
    
    Args:
        request: Transcript and context information
        
    Returns:
        Complete AI Agent analysis with insights, risks, tasks, and recommendations
    """
    try:
        analysis = crm_agent.analyze_transcript(
            transcript=request.transcript,
            context=request.context
        )
        
        return analysis
    except Exception as e:
        import traceback
        print(f"Error in AI Agent analysis: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Agent analysis failed: {str(e)}"
        )


@router.post("/quick-summary")
async def get_quick_summary(request: AgentRequest):
    """Get a quick summary without full analysis.
    
    Args:
        request: Transcript and context
        
    Returns:
        Quick summary and key metrics
    """
    try:
        analysis = crm_agent.analyze_transcript(
            transcript=request.transcript,
            context=request.context
        )
        
        return {
            "summary": analysis.summary,
            "risk_level": analysis.risk_level,
            "churn_probability": analysis.churn_probability,
            "key_points": analysis.key_points[:3],
            "urgent_actions": [
                action for action in analysis.recommended_actions
                if "Immediate" in action or "🚨" in action
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summary generation failed: {str(e)}"
        )


@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """Chat with AI Agent using Gemini LLM with connection-aware context.
    
    Args:
        request: User query and context (CRM stats, connections, data sources)
        
    Returns:
        AI-generated response based on CONNECTED CRM data only
    """
    try:
        from app.services.ai_extraction import ai_service
        
        # Extract context data
        context = request.context
        connected_crms = context.get('connectedCRMs', 0)
        total_contacts = context.get('totalContacts', 0)
        total_activities = context.get('totalActivities', 0)
        recent_contacts = context.get('recentContacts', [])
        recent_activities = context.get('recentActivities', [])
        active_connectors = context.get('activeConnectors', [])
        
        # Build connection status string
        connection_status = "🔌 **CRM CONNECTION STATUS:**\n"
        if connected_crms > 0:
            connection_status += f"✅ {connected_crms} CRM platform(s) connected\n"
            if active_connectors:
                connection_status += "Connected platforms:\n"
                for connector in active_connectors:
                    connection_status += f"  • {connector.get('name', 'Unknown')} - {connector.get('contacts', 0)} contacts\n"
        else:
            connection_status += "❌ No CRMs currently connected\n"
        
        connection_status += f"\n📊 **AVAILABLE DATA** (from connected sources only):\n"
        connection_status += f"  • Total Contacts: {total_contacts:,}\n"
        connection_status += f"  • Recent Activities: {total_activities}\n"
        
        # Format recent contacts
        contacts_info = ""
        if recent_contacts:
            contacts_info = "\n📇 **RECENT CONTACTS** (from connected CRMs):\n"
            for i, contact in enumerate(recent_contacts[:5], 1):
                contacts_info += f"{i}. {contact['name']} - {contact['company']} (Source: {contact['source']})\n"
        else:
            contacts_info = "\n📇 **RECENT CONTACTS:** None available (connect CRMs to see data)\n"
        
        # Format recent activities
        activities_info = ""
        if recent_activities:
            activities_info = "\n📈 **RECENT ACTIVITIES** (from connected data sources):\n"
            for i, activity in enumerate(recent_activities[:5], 1):
                act_type = activity.get('type', 'activity')
                activities_info += f"{i}. {activity['title']} ({activity['connector']} - {act_type})\n"
        else:
            activities_info = "\n📈 **RECENT ACTIVITIES:** None available (connect data sources to see activities)\n"
        
        # Build comprehensive system prompt with deep analysis capabilities
        system_prompt = f"""You are an advanced AI assistant for a Zero-Click CRM system with deep analytical capabilities. You help relationship managers make data-driven decisions.
 
{connection_status}
 
{contacts_info}
 
{activities_info}
 
🎯 **CORE RESPONSIBILITIES:**
 
1. **DATA INTEGRITY**
   • ONLY use data from CONNECTED sources (numbers above reflect connected CRMs only)  
   • Do NOT invent, assume, or extrapolate data  
   • Reference which specific CRM/source provides each piece of information  
   • If data is unavailable, explain why and suggest how to get it  
 
2. **DEEP CONTENT ANALYSIS** (When relevant to query)  
   • Analyze patterns in contacts (industries, roles, engagement levels)  
   • Identify trends in activities (frequency, types, outcomes)  
   • Spot anomalies or concerning patterns  
   • Compare across different CRM sources if multiple are connected  
   • Extract key themes and topics from activity descriptions  
   • **When asked about tasks or pending activities (e.g., “pending activities in the last 3 days”), inspect the `content` field of each transcript/notes to identify tasks, deadlines, follow‑ups, and unresolved issues. Base your conclusions on these notes.**
 
3. **DECISION SUPPORT** (Critical!)  
   • Synthesize insights from the available data  
   • Provide actionable recommendations based on evidence  
   • Highlight risks, opportunities, or action items  
   • Suggest next steps with clear reasoning  
   • Prioritize suggestions by impact and urgency  
 
4. **ANALYTICAL APPROACH**  
   • When asked about contacts: Analyze company patterns, roles, engagement recency  
   • When asked about activities: Identify trends, frequency patterns, engagement quality  
   • When asked about performance: Compare metrics, identify top/bottom performers  
   • When asked “should I…”: Provide decision framework based on available data  
 
📊 **ANALYSIS FRAMEWORK:**
 
For **Contacts**:  
- Who are they? (roles, companies, sources)  
- Engagement patterns (recent vs stale)  
- Distribution (which CRMs, industries)  
- Gaps or missing information  
 
For **Activities**:  
- What's happening? (types, frequency)  
- Trends over time (if dates available)  
- Quality indicators (call durations, meeting attendance)  
- Which platforms show most activity?  
- **Review the conversation content (`content` field) to surface tasks, commitments, deadlines, or follow‑ups that indicate pending or completed activities.**
 
For **Decision Questions** (e.g., “Should I…”, “What should I focus on…”):  
- Current state analysis (what data shows)  
- Risk assessment (what could go wrong)  
- Opportunity identification (what to pursue)  
- Recommended actions (prioritized steps)  
- Expected outcomes (what success looks like)  
 
🔍 **DEEP DIVE TRIGGERS:**  
If user asks about:  
• “Analyze…” → Provide detailed breakdown with patterns  
• “What should I…” → Give decision framework with pros/cons  
• “Which contacts/deals…” → Rank and explain reasoning  
• “Are there any…” → Search for patterns and flag concerns  
• “Summarize…” → Extract key themes and implications  
• **“Pending activities…” → Dive into each transcript’s content to identify outstanding tasks or follow‑ups.**
 
🤖 **RESPONSE STRUCTURE for Analysis:**  
 
**Summary**: One-line key finding  
**Analysis**: Detailed breakdown of the data  
**Insights**: Patterns, trends, or anomalies discovered  
**Recommendations**: Prioritized action items  
**Reasoning**: Why these actions matter  
 
📋 **DATA SOURCE RULES:**  
• connected_crms = {connected_crms} (ONLY use data from these)  
• total_contacts = {total_contacts:,} (available for analysis)  
• total_activities = {total_activities} (scope of activity data)  
• If counts are 0, explain missing connections needed  
 
💡 **RESPONSE STYLE:**  
• Lead with insights, not just data recitation  
• Use bullet points for clarity  
• Bold key findings  
• Include relevant emojis (📊 📈 ⚠️ ✅ 💡)  
• Always tie back to business impact  
 
🚨 **CRITICAL: For Decision Support**  
When user needs to make a decision:  
1. State what the data shows  
2. Identify implications (risks/opportunities)  
3. Suggest specific actions  
4. Explain expected outcomes  
5. Mention data limitations (what we can't see)  
 
USER QUERY: {request.query}
 
Analyze deeply, think critically, and provide actionable insights based ONLY on the data above. Help the user make informed decisions."""

        # Check if AI service is available
        if not ai_service._credentials_available or ai_service.model is None:
            # Fallback to simple rule-based response
            response = f"⚠️ **AI Assistant (Limited Mode)**\n\n"
            response += f"Google Cloud AI is not configured. Running in basic mode.\n\n"
            response += f"📊 **Current Status:**\n"
            response += f"• Connected CRMs: {connected_crms}\n"
            response += f"• Total Contacts: {total_contacts:,}\n"
            response += f"• Recent Activities: {total_activities}\n\n"
            response += f"💡 Configure Google Cloud credentials for full AI capabilities."
            return {"response": response}
        
        # Generate AI response using Vertex AI (Gemini)
        try:
            ai_response = ai_service.model.generate_content(system_prompt)
            
            # Add footer with data freshness indicator
            footer = f"\n\n---\n💡 *Data refreshed at chat open • Based on {connected_crms} connected CRM(s)*"
            
            return {
                "response": ai_response.text + footer
            }
        except Exception as ai_error:
            print(f"AI generation error: {ai_error}")
            # Fallback response
            response = f"📊 **CRM Status** (AI temporarily unavailable)\n\n"
            response += f"• Connected CRMs: {connected_crms}\n"
            response += f"• Total Contacts: {total_contacts:,}\n"
            response += f"• Activities: {total_activities}\n\n"
            
            if connected_crms > 0:
                response += f"✅ Your CRM is active with {total_contacts:,} contacts synced!"
            else:
                response += "💡 Connect CRMs in the Connectors page to start syncing data."
            
            return {"response": response}
        
    except Exception as e:
        import traceback
        print(f"Error in chat: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )