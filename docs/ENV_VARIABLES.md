# 🔑 Environment Variables Reference

## Required Variables (Backend .env)

### 1. DEPLOYER_PRIVATE_KEY
**What**: Your Solana wallet private key
**Format**: Base58 string (looks like: `5J7Xb2K...`)
**How to get**:
1. Open Phantom wallet
2. Go to Settings (gear icon)
3. Click "Show Private Key"
4. Copy the **base58** format (NOT the byte array)

**Example**:
```env
DEPLOYER_PRIVATE_KEY=5J7Xb2K9fD3pQ8mN6rT4wE2gS1hV7cB9xL4yA6zM3nP5kR8jU2vW7qT1oI3eN4mL6
```

---

### 2. HELIUS_API_KEY
**What**: API key for Helius RPC service
**Format**: String (looks like: `abc123-def456-ghi789`)
**How to get**:
1. Go to https://helius.dev
2. Sign up (free)
3. Create new project
4. Copy API key

**Example**:
```env
HELIUS_API_KEY=abc123-def456-ghi789-jkl012
```

---

### 3. HELIUS_RPC_URL
**What**: Helius RPC endpoint with your API key
**Format**: URL with embedded API key
**How to set**:
Replace `YOUR_KEY` with your actual Helius API key

**Example**:
```env
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=abc123-def456-ghi789-jkl012
```

---

### 4. REDIS_URL
**What**: Redis connection string
**Format**: `redis://host:port`
**Default**: `redis://localhost:6379`

**Examples**:
```env
# Local Redis
REDIS_URL=redis://localhost:6379

# Remote Redis with password
REDIS_URL=redis://:password@redis-server.com:6379

# Redis Cloud
REDIS_URL=redis://default:password@redis-12345.cloud.redislabs.com:12345
```

---

### 5. GENESIS_TOKEN_MINT
**What**: The first Chain Reaction token contract address to monitor
**Format**: Solana public key (44 characters)
**How to get**:
1. Go to https://pump.fun
2. Create a new token (name it "Chain Reaction #001")
3. Copy the contract address
4. Paste here

**Example**:
```env
GENESIS_TOKEN_MINT=7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963vgcg
```

**Note**: Can also use an existing Pump.fun token if you want to monitor it.

---

## Optional Variables (Has Defaults)

### WebSocket Configuration
```env
# Port for WebSocket server (frontend connects to this)
WS_PORT=8080
```

### Jito Configuration
```env
# Jito block engine URL
JITO_BLOCK_ENGINE_URL=https://mainnet.block-engine.jito.wtf

# Jito auth keypair (optional, for priority access)
JITO_AUTH_KEYPAIR=

# Initial tip amount (0.001 SOL)
JITO_TIP_LAMPORTS=1000000

# Retry tip amount (0.005 SOL)
JITO_TIP_RETRY_LAMPORTS=5000000
```

### Monitoring Thresholds
```env
# How often to poll in casual mode (30 seconds)
CASUAL_POLL_INTERVAL_MS=30000

# How often to poll in intensive mode (200ms)
INTENSIVE_POLL_INTERVAL_MS=200

# Market cap to switch from casual to intensive ($50k)
MARKET_CAP_THRESHOLD=50000

# Bonding curve % to trigger mitosis (99.5%)
BONDING_CURVE_THRESHOLD=0.995
```

### Airdrop Configuration
```env
# Number of transfers per transaction
AIRDROP_BATCH_SIZE=8

# Delay between batches (500ms)
AIRDROP_BATCH_DELAY_MS=500

# Priority fee per transaction (0.0001 SOL)
PRIORITY_FEE_LAMPORTS=100000
```

---

## Frontend .env.local

Create this file in the `frontend/` directory:

```env
# WebSocket URL to connect to backend
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**For production**:
```env
NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com:8080
```

**Note**: Must start with `NEXT_PUBLIC_` to be accessible in browser!

---

## Complete Example Files

### Backend (.env in root directory)
```env
# Required
DEPLOYER_PRIVATE_KEY=5J7Xb2K9fD3pQ8mN6rT4wE2gS1hV7cB9xL4yA6zM3nP5kR8jU2vW7qT1oI3eN4mL6
HELIUS_API_KEY=abc123-def456-ghi789
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=abc123-def456-ghi789
REDIS_URL=redis://localhost:6379
GENESIS_TOKEN_MINT=7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963vgcg

# Optional (can leave defaults)
WS_PORT=8080
MARKET_CAP_THRESHOLD=50000
```

### Frontend (.env.local in frontend/ directory)
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

---

## Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore`
- Never commit private keys to git
- Use different keys for dev/prod
- Rotate keys periodically
- Use environment variables in production

### ❌ DON'T:
- Share your `.env` file
- Commit `.env` to GitHub
- Use production keys in development
- Store keys in code
- Share private keys in screenshots

---

## Validation Checklist

Before starting the bot, verify:

- [ ] `.env` file exists in root directory
- [ ] `DEPLOYER_PRIVATE_KEY` is 87-88 characters (base58)
- [ ] `HELIUS_API_KEY` is set
- [ ] `HELIUS_RPC_URL` contains your actual API key
- [ ] `REDIS_URL` points to running Redis instance
- [ ] `GENESIS_TOKEN_MINT` is 43-44 characters (Solana address)
- [ ] `frontend/.env.local` exists
- [ ] `NEXT_PUBLIC_WS_URL` points to backend WebSocket port

---

## Testing Your Configuration

### Test Backend Config
```bash
npm start
```

Look for:
```
Configuration loaded:
- Deployer: YourPublicKeyHere
✅ Redis connected
✅ WebSocket server started
```

### Test Frontend Config
Open browser console (F12), should see:
```
Connecting to WebSocket: ws://localhost:8080
WebSocket connected
```

---

## Troubleshooting

### "Missing required environment variables"
→ Check all 5 required variables are set in `.env`

### "Failed to load deployer private key"
→ Ensure key is in base58 format (not array)
→ No extra spaces or quotes

### "Redis connection failed"
→ Start Redis: `redis-server`
→ Check `REDIS_URL` is correct

### "No active token mint configured"
→ Set `GENESIS_TOKEN_MINT` in `.env`
→ Create token on Pump.fun first

### Frontend shows "DISCONNECTED"
→ Check backend is running
→ Verify `NEXT_PUBLIC_WS_URL` in frontend/.env.local

---

**Ready to configure? See START_HERE.md for step-by-step setup!** 🚀
