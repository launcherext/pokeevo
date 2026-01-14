# CHAIN_REACTION - Viral DeFi MEV Bot

> **⚠️ PRODUCTION MEV SYSTEM - Handle with extreme care**

An automated MEV bot that creates a recursive loop of token launches on Pump.fun. When a token's bonding curve reaches 100%, the bot atomically claims creator rewards, deploys a new token, snipes the initial supply, and airdrops it to the top 100 holders of the previous generation.

## 🏗️ Architecture

```
Monitor Service → Snapshot Engine → Jito Bundle Executor → Airdrop Dispenser
      ↓                                      ↓
   Redis Cache ←────────────────────── WebSocket Server → Frontend
```

### Two-Phase Monitoring

1. **Casual Phase** (Market Cap < $50k): Poll PumpPortal API every 30 seconds
2. **Intensive Phase** (Market Cap ≥ $50k): Poll bonding curve every 200ms via Helius RPC

### Atomic Execution

Uses Jito bundles to ensure atomic execution of:
- **Transaction 1**: Claim creator rewards
- **Transaction 2**: Create new Chain Reaction token
- **Transaction 3**: Buy new token with claimed SOL

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Redis server (local or cloud)
- Solana wallet with SOL for fees and initial deployment
- Helius API key (Pro tier recommended for intensive polling)
- Jito block engine access

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
DEPLOYER_PRIVATE_KEY=your_base58_private_key
HELIUS_API_KEY=your_helius_api_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
REDIS_URL=redis://localhost:6379

# Genesis Token (first token to monitor)
GENESIS_TOKEN_MINT=YourTokenMintAddressHere

# Optional: Adjust thresholds
MARKET_CAP_THRESHOLD=50000
BONDING_CURVE_THRESHOLD=0.995
```

### 3. Setup Redis

**Option A: Local Redis**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download or use WSL
```

**Option B: Cloud Redis**
- Use Redis Cloud, AWS ElastiCache, or any Redis provider
- Update `REDIS_URL` in `.env`

### 4. Upload Metadata

Before running, upload your token metadata to Arweave/IPFS:

```json
{
  "name": "Chain Reaction #001",
  "symbol": "CR001",
  "description": "Generation 1 of the Chain Reaction recursive token experiment",
  "image": "https://arweave.net/your-image-hash"
}
```

Update `METADATA_BASE_URI` in `.env` to point to your metadata folder.

### 5. Build and Run

```bash
# Build TypeScript
npm run build

# Run in production
npm start

# Or run in development mode
npm run dev
```

## 🔧 Configuration

### Pump.fun Program IDs

Default values are provided, but verify these are current:

```env
PUMP_PROGRAM_ID=6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
PUMP_GLOBAL_ACCOUNT=4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf
PUMP_FEE_RECIPIENT=CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM
```

### Jito Configuration

```env
JITO_BLOCK_ENGINE_URL=https://mainnet.block-engine.jito.wtf
JITO_TIP_LAMPORTS=1000000        # 0.001 SOL initial tip
JITO_TIP_RETRY_LAMPORTS=5000000  # 0.005 SOL retry tip
```

### Monitoring Thresholds

```env
CASUAL_POLL_INTERVAL_MS=30000         # 30 seconds
INTENSIVE_POLL_INTERVAL_MS=200        # 200ms when near completion
MARKET_CAP_THRESHOLD=50000            # Switch to intensive at $50k
BONDING_CURVE_THRESHOLD=0.995         # Trigger mitosis at 99.5%
```

### Airdrop Settings

```env
AIRDROP_BATCH_SIZE=8           # Transfers per transaction
AIRDROP_BATCH_DELAY_MS=500     # Delay between batches
PRIORITY_FEE_LAMPORTS=100000   # 0.0001 SOL priority fee
```

## 📡 WebSocket Events

Frontend can connect to `ws://localhost:8080` to receive real-time updates:

### Event Types

**curve_update** (every 200ms during intensive polling)
```json
{
  "event": "curve_update",
  "progress": 0.987,
  "marketCap": 67500,
  "mint": "TokenMintAddress...",
  "timestamp": 1234567890
}
```

**mitosis_imminent** (when progress > 99%)
```json
{
  "event": "mitosis_imminent",
  "currentMint": "CurrentTokenMint...",
  "progress": 0.996,
  "timestamp": 1234567890
}
```

**mitosis_complete** (after bundle lands)
```json
{
  "event": "mitosis_complete",
  "oldMint": "OldTokenMint...",
  "newMint": "NewTokenMint...",
  "signature": "TransactionSignature...",
  "generation": 7,
  "timestamp": 1234567890
}
```

**error**
```json
{
  "event": "error",
  "error": "Error message",
  "timestamp": 1234567890
}
```

## ⚠️ Critical Implementation Notes

### 1. Pump.fun Instruction Discriminators

The code includes **PLACEHOLDER discriminators** for Pump.fun instructions. You MUST update these:

**File: `src/utils/pump.ts`**

```typescript
// Lines to update:
const CLAIM_DISCRIMINATOR = Buffer.from([...]); // Line ~77
const CREATE_DISCRIMINATOR = Buffer.from([...]); // Line ~117
const BUY_DISCRIMINATOR = Buffer.from([...]);    // Line ~173
```

**How to find correct discriminators:**
1. Inspect successful transactions on Solscan
2. Check PumpPortal documentation: https://pumpportal.fun/docs
3. Use Anchor IDL if available
4. Reverse engineer from known working transactions

### 2. Bonding Curve Account Layout

The bonding curve parser in `parseBondingCurveAccount()` uses estimated offsets. Verify against actual Pump.fun account structure:

**File: `src/utils/pump.ts` (Line ~51)**

### 3. Creator Rewards Estimation

The executor estimates claimable rewards at ~0.8 SOL. For production, query the actual bonding curve account:

**File: `src/services/executor.ts` (Line ~154)**

### 4. Rate Limiting

Helius free tier = 10 RPS. Intensive polling uses ~5 RPS. Upgrade to Pro for production:
- Free: 10 RPS
- Pro: 100 RPS
- Business: 1000 RPS

## 🛡️ Safety & Error Handling

### Bundle Failure Recovery

If Jito bundle fails:
1. Automatic retry with 5x higher tip
2. If second attempt fails → manual intervention required
3. Bundle status stored in Redis for debugging

### Emergency Abort

```bash
# Send SIGINT (Ctrl+C) for graceful shutdown
# Send SIGTERM for force shutdown
```

### Monitoring Health

Status logged every 60 seconds:
- Bot running status
- Monitor phase (casual/intensive/executing)
- Active mint address
- Connected WebSocket clients

## 🔍 Debugging

### Check Redis State

```bash
redis-cli
> GET active_mint
> GET generation
> GET phase
> ZREVRANGE holders:YourMintAddress 0 9 WITHSCORES  # Top 10 holders
```

### View Bundle Info

```bash
> GET bundle:YourBundleId
```

### Monitor Logs

All operations are logged to console with timestamps and status indicators:
- ✅ Success
- ❌ Failure
- ⚠️  Warning
- 🔴 Critical events

## 📊 System Requirements

- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 2GB minimum (4GB recommended)
- **Network**: Stable low-latency connection to Solana RPC
- **Storage**: 1GB for Redis + logs

## 🚨 Production Checklist

- [ ] Update Pump.fun instruction discriminators
- [ ] Verify bonding curve account layout
- [ ] Upload token metadata to Arweave/IPFS
- [ ] Fund deployer wallet with SOL (recommend 5-10 SOL)
- [ ] Setup Redis with persistence
- [ ] Configure Helius Pro tier API
- [ ] Test with genesis token on devnet first
- [ ] Setup monitoring/alerting for failures
- [ ] Backup private keys securely
- [ ] Document recovery procedures

## 🐛 Troubleshooting

**Bot won't start / No active token mint**
- Set `GENESIS_TOKEN_MINT` in `.env`
- Or manually set in Redis: `SET active_mint YourMintAddress`

**Bundle transactions failing**
- Check Jito tip amount (may need to increase)
- Verify instruction discriminators are correct
- Check deployer wallet has sufficient SOL

**Snapshot returns no holders**
- Verify Helius API key has DAS API access
- Check token mint address is correct
- Fallback RPC method will be used automatically

**WebSocket clients disconnecting**
- Check firewall rules allow port 8080
- Verify heartbeat interval (30s default)

## 📜 License

MIT

## ⚠️ Disclaimer

This software is provided for educational and research purposes. Use at your own risk. MEV operations carry significant financial risk. The authors are not responsible for any losses incurred.

---

**Built for the CHAIN_REACTION experiment** 🔥

For questions, issues, or improvements, consult the Pump.fun documentation and Jito developer resources.
