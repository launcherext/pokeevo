# 🚀 Complete Setup Guide - CHAIN_REACTION System

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Redis installed and running
- ✅ Solana wallet with SOL for fees
- ✅ Helius API key (free tier works for testing)

---

## Part 1: Backend Bot Setup

### Step 1: Create .env File

In the **root directory** (`C:\Users\offic\Desktop\suicidecoin\`), create a file named `.env`:

```bash
# In PowerShell:
cd C:\Users\offic\Desktop\suicidecoin
New-Item -Path ".env" -ItemType File
notepad .env
```

### Step 2: Add Environment Variables

Copy and paste this into `.env` (replace with your actual values):

```env
# ============================================
# CRITICAL - MUST CONFIGURE
# ============================================

# Your Solana wallet private key (base58 format)
# Get from Phantom: Settings → Private Key (copy as base58)
DEPLOYER_PRIVATE_KEY=your_base58_private_key_here

# Helius API Key (get free at https://helius.dev)
HELIUS_API_KEY=your_helius_api_key_here

# Helius RPC URL (replace YOUR_KEY with your actual API key)
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Redis connection (use default if running locally)
REDIS_URL=redis://localhost:6379

# First token to monitor (MUST SET THIS)
# This is the contract address of your genesis Chain Reaction token
GENESIS_TOKEN_MINT=

# ============================================
# OPTIONAL - HAS SENSIBLE DEFAULTS
# ============================================

# WebSocket RPC (usually same as HTTP but with wss://)
HELIUS_WS_URL=wss://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Jito Configuration
JITO_BLOCK_ENGINE_URL=https://mainnet.block-engine.jito.wtf
JITO_AUTH_KEYPAIR=
JITO_TIP_LAMPORTS=1000000
JITO_TIP_RETRY_LAMPORTS=5000000

# Redis Password (if using remote Redis)
REDIS_PASSWORD=

# WebSocket Server Port
WS_PORT=8080

# Pump.fun Program IDs (verified defaults provided)
PUMP_PROGRAM_ID=6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
PUMP_GLOBAL_ACCOUNT=4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf
PUMP_FEE_RECIPIENT=CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM
PUMP_EVENT_AUTHORITY=Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1

# Token Metadata
METADATA_BASE_URI=https://arweave.net/YOUR_BASE_URI
TOKEN_NAME_PREFIX=Chain Reaction
TOKEN_SYMBOL_PREFIX=SK

# Monitoring Configuration
CASUAL_POLL_INTERVAL_MS=30000
INTENSIVE_POLL_INTERVAL_MS=200
MARKET_CAP_THRESHOLD=50000
BONDING_CURVE_THRESHOLD=0.995

# Execution Configuration
AIRDROP_BATCH_SIZE=8
AIRDROP_BATCH_DELAY_MS=500
PRIORITY_FEE_LAMPORTS=100000
```

### Step 3: Get Your Private Key

**From Phantom Wallet:**
1. Open Phantom
2. Click Settings (gear icon)
3. Click "Show Private Key"
4. Enter password
5. Copy the **base58** format (NOT the array format)
6. Paste into `DEPLOYER_PRIVATE_KEY` in .env

**⚠️ SECURITY WARNING**: Never share your private key! Keep .env file secure!

### Step 4: Get Helius API Key

1. Go to https://helius.dev
2. Sign up (free)
3. Create new project
4. Copy API key
5. Paste into `HELIUS_API_KEY` in .env
6. Update `HELIUS_RPC_URL` with your key:
   ```
   HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_ACTUAL_KEY_HERE
   ```

### Step 5: Start Redis

**Windows (PowerShell):**
```bash
# If Redis is installed via WSL
wsl redis-server

# OR if using Windows Redis
redis-server
```

**Check if Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

**Don't have Redis?**
- **Option A**: Install via WSL: `wsl --install` then `sudo apt install redis-server`
- **Option B**: Use Redis Cloud (free tier): https://redis.com/try-free/
  - Get connection URL and update `REDIS_URL` in .env

### Step 6: Set Genesis Token

You need to set the first token to monitor. You have 3 options:

**Option A: Use Existing Token** (if you already launched one)
```env
GENESIS_TOKEN_MINT=YourExistingTokenMintAddress
```

**Option B: Launch New Token First**
1. Go to https://pump.fun
2. Create a new Chain Reaction token manually
3. Copy the contract address
4. Paste into `GENESIS_TOKEN_MINT`

**Option C: Let Bot Create First Token** (advanced)
- Leave `GENESIS_TOKEN_MINT` empty
- Bot will need manual trigger to create first token
- Not recommended for first run

### Step 7: Start the Backend Bot

```bash
cd C:\Users\offic\Desktop\suicidecoin

# Make sure dependencies are installed
npm install

# Start the bot
npm start
```

**You should see:**
```
Configuration loaded:
- Deployer: YourPublicKeyHere
- Helius RPC: https://mainnet.helius-rpc.com...
- Redis: redis://localhost:6379
- WebSocket Port: 8080
- Pump Program: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P

🔥 CHAIN_REACTION BOT STARTING 🔥
══════════════════════════════════════════════
✅ Redis connected
✅ WebSocket server started
Active Token: ABC123...
Current Generation: 1
══════════════════════════════════════════════
🚀 BOT RUNNING - Watching for mitosis events...
══════════════════════════════════════════════
```

---

## Part 2: Frontend Setup

### Step 1: Create Frontend .env.local

```bash
cd C:\Users\offic\Desktop\suicidecoin\frontend
New-Item -Path ".env.local" -ItemType File
notepad .env.local
```

Add this single line:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**For production deployment**, use:
```env
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com:8080
```

### Step 2: Install Frontend Dependencies

```bash
cd C:\Users\offic\Desktop\suicidecoin\frontend
npm install
```

### Step 3: Start Frontend

```bash
npm run dev
```

**You should see:**
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

You should see:
- ✅ CHAIN_REACTION header
- ✅ "LIVE" green status (if backend is running)
- ✅ Explainer section
- ✅ How to Participate guide
- ✅ Live progress dashboard

---

## Complete System Checklist

### Before Starting:

- [ ] `.env` file created in root directory
- [ ] `DEPLOYER_PRIVATE_KEY` set (base58 format)
- [ ] `HELIUS_API_KEY` set
- [ ] `HELIUS_RPC_URL` updated with your API key
- [ ] `GENESIS_TOKEN_MINT` set (or token created on Pump.fun)
- [ ] Redis is running (`redis-cli ping` returns PONG)
- [ ] Deployer wallet has SOL (5-10 SOL recommended)
- [ ] Token metadata uploaded to Arweave/IPFS (optional for testing)
- [ ] Pump.fun discriminators updated (see IMPLEMENTATION_NOTES.md)

### To Start:

**Terminal 1 - Redis:**
```bash
redis-server
# or
wsl redis-server
```

**Terminal 2 - Backend:**
```bash
cd C:\Users\offic\Desktop\suicidecoin
npm start
```

**Terminal 3 - Frontend:**
```bash
cd C:\Users\offic\Desktop\suicidecoin\frontend
npm run dev
```

**Browser:**
```
http://localhost:3000
```

---

## Testing the System

### 1. Check Backend is Running

Look for these logs:
```
✅ Redis connected
✅ WebSocket server started
Active Token: ABC123...
🚀 BOT RUNNING
```

### 2. Check Frontend Connection

Open browser console (F12):
- Should see: `WebSocket connected`
- Frontend status should show: 🟢 LIVE

### 3. Verify WebSocket Communication

In browser console, you should see:
```
WebSocket message: {event: "curve_update", progress: 0.15, ...}
```

### 4. Watch Status Updates

Bot logs status every 60 seconds:
```
═══ CHAIN_REACTION STATUS ═══
Running: true
Monitor Active: true
Monitor Phase: casual
Active Mint: ABC123...
WebSocket Clients: 1
═══════════════════════════
```

---

## Common Issues

### Issue: "Missing required environment variables"

**Solution**: Check .env file has all required variables:
```bash
DEPLOYER_PRIVATE_KEY=...
HELIUS_API_KEY=...
HELIUS_RPC_URL=...
REDIS_URL=...
```

### Issue: "Redis connection failed"

**Solutions**:
1. Check Redis is running: `redis-cli ping`
2. Start Redis: `redis-server`
3. Check `REDIS_URL` in .env matches your Redis location

### Issue: "No active token mint configured"

**Solution**: Set `GENESIS_TOKEN_MINT` in .env:
```env
GENESIS_TOKEN_MINT=YourTokenMintAddressHere
```

### Issue: Frontend shows "DISCONNECTED"

**Solutions**:
1. Check backend is running
2. Check WebSocket port 8080 is not blocked
3. Verify `.env.local` has correct URL:
   ```env
   NEXT_PUBLIC_WS_URL=ws://localhost:8080
   ```

### Issue: "Invalid private key"

**Solutions**:
1. Make sure you copied **base58** format (not array)
2. No extra spaces or quotes
3. Should look like: `5J7Xb...` (starts with number/letter)

### Issue: Build fails with TypeScript errors

**Solution**: Already compiled! Just use:
```bash
npm start
```

If you need to rebuild:
```bash
npm run build
npm start
```

---

## Environment Variables Reference

### Required (Must Configure):

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DEPLOYER_PRIVATE_KEY` | Your wallet private key | Phantom → Settings → Show Private Key |
| `HELIUS_API_KEY` | Helius API key | https://helius.dev → Sign up |
| `HELIUS_RPC_URL` | Helius RPC endpoint | Use key in URL format shown above |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` if local |
| `GENESIS_TOKEN_MINT` | First token to monitor | Pump.fun token address |

### Optional (Has Defaults):

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_PORT` | `8080` | WebSocket server port |
| `MARKET_CAP_THRESHOLD` | `50000` | When to switch to intensive polling |
| `BONDING_CURVE_THRESHOLD` | `0.995` | When to trigger mitosis (99.5%) |
| `JITO_TIP_LAMPORTS` | `1000000` | Initial Jito tip (0.001 SOL) |
| `AIRDROP_BATCH_SIZE` | `8` | Transfers per transaction |

---

## Quick Start Summary

**Absolute minimum to start:**

```bash
# 1. Create .env with these 5 variables:
DEPLOYER_PRIVATE_KEY=your_key
HELIUS_API_KEY=your_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_key
REDIS_URL=redis://localhost:6379
GENESIS_TOKEN_MINT=token_address

# 2. Start Redis
redis-server

# 3. Start backend
npm start

# 4. Start frontend (new terminal)
cd frontend
npm run dev

# 5. Open browser
# http://localhost:3000
```

---

## Next Steps After Setup

1. ✅ **Watch the dashboard** - See real-time updates
2. ✅ **Monitor backend logs** - Check for errors
3. ✅ **Test with small amounts** - Don't risk large funds initially
4. ✅ **Update discriminators** - See IMPLEMENTATION_NOTES.md
5. ✅ **Deploy to production** - See VERCEL_DEPLOYMENT.md

---

## Need Help?

- **Backend issues**: Check root directory `.env` file
- **Frontend issues**: Check `frontend/.env.local` file
- **Redis issues**: Run `redis-cli ping`
- **WebSocket issues**: Check port 8080 is not blocked
- **Wallet issues**: Ensure deployer has SOL

---

**You're ready to run the CHAIN_REACTION system!** 🚀

Start all three terminals (Redis, Backend, Frontend) and watch the recursive token experiment come to life!
