# 🔥 START HERE - Quick Setup

## ⚡ 5-Minute Setup

### 1️⃣ Create .env File (2 minutes)

In the root directory, create `.env`:

```env
DEPLOYER_PRIVATE_KEY=your_base58_private_key_from_phantom
HELIUS_API_KEY=your_helius_api_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
REDIS_URL=redis://localhost:6379
GENESIS_TOKEN_MINT=your_first_token_mint_address
```

**Where to get these:**
- Private Key: Phantom wallet → Settings → Show Private Key
- Helius Key: https://helius.dev (free signup)
- Genesis Token: Create token on https://pump.fun first

### 2️⃣ Start Redis (30 seconds)

```bash
redis-server
```

Or if using WSL:
```bash
wsl redis-server
```

### 3️⃣ Start Backend (1 minute)

```bash
npm start
```

### 4️⃣ Start Frontend (1 minute)

New terminal:
```bash
cd frontend
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8080" > .env.local
npm install
npm run dev
```

### 5️⃣ Open Browser

**http://localhost:3000**

---

## ✅ You Should See:

**Backend logs:**
```
🔥 CHAIN_REACTION BOT STARTING 🔥
✅ Redis connected
✅ WebSocket server started
🚀 BOT RUNNING - Watching for mitosis events...
```

**Frontend:**
- 🟢 "LIVE" status
- Progress bar updating
- Current token info
- Event stream populating

---

## 🆘 Having Issues?

See **COMPLETE_SETUP_GUIDE.md** for detailed troubleshooting.

**Most common issues:**
1. Forgot to create `.env` file
2. Redis not running
3. Wrong private key format (use base58, not array)
4. No `GENESIS_TOKEN_MINT` set

---

## 📋 Quick Checklist

- [ ] Created `.env` in root directory
- [ ] Added 5 required variables
- [ ] Got private key from Phantom (base58 format)
- [ ] Got Helius API key (free at helius.dev)
- [ ] Created or found genesis token on Pump.fun
- [ ] Started Redis (`redis-server`)
- [ ] Ran `npm start` in root directory
- [ ] Created `frontend/.env.local`
- [ ] Ran `npm run dev` in frontend directory
- [ ] Opened http://localhost:3000
- [ ] See 🟢 LIVE status

---

**That's it! You're running the CHAIN_REACTION system!** 🎉
