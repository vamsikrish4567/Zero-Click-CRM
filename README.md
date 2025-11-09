# Zero-Click CRM 🚀

An AI-powered Customer Relationship Management system that uses intelligent automation to manage customer data with minimal manual input.

## 📋 Overview

Zero-Click CRM is a modern CRM system that leverages AI agents and multi-platform integration to help businesses manage customer relationships efficiently.

### Key Features

- 🤖 **AI Agent Assistant**: Gemini-powered chatbot that analyzes your CRM data and provides actionable insights
- 🔄 **Multi-CRM Integration**: Connect HubSpot, Salesforce, Pipedrive, Zoho, Monday.com, and Zendesk
- 📊 **Real-time Dashboard**: Interactive dashboard with contact statistics and activity tracking
- 👥 **Contact Management**: Manage contacts with full CRUD operations
- 💬 **Conversational UI**: Natural language interface with markdown-formatted responses
- 🎨 **Dark/Light Theme**: Built-in theme toggle for user preference
- 📱 **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│  React + TypeScript + Vite + Tailwind CSS + React Query         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │ Connectors   │  │ Contacts     │          │
│  │  Page        │  │ Page         │  │ Page         │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐                                                │
│  │  Activity    │                                                │
│  │  Page        │                                                │
│  └──────────────┘                                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           ChatWidget (AI Agent Interface)             │       │
│  │  • Context-aware queries                              │       │
│  │  • Markdown rendering (react-markdown + remark-gfm)   │       │
│  │  • Expand/collapse UI                                 │       │
│  │  • Real-time cache invalidation                       │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                             │
│          FastAPI + Python + Uvicorn + Pydantic                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Connectors  │  │  Contacts    │  │  AI Agent    │          │
│  │  API         │  │  API         │  │  API         │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐                                                │
│  │  Interactions│                                                │
│  │  API         │                                                │
│  └──────────────┘                                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │         AI AGENT SYSTEM (Agentic Architecture)      │         │
│  │                                                      │         │
│  │  ┌──────────────────────────────────────────────┐  │         │
│  │  │   Gemini LLM Integration (Core Agent)        │  │         │
│  │  │   • Connection-aware responses               │  │         │
│  │  │   • Deep content analysis                    │  │         │
│  │  │   • Decision support framework               │  │         │
│  │  │   • Structured analytical responses          │  │         │
│  │  └──────────────────────────────────────────────┘  │         │
│  │                                                      │         │
│  │  ┌──────────────────────────────────────────────┐  │         │
│  │  │   Context Builder (Dynamic Prompt Engine)    │  │         │
│  │  │   • Active connector status                  │  │         │
│  │  │   • Recent contacts from connected CRMs     │  │         │
│  │  │   • Recent activities aggregation            │  │         │
│  │  │   • Data integrity constraints               │  │         │
│  │  └──────────────────────────────────────────────┘  │         │
│  └────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  • Google Cloud AI Platform (Gemini LLM via Vertex AI)         │
│  • CRM APIs (HubSpot, Salesforce, Pipedrive, etc.)             │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        DATA STORAGE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  • JSON-based CRM data storage (backend/data/*.json)            │
│  • In-memory session store                                      │
│  • React Query cache (frontend client-side)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agentic AI Architecture

### Agent Design Philosophy

The AI agent follows an **agentic architecture** where it acts as an intelligent assistant with:

1. **Autonomy**: Makes decisions about data analysis without explicit instructions
2. **Context-Awareness**: Understands which CRMs are connected and what data is available
3. **Goal-Oriented**: Focused on providing actionable business insights
4. **Adaptive**: Adjusts responses based on available data sources
5. **Proactive**: Identifies patterns, risks, and opportunities without being asked

### Agent Components

#### 1. **Context Engine**
```python
# Dynamic context building based on active connections
context = {
    "connected_crms": ["HubSpot", "Salesforce"],  # Only active sources
    "total_contacts": 11,  # Aggregated from connected CRMs
    "recent_contacts": [...],  # Last 10 from connected sources
    "recent_activities": [...],  # Latest activities
    "active_connectors": ["hubspot", "salesforce"]
}
```

#### 2. **Prompt Engineering Framework**

The agent uses a structured prompt with:

- **Data Integrity Rules**: Only uses data from connected sources
- **Analysis Framework**: Structured approach for contacts, activities, and decisions
- **Deep Dive Triggers**: Keywords that activate deeper analysis
- **Decision Support**: Step-by-step reasoning for business decisions
- **Response Templates**: Consistent format for insights and recommendations

#### 3. **Analysis Capabilities**

**For Contacts:**
- Distribution analysis across CRMs
- Engagement pattern recognition
- Role and company clustering
- Gap identification

**For Activities:**
- Frequency and trend analysis
- Quality indicators
- Cross-platform activity comparison
- Anomaly detection

**For Decision Support:**
- Current state analysis from data
- Risk assessment based on patterns
- Opportunity identification
- Prioritized action recommendations
- Expected outcome predictions

#### 4. **Response Structure**

```markdown
**Summary**: One-line key finding
**Analysis**: Detailed breakdown of the data
**Insights**: Patterns, trends, or anomalies discovered  
**Recommendations**: Prioritized action items
**Reasoning**: Why these actions matter
```

### Agent Interaction Flow

```
User Query → Context Builder → Gemini LLM → Response Formatter → UI Renderer
     ↓              ↓                ↓               ↓              ↓
  Natural      Connected      Deep Analysis    Markdown        Rich Display
  Language     CRM Data       + Insights       Formatted       with Emojis
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.2.0 |
| **TypeScript** | Type-safe development | 5.3.3 |
| **Vite** | Build tool & dev server | 5.0.11 |
| **Tailwind CSS** | Utility-first styling | 3.4.1 |
| **@tailwindcss/typography** | Markdown prose styling | 0.5.10 |
| **React Query** | Server state management | 5.17.9 |
| **React Router DOM** | Client-side routing | 6.21.1 |
| **Lucide React** | Icon library | 0.309.0 |
| **React Markdown** | Markdown rendering | 10.1.0 |
| **remark-gfm** | GitHub Flavored Markdown | 4.0.1 |
| **Axios** | HTTP client | 1.6.5 |
| **date-fns** | Date manipulation | 3.0.6 |
| **clsx** + **tailwind-merge** | Conditional class utilities | - |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Web framework | 0.109.0 |
| **Python** | Programming language | 3.9+ |
| **Uvicorn** | ASGI server | 0.27.0 |
| **Pydantic** | Data validation | 2.5.3 |
| **google-cloud-aiplatform** | Gemini LLM integration | 1.38.1 |
| **LangChain** | LLM framework | 0.1.0 |
| **python-dateutil** | Date utilities | 2.8.2 |
| **aiofiles** | Async file operations | 23.2.1 |
| **httpx** | Async HTTP client | 0.26.0 |
| **python-multipart** | Form data parsing | 0.0.6 |
| **python-dotenv** | Environment variables | 1.0.0 |

### AI & Machine Learning

| Technology | Purpose |
|------------|---------|
| **Gemini 1.5 Flash (Vertex AI)** | Large Language Model for agent responses and analysis |
| **AI Extraction Service** | Extract contacts and insights from unstructured text |
| **Pattern Matching** | Identify key phrases, action items, and decisions |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | JavaScript/TypeScript linting |
| **Black** | Python code formatting |
| **Flake8** | Python linting |
| **pytest** | Python testing framework |
| **pytest-asyncio** | Async test support |

---

## 📁 Project Structure

```
Hacknation/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ChatWidget.tsx  # AI agent chat interface
│   │   │   ├── Layout.tsx      # Main layout wrapper
│   │   │   ├── ThemeToggle.tsx # Dark/light mode toggle
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── Connectors.tsx  # CRM connections
│   │   │   ├── Contacts.tsx    # Contact management
│   │   │   └── Activity.tsx    # Activity feed
│   │   ├── contexts/           # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── services/           # API clients
│   │   │   └── api.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                     # FastAPI backend application
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── agent.py    # AI agent endpoints (/chat)
│   │   │       ├── connectors.py  # CRM connection management
│   │   │       ├── contacts.py # Contact CRUD operations
│   │   │       └── interactions.py # Interaction tracking
│   │   ├── core/
│   │   │   ├── config.py       # Configuration settings
│   │   │   └── session.py      # Session management
│   │   └── main.py             # FastAPI app initialization
│   ├── data/                   # JSON-based CRM data storage
│   │   ├── hubspot.json        # HubSpot data
│   │   ├── salesforce.json     # Salesforce data
│   │   ├── pipedrive.json      # Pipedrive data
│   │   ├── zoho.json           # Zoho CRM data
│   │   ├── monday.json         # Monday.com data
│   │   └── zendesk.json        # Zendesk Sell data
│   └── requirements.txt
│
├── TECHSTACK.md                 # Detailed tech stack documentation
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ (for frontend)
- **Python** 3.9+ (for backend)
- **Google Cloud Account** (for AI services - optional)
- **CRM API Credentials** (optional, for live integrations)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Hacknation
```

#### 2. Google Cloud Setup (Optional - Required for AI Features)

The AI agent requires Google Cloud credentials to function.

**📖 See [`GOOGLE_CLOUD_SETUP.md`](GOOGLE_CLOUD_SETUP.md) for detailed setup instructions.**

**Quick Setup (5 minutes):**
1. Get Gemini API Key: https://makersuite.google.com/app/apikey
2. Create `backend/.env` file:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```
3. Restart backend

**Alternative:** Use Service Account for production (see GOOGLE_CLOUD_SETUP.md)

#### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see GOOGLE_CLOUD_SETUP.md for details)
# For quick start, just add your Gemini API key:
echo "GOOGLE_API_KEY=your_api_key_here" > .env

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

**Important Notes:**
- ⚠️ **Never commit `service-account-key.json` to Git** (already in `.gitignore`)
- ⚠️ **Never commit `.env` file with real credentials** (already in `.gitignore`)
- ✅ The app will work with limited functionality without Google Cloud credentials
- ✅ See `GOOGLE_CLOUD_SETUP.md` for detailed setup instructions
- ✅ See `QUICK_FIX_SUMMARY.md` for troubleshooting common issues

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Troubleshooting

If you encounter issues:
1. **Encoding errors**: Fixed in latest version (uses UTF-8 encoding)
2. **AI in Limited Mode**: See `GOOGLE_CLOUD_SETUP.md` to configure Google Cloud
3. **Connection refused**: Ensure backend is running on port 8000
4. **CORS errors**: Check `ALLOWED_ORIGINS` in backend `.env`

For detailed troubleshooting, see `QUICK_FIX_SUMMARY.md`

---

## 🎯 Key Features Implementation

### 1. AI Agent Chat Interface

**Location:** `frontend/src/components/ChatWidget.tsx`

**Features:**
- Expandable chat window (fixed corner → full screen)
- Markdown rendering with GitHub Flavored Markdown support
- Real-time connection status display
- Context-aware queries (sends active CRM list to backend)
- Cache invalidation on connector changes

**Technologies:**
- `react-markdown` for rendering
- `remark-gfm` for tables, strikethrough, task lists
- `@tailwindcss/typography` for prose styling

### 2. CRM Connector Management

**Location:** `frontend/src/pages/Connectors.tsx`, `backend/app/api/routes/connectors.py`

**Features:**
- Connect/disconnect multiple CRMs
- Stats display (contacts, deals, companies, last sync)
- Recent activity feed
- **Data preservation on disconnect** (contacts/deals not deleted)
- React Query cache invalidation on connection changes

**Supported CRMs:**
- HubSpot
- Salesforce
- Pipedrive
- Zoho CRM
- Monday.com
- Zendesk Sell

### 3. Contact Management

**Location:** `frontend/src/pages/Contacts.tsx`, `backend/app/api/routes/contacts.py`

**Features:**
- View all contacts from connected CRMs
- Contact details display
- Search and filtering
- Source attribution (which CRM the contact came from)
- Automatic aggregation from multiple sources

### 4. Dashboard & Analytics

**Location:** `frontend/src/pages/Dashboard.tsx`

**Features:**
- Total contacts count
- Connected CRMs overview
- Recent activity feed
- Quick stats and metrics
- Real-time updates via React Query

### 5. Gemini LLM Integration

**Location:** `backend/app/api/routes/agent.py`

**Capabilities:**
- Connection-aware responses (only uses connected CRM data)
- Deep content analysis (patterns, trends, anomalies)
- Decision support framework
- Analytical response structure
- Source attribution (mentions which CRM provided data)
- Graceful degradation if AI service unavailable

**Prompt Engineering:**
- Analysis Framework for contacts/activities/decisions
- Deep Dive Triggers ("analyze", "what should I", "summarize")
- Response Style guidelines (professional, friendly, emojis, markdown)
- Critical instructions (no data invention, source references)

### 6. Real-time Data Synchronization

**Implementation:**
- React Query with automatic refetching on mount/focus
- Cache invalidation on connector connect/disconnect
- Context-aware API calls (frontend sends `activeConnectors` to backend)
- Backend filters data by connected CRMs only
- `lastSync` timestamps for each CRM

---

## 📊 Data Flow

### AI Agent Query Flow

```
User asks question in ChatWidget
      ↓
Frontend sends: {query, activeConnectors}
      ↓
Backend builds context:
  - Connected CRMs
  - Recent contacts from those CRMs
  - Recent activities
      ↓
Context + Query sent to Gemini (Vertex AI)
      ↓
Gemini analyzes and generates response
      ↓
Markdown-formatted response returned
      ↓
react-markdown renders in UI
```

### CRM Connection Flow

```
User clicks "Connect" on CRM card
      ↓
POST /connectors/{id}/connect
      ↓
Backend marks CRM as connected
Backend preserves existing contacts/deals
Backend updates stats
      ↓
React Query invalidates cache
      ↓
Frontend refetches dashboard data
      ↓
ChatWidget sees new CRM in context
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run lint        # ESLint checks
npm run test        # Run tests (if configured)
```

### Backend Tests

```bash
cd backend
pytest              # Run all tests
pytest -v           # Verbose output
black .             # Format code
flake8 .            # Lint code
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
# Google Cloud (Optional - for AI features)
GOOGLE_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id

# CRM API Keys (Optional - for live integrations)
HUBSPOT_API_KEY=your_hubspot_key
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_secret
PIPEDRIVE_API_KEY=your_pipedrive_key
ZOHO_CLIENT_ID=your_zoho_client_id
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
```

**Note**: The app will work without Google Cloud credentials using mock/demo data. AI features will be limited.

---

## 📈 Performance Optimizations

1. **React Query Caching**: Reduces unnecessary API calls
2. **Lazy Loading**: Routes and components loaded on demand
3. **Optimistic Updates**: UI updates before server confirmation
4. **Markdown Memoization**: Prevents re-rendering of formatted content
5. **Connection-Aware Queries**: Backend only processes connected CRM data

---

## 🔐 Security Considerations

1. **API Key Management**: Environment variables, never committed
2. **Input Validation**: Pydantic models validate all API inputs
3. **CORS**: Configured for frontend-backend communication
4. **Session Storage**: Tokens stored in memory
5. **Data Privacy**: CRM data stored locally

---

## 🛣️ Roadmap

### ✅ Completed
- [x] Multi-CRM connector system (6 CRM platforms)
- [x] AI-powered chat interface with Gemini LLM
- [x] Contact management system
- [x] Real-time dashboard with analytics
- [x] Dark/Light theme support
- [x] Responsive mobile-friendly UI
- [x] Markdown-formatted AI responses

### 🚧 Planned Features
- [ ] **Voice & Transcript Processing**: Upload audio files for AI analysis
- [ ] **Google Drive Integration**: Access and process documents from Drive
- [ ] **Email Processing**: Parse emails to extract CRM data
- [ ] **Companies Management**: Dedicated company profiles
- [ ] **Deal Pipeline**: Visual deal tracking and management
- [ ] **Advanced Upload**: Multi-source document processing
- [ ] **Google Speech-to-Text**: Voice transcription
- [ ] **Database Migration**: Move to PostgreSQL/MongoDB
- [ ] **Real-time Sync**: WebSocket connections for live updates
- [ ] **Calendar Integration**: Sync meetings automatically
- [ ] **Mobile App**: React Native app for iOS/Android
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Advanced Analytics**: Charts, graphs, forecasting
- [ ] **Custom Workflows**: User-defined automation rules
- [ ] **Team Collaboration**: Multi-user support with roles
- [ ] **API Webhooks**: Real-time notifications for events

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Cloud AI Platform** for Gemini LLM
- **FastAPI** for the excellent Python web framework
- **React Query** for powerful server state management
- **Tailwind CSS** for beautiful, responsive styling
- **Lucide** for the icon library

---

## 📧 Contact & Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Create an Issue](https://github.com/your-username/zero-click-crm/issues)
- **Documentation**: See `TECHSTACK.md` for detailed technology information
- **API Documentation**: Visit `http://localhost:8000/docs` when backend is running

---

## 🌟 Features at a Glance

| Feature | Status | Description |
|---------|--------|-------------|
| 🤖 AI Agent Chat | ✅ Implemented | Context-aware assistant with markdown responses |
| 🔄 Multi-CRM Sync | ✅ Implemented | 6 CRM connectors with data preservation |
| 📊 Dashboard | ✅ Implemented | Real-time analytics and statistics |
| 👥 Contact Management | ✅ Implemented | View and manage contacts from all CRMs |
| 📝 Activity Feed | ✅ Implemented | Track interactions across platforms |
| 🎨 Theme Support | ✅ Implemented | Dark/Light mode toggle |
| 📱 Responsive Design | ✅ Implemented | Mobile-friendly interface |
| 🎙️ Voice Processing | 🚧 Planned | Upload audio files for transcription |
| 📧 Email Parsing | 🚧 Planned | Extract CRM data from email content |
| 📄 Document Upload | 🚧 Planned | Process various document formats |
| 📁 Google Drive | 🚧 Planned | OAuth integration with file processing |
| 🏢 Company Management | 🚧 Planned | Dedicated company profiles |
| 💰 Deal Pipeline | 🚧 Planned | Visual deal tracking and management |

---

**Built with ❤️ using AI-first principles**

*Zero-Click CRM - Where AI meets productivity*
