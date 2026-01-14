# CHAIN_REACTION - Complete File Structure

## 📁 Project Directory Tree

```
suicidecoin/
│
├── 📄 package.json              # Dependencies and npm scripts
├── 📄 tsconfig.json             # TypeScript compiler configuration
├── 📄 .gitignore                # Git ignore rules
│
├── 📚 Documentation
│   ├── README.md                # Main user guide and setup instructions
│   ├── IMPLEMENTATION_NOTES.md  # Technical deep dive and critical TODOs
│   ├── PROJECT_SUMMARY.md       # High-level overview and status
│   └── FILE_STRUCTURE.md        # This file
│
├── 🚀 Quick Start Scripts
│   ├── start.sh                 # Linux/Mac startup script
│   └── start.bat                # Windows startup script
│
└── 📂 src/                      # Source code
    │
    ├── 📄 index.ts              # Main orchestrator - Entry point
    ├── 📄 config.ts             # Environment configuration loader
    ├── 📄 types.ts              # TypeScript type definitions
    │
    ├── 📂 services/             # Core business logic services
    │   ├── monitor.ts           # Bonding curve monitoring (2-phase)
    │   ├── snapshot.ts          # Top holder capture engine
    │   ├── executor.ts          # Jito bundle executor
    │   └── dispenser.ts         # Token airdrop processor
    │
    ├── 📂 utils/                # Utility modules
    │   ├── redis.ts             # Redis client wrapper
    │   ├── pump.ts              # Pump.fun instruction builders
    │   └── jito.ts              # Jito bundle manager
    │
    └── 📂 websocket/            # Real-time communication
        └── stream.ts            # WebSocket server for frontend
```

## 📄 File Descriptions

### Root Configuration Files

#### package.json (32 lines)
- Project metadata and dependencies
- npm scripts: `build`, `start`, `dev`, `watch`
- Dependencies: Solana SDK, Helius, Jito, Redis, WebSocket
- DevDependencies: TypeScript, ts-node, type definitions

#### tsconfig.json (22 lines)
- TypeScript compiler options
- Strict mode enabled for type safety
- ES2022 target with CommonJS modules
- Source maps and declarations enabled

#### .gitignore (11 lines)
- Ignores node_modules, dist, .env, logs
- IDE and OS-specific files

### Documentation Files

#### README.md (365 lines)
- **Purpose**: Main user-facing documentation
- **Contents**:
  - Architecture overview with diagrams
  - Prerequisites and dependencies
  - Quick start guide (6 steps)
  - Configuration reference
  - WebSocket API documentation
  - Critical implementation notes
  - Safety and error handling
  - Debugging guide
  - Production checklist
  - Troubleshooting section

#### IMPLEMENTATION_NOTES.md (280 lines)
- **Purpose**: Technical deep dive for developers
- **Contents**:
  - Critical TODOs before production
  - Pump.fun discriminator update guide
  - Bonding curve layout verification
  - Creator rewards implementation
  - Architecture state machine
  - Redis schema documentation
  - Transaction flow diagram
  - Security considerations
  - Failure scenarios and recovery
  - Deployment checklist
  - Known limitations
  - Reference links

#### PROJECT_SUMMARY.md (240 lines)
- **Purpose**: Executive summary and status
- **Contents**:
  - Implementation completion status
  - Deliverables checklist
  - System architecture diagram
  - Key features implemented
  - Technology stack
  - Performance characteristics
  - Critical actions required
  - Quick start commands
  - Security overview
  - Production checklist

### Quick Start Scripts

#### start.sh (28 lines)
- Bash script for Linux/Mac
- Checks for .env file
- Installs dependencies if needed
- Builds TypeScript if needed
- Validates Redis connection
- Starts the bot

#### start.bat (27 lines)
- Batch script for Windows
- Same functionality as start.sh
- Windows-specific commands

### Source Code Files

#### src/index.ts (180 lines)
- **Purpose**: Main orchestrator and entry point
- **Key Features**:
  - Initializes all services
  - Coordinates mitosis lifecycle
  - Event handling and routing
  - WebSocket broadcasting
  - Graceful shutdown handling
  - Status monitoring
- **Exports**: SerialKillerBot class

#### src/config.ts (110 lines)
- **Purpose**: Environment configuration management
- **Key Features**:
  - Loads and validates .env variables
  - Parses Solana public keys
  - Creates deployer keypair
  - Validates required fields
  - Provides getter functions
  - Logs configuration on load
- **Exports**: config object, getDeployerKeypair(), getJitoAuthKeypair()

#### src/types.ts (220 lines)
- **Purpose**: TypeScript type definitions
- **Key Features**:
  - BondingCurveState interface
  - WebSocket event types (5 types)
  - Token metadata structure
  - System state definitions
  - Redis key patterns
  - Complete Config interface
- **Exports**: 20+ interfaces and enums

### Services

#### src/services/monitor.ts (230 lines)
- **Purpose**: Bonding curve monitoring service
- **Key Features**:
  - Two-phase polling (casual → intensive)
  - PumpPortal API integration
  - Direct RPC polling at 200ms
  - Progress calculation
  - Event emission (curve_update, mitosis_imminent)
  - Phase management
- **Class**: MonitorService extends EventEmitter
- **Methods**: start(), stop(), getCurrentPhase(), getActiveMint()

#### src/services/snapshot.ts (170 lines)
- **Purpose**: Token holder snapshot engine
- **Key Features**:
  - Helius DAS API integration
  - Paginated holder fetching
  - Fallback to direct RPC
  - Redis ZSET storage
  - Top 100 extraction
  - Automatic cleanup
- **Class**: SnapshotService
- **Methods**: captureSnapshot(), getTopHolders(), clearSnapshot()

#### src/services/executor.ts (200 lines)
- **Purpose**: Jito bundle execution engine
- **Key Features**:
  - Atomic 3-transaction bundle
  - Claim + Create + Buy sequence
  - Automatic retry with higher tip
  - Bundle status tracking
  - Error handling and recovery
  - Redis state management
- **Class**: ExecutorService
- **Methods**: executeMitosis(), verifyBundleSuccess(), getBundleInfo()

#### src/services/dispenser.ts (120 lines)
- **Purpose**: Token airdrop batch processor
- **Key Features**:
  - Batches of 8 transfers
  - Sequential execution with delays
  - SPL Token transfer instructions
  - Per-batch error handling
  - Progress logging
- **Class**: DispenserService
- **Methods**: distributeToHolders()

### Utilities

#### src/utils/redis.ts (270 lines)
- **Purpose**: Redis client wrapper with type safety
- **Key Features**:
  - Connection management with retry
  - Event handler setup
  - Holder ZSET operations
  - System state management
  - Bundle info storage
  - Batch operations support
- **Class**: RedisClient
- **Singleton Export**: redisClient
- **Methods**: 20+ type-safe Redis operations

#### src/utils/pump.ts (320 lines)
- **Purpose**: Pump.fun protocol utilities
- **Key Features**:
  - PDA derivation functions
  - Bonding curve parser
  - Instruction builders (claim, create, buy)
  - Progress calculation
  - Market cap estimation
  - Metadata generation
- **Functions**: 10+ helper functions
- **⚠️ Critical**: Contains placeholder discriminators that MUST be updated

#### src/utils/jito.ts (250 lines)
- **Purpose**: Jito bundle management
- **Key Features**:
  - Jito SearcherClient wrapper
  - Bundle construction and signing
  - Tip account rotation (8 accounts)
  - Compute budget instructions
  - Bundle confirmation polling
  - Retry logic with higher tips
- **Class**: JitoBundleManager
- **Singleton Export**: getJitoBundleManager()
- **Methods**: executeMitosisBundle(), sendBundle(), sendTransaction()

### WebSocket

#### src/websocket/stream.ts (100 lines)
- **Purpose**: Real-time WebSocket server
- **Key Features**:
  - WebSocket server on port 8080
  - Client connection management
  - Broadcast to all clients
  - Heartbeat every 30s
  - Error handling
  - Client count tracking
- **Class**: StreamServer
- **Singleton Export**: streamServer
- **Methods**: start(), stop(), broadcast(), getClientCount()

## 📊 Code Statistics

```
Total Files:     15 source files + 4 docs + 2 scripts
Total Lines:     ~2,500+ lines of code
TypeScript:      100% (strict mode)
Documentation:   ~1,000+ lines
Test Coverage:   TBD (add tests before production)
```

## 🔗 File Dependencies

```
index.ts
├── config.ts
├── types.ts
├── services/
│   ├── monitor.ts
│   │   ├── utils/redis.ts
│   │   └── utils/pump.ts
│   ├── snapshot.ts
│   │   └── utils/redis.ts
│   ├── executor.ts
│   │   ├── utils/redis.ts
│   │   ├── utils/pump.ts
│   │   └── utils/jito.ts
│   └── dispenser.ts
│       └── config.ts
└── websocket/
    └── stream.ts
        ├── config.ts
        └── types.ts
```

## 🎯 Entry Points

### Development
```bash
npm run dev         # Runs src/index.ts via ts-node
```

### Production
```bash
npm run build       # Compiles to dist/
npm start          # Runs dist/index.js
```

### Quick Start
```bash
./start.sh         # Linux/Mac
start.bat          # Windows
```

## 📦 Build Output (after `npm run build`)

```
dist/
├── index.js
├── index.d.ts
├── config.js
├── config.d.ts
├── types.js
├── types.d.ts
├── services/
│   ├── monitor.js & .d.ts
│   ├── snapshot.js & .d.ts
│   ├── executor.js & .d.ts
│   └── dispenser.js & .d.ts
├── utils/
│   ├── redis.js & .d.ts
│   ├── pump.js & .d.ts
│   └── jito.js & .d.ts
└── websocket/
    └── stream.js & .d.ts
```

## 🔍 Files to Edit Before Production

### Required Updates
1. **src/utils/pump.ts** (Lines 77, 117, 173)
   - Update Pump.fun instruction discriminators

2. **src/utils/pump.ts** (Line 51)
   - Verify bonding curve account layout

3. **src/services/executor.ts** (Line 154)
   - Implement accurate creator rewards query

### Configuration
4. **.env** (create from .env.example)
   - Add all credentials and settings

5. **Metadata files** (external)
   - Upload to Arweave/IPFS
   - Update METADATA_BASE_URI

## 🚫 Files NOT to Commit

- `.env` - Contains private keys
- `node_modules/` - Package dependencies
- `dist/` - Build output
- `*.log` - Log files
- `.DS_Store` - macOS system files

## ✅ Complete Implementation

All files have been created and are ready for:
1. Discriminator updates
2. Devnet testing
3. Production deployment

---

**Last Updated**: January 2026  
**Total Implementation Time**: Complete in single session  
**Status**: ✅ All files created and documented
