import { config } from '../config';
import { redisClient } from '../utils/redis';
import { TokenHolder } from '../types';

/**
 * Helius getTokenAccounts response type
 */
interface HeliusTokenAccountsResponse {
  jsonrpc: string;
  id: string;
  result?: {
    total: number;
    limit: number;
    cursor?: string;
    token_accounts: Array<{
      address: string;
      mint: string;
      owner: string;
      amount: number;
      delegated_amount: number;
      frozen: boolean;
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Snapshot Engine
 * Captures and stores top token holders at the moment of mitosis
 */
export class SnapshotService {
  constructor() {
    // Uses direct fetch to Helius API
  }

  /**
   * Take a snapshot of all token holders
   * @param mint Token mint address
   * @returns Array of all token holders
   */
  public async captureSnapshot(mint: string): Promise<TokenHolder[]> {
    console.log(`📸 Taking snapshot for token: ${mint}`);
    const startTime = Date.now();

    try {
      // Use Helius DAS API to get all token accounts
      const tokenAccounts = await this.fetchAllTokenAccounts(mint);
      
      if (tokenAccounts.length === 0) {
        console.warn('No token holders found!');
        return [];
      }

      console.log(`Found ${tokenAccounts.length} token holders`);

      // Store holders in Redis
      await this.storeHoldersInRedis(mint, tokenAccounts);

      // Get top 100
      const topHolders = await redisClient.getTopHolders(mint, 100);

      const duration = Date.now() - startTime;
      console.log(`Snapshot complete in ${duration}ms. Top 100 holders cached.`);

      return topHolders;
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
      throw error;
    }
  }

  /**
   * Fetch all token accounts for a mint using Helius DAS API
   * Uses direct fetch to ensure correct API format
   * @param mint Token mint address
   * @returns Array of token holders
   */
  private async fetchAllTokenAccounts(mint: string): Promise<Array<{ wallet: string; balance: number }>> {
    try {
      const holders: Array<{ wallet: string; balance: number }> = [];
      let page = 1;
      const limit = 1000; // Helius DAS API max per page

      while (true) {
        console.log(`Fetching token accounts page ${page}...`);

        // Use direct fetch for reliable API format
        const response = await fetch(config.helius.rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: `token-accounts-${page}`,
            method: 'getTokenAccounts',
            params: {
              mint,
              page,
              limit
            }
          })
        });

        const data = await response.json() as HeliusTokenAccountsResponse;

        if (!data.result || !data.result.token_accounts || data.result.token_accounts.length === 0) {
          break;
        }

        // Parse token accounts
        for (const account of data.result.token_accounts) {
          const amount = account.amount || 0;
          const owner = account.owner || '';
          // Pump.fun tokens use 6 decimals
          const balance = Number(amount) / 1e6;

          // Only include accounts with non-zero balance
          if (balance > 0 && owner) {
            holders.push({
              wallet: owner,
              balance
            });
          }
        }

        console.log(`  Found ${data.result.token_accounts.length} accounts on page ${page}`);

        // Check if we've fetched all pages
        if (data.result.token_accounts.length < limit) {
          break;
        }

        page++;

        // Safety limit to prevent infinite loops
        if (page > 200) {
          console.warn('Reached page limit, stopping pagination');
          break;
        }
      }

      // Sort by balance descending
      holders.sort((a, b) => b.balance - a.balance);

      console.log(`Total holders found: ${holders.length}`);
      return holders;
    } catch (error) {
      console.error('Error fetching token accounts from Helius:', error);

      // Fallback: Try direct RPC call
      return await this.fetchTokenAccountsFallback(mint);
    }
  }

  /**
   * Fallback method using direct RPC calls
   * @param mint Token mint address
   * @returns Array of token holders
   */
  private async fetchTokenAccountsFallback(mint: string): Promise<Array<{ wallet: string; balance: number }>> {
    console.log('Using fallback RPC method to fetch token accounts...');
    
    try {
      const { Connection, PublicKey } = await import('@solana/web3.js');
      const connection = new Connection(config.helius.rpcUrl, 'confirmed');
      const mintPubkey = new PublicKey(mint);

      // Get all token accounts for this mint
      const accounts = await connection.getProgramAccounts(
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        {
          filters: [
            { dataSize: 165 }, // Token account size
            { memcmp: { offset: 0, bytes: mintPubkey.toBase58() } } // Filter by mint
          ]
        }
      );

      const holders: Array<{ wallet: string; balance: number }> = [];

      for (const account of accounts) {
        try {
          // Parse token account data
          // Layout: mint(32) + owner(32) + amount(8) + ...
          const data = account.account.data;
          const owner = new PublicKey(data.slice(32, 64));
          const amount = data.readBigUInt64LE(64);
          const balance = Number(amount) / 1e6; // Assume 6 decimals

          if (balance > 0) {
            holders.push({
              wallet: owner.toBase58(),
              balance
            });
          }
        } catch (parseError) {
          console.error('Error parsing token account:', parseError);
        }
      }

      holders.sort((a, b) => b.balance - a.balance);
      console.log(`Fallback method found ${holders.length} token holders`);

      return holders;
    } catch (error) {
      console.error('Fallback method failed:', error);
      return [];
    }
  }

  /**
   * Store holders in Redis sorted set
   * @param mint Token mint address
   * @param holders Array of holders
   */
  private async storeHoldersInRedis(
    mint: string,
    holders: Array<{ wallet: string; balance: number }>
  ): Promise<void> {
    console.log(`Storing ${holders.length} holders in Redis...`);

    // Use batch operation for performance
    await redisClient.addHoldersBatch(mint, holders);

    console.log('Holders stored in Redis successfully');
  }

  /**
   * Get top N holders from Redis
   * @param mint Token mint address
   * @param limit Number of holders to return
   * @returns Array of top holders
   */
  public async getTopHolders(mint: string, limit: number = 100): Promise<TokenHolder[]> {
    try {
      const holders = await redisClient.getTopHolders(mint, limit);
      console.log(`Retrieved top ${holders.length} holders for ${mint}`);
      return holders;
    } catch (error) {
      console.error('Failed to get top holders:', error);
      throw error;
    }
  }

  /**
   * Clear snapshot data for a token
   * @param mint Token mint address
   */
  public async clearSnapshot(mint: string): Promise<void> {
    console.log(`Clearing snapshot data for ${mint}`);
    await redisClient.clearHolders(mint);
  }

  /**
   * Get holder statistics
   * @param mint Token mint address
   */
  public async getHolderStats(mint: string): Promise<{ totalHolders: number; topHolderBalance: number }> {
    try {
      const totalHolders = await redisClient.getHolderCount(mint);
      const topHolders = await redisClient.getTopHolders(mint, 1);
      const topHolderBalance = topHolders.length > 0 ? topHolders[0].balance : 0;

      return {
        totalHolders,
        topHolderBalance
      };
    } catch (error) {
      console.error('Failed to get holder stats:', error);
      return { totalHolders: 0, topHolderBalance: 0 };
    }
  }
}
