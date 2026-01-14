import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  PublicKey,
  ComputeBudgetProgram
} from '@solana/web3.js';
import { config, getDeployerKeypair } from '../config';
import { BundleResult } from '../types';

// Jito tip account addresses (rotate for better distribution)
const JITO_TIP_ACCOUNTS = [
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
  'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
  'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
  'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
  'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh'
];

/**
 * Get a random Jito tip account
 */
function getRandomTipAccount(): PublicKey {
  const randomIndex = Math.floor(Math.random() * JITO_TIP_ACCOUNTS.length);
  return new PublicKey(JITO_TIP_ACCOUNTS[randomIndex]);
}

/**
 * Jito Bundle Manager
 * Handles creation and submission of Jito bundles
 */
export class JitoBundleManager {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Create a tip instruction
   * @param payer Payer public key
   * @param tipLamports Tip amount in lamports
   * @returns TransactionInstruction
   */
  private createTipInstruction(payer: PublicKey, tipLamports: number): TransactionInstruction {
    const tipAccount = getRandomTipAccount();
    
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: tipAccount,
      lamports: tipLamports
    });
  }

  /**
   * Create a compute budget instruction for priority fees
   * @param microLamports Compute unit price in micro-lamports
   * @returns TransactionInstruction
   */
  private createComputeBudgetInstruction(microLamports: number = 1000): TransactionInstruction {
    return ComputeBudgetProgram.setComputeUnitPrice({
      microLamports
    });
  }

  /**
   * Build and sign a transaction
   * @param instructions Transaction instructions
   * @param signers Signers (first must be fee payer)
   * @param tipLamports Optional tip amount
   * @returns Signed transaction
   */
  private async buildTransaction(
    instructions: TransactionInstruction[],
    signers: Keypair[],
    tipLamports?: number
  ): Promise<Transaction> {
    const transaction = new Transaction();
    
    // Add compute budget instruction
    transaction.add(this.createComputeBudgetInstruction());
    
    // Add main instructions
    for (const ix of instructions) {
      transaction.add(ix);
    }
    
    // Add tip instruction if specified
    if (tipLamports && tipLamports > 0) {
      transaction.add(this.createTipInstruction(signers[0].publicKey, tipLamports));
    }
    
    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = signers[0].publicKey;
    
    // Sign transaction
    transaction.sign(...signers);
    
    return transaction;
  }

  /**
   * Send a bundle to Jito
   * @param transactions Array of signed transactions
   * @returns Bundle result
   */
  public async sendBundle(transactions: Transaction[]): Promise<BundleResult> {
    try {
      console.log(`Preparing Jito bundle with ${transactions.length} transactions...`);
      
      // Note: Jito bundle implementation requires jito-ts SDK setup
      // For now, we'll send transactions sequentially as a fallback
      console.warn('⚠️  Jito bundle API integration pending. Falling back to sequential transaction submission.');
      
      const signatures: string[] = [];
      
      for (const tx of transactions) {
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {
          skipPreflight: false,
          maxRetries: 3
        });
        await this.connection.confirmTransaction(sig, 'confirmed');
        signatures.push(sig);
      }
      
      return {
        bundleId: signatures[0],
        success: true,
        signature: signatures[0],
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to send bundle:', error);
      return {
        bundleId: 'failed',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }


  /**
   * Execute the "Mitosis" bundle: (Optional Claim) + Create + Buy
   * @param claimIx Claim rewards instruction (optional - set to null to skip)
   * @param createIx Create token instruction
   * @param buyIx Buy token instruction
   * @param mintKeypair New token mint keypair
   * @param retryOnFailure Whether to retry with higher tip
   * @returns Bundle result
   */
  public async executeMitosisBundle(
    claimIx: TransactionInstruction | null,
    createIx: TransactionInstruction,
    buyIx: TransactionInstruction,
    mintKeypair: Keypair,
    retryOnFailure: boolean = true
  ): Promise<BundleResult> {
    const deployer = getDeployerKeypair();
    
    try {
      // Build transactions
      console.log('Building Mitosis bundle transactions...');
      
      const transactions: Transaction[] = [];
      
      // Transaction 1: Claim rewards (optional, with tip)
      if (claimIx) {
        const claimTx = await this.buildTransaction(
          [claimIx],
          [deployer],
          config.jito.tipLamports
        );
        transactions.push(claimTx);
      }
      
      // Transaction 2: Create new token
      const createTx = await this.buildTransaction(
        [createIx],
        [deployer, mintKeypair]
      );
      transactions.push(createTx);
      
      // Transaction 3: Buy new token
      const buyTx = await this.buildTransaction(
        [buyIx],
        [deployer]
      );
      transactions.push(buyTx);
      
      // Submit bundle
      const result = await this.sendBundle(transactions);
      
      // Retry with higher tip if failed
      if (!result.success && retryOnFailure) {
        console.warn('Bundle failed. Retrying with higher tip...');
        
        const retryTransactions: Transaction[] = [];
        
        // Rebuild with higher tip
        if (claimIx) {
          const claimTxRetry = await this.buildTransaction(
            [claimIx],
            [deployer],
            config.jito.tipRetryLamports
          );
          retryTransactions.push(claimTxRetry);
        }
        
        const createTxRetry = await this.buildTransaction(
          [createIx],
          [deployer, mintKeypair]
        );
        retryTransactions.push(createTxRetry);
        
        const buyTxRetry = await this.buildTransaction(
          [buyIx],
          [deployer]
        );
        retryTransactions.push(buyTxRetry);
        
        return await this.sendBundle(retryTransactions);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to execute Mitosis bundle:', error);
      return {
        bundleId: 'error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Send a simple transaction via Jito (for airdrops)
   * @param instructions Transaction instructions
   * @param signers Signers
   * @param tipLamports Tip amount
   * @returns Transaction signature
   */
  public async sendTransaction(
    instructions: TransactionInstruction[],
    signers: Keypair[],
    tipLamports: number = 0
  ): Promise<string> {
    try {
      const transaction = await this.buildTransaction(instructions, signers, tipLamports);
      const result = await this.sendBundle([transaction]);
      
      if (result.success && result.signature) {
        return result.signature;
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }
}

// Export singleton instance
let jitoBundleManager: JitoBundleManager | null = null;

export function getJitoBundleManager(connection: Connection): JitoBundleManager {
  if (!jitoBundleManager) {
    jitoBundleManager = new JitoBundleManager(connection);
  }
  return jitoBundleManager;
}
