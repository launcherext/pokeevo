import { Connection, PublicKey } from '@solana/web3.js';
import { EventEmitter } from 'events';
import { config } from '../config';
import { redisClient } from '../utils/redis';
import {
  fetchBondingCurveState,
  calculateBondingCurveProgress,
  estimateMarketCap
} from '../utils/pump';
import {
  MonitorPhase,
  WSEventType,
  CurveUpdateEvent,
  MitosisImminentEvent
} from '../types';

/**
 * Monitor Service Events
 */
export enum MonitorEvent {
  CURVE_UPDATE = 'curve_update',
  MITOSIS_IMMINENT = 'mitosis_imminent',
  PHASE_CHANGE = 'phase_change',
  ERROR = 'error'
}

/**
 * Bonding Curve Monitor Service
 * Watches token bonding curve progress and triggers mitosis when ready
 */
export class MonitorService extends EventEmitter {
  private connection: Connection;
  private activeMint: PublicKey | null = null;
  private currentPhase: MonitorPhase = MonitorPhase.STOPPED;
  private pollInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private mitosisTriggered: boolean = false;

  constructor() {
    super();
    this.connection = new Connection(config.helius.rpcUrl, {
      commitment: 'confirmed',
      wsEndpoint: config.helius.wsUrl
    });
  }

  /**
   * Start monitoring a token
   * @param mint Token mint address
   */
  public async start(mint: string): Promise<void> {
    if (this.isRunning) {
      console.warn('Monitor service already running. Stop it first.');
      return;
    }

    try {
      this.activeMint = new PublicKey(mint);
      this.isRunning = true;
      this.mitosisTriggered = false;
      this.currentPhase = MonitorPhase.CASUAL;

      console.log(`Starting monitor for token: ${mint}`);
      await redisClient.setPhase(MonitorPhase.CASUAL);

      // Start with casual polling
      this.startCasualPolling();
    } catch (error) {
      console.error('Failed to start monitor service:', error);
      this.emit(MonitorEvent.ERROR, error);
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  public async stop(): Promise<void> {
    console.log('Stopping monitor service...');
    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.currentPhase = MonitorPhase.STOPPED;
    await redisClient.setPhase(MonitorPhase.STOPPED);
    
    console.log('Monitor service stopped');
  }

  /**
   * Phase 1: Casual Polling (Market Cap < $50k)
   * Polls PumpPortal API every 30 seconds
   */
  private startCasualPolling(): void {
    console.log(`Phase 1: Casual polling (interval: ${config.monitoring.casualPollInterval}ms)`);
    console.log('Using Helius RPC to fetch bonding curve data directly');

    this.pollInterval = setInterval(async () => {
      if (!this.isRunning || !this.activeMint) return;

      try {
        // Fetch bonding curve state directly from Helius RPC
        const state = await fetchBondingCurveState(this.connection, this.activeMint);
        
        if (!state) {
          // Bonding curve might not exist yet or account fetch failed
          // Emit update with 0 values but keep mint
          const updateEvent: CurveUpdateEvent = {
            event: WSEventType.CURVE_UPDATE,
            progress: 0,
            marketCap: 0,
            mint: this.activeMint.toBase58(),
            timestamp: Date.now()
          };
          this.emit(MonitorEvent.CURVE_UPDATE, updateEvent);
          return;
        }

        // Calculate progress and market cap from bonding curve state
        const progress = calculateBondingCurveProgress(state);
        const marketCap = estimateMarketCap(state);

        // Emit curve update event
        const updateEvent: CurveUpdateEvent = {
          event: WSEventType.CURVE_UPDATE,
          progress,
          marketCap,
          mint: this.activeMint.toBase58(),
          timestamp: Date.now()
        };
        this.emit(MonitorEvent.CURVE_UPDATE, updateEvent);

        console.log(`Progress: ${(progress * 100).toFixed(2)}% | Market Cap: $${marketCap.toFixed(2)} | Target: $${config.monitoring.marketCapThreshold}`);

        // Check if we should transition to intensive polling
        if (marketCap >= config.monitoring.marketCapThreshold) {
          console.log(`Market cap threshold reached! Transitioning to intensive polling...`);
          this.transitionToIntensivePolling();
        }

        // Check if already complete (edge case)
        if (state.complete && !this.mitosisTriggered) {
          console.log('Token bonding curve already complete!');
          await this.triggerMitosis(1.0);
        }
      } catch (error) {
        console.error('Error in casual polling:', error);
        this.emit(MonitorEvent.ERROR, error);
      }
    }, config.monitoring.casualPollInterval);
  }

  /**
   * Phase 2: Intensive Polling (Market Cap >= $50k)
   * Polls bonding curve account every 200ms via Helius RPC
   */
  private transitionToIntensivePolling(): void {
    // Clear casual polling interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.currentPhase = MonitorPhase.INTENSIVE;
    redisClient.setPhase(MonitorPhase.INTENSIVE).catch(console.error);
    this.emit(MonitorEvent.PHASE_CHANGE, MonitorPhase.INTENSIVE);

    console.log(`Phase 2: Intensive polling (interval: ${config.monitoring.intensivePollInterval}ms)`);

    this.pollInterval = setInterval(async () => {
      if (!this.isRunning || !this.activeMint) return;

      try {
        const state = await fetchBondingCurveState(this.connection, this.activeMint);

        if (!state) {
          console.warn('Failed to fetch bonding curve state');
          return;
        }

        const progress = calculateBondingCurveProgress(state);
        const marketCap = estimateMarketCap(state);

        // Emit curve update event
        const updateEvent: CurveUpdateEvent = {
          event: WSEventType.CURVE_UPDATE,
          progress,
          marketCap,
          mint: this.activeMint.toBase58(),
          timestamp: Date.now()
        };
        this.emit(MonitorEvent.CURVE_UPDATE, updateEvent);

        console.log(`Progress: ${(progress * 100).toFixed(2)}% | Market Cap: $${marketCap.toFixed(2)}`);

        // Check if we've reached the mitosis threshold
        if (progress >= config.monitoring.bondingCurveThreshold && !this.mitosisTriggered) {
          console.log('🔴 MITOSIS IMMINENT! Triggering execution sequence...');
          await this.triggerMitosis(progress);
        }

        // Check if complete
        if (state.complete && !this.mitosisTriggered) {
          console.log('Bonding curve complete! Triggering mitosis...');
          await this.triggerMitosis(1.0);
        }
      } catch (error) {
        console.error('Error in intensive polling:', error);
        this.emit(MonitorEvent.ERROR, error);
      }
    }, config.monitoring.intensivePollInterval);
  }

  /**
   * Trigger mitosis event
   * @param progress Current bonding curve progress
   */
  private async triggerMitosis(progress: number): Promise<void> {
    if (this.mitosisTriggered || !this.activeMint) return;

    this.mitosisTriggered = true;
    this.currentPhase = MonitorPhase.EXECUTING;
    await redisClient.setPhase(MonitorPhase.EXECUTING);

    // Stop polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Emit mitosis imminent event
    const mitosisEvent: MitosisImminentEvent = {
      event: WSEventType.MITOSIS_IMMINENT,
      currentMint: this.activeMint.toBase58(),
      progress,
      timestamp: Date.now()
    };

    this.emit(MonitorEvent.MITOSIS_IMMINENT, mitosisEvent);
    console.log('🚨 MITOSIS EVENT TRIGGERED 🚨');
  }


  /**
   * Get current phase
   */
  public getCurrentPhase(): MonitorPhase {
    return this.currentPhase;
  }

  /**
   * Get active mint
   */
  public getActiveMint(): string | null {
    return this.activeMint?.toBase58() || null;
  }

  /**
   * Check if monitoring is active
   */
  public isActive(): boolean {
    return this.isRunning;
  }
}
