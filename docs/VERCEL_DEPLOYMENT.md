# 🚀 Vercel Deployment Guide - CHAIN_REACTION Frontend

## Current Issue

There's an existing Vercel project linked with incorrect path settings. Here's how to fix it:

## Option 1: Delete and Redeploy (Recommended)

### Step 1: Delete Existing Project

1. Go to https://vercel.com/shillz96s-projects/frontend/settings
2. Scroll to bottom → Click "Delete Project"
3. Confirm deletion

### Step 2: Deploy Fresh

```bash
cd C:\Users\offic\Desktop\suicidecoin\frontend

# Remove local Vercel link
Remove-Item -Recurse -Force .vercel

# Deploy to Vercel
npx vercel --yes

# When prompted:
# - Set up and deploy? YES
# - Which scope? (select your account)
# - Link to existing project? NO
# - What's your project's name? chain-reaction-frontend
# - In which directory is your code located? ./ (just press Enter)
# - Want to modify settings? NO

# Deploy to production
npx vercel --prod
```

---

## Option 2: Fix Existing Project Settings

### Via Vercel Dashboard

1. Go to https://vercel.com/shillz96s-projects/frontend/settings
2. Under "General" → "Root Directory"
3. Change from `frontend` to `./` or leave blank
4. Save changes
5. Try deploying again:

```bash
cd C:\Users\offic\Desktop\suicidecoin\frontend
npx vercel --prod
```

---

## Option 3: Deploy via GitHub (Best for Continuous Deployment)

### Step 1: Push to GitHub

```bash
cd C:\Users\offic\Desktop\suicidecoin

# Initialize git (if not already)
git init
git add .
git commit -m "Add CHAIN_REACTION backend and frontend"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/chain-reaction.git
git branch -M main
git push -u origin main
```

### Step 2: Import on Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variable:
   - Key: `NEXT_PUBLIC_WS_URL`
   - Value: `wss://your-backend-url:8080` (or `ws://` for dev)
6. Click "Deploy"

---

## Option 4: Manual Build and Deploy

If Vercel CLI continues to have issues:

```bash
cd C:\Users\offic\Desktop\suicidecoin\frontend

# Build locally
npm run build

# Upload .next folder manually to Vercel
# Or use: vercel --prebuilt
```

---

## Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add:

```
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com:8080
```

**Important**: Use `wss://` (secure WebSocket) for production, not `ws://`

---

## Verify Deployment

Once deployed:

1. Open your Vercel URL (e.g., `https://chain-reaction-frontend.vercel.app`)
2. Check console (F12) for WebSocket connection
3. Verify "LIVE" status appears when backend is running

---

## Common Issues

### WebSocket Won't Connect

**Problem**: Frontend shows "DISCONNECTED"

**Solutions**:
- Verify backend is running and accessible
- Check `NEXT_PUBLIC_WS_URL` is correct
- Ensure firewall allows WebSocket connections
- Use `wss://` for production (secure)

### Build Fails on Vercel

**Problem**: Deployment fails during build

**Solutions**:
1. Check build logs on Vercel dashboard
2. Ensure all dependencies are in package.json
3. Try building locally first: `npm run build`

### CORS Errors

**Problem**: WebSocket blocked by CORS

**Solutions**:
- WebSocket connections don't use CORS
- Check backend WebSocket server allows connections from Vercel domain
- Verify URL format is correct

---

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Backend WebSocket port (8080) open
- [ ] SSL certificate for wss:// (recommended)
- [ ] Environment variable `NEXT_PUBLIC_WS_URL` set correctly
- [ ] Test WebSocket connection from deployed frontend
- [ ] Check all animations work
- [ ] Verify mobile responsiveness

---

## Quick Deploy (Once Fixed)

```bash
# Development deploy
cd frontend
npx vercel

# Production deploy
npx vercel --prod
```

---

## Alternative: Deploy Backend + Frontend Together

If you want to deploy both on the same platform:

### Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy backend
railway up

# Get backend URL and update frontend .env
# Then deploy frontend separately or as monorepo
```

### Render.com

1. Connect GitHub repo
2. Create Web Service for backend (Node.js)
3. Create Static Site for frontend (Next.js)
4. Set environment variables

---

## Recommended Setup

**Backend**: Railway, Render, or DigitalOcean
**Frontend**: Vercel (fastest and easiest)
**Redis**: Redis Cloud or Railway

This way you get:
- ✅ Fast global CDN for frontend (Vercel)
- ✅ Reliable backend hosting
- ✅ Managed Redis
- ✅ Easy SSL certificates
- ✅ Auto-deployments from Git

---

## Need Help?

If you continue having issues:

1. Check Vercel project settings: https://vercel.com/shillz96s-projects/frontend/settings
2. Review build logs on Vercel dashboard
3. Test local build: `npm run build && npm start`
4. Check browser console for errors

---

**The frontend is ready to deploy - just need to fix the project link!** 🚀
