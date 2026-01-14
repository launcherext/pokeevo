import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { config, getDeployerKeypair } from '../config';
import { TokenHolder, AirdropBatchResult } from '../types';

/**
 * Airdrop Dispenser Service
 * Batches and sends token transfers to top holders
 */
export class DispenserService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(config.helius.rpcUrl, 'confirmed');
  }

  /**
   * Distribute tokens to top holders
   * @param mint Token mint address
   * @param topHolders Array of top holders
   * @param totalAmount Total amount of tokens to distribute
   * @returns Array of batch results
   */
  public async distributeToHolders(
    mint: string,
    topHolders: TokenHolder[],
    totalAmount: number
  ): Promise<AirdropBatchResult[]> {
    console.log(`🎁 Starting airdrop to ${topHolders.length} holders`);
    console.log(`Total amount: ${totalAmount} tokens`);

    const deployer = getDeployerKeypair();
    const mintPubkey = new PublicKey(mint);
    const amountPerHolder = Math.floor((totalAmount / topHolders.length) * 1e6); // Convert to raw amount

    console.log(`Amount per holder: ${amountPerHolder / 1e6} tokens`);

    // Split into batches
    const batches = this.createBatches(topHolders, config.execution.airdropBatchSize);
    console.log(`Created ${batches.length} batches`);

    const results: AirdropBatchResult[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} recipients)`);

      try {
        const signature = await this.sendBatch(deployer, mintPubkey, batch, amountPerHolder);
        
        results.push({
          batchIndex: i,
          signature,
          success: true,
          recipientCount: batch.length
        });

        console.log(`✅ Batch ${i + 1} sent: ${signature}`);
      } catch (error) {
        console.error(`❌ Batch ${i + 1} failed:`, error);
        results.push({
          batchIndex: i,
          signature: '',
          success: false,
          recipientCount: batch.length,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Delay between batches
      if (i < batches.length - 1) {
        await this.delay(config.execution.airdropBatchDelay);
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Airdrop complete: ${successCount}/${batches.length} batches successful`);

    return results;
  }

  /**
   * Send a single batch of transfers
   * Creates ATAs for recipients if they don't exist
   */
  private async sendBatch(
    deployer: Keypair,
    mint: PublicKey,
    holders: TokenHolder[],
    amountPerHolder: number
  ): Promise<string> {
    const transaction = new Transaction();

    // Get source token account (deployer's ATA)
    const sourceAta = await getAssociatedTokenAddress(mint, deployer.publicKey);

    // Add transfer instruction for each holder, creating ATA if needed
    for (const holder of holders) {
      const recipientPubkey = new PublicKey(holder.wallet);
      const destinationAta = await getAssociatedTokenAddress(mint, recipientPubkey);

      // Check if ATA exists, if not add creation instruction
      try {
        await getAccount(this.connection, destinationAta);
      } catch (error) {
        // ATA doesn't exist, create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            deployer.publicKey, // payer
            destinationAta, // ata
            recipientPubkey, // owner
            mint, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          sourceAta,
          destinationAta,
          deployer.publicKey,
          amountPerHolder,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    // Get recent blockhash and send
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = deployer.publicKey;
    transaction.sign(deployer);

    const signature = await this.connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3
    });
    await this.connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }

  /**
   * Create batches from holders array
   */
  private createBatches(holders: TokenHolder[], batchSize: number): TokenHolder[][] {
    const batches: TokenHolder[][] = [];
    for (let i = 0; i < holders.length; i += batchSize) {
      batches.push(holders.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
