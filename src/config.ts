import { Keypair, PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import * as dotenv from 'dotenv';
import { Config } from './types';

// Load environment variables
dotenv.config();

/**
 * Load and validate environment configuration
 */
function loadConfig(): Config {
  // Validate required environment variables
  const requiredVars = [
    'DEPLOYER_PRIVATE_KEY',
    'HELIUS_API_KEY',
    'HELIUS_RPC_URL',
    'REDIS_URL',
    'PUMP_PROGRAM_ID'
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Load deployer keypair
  let deployerKeypair: Keypair;
  try {
    const privateKeyString = process.env.DEPLOYER_PRIVATE_KEY!;
    const privateKeyBytes = bs58.decode(privateKeyString);
    deployerKeypair = Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    throw new Error(`Failed to load deployer private key: ${error}`);
  }

  // Parse Pump.fun program IDs
  const pumpProgramId = new PublicKey(process.env.PUMP_PROGRAM_ID!);
  const pumpGlobalAccount = process.env.PUMP_GLOBAL_ACCOUNT 
    ? new PublicKey(process.env.PUMP_GLOBAL_ACCOUNT)
    : new PublicKey('4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf');
  const pumpFeeRecipient = process.env.PUMP_FEE_RECIPIENT
    ? new PublicKey(process.env.PUMP_FEE_RECIPIENT)
    : new PublicKey('CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM');
  const pumpEventAuthority = process.env.PUMP_EVENT_AUTHORITY
    ? new PublicKey(process.env.PUMP_EVENT_AUTHORITY)
    : new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');

  return {
    deployer: {
      privateKey: process.env.DEPLOYER_PRIVATE_KEY!,
      publicKey: deployerKeypair.publicKey
    },
    helius: {
      apiKey: process.env.HELIUS_API_KEY!,
      rpcUrl: process.env.HELIUS_RPC_URL!,
      wsUrl: process.env.HELIUS_WS_URL || process.env.HELIUS_RPC_URL!.replace('https', 'wss')
    },
    jito: {
      blockEngineUrl: process.env.JITO_BLOCK_ENGINE_URL || 'https://mainnet.block-engine.jito.wtf',
      authKeypair: process.env.JITO_AUTH_KEYPAIR,
      tipLamports: parseInt(process.env.JITO_TIP_LAMPORTS || '1000000'),
      tipRetryLamports: parseInt(process.env.JITO_TIP_RETRY_LAMPORTS || '5000000')
    },
    redis: {
      url: process.env.REDIS_URL!,
      password: process.env.REDIS_PASSWORD
    },
    websocket: {
      port: parseInt(process.env.PORT || process.env.WS_PORT || '8080')
    },
    pump: {
      programId: pumpProgramId,
      globalAccount: pumpGlobalAccount,
      feeRecipient: pumpFeeRecipient,
      eventAuthority: pumpEventAuthority
    },
    metadata: {
      baseUri: process.env.METADATA_BASE_URI || 'https://arweave.net/placeholder',
      namePrefix: process.env.TOKEN_NAME_PREFIX || 'PikachuChain',
      symbolPrefix: process.env.TOKEN_SYMBOL_PREFIX || 'PIKA'
    },
    monitoring: {
      casualPollInterval: parseInt(process.env.CASUAL_POLL_INTERVAL_MS || '30000'),
      intensivePollInterval: parseInt(process.env.INTENSIVE_POLL_INTERVAL_MS || '200'),
      marketCapThreshold: parseInt(process.env.MARKET_CAP_THRESHOLD || '60400'),
      bondingCurveThreshold: parseFloat(process.env.BONDING_CURVE_THRESHOLD || '0.995')
    },
    execution: {
      airdropBatchSize: parseInt(process.env.AIRDROP_BATCH_SIZE || '8'),
      airdropBatchDelay: parseInt(process.env.AIRDROP_BATCH_DELAY_MS || '500'),
      priorityFeeLamports: parseInt(process.env.PRIORITY_FEE_LAMPORTS || '100000')
    },
    genesisTokenMint: process.env.GENESIS_TOKEN_MINT
  };
}

// Export singleton config
export const config = loadConfig();

// Export helper to get deployer keypair
export function getDeployerKeypair(): Keypair {
  const privateKeyBytes = bs58.decode(config.deployer.privateKey);
  return Keypair.fromSecretKey(privateKeyBytes);
}

// Export Jito auth keypair if provided
export function getJitoAuthKeypair(): Keypair | undefined {
  if (!config.jito.authKeypair) return undefined;
  try {
    const privateKeyBytes = bs58.decode(config.jito.authKeypair);
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error('Failed to load Jito auth keypair:', error);
    return undefined;
  }
}

// Log configuration on load (without sensitive data)
console.log('Configuration loaded:');
console.log(`- Deployer: ${config.deployer.publicKey.toBase58()}`);
console.log(`- Helius RPC: ${config.helius.rpcUrl.substring(0, 50)}...`);
console.log(`- Jito Block Engine: ${config.jito.blockEngineUrl}`);
console.log(`- Redis: ${config.redis.url}`);
console.log(`- WebSocket Port: ${config.websocket.port}`);
console.log(`- Pump Program: ${config.pump.programId.toBase58()}`);
console.log(`- Market Cap Threshold: $${config.monitoring.marketCapThreshold}`);
console.log(`- Bonding Curve Threshold: ${config.monitoring.bondingCurveThreshold * 100}%`);
