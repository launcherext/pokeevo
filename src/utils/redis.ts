import Redis from 'ioredis';
import { config } from '../config';
import { REDIS_KEYS, TokenHolder, SystemState, MonitorPhase } from '../types';

/**
 * Redis Client Wrapper
 * Provides type-safe methods for interacting with Redis
 */
export class RedisClient {
  private client: Redis;

  constructor() {
    this.client = new Redis(config.redis.url, {
      password: config.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true  // Changed to true to prevent auto-connect
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Redis: Connected');
    });

    this.client.on('ready', () => {
      console.log('Redis: Ready');
    });

    this.client.on('error', (error) => {
      console.error('Redis Error:', error);
    });

    this.client.on('close', () => {
      console.log('Redis: Connection closed');
    });

    this.client.on('reconnecting', () => {
      console.log('Redis: Reconnecting...');
    });
  }

  /**
   * Check if Redis is connected
   */
  public async ensureConnected(): Promise<void> {
    const status = this.client.status;
    
    if (status === 'ready' || status === 'connect') {
      return;
    }
    
    if (status !== 'connecting' && status !== 'reconnecting') {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  /**
   * Get the active token mint
   */
  public async getActiveMint(): Promise<string | null> {
    return await this.client.get(REDIS_KEYS.ACTIVE_MINT);
  }

  /**
   * Set the active token mint
   */
  public async setActiveMint(mint: string): Promise<void> {
    await this.client.set(REDIS_KEYS.ACTIVE_MINT, mint);
  }

  /**
   * Get current generation number
   */
  public async getGeneration(): Promise<number> {
    const gen = await this.client.get(REDIS_KEYS.GENERATION);
    return gen ? parseInt(gen) : 0;
  }

  /**
   * Increment and get next generation number
   */
  public async incrementGeneration(): Promise<number> {
    return await this.client.incr(REDIS_KEYS.GENERATION);
  }

  /**
   * Set generation number
   */
  public async setGeneration(generation: number): Promise<void> {
    await this.client.set(REDIS_KEYS.GENERATION, generation.toString());
  }

  /**
   * Get current monitor phase
   */
  public async getPhase(): Promise<MonitorPhase> {
    const phase = await this.client.get(REDIS_KEYS.PHASE);
    return (phase as MonitorPhase) || MonitorPhase.CASUAL;
  }

  /**
   * Set monitor phase
   */
  public async setPhase(phase: MonitorPhase): Promise<void> {
    await this.client.set(REDIS_KEYS.PHASE, phase);
  }

  /**
   * Add a token holder to the sorted set
   * @param mint Token mint address
   * @param wallet Wallet address
   * @param balance Token balance
   */
  public async addHolder(mint: string, wallet: string, balance: number): Promise<void> {
    const key = REDIS_KEYS.HOLDERS(mint);
    await this.client.zadd(key, balance, wallet);
  }

  /**
   * Add multiple holders in a pipeline (batch operation)
   */
  public async addHoldersBatch(mint: string, holders: Array<{ wallet: string; balance: number }>): Promise<void> {
    const key = REDIS_KEYS.HOLDERS(mint);
    const pipeline = this.client.pipeline();
    
    for (const holder of holders) {
      pipeline.zadd(key, holder.balance, holder.wallet);
    }
    
    await pipeline.exec();
  }

  /**
   * Get top N holders for a token
   * @param mint Token mint address
   * @param limit Number of holders to return (default 100)
   * @returns Array of TokenHolder objects
   */
  public async getTopHolders(mint: string, limit: number = 100): Promise<TokenHolder[]> {
    const key = REDIS_KEYS.HOLDERS(mint);
    
    // Get top holders with scores (balances) in descending order
    const results = await this.client.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    
    const holders: TokenHolder[] = [];
    for (let i = 0; i < results.length; i += 2) {
      holders.push({
        wallet: results[i],
        balance: parseFloat(results[i + 1]),
        rank: holders.length + 1
      });
    }
    
    return holders;
  }

  /**
   * Get holder count for a token
   */
  public async getHolderCount(mint: string): Promise<number> {
    const key = REDIS_KEYS.HOLDERS(mint);
    return await this.client.zcard(key);
  }

  /**
   * Clear holder data for a token
   */
  public async clearHolders(mint: string): Promise<void> {
    const key = REDIS_KEYS.HOLDERS(mint);
    await this.client.del(key);
  }

  /**
   * Store bundle information
   */
  public async storeBundleInfo(bundleId: string, data: Record<string, unknown>): Promise<void> {
    const key = REDIS_KEYS.BUNDLE(bundleId);
    await this.client.set(key, JSON.stringify(data), 'EX', 86400); // 24h expiry
  }

  /**
   * Get bundle information
   */
  public async getBundleInfo(bundleId: string): Promise<Record<string, unknown> | null> {
    const key = REDIS_KEYS.BUNDLE(bundleId);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get complete system state
   */
  public async getSystemState(): Promise<SystemState> {
    const [activeMint, generation, phase, lastUpdate] = await Promise.all([
      this.getActiveMint(),
      this.getGeneration(),
      this.getPhase(),
      this.client.get(REDIS_KEYS.LAST_UPDATE)
    ]);

    return {
      activeMint,
      generation,
      phase,
      lastUpdate: lastUpdate ? parseInt(lastUpdate) : Date.now()
    };
  }

  /**
   * Update last update timestamp
   */
  public async updateTimestamp(): Promise<void> {
    await this.client.set(REDIS_KEYS.LAST_UPDATE, Date.now().toString());
  }

  /**
   * Initialize system state with genesis token
   */
  public async initializeSystem(genesisTokenMint?: string): Promise<void> {
    const activeMint = await this.getActiveMint();
    
    if (!activeMint && genesisTokenMint) {
      console.log(`Initializing system with genesis token: ${genesisTokenMint}`);
      await this.setActiveMint(genesisTokenMint);
      await this.setGeneration(1);
      await this.setPhase(MonitorPhase.CASUAL);
      await this.updateTimestamp();
    } else if (!activeMint) {
      console.log('No active token set. Waiting for genesis token configuration.');
    } else if (genesisTokenMint && genesisTokenMint !== activeMint) {
      // Force update if new genesis token is provided
      console.log(`Updating active token from ${activeMint} to ${genesisTokenMint}`);
      await this.setActiveMint(genesisTokenMint);
      await this.setGeneration(1); // Reset generation for new token
      await this.setPhase(MonitorPhase.CASUAL);
      await this.updateTimestamp();
    } else {
      console.log(`System already initialized with token: ${activeMint}`);
    }
  }

  /**
   * Clean up old data
   */
  public async cleanup(mint: string): Promise<void> {
    await this.clearHolders(mint);
    console.log(`Cleaned up data for token: ${mint}`);
  }

  /**
   * Close Redis connection
   */
  public async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('Redis: Disconnected');
  }

  /**
   * Get raw Redis client (for advanced operations)
   */
  public getClient(): Redis {
    return this.client;
  }
}

// Export singleton instance
export const redisClient = new RedisClient();
