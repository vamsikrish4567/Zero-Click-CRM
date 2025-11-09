# Google Cloud Setup Guide for Zero-Click CRM

## ⚠️ Current Status
Your application is running in **Limited Mode** because Google Cloud AI is not configured.

## 🚀 Quick Setup (Choose One Option)

### **Option 1: Using Gemini API Key (Easiest)**

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key

2. **Create `.env` file in backend/ directory**
   ```env
   GOOGLE_API_KEY=your_actual_api_key_here
   GOOGLE_CLOUD_PROJECT=
   ```

3. **Restart the backend**
   ```bash
   # Stop the current uvicorn server (Ctrl+C)
   uvicorn app.main:app --reload
   ```

### **Option 2: Using Service Account (For Production)**

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note your Project ID

2. **Enable Vertex AI API**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```
   Or manually in Console: APIs & Services > Library > Search "Vertex AI"

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: `zero-click-crm-sa`
   - Grant roles:
     - **Vertex AI User**
     - **AI Platform Developer**

4. **Download Service Account Key**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose **JSON** format
   - Download and rename to `service-account-key.json`
   - Move to `backend/` directory

5. **Create `.env` file in backend/ directory**
   ```env
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
   VERTEX_AI_LOCATION=us-central1
   VERTEX_AI_MODEL=gemini-1.5-flash
   ```

6. **Restart the backend**
   ```bash
   # Stop the current uvicorn server (Ctrl+C)
   uvicorn app.main:app --reload
   ```

## ✅ Verify Setup

After restarting, check for:
- ✅ No more "Using fallback extraction" warning
- ✅ AI Assistant should show "Full Mode" or no warning
- ✅ Chat responses should be more intelligent and context-aware

## 🔒 Security Notes

- ⚠️ **NEVER commit** `.env` or `service-account-key.json` to Git
- ✅ These files are already in `.gitignore`
- ✅ Use `.env.example` as a template (without real credentials)

## 💰 Cost Considerations

- **Gemini API Key**: Free tier available (60 requests/minute)
- **Vertex AI**: Pay-as-you-go pricing
- For development: API Key is sufficient
- For production: Service Account recommended

## 🐛 Troubleshooting

### "Credentials not found"
- Check `.env` file exists in `backend/` directory
- Verify file name is exactly `.env` (not `.env.txt`)
- Check file permissions

### "API not enabled"
- Enable Vertex AI API in Google Cloud Console
- Wait 2-3 minutes for API to activate

### "Invalid API Key"
- Verify key is copied correctly (no spaces)
- Check API key is not expired
- Regenerate key if needed

## 📊 What Changes After Setup?

**Before (Limited Mode):**
- Basic rule-based responses
- No deep analysis
- No pattern recognition
- Simple data display

**After (Full AI Mode):**
- Intelligent context-aware responses
- Deep data analysis and insights
- Pattern recognition across CRM data
- Decision support recommendations
- Action items extraction from transcripts
- Trend analysis and forecasting

---

**Need Help?** Check the main README.md for detailed architecture and feature documentation.

