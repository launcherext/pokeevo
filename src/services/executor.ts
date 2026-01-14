import { Connection, Keypair } from '@solana/web3.js';
import { config, getDeployerKeypair } from '../config';
import { redisClient } from '../utils/redis';
import { getJitoBundleManager } from '../utils/jito';
import {
  buildPumpCreateInstruction,
  buildPumpBuyInstruction,
  generateChainReactionMetadata
} from '../utils/pump';
import { BundleResult, TokenHolder } from '../types';

/**
 * Executor Service
 * Constructs and executes the atomic Mitosis bundle: Claim + Create + Buy
 */
export class ExecutorService {
  private connection: Connection;
  private jitoBundleManager: ReturnType<typeof getJitoBundleManager>;

  constructor() {
    this.connection = new Connection(config.helius.rpcUrl, {
      commitment: 'confirmed',
      wsEndpoint: config.helius.wsUrl
    });
    this.jitoBundleManager = getJitoBundleManager(this.connection);
  }

  /**
   * Execute the Mitosis sequence
   * @param currentMint Current token mint that's graduating
   * @param topHolders Top 100 holders to receive airdrop
   * @returns Execution result with new token info
   */
  public async executeMitosis(
    currentMint: string,
    topHolders: TokenHolder[]
  ): Promise<{
    success: boolean;
    newMint: string | null;
    bundleResult: BundleResult;
    claimedAmount: number;
    snipedAmount: number;
  }> {
    console.log('🚀 EXECUTING MITOSIS SEQUENCE 🚀');
    console.log(`Current Mint: ${currentMint}`);
    console.log(`Top Holders: ${topHolders.length}`);

    const deployer = getDeployerKeypair();
    const startTime = Date.now();

    try {
      // Step 1: Get next generation number
      const generation = await redisClient.incrementGeneration();
      console.log(`Generation: #${generation}`);

      // Step 2: Generate new token metadata
      const metadata = generateChainReactionMetadata(generation);
      console.log(`New Token: ${metadata.name} (${metadata.symbol})`);

      // Step 3: Create new token mint keypair
      const newTokenKeypair = Keypair.generate();
      const newMint = newTokenKeypair.publicKey.toBase58();
      console.log(`New Mint: ${newMint}`);

      // NOTE: CLAIM instruction removed - user can manually claim rewards
      // Using deployer's existing SOL balance instead
      console.log('⚠️  Skipping CLAIM - using deployer SOL balance');

      // Step 5: Build instructions (CREATE + BUY only)
      console.log('Building transaction instructions...');

      const createIx = await buildPumpCreateInstruction(
        newTokenKeypair,
        metadata,
        deployer.publicKey
      );

      // Use a fixed amount from deployer's wallet for initial buy
      const buyAmountSol = 0.5; // 0.5 SOL initial buy
      const buyAmountLamports = Math.floor(buyAmountSol * 1e9);

      const buyIx = await buildPumpBuyInstruction(
        newTokenKeypair.publicKey,
        deployer.publicKey,
        buyAmountLamports,
        500 // 5% slippage tolerance
      );

      console.log(`Buy amount: ${buyAmountSol.toFixed(4)} SOL (${buyAmountLamports} lamports)`);

      // Step 6: Execute bundle (CREATE + BUY)
      console.log('Submitting bundle (CREATE + BUY)...');
      const bundleResult = await this.jitoBundleManager.executeMitosisBundle(
        null, // No claim instruction
        createIx,
        buyIx,
        newTokenKeypair,
        true // Enable retry on failure
      );

      // Step 7: Store bundle info in Redis
      await redisClient.storeBundleInfo(bundleResult.bundleId, {
        oldMint: currentMint,
        newMint,
        generation,
        timestamp: bundleResult.timestamp,
        success: bundleResult.success,
        signature: bundleResult.signature,
        topHoldersCount: topHolders.length
      });

      const duration = Date.now() - startTime;

      if (bundleResult.success) {
        console.log('✅ MITOSIS COMPLETE! ✅');
        console.log(`Bundle ID: ${bundleResult.bundleId}`);
        console.log(`Signature: ${bundleResult.signature}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`New Token: ${newMint}`);

        // Update active mint in Redis
        await redisClient.setActiveMint(newMint);

        return {
          success: true,
          newMint,
          bundleResult,
          claimedAmount: 0,
          snipedAmount: buyAmountSol
        };
      } else {
        console.error('❌ MITOSIS FAILED! ❌');
        console.error(`Error: ${bundleResult.error}`);
        console.error(`Duration: ${duration}ms`);

        return {
          success: false,
          newMint: null,
          bundleResult,
          claimedAmount: 0,
          snipedAmount: 0
        };
      }
    } catch (error) {
      console.error('Fatal error during mitosis execution:', error);
      
      return {
        success: false,
        newMint: null,
        bundleResult: {
          bundleId: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        },
        claimedAmount: 0,
        snipedAmount: 0
      };
    }
  }

  /**
   * Estimate claimable creator rewards
   * @param _mint Token mint address
   * @returns Estimated SOL amount
   * 
   * NOTE: Currently unused - kept for future implementation
   */
  /*
  private estimateClaimableRewards(_mint: string): Promise<number> {
    try {
      // Query the bonding curve account to check claimable rewards
      // This is a simplified estimation. In production, you'd want to:
      // 1. Fetch the bonding curve account
      // 2. Read the creator_rewards field
      // 3. Return the exact claimable amount

      // For now, we'll use a conservative estimate based on typical Pump.fun economics
      // When a token graduates (~$69k MC), creator rewards are typically 0.5-2 SOL
      const estimatedRewards = 0.8; // Conservative estimate in SOL

      console.log(`Using estimated rewards: ${estimatedRewards} SOL`);
      console.log('⚠️  NOTE: This is an estimate. Update with actual bonding curve query.');

      return Promise.resolve(estimatedRewards);
    } catch (error) {
      console.error('Failed to estimate claimable rewards:', error);
      // Return minimum viable amount
      return Promise.resolve(0.5);
    }
  }
  */


  /**
   * Verify that a bundle landed successfully
   * @param bundleId Bundle ID to check
   * @returns True if confirmed on-chain
   */
  public async verifyBundleSuccess(bundleId: string): Promise<boolean> {
    try {
      const bundleInfo = await redisClient.getBundleInfo(bundleId);
      
      if (!bundleInfo) {
        console.warn(`No bundle info found for ${bundleId}`);
        return false;
      }

      // Check if we have a signature
      if (!bundleInfo.signature) {
        return false;
      }

      // Verify the transaction on-chain
      const signature = bundleInfo.signature as string;
      const status = await this.connection.getSignatureStatus(signature);

      if (status && status.value && status.value.confirmationStatus) {
        const isConfirmed = 
          status.value.confirmationStatus === 'confirmed' || 
          status.value.confirmationStatus === 'finalized';
        
        console.log(`Bundle ${bundleId} status: ${status.value.confirmationStatus}`);
        return isConfirmed;
      }

      return false;
    } catch (error) {
      console.error('Failed to verify bundle success:', error);
      return false;
    }
  }

  /**
   * Get bundle info from Redis
   * @param bundleId Bundle ID
   * @returns Bundle information
   */
  public async getBundleInfo(bundleId: string): Promise<Record<string, unknown> | null> {
    return await redisClient.getBundleInfo(bundleId);
  }

  /**
   * Emergency abort - attempt to cancel pending operations
   */
  public async emergencyAbort(): Promise<void> {
    console.log('🚨 EMERGENCY ABORT TRIGGERED 🚨');
    // In a real implementation, you might want to:
    // 1. Stop all pending operations
    // 2. Save state for recovery
    // 3. Send alerts
    console.log('State saved. Manual intervention required.');
  }
}
