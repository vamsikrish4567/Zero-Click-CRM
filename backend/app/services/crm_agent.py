"""AI Agent for intelligent transcript analysis and CRM data generation."""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from app.services.ai_extraction import ai_service
import re


class AgentInsight(BaseModel):
    """AI Agent generated insight."""
    category: str  # sentiment, risk, opportunity, task
    priority: str  # high, medium, low
    title: str
    description: str
    action_required: bool
    suggested_actions: List[str]


class AgentAnalysis(BaseModel):
    """Complete AI Agent analysis."""
    summary: str
    key_points: List[str]
    sentiment_timeline: List[Dict[str, str]]
    risk_level: str  # low, medium, high, critical
    churn_probability: float  # 0-100
    insights: List[AgentInsight]
    recommended_actions: List[str]
    contacts_identified: List[Dict[str, str]]
    deals_identified: List[Dict[str, Any]]
    tasks_to_create: List[Dict[str, str]]
    # NEW: Minutes of Meeting fields
    meeting_title: Optional[str] = None
    meeting_date: Optional[str] = None
    attendees: List[str] = []
    decisions_made: List[str] = []
    action_items: List[Dict[str, str]] = []
    follow_up_items: List[str] = []
    next_meeting: Optional[str] = None


class CRMAgent:
    """Intelligent AI Agent for CRM analysis."""
    
    def __init__(self):
        self.ai_service = ai_service
    
    def analyze_transcript(self, transcript: str, context: str = "customer_service") -> AgentAnalysis:
        """Analyze transcript with AI Agent and generate comprehensive insights.
        
        Args:
            transcript: The call/meeting transcript
            context: Type of conversation (customer_service, sales, support)
            
        Returns:
            Complete AI Agent analysis
        """
        # Extract basic CRM data first
        extracted = self.ai_service.extract_from_text(transcript, source_type="call")
        
        # Analyze sentiment throughout conversation
        sentiment_timeline = self._analyze_sentiment_timeline(transcript)
        
        # Detect risks and opportunities
        risks = self._detect_risks(transcript, extracted)
        
        # Generate intelligent insights
        insights = self._generate_insights(transcript, extracted, risks)
        
        # Calculate churn probability
        churn_prob = self._calculate_churn_probability(transcript, sentiment_timeline)
        
        # Identify all contacts
        contacts = self._identify_contacts(transcript, extracted)
        
        # Extract deals/transactions
        deals = self._extract_deals(transcript, extracted)
        
        # Generate actionable tasks
        tasks = self._generate_tasks(transcript, extracted, insights)
        
        # Create comprehensive summary
        summary = self._generate_executive_summary(
            transcript, extracted, sentiment_timeline, risks, churn_prob
        )
        
        # Extract key points
        key_points = self._extract_key_points(transcript, extracted)
        
        # Determine overall risk level
        risk_level = self._determine_risk_level(churn_prob, risks, sentiment_timeline)
        
        # Generate recommended actions
        actions = self._generate_recommended_actions(insights, risk_level, churn_prob)
        
        # Extract MOM (Minutes of Meeting) components
        meeting_title, meeting_date = self._extract_meeting_metadata(transcript, context)
        attendees = self._extract_attendees(contacts)
        decisions = self._extract_decisions(transcript)
        action_items = self._extract_action_items(transcript, tasks)
        follow_ups = self._extract_follow_ups(transcript, extracted)
        next_meeting = self._extract_next_meeting(transcript)
        
        return AgentAnalysis(
            summary=summary,
            key_points=key_points,
            sentiment_timeline=sentiment_timeline,
            risk_level=risk_level,
            churn_probability=churn_prob,
            insights=insights,
            recommended_actions=actions,
            contacts_identified=contacts,
            deals_identified=deals,
            tasks_to_create=tasks,
            meeting_title=meeting_title,
            meeting_date=meeting_date,
            attendees=attendees,
            decisions_made=decisions,
            action_items=action_items,
            follow_up_items=follow_ups,
            next_meeting=next_meeting
        )
    
    def _analyze_sentiment_timeline(self, transcript: str) -> List[Dict[str, str]]:
        """Analyze sentiment changes throughout conversation."""
        timeline = []
        
        # Split by speakers
        lines = transcript.split('\n')
        current_sentiment = "neutral"
        
        for i, line in enumerate(lines):
            if not line.strip():
                continue
                
            # Detect sentiment keywords
            line_lower = line.lower()
            
            if any(word in line_lower for word in ['angry', 'upset', 'ridiculous', 'unacceptable', 'terrible', 'worst']):
                sentiment = "negative"
                emoji = "😠"
            elif any(word in line_lower for word in ['apologize', 'sorry', 'understand', 'help']):
                sentiment = "empathetic"
                emoji = "🤝"
            elif any(word in line_lower for word in ['thank', 'appreciate', 'great', 'excellent']):
                sentiment = "positive"
                emoji = "😊"
            else:
                sentiment = "neutral"
                emoji = "😐"
            
            # Only add if sentiment changed
            if sentiment != current_sentiment:
                timeline.append({
                    "stage": f"Point {len(timeline) + 1}",
                    "sentiment": sentiment,
                    "emoji": emoji,
                    "description": line[:100] + "..." if len(line) > 100 else line
                })
                current_sentiment = sentiment
        
        return timeline[:5]  # Limit to 5 key points
    
    def _detect_risks(self, transcript: str, extracted) -> List[str]:
        """Detect business risks in conversation."""
        risks = []
        transcript_lower = transcript.lower()
        
        # Churn indicators
        if any(word in transcript_lower for word in ['cancel', 'refund', 'never again', 'worst']):
            risks.append("Customer churn risk detected")
        
        # Escalation
        if 'supervisor' in transcript_lower or 'manager' in transcript_lower:
            risks.append("Issue escalated to management")
        
        # Negative sentiment
        if transcript_lower.count('unacceptable') > 2 or transcript_lower.count('ridiculous') > 2:
            risks.append("High negative sentiment - immediate action required")
        
        # Product/service issues
        if 'cancel' in transcript_lower and ('flight' in transcript_lower or 'booking' in transcript_lower):
            risks.append("Service disruption - customer compensation may be needed")
        
        return risks
    
    def _calculate_churn_probability(self, transcript: str, sentiment_timeline: List[Dict]) -> float:
        """Calculate probability of customer churn (0-100)."""
        score = 50.0  # Start neutral
        
        transcript_lower = transcript.lower()
        
        # Negative indicators (increase churn probability)
        score += transcript_lower.count('cancel') * 10
        score += transcript_lower.count('refund') * 8
        score += transcript_lower.count('unacceptable') * 5
        score += transcript_lower.count('worst') * 7
        score += transcript_lower.count('never') * 6
        
        # Check if voucher/compensation declined
        if 'voucher' in transcript_lower and 'don\'t want' in transcript_lower:
            score += 15
        
        # Positive indicators (decrease churn probability)
        if 'thank' in transcript_lower:
            score -= 5
        if 'appreciate' in transcript_lower:
            score -= 5
        if 'resolve' in transcript_lower or 'fixed' in transcript_lower:
            score -= 10
        
        # Sentiment impact
        negative_count = sum(1 for s in sentiment_timeline if s['sentiment'] == 'negative')
        score += negative_count * 8
        
        # Cap at 0-100
        return max(0, min(100, score))
    
    def _generate_insights(self, transcript: str, extracted, risks: List[str]) -> List[AgentInsight]:
        """Generate intelligent insights from analysis."""
        insights = []
        
        # Risk insights
        if risks:
            insights.append(AgentInsight(
                category="risk",
                priority="high",
                title="⚠️ Critical Customer Issues Detected",
                description=f"{len(risks)} risk factors identified requiring immediate attention",
                action_required=True,
                suggested_actions=[
                    "Assign to senior account manager",
                    "Schedule follow-up call within 24 hours",
                    "Review service recovery procedures"
                ]
            ))
        
        # Sentiment insight
        if extracted.sentiment == "negative":
            insights.append(AgentInsight(
                category="sentiment",
                priority="high",
                title="😠 Negative Customer Experience",
                description="Customer expressed significant dissatisfaction throughout interaction",
                action_required=True,
                suggested_actions=[
                    "Send personalized apology from leadership",
                    "Offer additional compensation",
                    "Monitor for follow-up issues"
                ]
            ))
        
        # Opportunity insight
        if extracted.deal_value and extracted.deal_value > 1000:
            insights.append(AgentInsight(
                category="opportunity",
                priority="medium",
                title="💰 High-Value Customer",
                description=f"Customer has ${extracted.deal_value:,.0f} transaction - worth retaining",
                action_required=True,
                suggested_actions=[
                    "Assign VIP status",
                    "Provide premium support access",
                    "Consider loyalty program enrollment"
                ]
            ))
        
        return insights
    
    def _identify_contacts(self, transcript: str, extracted) -> List[Dict[str, str]]:
        """Identify all contacts mentioned in transcript."""
        contacts = []
        
        # Main contact
        if extracted.contact_name:
            contacts.append({
                "name": extracted.contact_name,
                "email": extracted.contact_email or "",
                "phone": extracted.contact_phone or "",
                "role": "Customer",
                "company": extracted.company_name or ""
            })
        
        # Find staff members
        staff_patterns = [
            r'(?:CSR|Agent|Supervisor|Manager)[\s:]+([A-Z][a-z]+(?: [A-Z][a-z]+)?)',
            r'this is ([A-Z][a-z]+(?: [A-Z][a-z]+)?)',
        ]
        
        for pattern in staff_patterns:
            matches = re.findall(pattern, transcript)
            for match in matches:
                name = match if isinstance(match, str) else match[0]
                if name and len(name) > 2:
                    contacts.append({
                        "name": name.strip(),
                        "email": "",
                        "phone": "",
                        "role": "Staff",
                        "company": extracted.company_name or "Internal"
                    })
        
        # Remove duplicates
        seen = set()
        unique_contacts = []
        for contact in contacts:
            name = contact['name']
            if name not in seen:
                seen.add(name)
                unique_contacts.append(contact)
        
        return unique_contacts[:5]  # Limit to 5
    
    def _extract_deals(self, transcript: str, extracted) -> List[Dict]:
        """Extract deal/transaction information."""
        deals = []
        
        if extracted.deal_title or extracted.deal_value:
            deals.append({
                "title": extracted.deal_title or "Transaction",
                "value": extracted.deal_value or 0,
                "stage": self._determine_deal_stage(transcript),
                "status": self._determine_deal_status(transcript),
                "notes": extracted.summary or ""
            })
        
        return deals
    
    def _determine_deal_stage(self, transcript: str) -> str:
        """Determine deal stage from transcript."""
        transcript_lower = transcript.lower()
        
        if 'refund' in transcript_lower or 'cancel' in transcript_lower:
            return "Cancelled/Refunded"
        elif 'closed' in transcript_lower or 'completed' in transcript_lower:
            return "Closed Won"
        elif 'negotiat' in transcript_lower or 'discuss' in transcript_lower:
            return "Negotiation"
        else:
            return "In Progress"
    
    def _determine_deal_status(self, transcript: str) -> str:
        """Determine deal status."""
        transcript_lower = transcript.lower()
        
        if 'refund' in transcript_lower:
            return "Refunded"
        elif 'cancel' in transcript_lower:
            return "Cancelled"
        elif 'complete' in transcript_lower:
            return "Completed"
        else:
            return "Active"
    
    def _generate_tasks(self, transcript: str, extracted, insights: List[AgentInsight]) -> List[Dict]:
        """Generate actionable tasks."""
        tasks = []
        
        # From action items
        if extracted.next_step:
            tasks.append({
                "title": "Follow-up Action Required",
                "description": extracted.next_step,
                "priority": "high",
                "due_date": "2 days",
                "assigned_to": "Account Manager"
            })
        
        # From risks
        if any(i.category == "risk" for i in insights):
            tasks.append({
                "title": "Customer Retention Action",
                "description": "High churn risk - immediate outreach required",
                "priority": "urgent",
                "due_date": "24 hours",
                "assigned_to": "Senior Account Manager"
            })
        
        # Refund processing
        if 'refund' in transcript.lower():
            tasks.append({
                "title": "Process Refund",
                "description": "Complete refund processing and confirm with customer",
                "priority": "high",
                "due_date": "3 days",
                "assigned_to": "Finance Team"
            })
        
        return tasks
    
    def _generate_executive_summary(self, transcript: str, extracted, sentiment_timeline, risks, churn_prob) -> str:
        """Generate executive summary."""
        summary_parts = []
        
        # Main issue
        if extracted.contact_name:
            summary_parts.append(f"Customer {extracted.contact_name} contacted support")
        
        # Sentiment
        if sentiment_timeline:
            summary_parts.append(f"with {sentiment_timeline[0]['sentiment']} sentiment")
        
        # Issue description
        if extracted.summary:
            summary_parts.append(f"regarding: {extracted.summary[:100]}")
        
        # Risk level
        if churn_prob > 70:
            summary_parts.append(f"⚠️ CRITICAL: {churn_prob:.0f}% churn probability")
        elif churn_prob > 50:
            summary_parts.append(f"⚠️ WARNING: {churn_prob:.0f}% churn probability")
        
        # Actions taken
        if 'refund' in transcript.lower():
            summary_parts.append("Refund processed")
        
        if 'supervisor' in transcript.lower():
            summary_parts.append("escalated to supervisor")
        
        return ". ".join(summary_parts) + "."
    
    def _extract_key_points(self, transcript: str, extracted) -> List[str]:
        """Extract key points from conversation."""
        points = []
        
        # Find important sentences
        sentences = re.split(r'[.!?]+', transcript)
        
        for sentence in sentences:
            sentence = sentence.strip()
            # Look for key phrases
            if any(keyword in sentence.lower() for keyword in [
                'refund', 'cancel', 'problem', 'issue', 'apologize', 
                'resolve', 'supervisor', 'voucher', 'compensation'
            ]) and len(sentence) > 30:
                points.append(sentence[:150])
                if len(points) >= 5:
                    break
        
        return points
    
    def _determine_risk_level(self, churn_prob: float, risks: List[str], sentiment_timeline) -> str:
        """Determine overall risk level."""
        if churn_prob > 70 or len(risks) >= 3:
            return "critical"
        elif churn_prob > 50 or len(risks) >= 2:
            return "high"
        elif churn_prob > 30 or len(risks) >= 1:
            return "medium"
        else:
            return "low"
    
    def _generate_recommended_actions(self, insights: List[AgentInsight], risk_level: str, churn_prob: float) -> List[str]:
        """Generate recommended actions."""
        actions = []
        
        if risk_level in ["critical", "high"]:
            actions.append("🚨 Immediate: Assign to senior account manager")
            actions.append("📞 Schedule follow-up call within 24 hours")
        
        if churn_prob > 60:
            actions.append("💰 Consider additional compensation/credits")
            actions.append("👥 Escalate to customer success team")
        
        actions.append("📧 Send personalized follow-up email")
        actions.append("📊 Monitor customer satisfaction metrics")
        actions.append("✅ Document issue in CRM with full context")
        
        return actions[:6]  # Limit to 6 actions
    
    # NEW: MOM (Minutes of Meeting) Extraction Methods
    
    def _extract_meeting_metadata(self, transcript: str, context: str) -> tuple[Optional[str], Optional[str]]:
        """Extract meeting title and date."""
        title = None
        date = None
        
        # Extract date patterns
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # 2024-02-01
            r'(\d{1,2}/\d{1,2}/\d{4})',  # 2/1/2024
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, transcript, re.IGNORECASE)
            if match:
                date = match.group(0)
                break
        
        # Generate title based on context
        if context == "customer_service":
            if "supervisor" in transcript.lower():
                title = "Customer Service Escalation Call"
            else:
                title = "Customer Support Call"
        elif "meeting" in transcript.lower():
            title = "Team Meeting"
        elif "review" in transcript.lower():
            title = "Review Session"
        else:
            title = "Business Discussion"
        
        return title, date
    
    def _extract_attendees(self, contacts: List[Dict]) -> List[str]:
        """Extract attendee list from contacts."""
        return [contact['name'] for contact in contacts if contact.get('name')]
    
    def _extract_decisions(self, transcript: str) -> List[str]:
        """Extract key decisions made during the conversation."""
        decisions = []
        
        # Look for decision keywords
        decision_patterns = [
            r'(?:decided|agreed|concluded|determined)\s+(?:to|that)\s+([^.!?]{20,100})',
            r'(?:will|going to)\s+([^.!?]{20,80})',
            r'(?:refund|process|implement|schedule|approve)\s+([^.!?]{15,80})'
        ]
        
        for pattern in decision_patterns:
            matches = re.findall(pattern, transcript, re.IGNORECASE)
            for match in matches:
                decision = match.strip()
                if len(decision) > 15 and decision not in decisions:
                    decisions.append(f"• {decision}")
                if len(decisions) >= 5:
                    break
        
        return decisions[:5]
    
    def _extract_action_items(self, transcript: str, tasks: List[Dict]) -> List[Dict[str, str]]:
        """Extract action items with owners and due dates."""
        action_items = []
        
        # Convert tasks to action items
        for task in tasks:
            action_items.append({
                "action": task['title'],
                "owner": task.get('assigned_to', 'TBD'),
                "due_date": task.get('due_date', 'TBD'),
                "priority": task.get('priority', 'medium'),
                "status": "pending"
            })
        
        # Extract additional action items from text
        action_patterns = [
            r'(?:action item|to-do|task):\s*([^.!?\n]{15,80})',
            r'(?:please|need to|should|must)\s+([^.!?\n]{15,80})',
        ]
        
        for pattern in action_patterns:
            matches = re.findall(pattern, transcript, re.IGNORECASE)
            for match in matches[:3]:
                if len(action_items) < 8:
                    action_items.append({
                        "action": match.strip(),
                        "owner": "TBD",
                        "due_date": "TBD",
                        "priority": "medium",
                        "status": "pending"
                    })
        
        return action_items[:8]
    
    def _extract_follow_ups(self, transcript: str, extracted) -> List[str]:
        """Extract follow-up items."""
        follow_ups = []
        
        # Check for next_step from extracted data
        if extracted.next_step:
            follow_ups.append(f"• {extracted.next_step}")
        
        # Look for follow-up patterns
        follow_up_patterns = [
            r'(?:follow[- ]up|follow up with|reach out to)\s+([^.!?\n]{15,80})',
            r'(?:next time|in the future|moving forward)\s+([^.!?\n]{15,80})',
        ]
        
        for pattern in follow_up_patterns:
            matches = re.findall(pattern, transcript, re.IGNORECASE)
            for match in matches:
                item = match.strip()
                if len(item) > 15 and item not in follow_ups:
                    follow_ups.append(f"• {item}")
                if len(follow_ups) >= 5:
                    break
        
        return follow_ups[:5]
    
    def _extract_next_meeting(self, transcript: str) -> Optional[str]:
        """Extract next meeting date/time if mentioned."""
        next_meeting_patterns = [
            r'next (?:meeting|call|session)\s+(?:on|at)?\s*([^.!?\n]{10,50})',
            r'(?:schedule|book|set up)\s+(?:a|another|the next)\s+(?:meeting|call)\s+(?:for|on)?\s*([^.!?\n]{10,50})',
            r'(?:see you|talk to you|speak with you)\s+([^.!?\n]{10,40})'
        ]
        
        for pattern in next_meeting_patterns:
            match = re.search(pattern, transcript, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None


# Global agent instance
crm_agent = CRMAgent()

