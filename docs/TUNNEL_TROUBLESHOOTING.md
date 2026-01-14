# WebSocket Tunnel Troubleshooting

## Problem
WebSocket connection to `wss://zero-hour-ws.loca.lt/` is failing.

## Quick Fix: Use ngrok (More Reliable)

### Step 1: Install ngrok
```bash
# Download from https://ngrok.com/download
# Or use npm:
npm install -g ngrok
```

### Step 2: Sign up (Free)
1. Go to https://ngrok.com
2. Sign up for free account
3. Get your authtoken from dashboard

### Step 3: Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 4: Start Backend
```bash
cd C:\Users\offic\Desktop\suicidecoin
npm start
```

### Step 5: Start ngrok tunnel
Open a **new terminal**:
```bash
ngrok http 8080
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080
```

### Step 6: Update Vercel
1. Go to: https://vercel.com/shillz96s-projects/suicide/settings/environment-variables
2. Update `NEXT_PUBLIC_WS_URL` to: `wss://abc123.ngrok-free.app` (use the URL from ngrok)
3. Redeploy Vercel

---

## Alternative: Check if Localtunnel is Running

If you want to stick with localtunnel:

1. **Check if tunnel is running:**
   - Look for a terminal window running `lt --port 8080`
   - If not running, start it:
     ```bash
     lt --port 8080 --subdomain zero-hour-ws
     ```

2. **The URL might have changed:**
   - Localtunnel URLs change each time
   - Check the terminal output for the current URL
   - Update Vercel with the new URL

3. **Localtunnel WebSocket issues:**
   - Localtunnel doesn't always support WebSocket upgrades well
   - **Recommendation: Use ngrok instead**

---

## Best Solution: Deploy Backend to Railway

For production, deploy your backend to Railway (free tier available):

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Connect your repo
4. Set environment variables
5. Deploy

Then update Vercel's `NEXT_PUBLIC_WS_URL` to your Railway URL.

---

## Quick Test: Is Backend Running?

Check if your backend is actually running on port 8080:

```bash
# In a new terminal
curl http://localhost:8080
```

Or check if the WebSocket server is listening:
```bash
netstat -an | findstr 8080
```

If nothing is listening, your backend isn't running!
