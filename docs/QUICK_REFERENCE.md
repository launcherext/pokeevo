# CHAIN_REACTION - Quick Reference Card

## ⚡ Quick Commands

```bash
# Setup
npm install                 # Install dependencies
cp .env.example .env       # Create environment file
# Edit .env with your credentials

# Build & Run
npm run build              # Compile TypeScript
npm start                  # Run production build
npm run dev                # Run with ts-node (development)

# Quick Start
./start.sh                 # Linux/Mac all-in-one script
start.bat                  # Windows all-in-one script
```

## 🔑 Essential Environment Variables

```env
# Must Configure
DEPLOYER_PRIVATE_KEY=YourBase58PrivateKeyHere
HELIUS_API_KEY=YourHeliusApiKeyHere
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
REDIS_URL=redis://localhost:6379
GENESIS_TOKEN_MINT=TokenMintToStartWith

# Optional (has defaults)
MARKET_CAP_THRESHOLD=50000
BONDING_CURVE_THRESHOLD=0.995
WS_PORT=8080
```

## 🔴 Critical TODOs Before Running

### 1. Update Discriminators
**File**: `src/utils/pump.ts`
- Line 77: `CLAIM_DISCRIMINATOR`
- Line 117: `CREATE_DISCRIMINATOR`
- Line 173: `BUY_DISCRIMINATOR`

**How**: Inspect Pump.fun transactions on Solscan or use PumpPortal docs

### 2. Verify Account Layout
**File**: `src/utils/pump.ts` (Line 51)
- Function: `parseBondingCurveAccount()`
- Check offsets match actual Pump.fun structure

### 3. Upload Metadata
- Create JSON files for Chain Reaction tokens
- Upload to Arweave or IPFS
- Update `METADATA_BASE_URI` in .env

## 📡 WebSocket Events (Port 8080)

```javascript
// Connect
const ws = new WebSocket('ws://localhost:8080');

// Events you'll receive
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.event) {
    case 'curve_update':      // Every 200ms during intensive phase
      // data.progress, data.marketCap
      break;
    case 'mitosis_imminent':  // When progress > 99%
      // data.currentMint, data.progress
      break;
    case 'mitosis_complete':  // After bundle lands
      // data.newMint, data.oldMint, data.signature
      break;
    case 'error':
      // data.error
      break;
    case 'heartbeat':         // Every 30s
      break;
  }
};
```

## 🎯 System Flow

```
1. Monitor polls token at 30s intervals
   ↓
2. Market cap reaches $50k
   ↓
3. Switch to intensive 200ms polling
   ↓
4. Bonding curve reaches 99.5%
   ↓
5. Capture snapshot of top 100 holders
   ↓
6. Build Jito bundle:
   - TX1: Claim rewards
   - TX2: Create new token
   - TX3: Buy new token
   ↓
7. Submit bundle to Jito
   ↓
8. Airdrop to top 100 (batches of 8)
   ↓
9. Restart monitor on new token
   ↓
10. Loop back to step 1
```

## 🛠️ Redis Commands

```bash
redis-cli

# Check system state
GET active_mint
GET generation
GET phase

# View top 10 holders
ZREVRANGE holders:YourMintAddress 0 9 WITHSCORES

# View bundle info
GET bundle:YourBundleId

# Clear holder data
DEL holders:YourMintAddress

# Reset system (careful!)
DEL active_mint generation phase
```

## 🐛 Common Issues

### Bot won't start
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Check .env file exists
ls -la .env

# Check GENESIS_TOKEN_MINT is set
grep GENESIS_TOKEN_MINT .env
```

### Bundle failing
- Increase Jito tip in .env
- Verify discriminators are correct
- Check deployer wallet SOL balance

### No holders in snapshot
- Verify Helius API key has DAS access
- Check token mint address is correct
- System will try fallback RPC automatically

### WebSocket disconnecting
- Check firewall allows port 8080
- Verify WS_PORT in .env
- Check network stability

## 📊 Monitor Status

```bash
# The bot logs status every 60 seconds:
═══ CHAIN_REACTION STATUS ═══
Running: true
Monitor Active: true
Monitor Phase: intensive
Active Mint: ABC123...
WebSocket Clients: 2
═══════════════════════════
```

## 🚨 Emergency Shutdown

```bash
# Graceful shutdown (recommended)
Ctrl+C
# or
kill -SIGINT <pid>

# Force kill (if needed)
kill -9 <pid>
```

## 📦 Project Structure

```
suicidecoin/
├── src/
│   ├── index.ts              # Main entry point
│   ├── config.ts             # Configuration
│   ├── types.ts              # Type definitions
│   ├── services/             # Business logic
│   │   ├── monitor.ts        # 2-phase polling
│   │   ├── snapshot.ts       # Holder capture
│   │   ├── executor.ts       # Jito bundles
│   │   └── dispenser.ts      # Airdrops
│   ├── utils/                # Utilities
│   │   ├── redis.ts          # Redis wrapper
│   │   ├── pump.ts           # Pump.fun logic
│   │   └── jito.ts           # Jito manager
│   └── websocket/
│       └── stream.ts         # WebSocket server
├── README.md                 # Full documentation
├── IMPLEMENTATION_NOTES.md   # Technical details
└── package.json              # Dependencies
```

## 🔢 Key Numbers

```
Casual Poll Interval:     30,000 ms (30 seconds)
Intensive Poll Interval:  200 ms
Market Cap Threshold:     $50,000
Bonding Curve Trigger:    99.5%
Jito Tip (initial):       0.001 SOL
Jito Tip (retry):         0.005 SOL
Airdrop Batch Size:       8 transfers
Airdrop Batch Delay:      500 ms
WebSocket Port:           8080
Heartbeat Interval:       30,000 ms
```

## 🔗 Useful Links

- **Pump.fun**: https://pump.fun
- **PumpPortal API**: https://pumpportal.fun/docs
- **Jito Docs**: https://jito.wtf/docs
- **Helius Docs**: https://docs.helius.dev
- **Solana Docs**: https://docs.solana.com

## 📝 Pre-Flight Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Discriminators updated
- [ ] Metadata uploaded
- [ ] Redis running
- [ ] Deployer wallet funded (5-10 SOL)
- [ ] Helius API key active
- [ ] GENESIS_TOKEN_MINT set
- [ ] Tested on devnet
- [ ] Monitoring/alerts configured

## 🎯 Production Deployment

```bash
# 1. Build for production
npm run build

# 2. Test the build
npm start

# 3. Setup process manager (PM2)
npm install -g pm2
pm2 start dist/index.js --name chain-reaction
pm2 save
pm2 startup

# 4. Monitor logs
pm2 logs chain-reaction

# 5. Check status
pm2 status
```

## 💡 Pro Tips

1. **Use Helius Pro tier** - Free tier (10 RPS) insufficient for intensive polling
2. **Monitor Jito tip rates** - Adjust based on network congestion
3. **Keep 5-10 SOL in deployer wallet** - For fees and tips
4. **Setup log rotation** - Bot generates significant logs
5. **Test discriminators on devnet** - Before using real SOL
6. **Backup private keys** - Store securely offline
7. **Use systemd/PM2** - For automatic restart on crash
8. **Monitor Redis memory** - Clean old holder data periodically

---

**Version**: 1.0.0 | **Status**: Ready for Testing | **Updated**: January 2026
