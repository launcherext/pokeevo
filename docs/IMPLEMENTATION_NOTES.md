# CHAIN_REACTION Implementation Notes

## 🚨 Critical TODOs Before Production

### 1. Update Pump.fun Instruction Discriminators

**Location**: `src/utils/pump.ts`

The following discriminators are **PLACEHOLDERS** and MUST be updated:

```typescript
// Line ~77 - Claim Rewards Discriminator
const CLAIM_DISCRIMINATOR = Buffer.from([
  0x3d, 0x7e, 0x7b, 0x8f, 0x8f, 0x3a, 0x8e, 0x9c // ⚠️ PLACEHOLDER
]);

// Line ~117 - Create Token Discriminator
const CREATE_DISCRIMINATOR = Buffer.from([
  0x18, 0x1e, 0xc8, 0x28, 0x05, 0x1c, 0x07, 0x77 // ⚠️ PLACEHOLDER
]);

// Line ~173 - Buy Token Discriminator
const BUY_DISCRIMINATOR = Buffer.from([
  0x66, 0x06, 0x3d, 0x12, 0x01, 0xda, 0xeb, 0xea // ⚠️ PLACEHOLDER
]);
```

**How to get correct discriminators:**

1. **Inspect successful Pump.fun transactions** on Solscan
   - Find a claim/create/buy transaction
   - Look at instruction data (first 8 bytes)

2. **Use PumpPortal documentation**
   - Visit: https://pumpportal.fun/docs
   - Check API/SDK examples

3. **Extract from Pump.fun IDL** (if available)
   - Anchor discriminators = SHA256("global:method_name")[0..8]

4. **Reverse engineer from working code**
   - Check PumpPortal GitHub or other open-source bots

### 2. Verify Bonding Curve Account Layout

**Location**: `src/utils/pump.ts` - `parseBondingCurveAccount()` function (Line ~51)

Current implementation assumes:
```
Offset | Size | Field
-------|------|------------------
0      | 8    | discriminator
8      | 8    | virtualSolReserves (u64)
16     | 8    | virtualTokenReserves (u64)
24     | 8    | realSolReserves (u64)
32     | 8    | realTokenReserves (u64)
40     | 8    | tokenTotalSupply (u64)
48     | 1    | complete (bool)
```

**Verify this against actual Pump.fun account structure** by:
- Fetching a bonding curve account and inspecting raw data
- Comparing with Pump.fun documentation
- Testing with known bonding curve states

### 3. Implement Accurate Creator Rewards Query

**Location**: `src/services/executor.ts` - `estimateClaimableRewards()` (Line ~154)

Current implementation returns a **hardcoded estimate** (0.8 SOL).

For production:
```typescript
private async estimateClaimableRewards(mint: string): Promise<number> {
  // Fetch bonding curve account
  const [bondingCurvePDA] = deriveBondingCurvePDA(new PublicKey(mint));
  const account = await this.connection.getAccountInfo(bondingCurvePDA);
  
  // Parse creator_rewards field from account data
  // (offset depends on actual account layout)
  const creatorRewards = account.data.readBigUInt64LE(CREATOR_REWARDS_OFFSET);
  return Number(creatorRewards) / 1e9; // Convert to SOL
}
```

### 4. Test on Devnet First

Before running on mainnet:

1. Deploy a test token on Pump.fun devnet (if available)
2. Verify all instruction discriminators work
3. Test the full mitosis cycle with small amounts
4. Monitor for any transaction failures

### 5. Setup Monitoring & Alerts

Recommended monitoring:
- Bundle success/failure rates
- Transaction confirmation times
- Redis connection health
- WebSocket client connections
- SOL balance in deployer wallet

Tools to consider:
- Datadog, New Relic, or Grafana for metrics
- PagerDuty or similar for critical alerts
- Telegram bot for real-time notifications

## 📊 Architecture Deep Dive

### State Machine

```
STOPPED → CASUAL → INTENSIVE → EXECUTING → CASUAL (new token)
                ↑                            ↓
                └────────── Loop ────────────┘
```

### Redis Data Schema

```
Key                         Type    Description
─────────────────────────────────────────────────────────────
active_mint                 String  Current token mint address
generation                  String  Current generation number
phase                       String  Monitor phase (casual/intensive/executing)
last_update                 String  Last update timestamp
holders:{mint}              ZSET    Sorted set of wallet:balance pairs
bundle:{bundleId}           String  JSON bundle info (24h TTL)
```

### Transaction Flow

1. **Monitor detects 99.5% completion**
   - Emits `mitosis_imminent` event
   - Triggers snapshot engine

2. **Snapshot captures top 100 holders**
   - Queries Helius DAS API
   - Stores in Redis ZSET
   - Sorted by balance descending

3. **Executor builds Jito bundle**
   - TX1: Claim rewards from old token
   - TX2: Create new token
   - TX3: Buy new token with claimed SOL

4. **Jito submits bundle**
   - Atomic execution (all or nothing)
   - Retries once with 5x tip if failed

5. **Dispenser airdrops to holders**
   - Batches of 8 transfers per TX
   - 500ms delay between batches
   - Priority fees for fast landing

6. **System resets for new cycle**
   - Updates active_mint
   - Clears old holder data
   - Restarts monitor on new token

## 🔐 Security Considerations

### Private Key Management

- Store `DEPLOYER_PRIVATE_KEY` securely
- Consider using hardware wallet or MPC
- Never commit `.env` to version control
- Rotate keys periodically

### Rate Limiting

Helius tiers:
- **Free**: 10 RPS (insufficient for production)
- **Pro**: 100 RPS (minimum recommended)
- **Business**: 1000 RPS (ideal for high-frequency)

### MEV Competition

- Jito bundles provide front-running protection
- Higher tips increase bundle priority
- Monitor Jito tip market rates
- Consider dynamic tip adjustment based on network conditions

### Failure Scenarios

**Scenario 1: Bundle fails after retry**
- System logs error
- Broadcasts error event to WebSocket
- Restarts monitoring on same token
- **Manual intervention required** to retry or abort

**Scenario 2: Airdrop batch fails**
- Logs failed batch
- Continues with remaining batches
- **Manual retry** of failed batch needed

**Scenario 3: Redis connection lost**
- Auto-reconnect enabled (3 retries)
- If persistent failure → bot stops
- Restart bot after Redis recovery

**Scenario 4: Helius API rate limit**
- Falls back to slower polling
- Increases poll interval temporarily
- Logs warning

## 🚀 Deployment Checklist

- [ ] Clone repository to production server
- [ ] Install Node.js 18+ and Redis
- [ ] Copy and configure `.env` file
- [ ] Update Pump.fun discriminators
- [ ] Upload token metadata to Arweave/IPFS
- [ ] Fund deployer wallet (5-10 SOL recommended)
- [ ] Test on devnet first
- [ ] Setup process manager (PM2 or systemd)
- [ ] Configure firewall (allow port 8080 for WebSocket)
- [ ] Setup log rotation
- [ ] Configure monitoring/alerts
- [ ] Document recovery procedures
- [ ] Backup private keys offline
- [ ] Test emergency shutdown

## 📝 Maintenance

### Daily Tasks
- Check bot status logs
- Verify sufficient SOL balance
- Monitor bundle success rates

### Weekly Tasks
- Review failed transactions
- Analyze airdrop completion rates
- Check Redis memory usage
- Rotate logs

### Monthly Tasks
- Update dependencies
- Review and optimize gas usage
- Audit security practices
- Backup Redis snapshots

## 🐛 Known Limitations

1. **Instruction discriminators are placeholders** - Must be updated before use
2. **Bonding curve layout not verified** - May need adjustment
3. **Creator rewards estimation is hardcoded** - Should query actual amount
4. **No automatic recovery from bundle failure** - Requires manual intervention
5. **Airdrop batching is sequential** - Could be optimized with parallel submission
6. **No persistent transaction history** - Consider adding to Redis or DB
7. **WebSocket has no authentication** - Add authentication for production

## 📚 References

- Pump.fun: https://pump.fun
- PumpPortal API: https://pumpportal.fun
- Jito Docs: https://jito.wtf/docs
- Helius Docs: https://docs.helius.dev
- Solana Cookbook: https://solanacookbook.com

## 🤝 Support

For issues specific to:
- **Pump.fun mechanics**: Consult PumpPortal docs
- **Jito bundles**: Check Jito Discord/docs
- **Helius API**: See Helius documentation
- **Code bugs**: Review implementation and error logs

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Ready for testing (requires discriminator updates)
