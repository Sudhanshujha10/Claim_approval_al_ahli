# 🚀 Vercel Deployment Guide

## ⚠️ Important Notes

### **Vercel Limitations for This Project:**

1. **File Storage:** Vercel serverless functions have **read-only filesystem**
   - Cannot store uploaded PDFs permanently
   - Cannot modify `claims.json` directly
   - **Solution:** Need external storage (AWS S3, Vercel Blob, or Database)

2. **Serverless Timeout:** 10 seconds on free tier
   - AI validation might timeout
   - **Solution:** Use Vercel Pro ($20/month) for 60s timeout

3. **Python Parser:** Cannot run Python service on Vercel
   - **Solution:** Deploy Python parser separately (Render/Railway) or use OpenAI Vision API only

---

## 🎯 Recommended Architecture for Vercel

### **Option A: Vercel + External Storage (Recommended)**
```
Frontend (Vercel) → API (Vercel Serverless) → Storage (Vercel Blob/S3)
                                             → Database (MongoDB Atlas/Supabase)
```

### **Option B: Hybrid Deployment**
```
Frontend (Vercel Static)
Backend API (Render/Railway) ← Better for file storage
Python Parser (Render)
```

---

## 🚀 Quick Deploy to Vercel (Frontend Only)

If you want to deploy just the frontend for now:

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Set Environment Variables in Vercel Dashboard
- `OPENAI_API_KEY` - Your OpenAI API key
- `VITE_API_URL` - Your backend API URL (if separate)

---

## 📦 Full Deployment Steps (With Backend)

### **Prerequisites:**
1. Vercel account
2. External storage solution (choose one):
   - **Vercel Blob Storage** (easiest, paid)
   - **AWS S3** (flexible, pay-as-you-go)
   - **MongoDB Atlas** (free tier available)

### **Step 1: Modify Code for Serverless**

#### Update API to use external storage:
- Replace file system writes with Vercel Blob/S3
- Replace `claims.json` with database (MongoDB/Supabase)

#### Example: Using Vercel Blob
```javascript
import { put, list } from '@vercel/blob';

// Upload PDF
const blob = await put('claim-pdfs/file.pdf', fileBuffer, {
  access: 'public',
});
```

### **Step 2: Update Environment Variables**
Create `.env.production`:
```
OPENAI_API_KEY=your_key_here
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
MONGODB_URI=your_mongodb_connection_string
```

### **Step 3: Deploy**
```bash
vercel --prod
```

---

## 🔧 Alternative: Deploy Backend Separately

### **Better Approach for This Project:**

1. **Frontend → Vercel** (Static Site)
   ```bash
   npm run build
   vercel --prod
   ```

2. **Backend → Render** (Free Tier)
   - Persistent file storage
   - No timeout issues
   - Can run Python parser

3. **Update Frontend API URL:**
   ```typescript
   // src/lib/api.ts
   const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
   ```

---

## 📋 What You Need to Decide:

### **Option 1: Vercel Only (Requires Code Changes)**
- ✅ Single platform
- ❌ Need external storage ($)
- ❌ Need code refactoring
- ❌ 10s timeout limit

### **Option 2: Vercel Frontend + Render Backend (Recommended)**
- ✅ No code changes needed
- ✅ Free tier available
- ✅ File storage works
- ✅ No timeout issues
- ✅ Python parser works
- ❌ Two platforms to manage

---

## 🎯 My Recommendation

**Deploy Frontend to Vercel + Backend to Render:**

### **Why?**
1. Your app needs file storage (PDFs, claims.json)
2. AI validation can take >10 seconds
3. Python parser needs persistent service
4. Minimal code changes required

### **Steps:**
1. Deploy backend to Render (5 minutes)
2. Deploy frontend to Vercel (2 minutes)
3. Update API URL in frontend
4. Done! ✅

---

## 🚀 Quick Start Commands

### **Deploy Frontend Only (Vercel):**
```bash
npm run build
vercel --prod
```

### **Deploy Full Stack (Render):**
```bash
# Will provide Render deployment steps if you choose this option
```

---

## ❓ What Would You Like to Do?

1. **Deploy frontend only to Vercel** (backend stays local)
2. **Deploy frontend to Vercel + backend to Render** (recommended)
3. **Refactor code for Vercel serverless** (requires storage setup)

Let me know your choice and I'll proceed!
