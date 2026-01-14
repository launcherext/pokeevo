import { config } from '../config';
import { streamServer } from '../websocket/stream';
import { WSEventType, HolderUpdateEvent, TokenHolder } from '../types';

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
 * Holder Broadcaster Service
 * Fetches top 100 holders and broadcasts to frontend every 30 seconds
 */
export class HolderBroadcaster {
  private interval: NodeJS.Timeout | null = null;
  private currentMint: string | null = null;
  private isRunning: boolean = false;
  private broadcastInterval: number = 30000; // 30 seconds default

  constructor() {
    console.log('HolderBroadcaster initialized');
  }

  /**
   * Start broadcasting holder updates for a token
   * @param mint Token mint address to track
   */
  public start(mint: string): void {
    if (this.isRunning && this.currentMint === mint) {
      console.log('HolderBroadcaster already running for this mint');
      return;
    }

    // Stop any existing broadcast
    this.stop();

    this.currentMint = mint;
    this.isRunning = true;

    console.log(`HolderBroadcaster started for: ${mint}`);
    console.log(`Broadcast interval: ${this.broadcastInterval / 1000}s`);

    // Fetch immediately on start
    this.fetchAndBroadcast();

    // Then set up interval
    this.interval = setInterval(() => {
      this.fetchAndBroadcast();
    }, this.broadcastInterval);
  }

  /**
   * Stop broadcasting
   */
  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('HolderBroadcaster stopped');
  }

  /**
   * Pause broadcasting (during mitosis execution)
   */
  public pause(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('HolderBroadcaster paused');
  }

  /**
   * Resume broadcasting after pause
   */
  public resume(): void {
    if (!this.isRunning || !this.currentMint) {
      return;
    }

    if (this.interval) {
      return; // Already running
    }

    console.log('HolderBroadcaster resumed');
    this.fetchAndBroadcast();

    this.interval = setInterval(() => {
      this.fetchAndBroadcast();
    }, this.broadcastInterval);
  }

  /**
   * Switch to a new token mint
   * @param mint New token mint address
   */
  public switchMint(mint: string): void {
    console.log(`HolderBroadcaster switching to new mint: ${mint}`);
    this.start(mint);
  }

  /**
   * Set broadcast interval (for intensive phase)
   * @param intervalMs Interval in milliseconds
   */
  public setInterval(intervalMs: number): void {
    this.broadcastInterval = intervalMs;

    // Restart with new interval if running
    if (this.isRunning && this.currentMint) {
      this.start(this.currentMint);
    }
  }

  /**
   * Fetch top 100 holders and broadcast to WebSocket clients
   */
  private async fetchAndBroadcast(): Promise<void> {
    if (!this.currentMint) {
      return;
    }

    try {
      const holders = await this.fetchTopHolders(this.currentMint, 100);

      if (holders.length === 0) {
        console.log('No holders found for token');
        return;
      }

      const event: HolderUpdateEvent = {
        event: WSEventType.HOLDER_UPDATE,
        holders: holders,
        totalHolders: holders.length,
        mint: this.currentMint,
        timestamp: Date.now()
      };

      streamServer.broadcast(event);
      console.log(`Broadcasted ${holders.length} holders to clients`);

    } catch (error) {
      console.error('Failed to fetch/broadcast holders:', error);
    }
  }

  /**
   * Fetch top N holders from Helius API
   * @param mint Token mint address
   * @param limit Number of holders to fetch (max 100)
   */
  private async fetchTopHolders(mint: string, limit: number = 100): Promise<TokenHolder[]> {
    try {
      const response = await fetch(config.helius.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'holder-broadcast',
          method: 'getTokenAccounts',
          params: {
            mint,
            page: 1,
            limit: Math.min(limit, 1000)
          }
        })
      });

      const data = await response.json() as HeliusTokenAccountsResponse;

      if (!data.result || !data.result.token_accounts) {
        return [];
      }

      // Parse and sort holders
      const holders: TokenHolder[] = data.result.token_accounts
        .filter(account => account.amount > 0 && account.owner)
        .map(account => ({
          wallet: account.owner,
          balance: Number(account.amount) / 1e6, // Pump.fun uses 6 decimals
          rank: 0 // Will be set after sorting
        }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, limit)
        .map((holder, index) => ({
          ...holder,
          rank: index + 1
        }));

      return holders;

    } catch (error) {
      console.error('Error fetching holders from Helius:', error);
      return [];
    }
  }

  /**
   * Check if broadcaster is running
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current mint being tracked
   */
  public getCurrentMint(): string | null {
    return this.currentMint;
  }
}

// Export singleton instance
export const holderBroadcaster = new HolderBroadcaster();
