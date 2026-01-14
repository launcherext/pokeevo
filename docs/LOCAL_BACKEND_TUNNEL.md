# Connecting Vercel Frontend to Local Backend

## Quick Setup (Using localtunnel - No Signup Required)

### Step 1: Install localtunnel
```bash
npm install -g localtunnel
```

### Step 2: Start Your Backend
```bash
cd C:\Users\offic\Desktop\suicidecoin
npm start
```

Your backend should be running on port 8080 (WebSocket server).

### Step 3: Create Tunnel
Open a **new terminal** and run:
```bash
lt --port 8080 --subdomain zero-hour-ws
```

This will give you a URL like: `https://zero-hour-ws.loca.lt`

**Note:** The subdomain might be taken. If so, just use:
```bash
lt --port 8080
```
And it will give you a random URL.

### Step 4: Update Vercel Environment Variable

1. Go to: https://vercel.com/shillz96s-projects/suicide/settings/environment-variables
2. Add/Update:
   - **Key:** `NEXT_PUBLIC_WS_URL`
   - **Value:** `wss://zero-hour-ws.loca.lt` (or your tunnel URL)
   - **Environment:** Production, Preview, Development (check all)
3. Click **Save**

### Step 5: Redeploy Vercel
```bash
cd frontend
npx vercel --prod
```

Or just push to GitHub if you have auto-deploy enabled.

---

## Alternative: Using ngrok (More Reliable)

### Step 1: Sign up at https://ngrok.com (free)

### Step 2: Install ngrok
Download from: https://ngrok.com/download
Or use: `npm install -g ngrok`

### Step 3: Start Backend
```bash
cd C:\Users\offic\Desktop\suicidecoin
npm start
```

### Step 4: Create Tunnel
Open a **new terminal**:
```bash
ngrok http 8080
```

This will give you a URL like: `https://abc123.ngrok.io`

### Step 5: Update Vercel
1. Go to Vercel dashboard → Settings → Environment Variables
2. Set `NEXT_PUBLIC_WS_URL` to: `wss://abc123.ngrok.io`
3. Redeploy

---

## Important Notes

### WebSocket Protocol
- **Local:** `ws://localhost:8080`
- **Tunnel:** `wss://your-tunnel-url` (note the `wss://` for secure WebSocket)

### Tunnel URLs Change
- **localtunnel:** URL changes each time (unless you use a subdomain)
- **ngrok (free):** URL changes each time
- **ngrok (paid):** Can have fixed domain

### Keep Tunnel Running
- The tunnel must stay running while you're using the Vercel frontend
- If tunnel stops, frontend will disconnect
- Consider using `pm2` or similar to keep it running

---

## Production Solution (Recommended for Long-term)

For production, you should deploy the backend to:
- **Railway** (easiest)
- **Render** (free tier available)
- **Fly.io** (good for WebSockets)
- **DigitalOcean App Platform**

Then update Vercel's `NEXT_PUBLIC_WS_URL` to point to your deployed backend.

---

## Quick Test Script

Create `start-tunnel.bat`:
```batch
@echo off
echo Starting localtunnel for WebSocket server...
lt --port 8080 --subdomain zero-hour-ws
pause
```

Run this in a separate terminal after starting your backend.
