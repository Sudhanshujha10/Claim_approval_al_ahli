# 🚀 Quick Deployment Guide

## Step 1: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo: `Sudhanshujha10/Claim_approval_al_ahli`
4. Configure:
   - Build: `npm install`
   - Start: `node api/server.js`
   - Add env var: `OPENAI_API_KEY=your-key`
5. Copy the deployed URL (e.g., `https://qlm-api.onrender.com`)

## Step 2: Deploy Frontend to Vercel

Run these commands:

```bash
# Set backend URL (use YOUR Render URL from Step 1)
echo "VITE_API_URL=https://your-render-url.onrender.com" > .env.production

# Build
npm run build

# Deploy
vercel --prod
```

## Done! 🎉

Your app is live at the Vercel URL shown after deployment.

**Note:** First request to Render backend may be slow (cold start on free tier).
