# Setup Instructions for Zero-Click CRM

## ✅ Fixes Applied

### 1. **Fixed Encoding Error** ✅
**Problem:** Companies were failing to load from HubSpot and Pipedrive with charmap codec errors.

**Solution:** Added `encoding='utf-8'` to file reading in `backend/app/api/routes/companies.py`

```python
# Before:
with open(file_path, 'r') as f:

# After:
with open(file_path, 'r', encoding='utf-8') as f:
```

### 2. **Google Cloud AI Setup Guide** ✅
Created comprehensive setup guide: `GOOGLE_CLOUD_SETUP.md`

## 🚀 Next Steps

### Quick Start (5 minutes):

1. **Get a Gemini API Key** (Easiest option)
   - Visit: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. **Create `.env` file**
   ```bash
   cd backend
   # Create .env file with:
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

3. **Restart Backend**
   ```bash
   # Press Ctrl+C to stop current server
   uvicorn app.main:app --reload
   ```

4. **Verify**
   - Refresh your frontend
   - Check that AI Assistant no longer shows "Limited Mode"
   - Try asking a question in the chat

## 📋 What Changed?

### Before:
- ❌ Encoding errors when loading companies
- ⚠️ AI in Limited Mode (basic responses only)
- ⚠️ "Using fallback extraction" warning

### After:
- ✅ Companies load correctly from all CRMs
- ✅ Full AI capabilities with proper setup
- ✅ Deep analysis and intelligent responses

## 🔍 Additional Notes

### The encoding fix will take effect immediately after you restart the backend server.

### For AI features, you need to:
1. Choose between API Key (easier) or Service Account (production)
2. Create `.env` file with credentials
3. Restart backend

**See `GOOGLE_CLOUD_SETUP.md` for detailed instructions.**

## ⚡ Quick Commands

```bash
# Stop current server
# Press Ctrl+C in the terminal running uvicorn

# Navigate to backend
cd backend

# Create .env (if not exists)
# Add: GOOGLE_API_KEY=your_key_here

# Restart server
uvicorn app.main:app --reload

# In another terminal, check if it's working
curl http://localhost:8000/api/connectors
```

---

**Need more help?** 
- Check `GOOGLE_CLOUD_SETUP.md` for detailed Google Cloud setup
- Check `README.md` for overall architecture
- The app works in limited mode without Google Cloud (for development)

