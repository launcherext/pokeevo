import {
  Connection,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair
} from '@solana/web3.js';
import { config } from '../config';
import { TokenMetadata, BondingCurveState } from '../types';
import * as anchor from '@coral-xyz/anchor';

// Token Program IDs
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

/**
 * Derive bonding curve PDA for a mint
 */
export function deriveBondingCurvePDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('bonding-curve'), mint.toBuffer()],
    config.pump.programId
  );
}

/**
 * Derive associated bonding curve (token account owned by bonding curve)
 */
export function deriveAssociatedBondingCurve(mint: PublicKey, bondingCurve: PublicKey): PublicKey {
  return anchor.utils.token.associatedAddress({
    mint,
    owner: bondingCurve
  });
}

/**
 * Derive metadata PDA
 */
export function deriveMetadataPDA(mint: PublicKey): PublicKey {
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return metadata;
}

/**
 * Get associated token account address
 */
export function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  return anchor.utils.token.associatedAddress({ mint, owner });
}

/**
 * Parse bonding curve account data
 * @param data Raw account data from Solana
 * @returns Parsed bonding curve state
 */
export function parseBondingCurveAccount(data: Buffer): BondingCurveState {
  try {
    // Pump.fun bonding curve account layout:
    // 8 bytes discriminator
    // 8 bytes virtualSolReserves (u64)
    // 8 bytes virtualTokenReserves (u64)
    // 8 bytes realSolReserves (u64)
    // 8 bytes realTokenReserves (u64)
    // 8 bytes tokenTotalSupply (u64)
    // 1 byte complete (bool)
    
    let offset = 8; // Skip discriminator
    
    // CORRECTED: virtual_token_reserves comes FIRST in pump.fun's actual layout
    const virtualTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    
    const virtualSolReserves = data.readBigUInt64LE(offset);
    offset += 8;
    
    const realTokenReserves = data.readBigUInt64LE(offset);
    offset += 8;
    
    const realSolReserves = data.readBigUInt64LE(offset);
    offset += 8;
    
    const tokenTotalSupply = data.readBigUInt64LE(offset);
    offset += 8;
    
    const complete = data.readUInt8(offset) === 1;
    
    const state = {
      virtualSolReserves: Number(virtualSolReserves) / 1e9, // Convert lamports to SOL
      virtualTokenReserves: Number(virtualTokenReserves) / 1e6, // Adjust for token decimals
      realSolReserves: Number(realSolReserves) / 1e9,
      realTokenReserves: Number(realTokenReserves) / 1e6,
      tokenTotalSupply: Number(tokenTotalSupply) / 1e6,
      complete
    };
    
    // Detailed debug logging
    console.log(`[DEBUG] Bonding curve state:`);
    console.log(`  - virtualSolReserves: ${state.virtualSolReserves.toFixed(4)} SOL`);
    console.log(`  - virtualTokenReserves: ${state.virtualTokenReserves.toFixed(0)}`);
    console.log(`  - realSolReserves: ${state.realSolReserves.toFixed(4)} SOL`);
    console.log(`  - realTokenReserves: ${state.realTokenReserves.toFixed(0)}`);
    console.log(`  - tokenTotalSupply: ${state.tokenTotalSupply.toFixed(0)}`);
    console.log(`  - complete: ${complete}`);
    
    return state;
  } catch (error) {
    console.error('Failed to parse bonding curve account:', error);
    throw new Error('Invalid bonding curve account data');
  }
}

/**
 * Build instruction to claim creator rewards
 * @param mint Token mint address
 * @param creator Creator wallet address
 * @returns Transaction instruction
 */
export async function buildClaimRewardsInstruction(
  mint: PublicKey,
  creator: PublicKey
): Promise<TransactionInstruction> {
  // Derive necessary PDAs
  const [bondingCurve] = deriveBondingCurvePDA(mint);
  const associatedBondingCurve = deriveAssociatedBondingCurve(mint, bondingCurve);
  
  // TODO: Replace with actual discriminator from Pump.fun program
  // You can get this by:
  // 1. Inspecting a successful claim transaction on Solscan
  // 2. Using Anchor IDL if available
  // 3. Reverse engineering from PumpPortal documentation
  const CLAIM_DISCRIMINATOR = Buffer.from([
    0x3d, 0x7e, 0x7b, 0x8f, 0x8f, 0x3a, 0x8e, 0x9c // PLACEHOLDER - UPDATE THIS
  ]);

  const keys = [
    { pubkey: creator, isSigner: true, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: bondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
    { pubkey: config.pump.feeRecipient, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
  ];

  return new TransactionInstruction({
    keys,
    programId: config.pump.programId,
    data: CLAIM_DISCRIMINATOR
  });
}

/**
 * Build instruction to create a new Pump.fun token
 * @param mint New token mint keypair
 * @param metadata Token metadata
 * @param creator Creator wallet
 * @returns Transaction instruction
 */
export async function buildPumpCreateInstruction(
  mint: Keypair,
  metadata: TokenMetadata,
  creator: PublicKey
): Promise<TransactionInstruction> {
  // Derive PDAs
  const [bondingCurve] = deriveBondingCurvePDA(mint.publicKey);
  const associatedBondingCurve = deriveAssociatedBondingCurve(mint.publicKey, bondingCurve);
  const metadataPDA = deriveMetadataPDA(mint.publicKey);

  // CREATE instruction discriminator from pump.fun documentation
  // Verified: [24, 30, 200, 40, 5, 28, 7, 119] or [0x18, 0x1E, 0xC8, 0x28, 0x05, 0x1C, 0x07, 0x77]
  const CREATE_DISCRIMINATOR = Buffer.from([
    0x18, 0x1E, 0xC8, 0x28, 0x05, 0x1C, 0x07, 0x77
  ]);

  // Encode metadata into instruction data
  // Format: discriminator + name_len + name + symbol_len + symbol + uri_len + uri
  const nameBuffer = Buffer.from(metadata.name);
  const symbolBuffer = Buffer.from(metadata.symbol);
  const uriBuffer = Buffer.from(metadata.uri);

  const data = Buffer.concat([
    CREATE_DISCRIMINATOR,
    Buffer.from([nameBuffer.length]),
    nameBuffer,
    Buffer.from([symbolBuffer.length]),
    symbolBuffer,
    Buffer.from(new Uint16Array([uriBuffer.length]).buffer),
    uriBuffer
  ]);

  const keys = [
    { pubkey: mint.publicKey, isSigner: true, isWritable: true },
    { pubkey: bondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
    { pubkey: metadataPDA, isSigner: false, isWritable: true },
    { pubkey: creator, isSigner: true, isWritable: true },
    { pubkey: config.pump.globalAccount, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: config.pump.eventAuthority, isSigner: false, isWritable: false }
  ];

  return new TransactionInstruction({
    keys,
    programId: config.pump.programId,
    data
  });
}

/**
 * Build instruction to buy tokens on Pump.fun
 * @param mint Token mint address
 * @param buyer Buyer wallet address
 * @param solAmount Amount of SOL to spend (in lamports)
 * @param slippageBps Slippage tolerance in basis points (default 500 = 5%)
 * @returns Transaction instruction
 */
export async function buildPumpBuyInstruction(
  mint: PublicKey,
  buyer: PublicKey,
  solAmount: number,
  slippageBps: number = 500
): Promise<TransactionInstruction> {
  // Derive PDAs
  const [bondingCurve] = deriveBondingCurvePDA(mint);
  const associatedBondingCurve = deriveAssociatedBondingCurve(mint, bondingCurve);
  const associatedUser = getAssociatedTokenAddress(mint, buyer);

  // BUY instruction discriminator from pump.fun documentation
  // Verified: [0x66, 0x06, 0x3d, 0x12, 0x01, 0xda, 0xeb, 0xea]
  const BUY_DISCRIMINATOR = Buffer.from([
    0x66, 0x06, 0x3d, 0x12, 0x01, 0xda, 0xeb, 0xea
  ]);

  // Encode instruction data: discriminator + amount (u64) + max_slippage_bps (u16)
  const data = Buffer.alloc(8 + 8 + 2);
  BUY_DISCRIMINATOR.copy(data, 0);
  data.writeBigUInt64LE(BigInt(solAmount), 8);
  data.writeUInt16LE(slippageBps, 16);

  const keys = [
    { pubkey: buyer, isSigner: true, isWritable: true },
    { pubkey: config.pump.feeRecipient, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: bondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedUser, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: config.pump.eventAuthority, isSigner: false, isWritable: false }
  ];

  return new TransactionInstruction({
    keys,
    programId: config.pump.programId,
    data
  });
}

/**
 * Calculate bonding curve progress
 * @param state Bonding curve state
 * @returns Progress from 0 to 1
 */
export function calculateBondingCurveProgress(state: BondingCurveState): number {
  // Standard Pump.fun calculation
  // Progress = (current virtual SOL - initial) / (target - initial)
  const INITIAL_VIRTUAL_SOL = 30; // Pump.fun starts at 30 SOL virtual reserves
  const TARGET_VIRTUAL_SOL = 85; // Graduates at 85 SOL virtual reserves
  
  const progress = (state.virtualSolReserves - INITIAL_VIRTUAL_SOL) / (TARGET_VIRTUAL_SOL - INITIAL_VIRTUAL_SOL);
  return Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
}

/**
 * Estimate market cap from bonding curve state
 * @param state Bonding curve state
 * @returns Estimated market cap in USD
 */
export function estimateMarketCap(state: BondingCurveState, solPriceUsd: number = 200): number {
  // If token is complete (graduated to Raydium), reserves will be 0
  // In this case, we can't calculate market cap from bonding curve
  if (state.complete || state.virtualTokenReserves === 0 || state.virtualSolReserves === 0) {
    // Token has graduated - would need to query Raydium pool or DEX for price
    // For now, return 0 or a placeholder
    return 0;
  }

  // Simple estimation: total supply value based on current price
  // More sophisticated methods would query real-time price feeds
  const currentPrice = state.virtualSolReserves / state.virtualTokenReserves;
  const marketCapSol = currentPrice * state.tokenTotalSupply;
  const marketCap = marketCapSol * solPriceUsd;
  
  // Return 0 if calculation results in invalid number
  return isNaN(marketCap) || !isFinite(marketCap) ? 0 : marketCap;
}

/**
 * Generate metadata for a Chain Reaction token
 * @param generation Generation number
 * @returns Token metadata
 */
export function generateChainReactionMetadata(generation: number): TokenMetadata {
  const paddedGen = generation.toString().padStart(3, '0');
  
  return {
    name: `${config.metadata.namePrefix}${paddedGen}`,
    symbol: `${config.metadata.symbolPrefix}${paddedGen}`,
    uri: `${config.metadata.baseUri}`,
    generation
  };
}

/**
 * Fetch bonding curve state from chain
 * @param connection Solana connection
 * @param mint Token mint address
 * @returns Bonding curve state or null if not found
 */
export async function fetchBondingCurveState(
  connection: Connection,
  mint: PublicKey
): Promise<BondingCurveState | null> {
  try {
    const [bondingCurvePDA] = deriveBondingCurvePDA(mint);
    const accountInfo = await connection.getAccountInfo(bondingCurvePDA);
    
    if (!accountInfo) {
      return null;
    }
    
    return parseBondingCurveAccount(accountInfo.data);
  } catch (error) {
    console.error('Failed to fetch bonding curve state:', error);
    return null;
  }
}
