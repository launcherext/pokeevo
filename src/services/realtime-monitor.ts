import { EventEmitter } from 'events';
import { Connection, PublicKey } from '@solana/web3.js';
import { config } from '../config';
import { redisClient } from '../utils/redis';
import { pumpPortalWatcher, PumpPortalEvent, TokenTradeData } from './pumpportal-watcher';
import { getSolPriceUsd, initSolPriceService } from './sol-price';
import { fetchBondingCurveState, calculateBondingCurveProgress, estimateMarketCap } from '../utils/pump';
import {
  MonitorPhase,
  WSEventType,
  CurveUpdateEvent,
  MitosisImminentEvent
} from '../types';

/**
 * Realtime Monitor Events
 */
export enum RealtimeMonitorEvent {
  CURVE_UPDATE = 'curve_update',
  MITOSIS_IMMINENT = 'mitosis_imminent',
  PHASE_CHANGE = 'phase_change',
  ERROR = 'error'
}

// Bonding curve constants (same as pump.ts)
const INITIAL_VIRTUAL_SOL = 30;
const TARGET_VIRTUAL_SOL = 85;

/**
 * Pokechain Realtime Monitor Service
 * Uses PumpPortal trade stream for instant evolution tracking
 */
export class RealtimeMonitorService extends EventEmitter {
  private connection: Connection;
  private activeMint: PublicKey | null = null;
  private currentPhase: MonitorPhase = MonitorPhase.STOPPED;
  private isRunning: boolean = false;
  private mitosisTriggered: boolean = false;
  private lastTradeUpdate: number = 0;
  private fallbackInterval: NodeJS.Timeout | null = null;

  // Track last known state for fallback
  private lastKnownProgress: number = 0;
  private lastKnownMarketCap: number = 0;

  constructor() {
    super();
    this.connection = new Connection(config.helius.rpcUrl, {
      commitment: 'confirmed',
      wsEndpoint: config.helius.wsUrl
    });

    // Listen for trade updates from PumpPortal
    pumpPortalWatcher.on(PumpPortalEvent.TRADE_UPDATE, (data: TokenTradeData) => {
      this.handleTradeUpdate(data);
    });

    // Handle PumpPortal disconnections
    pumpPortalWatcher.on(PumpPortalEvent.DISCONNECTED, () => {
      console.log('📡 Lost connection to Pokemon trades, using backup...');
      this.startFallbackPolling();
    });

    pumpPortalWatcher.on(PumpPortalEvent.CONNECTED, () => {
      console.log('📡 Reconnected to Pokemon trades!');
      this.stopFallbackPolling();
    });
  }

  /**
   * Start monitoring a token in realtime
   */
  public async start(mint: string): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Already watching a Pokemon!');
      return;
    }

    try {
      // Initialize SOL price service
      await initSolPriceService();

      this.activeMint = new PublicKey(mint);
      this.isRunning = true;
      this.mitosisTriggered = false;
      this.currentPhase = MonitorPhase.CASUAL;

      console.log(`👀 Now watching Pokemon: ${mint.slice(0, 8)}...`);
      await redisClient.setPhase(MonitorPhase.CASUAL);

      // Subscribe to token trades on PumpPortal
      pumpPortalWatcher.subscribeToToken(mint);

      // Do an initial fetch to get current state
      await this.fetchAndEmitCurrentState();

      // Start fallback polling in case PumpPortal is slow
      this.startFallbackPolling();

    } catch (error) {
      console.error('💥 Failed to start watching:', error);
      this.emit(RealtimeMonitorEvent.ERROR, error);
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  public async stop(): Promise<void> {
    console.log('⏹️ Stopping Pokemon watch...');
    this.isRunning = false;

    if (this.activeMint) {
      pumpPortalWatcher.unsubscribeFromToken(this.activeMint.toBase58());
    }

    this.stopFallbackPolling();
    this.currentPhase = MonitorPhase.STOPPED;
    await redisClient.setPhase(MonitorPhase.STOPPED);

    console.log('✅ Pokemon watch stopped');
  }

  /**
   * Handle realtime trade update from PumpPortal
   */
  private async handleTradeUpdate(data: TokenTradeData): Promise<void> {
    if (!this.isRunning || !this.activeMint) return;
    if (data.mint !== this.activeMint.toBase58()) return;

    this.lastTradeUpdate = Date.now();

    try {
      // Calculate progress from virtual SOL reserves
      const vSolInSol = data.vSolInBondingCurve / 1e9;
      const progress = this.calculateProgress(vSolInSol);

      // Get real-time SOL price for USD conversion
      const solPrice = await getSolPriceUsd();
      const marketCapUsd = data.marketCapSol * solPrice;

      // Store for fallback
      this.lastKnownProgress = progress;
      this.lastKnownMarketCap = marketCapUsd;

      // Emit curve update
      const updateEvent: CurveUpdateEvent = {
        event: WSEventType.CURVE_UPDATE,
        progress,
        marketCap: marketCapUsd,
        mint: data.mint,
        timestamp: Date.now()
      };
      this.emit(RealtimeMonitorEvent.CURVE_UPDATE, updateEvent);

      // Log with Pokemon themed trade info
      const emoji = data.txType === 'buy' ? '🟢 TRAINER CAUGHT' : '🔴 TRAINER RELEASED';
      const pct = (progress * 100).toFixed(1);
      const xpBar = this.getXpBar(progress);
      console.log(`${emoji} | ${xpBar} ${pct}% | $${marketCapUsd.toLocaleString()}`);

      // Check phase transitions
      await this.checkPhaseTransitions(progress, marketCapUsd);

    } catch (error) {
      console.error('💥 Error handling trade:', error);
    }
  }

  /**
   * Generate XP bar visual
   */
  private getXpBar(progress: number): string {
    const filled = Math.floor(progress * 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Calculate bonding curve progress from virtual SOL reserves
   */
  private calculateProgress(virtualSolReserves: number): number {
    const vSol = virtualSolReserves > 1000 ? virtualSolReserves / 1e9 : virtualSolReserves;
    const progress = (vSol - INITIAL_VIRTUAL_SOL) / (TARGET_VIRTUAL_SOL - INITIAL_VIRTUAL_SOL);
    return Math.max(0, Math.min(1, progress));
  }

  /**
   * Check and handle phase transitions
   */
  private async checkPhaseTransitions(progress: number, marketCapUsd: number): Promise<void> {
    // Transition to intensive at market cap threshold
    if (this.currentPhase === MonitorPhase.CASUAL && marketCapUsd >= config.monitoring.marketCapThreshold) {
      console.log('');
      console.log('⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡');
      console.log(`🔥 POKEMON IS GETTING STRONGER! $${marketCapUsd.toLocaleString()}`);
      console.log('⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡');
      console.log('');
      this.currentPhase = MonitorPhase.INTENSIVE;
      await redisClient.setPhase(MonitorPhase.INTENSIVE);
      this.emit(RealtimeMonitorEvent.PHASE_CHANGE, MonitorPhase.INTENSIVE);
    }

    // Trigger evolution at bonding curve threshold
    if (progress >= config.monitoring.bondingCurveThreshold && !this.mitosisTriggered) {
      console.log('');
      console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');
      console.log(`⚡ EVOLUTION THRESHOLD REACHED! ${(progress * 100).toFixed(1)}% ⚡`);
      console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');
      console.log('');
      await this.triggerMitosis(progress);
    }
  }

  /**
   * Trigger evolution event
   */
  private async triggerMitosis(progress: number): Promise<void> {
    if (this.mitosisTriggered || !this.activeMint) return;

    this.mitosisTriggered = true;
    this.currentPhase = MonitorPhase.EXECUTING;
    await redisClient.setPhase(MonitorPhase.EXECUTING);

    // Stop fallback polling during execution
    this.stopFallbackPolling();

    const mitosisEvent: MitosisImminentEvent = {
      event: WSEventType.MITOSIS_IMMINENT,
      currentMint: this.activeMint.toBase58(),
      progress,
      timestamp: Date.now()
    };

    this.emit(RealtimeMonitorEvent.MITOSIS_IMMINENT, mitosisEvent);
    console.log('🎮 EVOLUTION SEQUENCE INITIATED!');
  }

  /**
   * Fetch current state via RPC (for initial load and fallback)
   */
  private async fetchAndEmitCurrentState(): Promise<void> {
    if (!this.activeMint) return;

    try {
      const state = await fetchBondingCurveState(this.connection, this.activeMint);
      if (!state) {
        console.warn('⚠️ Could not find Pokemon data');
        return;
      }

      const progress = calculateBondingCurveProgress(state);
      const solPrice = await getSolPriceUsd();

      // Calculate market cap properly using SOL price
      const marketCapSol = estimateMarketCap(state, 1);
      const marketCapUsd = marketCapSol * solPrice;

      this.lastKnownProgress = progress;
      this.lastKnownMarketCap = marketCapUsd;

      const updateEvent: CurveUpdateEvent = {
        event: WSEventType.CURVE_UPDATE,
        progress,
        marketCap: marketCapUsd,
        mint: this.activeMint.toBase58(),
        timestamp: Date.now()
      };

      this.emit(RealtimeMonitorEvent.CURVE_UPDATE, updateEvent);

      const xpBar = this.getXpBar(progress);
      console.log(`📊 Pokemon Stats: ${xpBar} ${(progress * 100).toFixed(1)}% | $${marketCapUsd.toLocaleString()}`);

      // Check if we're already past thresholds
      await this.checkPhaseTransitions(progress, marketCapUsd);

      // Check if already complete
      if (state.complete && !this.mitosisTriggered) {
        console.log('🎓 Pokemon already graduated to Raydium!');
        await this.triggerMitosis(1.0);
      }

    } catch (error) {
      console.error('💥 Error fetching Pokemon state:', error);
    }
  }

  /**
   * Start fallback polling (reduced frequency backup)
   */
  private startFallbackPolling(): void {
    if (this.fallbackInterval) return;

    // Poll every 5 seconds as backup (only if no trade updates in 10s)
    this.fallbackInterval = setInterval(async () => {
      if (!this.isRunning) return;

      // Skip if we got a trade update recently
      const timeSinceLastTrade = Date.now() - this.lastTradeUpdate;
      if (timeSinceLastTrade < 10000) return;

      console.log('🔄 Checking Pokemon status...');
      await this.fetchAndEmitCurrentState();
    }, 5000);
  }

  /**
   * Stop fallback polling
   */
  private stopFallbackPolling(): void {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }

  /**
   * Switch to monitoring a new token
   */
  public async switchToken(newMint: string): Promise<void> {
    if (this.activeMint) {
      pumpPortalWatcher.unsubscribeFromToken(this.activeMint.toBase58());
    }

    this.activeMint = new PublicKey(newMint);
    this.mitosisTriggered = false;
    this.currentPhase = MonitorPhase.CASUAL;
    this.lastTradeUpdate = 0;

    await redisClient.setPhase(MonitorPhase.CASUAL);
    pumpPortalWatcher.subscribeToToken(newMint);

    console.log(`🔄 Now watching new Pokemon: ${newMint.slice(0, 8)}...`);
    await this.fetchAndEmitCurrentState();
  }

  // Getters
  public getCurrentPhase(): MonitorPhase {
    return this.currentPhase;
  }

  public getActiveMint(): string | null {
    return this.activeMint?.toBase58() || null;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getLastKnownState(): { progress: number; marketCap: number } {
    return {
      progress: this.lastKnownProgress,
      marketCap: this.lastKnownMarketCap
    };
  }
}
