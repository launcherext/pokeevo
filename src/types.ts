import { PublicKey } from '@solana/web3.js';

/**
 * Bonding Curve Account Structure
 * Represents the state of a Pump.fun bonding curve
 */
export interface BondingCurveState {
  virtualSolReserves: number;
  virtualTokenReserves: number;
  realSolReserves: number;
  realTokenReserves: number;
  tokenTotalSupply: number;
  complete: boolean;
}

/**
 * Bonding Curve Progress Data
 */
export interface BondingCurveProgress {
  mint: string;
  progress: number; // 0.0 to 1.0
  marketCap: number; // in USD
  virtualSolReserves: number;
  realSolReserves: number;
  complete: boolean;
  timestamp: number;
}

/**
 * Token Holder Information
 */
export interface TokenHolder {
  wallet: string;
  balance: number;
  rank: number;
}

/**
 * WebSocket Event Types
 */
export enum WSEventType {
  CURVE_UPDATE = 'curve_update',
  MITOSIS_IMMINENT = 'mitosis_imminent',
  MITOSIS_COMPLETE = 'mitosis_complete',
  TOKEN_CREATED = 'token_created',
  HOLDER_UPDATE = 'holder_update',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat'
}

/**
 * WebSocket Event Payloads
 */
export interface CurveUpdateEvent {
  event: WSEventType.CURVE_UPDATE;
  progress: number;
  marketCap: number;
  mint: string;
  timestamp: number;
}

export interface MitosisImminentEvent {
  event: WSEventType.MITOSIS_IMMINENT;
  currentMint: string;
  progress: number;
  timestamp: number;
}

export interface MitosisCompleteEvent {
  event: WSEventType.MITOSIS_COMPLETE;
  oldMint: string;
  newMint: string;
  signature: string;
  generation: number;
  timestamp: number;
}

export interface ErrorEvent {
  event: WSEventType.ERROR;
  error: string;
  timestamp: number;
}

export interface HeartbeatEvent {
  event: WSEventType.HEARTBEAT;
  timestamp: number;
}

export interface TokenCreatedEvent {
  event: WSEventType.TOKEN_CREATED;
  mint: string;
  name: string;
  symbol: string;
  creator: string;
  signature: string;
  timestamp: number;
}

export interface HolderUpdateEvent {
  event: WSEventType.HOLDER_UPDATE;
  holders: TokenHolder[];
  totalHolders: number;
  mint: string;
  timestamp: number;
}

export interface InitialStateEvent {
  event: 'initial_state';
  mint: string;
  generation: number;
  timestamp: number;
}

export type WSEvent =
  | CurveUpdateEvent
  | MitosisImminentEvent
  | MitosisCompleteEvent
  | TokenCreatedEvent
  | HolderUpdateEvent
  | ErrorEvent
  | HeartbeatEvent
  | InitialStateEvent;

/**
 * Token Metadata Structure
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  generation: number;
}

/**
 * Jito Bundle Result
 */
export interface BundleResult {
  bundleId: string;
  success: boolean;
  signature?: string;
  error?: string;
  timestamp: number;
}

/**
 * Airdrop Batch Result
 */
export interface AirdropBatchResult {
  batchIndex: number;
  signature: string;
  success: boolean;
  recipientCount: number;
  error?: string;
}

/**
 * Monitor Phase
 */
export enum MonitorPhase {
  CASUAL = 'casual',
  INTENSIVE = 'intensive',
  EXECUTING = 'executing',
  STOPPED = 'stopped'
}

/**
 * System State
 */
export interface SystemState {
  activeMint: string | null;
  generation: number;
  phase: MonitorPhase;
  lastUpdate: number;
}

/**
 * PumpPortal API Response for Token Data
 */
export interface PumpPortalTokenData {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  market_cap: number;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool: string | null;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
}

/**
 * Redis Key Patterns
 */
export const REDIS_KEYS = {
  ACTIVE_MINT: 'active_mint',
  GENERATION: 'generation',
  PHASE: 'phase',
  HOLDERS: (mint: string) => `holders:${mint}`,
  BUNDLE: (bundleId: string) => `bundle:${bundleId}`,
  LAST_UPDATE: 'last_update'
} as const;

/**
 * Configuration Interface
 */
export interface Config {
  deployer: {
    privateKey: string;
    publicKey: PublicKey;
  };
  helius: {
    apiKey: string;
    rpcUrl: string;
    wsUrl: string;
  };
  jito: {
    blockEngineUrl: string;
    authKeypair?: string;
    tipLamports: number;
    tipRetryLamports: number;
  };
  redis: {
    url: string;
    password?: string;
  };
  websocket: {
    port: number;
  };
  pump: {
    programId: PublicKey;
    globalAccount: PublicKey;
    feeRecipient: PublicKey;
    eventAuthority: PublicKey;
  };
  metadata: {
    baseUri: string;
    namePrefix: string;
    symbolPrefix: string;
  };
  monitoring: {
    casualPollInterval: number;
    intensivePollInterval: number;
    marketCapThreshold: number;
    bondingCurveThreshold: number;
  };
  execution: {
    airdropBatchSize: number;
    airdropBatchDelay: number;
    priorityFeeLamports: number;
  };
  genesisTokenMint?: string;
}
