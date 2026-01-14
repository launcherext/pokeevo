# ✅ Your Credentials Are Configured!

## What's Set Up

✅ `.env` file created with your credentials:
- Private Key: `4ewoKafhuehPKx...` ✓
- Helius API Key: `0e492ad2-d236...` ✓
- Helius RPC URLs configured ✓
- Redis URL set to localhost ✓

✅ `frontend/.env.local` created:
- WebSocket URL: `ws://localhost:8080` ✓

---

## ⚠️ ONE MORE THING NEEDED

You need to set **GENESIS_TOKEN_MINT** in your `.env` file.

### Option 1: Create a New Token (Recommended for Testing)

1. Go to **https://pump.fun**
2. Click "Create Token"
3. Fill in:
   - Name: `Chain Reaction #001`
   - Symbol: `SK001`
   - Description: "The first generation of the CHAIN_REACTION recursive token experiment"
   - Upload an image (blood/knife theme)
4. Deploy the token
5. **Copy the contract address** (looks like: `7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963vgcg`)
6. Edit `.env` and add it:
   ```env
   GENESIS_TOKEN_MINT=YOUR_CONTRACT_ADDRESS_HERE
   ```

### Option 2: Use an Existing Token

If you already have a Pump.fun token:
1. Copy its contract address
2. Add to `.env`:
   ```env
   GENESIS_TOKEN_MINT=YOUR_EXISTING_TOKEN_ADDRESS
   ```

---

## 🚀 Ready to Start!

Once you've set `GENESIS_TOKEN_MINT`, you can start the system:

### Terminal 1: Start Redis
```bash
redis-server
```

### Terminal 2: Start Backend
```bash
npm start
```

### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev
```

### Browser
Open: **http://localhost:3000**

---

## 📋 Quick Checklist

- [x] Private key configured
- [x] Helius API key configured
- [x] Redis URL set
- [x] Frontend .env.local created
- [ ] **GENESIS_TOKEN_MINT set** ← DO THIS NOW
- [ ] Redis running
- [ ] Backend started
- [ ] Frontend started

---

## 🎯 What to Expect

When you start the bot, you'll see:

**Backend:**
```
Configuration loaded:
- Deployer: 4ewoKafhuehPKx...
- Helius RPC: https://mainnet.helius-rpc.com...
✅ Redis connected
✅ WebSocket server started
Active Token: YOUR_GENESIS_TOKEN
🚀 BOT RUNNING - Watching for mitosis events...
```

**Frontend:**
- 🟢 "LIVE" status
- Token info displayed
- Progress bar showing bonding curve %
- Real-time updates every 30s (or 200ms when market cap > $50k)

---

## 💰 Important Notes

### Wallet Balance
Your deployer wallet needs SOL for:
- Transaction fees
- Jito tips (0.001 - 0.005 SOL per bundle)
- Priority fees

**Recommended**: 5-10 SOL to start

### First Run
The bot will:
1. Monitor your genesis token on Pump.fun
2. Poll market cap every 30 seconds initially
3. Switch to 200ms polling when MC reaches $50k
4. Trigger mitosis at 99.5% bonding curve completion
5. Execute atomic: Claim → Create → Buy
6. Airdrop to top 100 holders
7. Start monitoring the new token

---

## 🐛 If Something Goes Wrong

### "Missing required environment variables"
→ Check `.env` has all 5 required variables

### "No active token mint configured"
→ Set `GENESIS_TOKEN_MINT` in `.env`

### "Redis connection failed"
→ Start Redis: `redis-server`

### Frontend shows "DISCONNECTED"
→ Make sure backend is running with `npm start`

---

## 🎉 You're Almost There!

Just one more step:
1. **Create or find a token on Pump.fun**
2. **Add its address to `GENESIS_TOKEN_MINT` in `.env`**
3. **Start the system** (3 terminals: redis, backend, frontend)
4. **Watch the magic happen** at http://localhost:3000

---

**Ready? Go create that genesis token on Pump.fun!** 🔥
