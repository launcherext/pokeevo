import { config } from './config';
import { redisClient } from './utils/redis';
import { RealtimeMonitorService, RealtimeMonitorEvent } from './services/realtime-monitor';
import { SnapshotService } from './services/snapshot';
import { ExecutorService } from './services/executor';
import { DispenserService } from './services/dispenser';
import { pumpPortalWatcher, PumpPortalEvent, TokenCreatedData } from './services/pumpportal-watcher';
import { holderBroadcaster } from './services/holder-broadcaster';
import { streamServer } from './websocket/stream';
import { tunnelService } from './services/tunnel';
import { WSEventType, MitosisCompleteEvent, ErrorEvent, CurveUpdateEvent, TokenCreatedEvent } from './types';

/**
 * PIKACHUCHAIN Main Orchestrator
 * Coordinates all services and manages the Pichu → Pikachu → Raichu evolution lifecycle
 */
class PikachuChainBot {
  private monitorService: RealtimeMonitorService;
  private snapshotService: SnapshotService;
  private executorService: ExecutorService;
  private dispenserService: DispenserService;
  private isRunning: boolean = false;

  constructor() {
    this.monitorService = new RealtimeMonitorService();
    this.snapshotService = new SnapshotService();
    this.executorService = new ExecutorService();
    this.dispenserService = new DispenserService();

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for monitor service and PumpPortal watcher
   */
  private setupEventHandlers(): void {
    // Forward curve updates to WebSocket (realtime from PumpPortal trade stream)
    this.monitorService.on(RealtimeMonitorEvent.CURVE_UPDATE, (event) => {
      streamServer.broadcast(event);
    });

    // Handle mitosis imminent event
    this.monitorService.on(RealtimeMonitorEvent.MITOSIS_IMMINENT, async (event) => {
      streamServer.broadcast(event);
      await this.handleMitosis(event.currentMint);
    });

    // Handle errors
    this.monitorService.on(RealtimeMonitorEvent.ERROR, (error) => {
      console.error('Monitor error:', error);
      const errorEvent: ErrorEvent = {
        event: WSEventType.ERROR,
        error: error.message || 'Unknown error',
        timestamp: Date.now()
      };
      streamServer.broadcast(errorEvent);
    });

    // Handle new token creation by deployer (PumpPortal watcher)
    pumpPortalWatcher.on(PumpPortalEvent.TOKEN_CREATED, async (data: TokenCreatedData) => {
      console.log('');
      console.log('⚡'.repeat(30));
      console.log('🥚 A NEW POKEMON EGG HAS APPEARED! 🥚');
      console.log('⚡'.repeat(30));

      await this.handleNewTokenCreated(data);
    });

    pumpPortalWatcher.on(PumpPortalEvent.CONNECTED, () => {
      console.log('🔭 Professor Oak is watching for new Pokemon...');
    });

    pumpPortalWatcher.on(PumpPortalEvent.ERROR, (error: Error) => {
      console.error('💥 Pokemon Center connection error:', error.message);
    });
  }

  /**
   * Handle new token created by deployer
   */
  private async handleNewTokenCreated(data: TokenCreatedData): Promise<void> {
    try {
      // Update Redis with new token
      await redisClient.setActiveMint(data.mint);
      await redisClient.incrementGeneration();

      const generation = await redisClient.getGeneration();
      console.log(`🎯 New Pokemon registered: ${data.mint}`);
      console.log(`�Pokemon Evolution #${generation}`);

      // Broadcast token created event to frontend
      const tokenCreatedEvent: TokenCreatedEvent = {
        event: WSEventType.TOKEN_CREATED,
        mint: data.mint,
        name: data.name,
        symbol: data.symbol,
        creator: data.creator,
        signature: data.signature,
        timestamp: data.timestamp
      };
      streamServer.broadcast(tokenCreatedEvent);

      // Switch monitoring to new token (handles subscription changes internally)
      if (this.monitorService.isActive()) {
        console.log('🔄 Switching Pokemon...');
        await this.monitorService.switchToken(data.mint);
      } else {
        console.log('👀 Starting to watch Pokemon...');
        await this.monitorService.start(data.mint);
      }

      // Start holder broadcaster for new token
      holderBroadcaster.switchMint(data.mint);

      console.log('⚡'.repeat(30));
      console.log('🎮 NOW TRAINING THIS POKEMON! 🎮');
      console.log('⚡'.repeat(30));
      console.log('');
    } catch (error) {
      console.error('Failed to handle new token creation:', error);
      const errorEvent: ErrorEvent = {
        event: WSEventType.ERROR,
        error: error instanceof Error ? error.message : 'Failed to switch to new token',
        timestamp: Date.now()
      };
      streamServer.broadcast(errorEvent);
    }
  }

  /**
   * Send initial state to newly connected clients
   */
  private async sendInitialState(): Promise<void> {
    try {
      const activeMint = await redisClient.getActiveMint();

      if (activeMint) {
        // Get last known state from realtime monitor
        const lastState = this.monitorService.getLastKnownState();

        // Send initial curve update with current state
        const initialState: CurveUpdateEvent = {
          event: WSEventType.CURVE_UPDATE,
          progress: lastState.progress,
          marketCap: lastState.marketCap,
          mint: activeMint,
          timestamp: Date.now()
        };
        streamServer.broadcast(initialState);
      }
    } catch (error) {
      console.error('Failed to send initial state:', error);
    }
  }

  /**
   * Start the bot
   */
  public async start(): Promise<void> {
    console.log('');
    console.log('⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡');
    console.log('🎮 PIKACHUCHAIN - Pichu → Pikachu → Raichu! 🎮');
    console.log('⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡');
    console.log('');

    try {
      // Initialize Redis
      await redisClient.ensureConnected();
      console.log('✅ Pokemon Storage Box connected');

      // Initialize system state
      await redisClient.initializeSystem(config.genesisTokenMint);

      // Start WebSocket server
      streamServer.start();
      console.log('✅ PokeCenter online');

      // Start tunnel for Vercel frontend
      const tunnelUrl = await tunnelService.start();
      if (tunnelUrl) {
        console.log('✅ Pokemon League connection established');
      } else {
        console.log('⚠️ Local training mode only');
      }

      // Start PumpPortal watcher to detect new tokens from deployer
      pumpPortalWatcher.start();
      console.log('✅ Professor Oak is watching...');

      // Get active mint from Redis
      const activeMint = await redisClient.getActiveMint();

      // Send initial state to any connected clients
      await this.sendInitialState();

      if (!activeMint) {
        console.error('❌ No Pokemon found in party!');
        console.log('Please set GENESIS_TOKEN_MINT in .env to catch your first Pokemon.');
        return;
      }

      console.log(`🎯 Current Pokemon: ${activeMint}`);
      const generation = await redisClient.getGeneration();
      console.log(`�Pokemon Evolution Stage: #${generation}`);

      // Start monitoring
      await this.monitorService.start(activeMint);
      this.isRunning = true;

      // Start holder broadcaster for real-time leaderboard
      holderBroadcaster.start(activeMint);
      console.log('✅ Trainer Leaderboard active');

      console.log('');
      console.log('⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡');
      console.log('🚀 PIKACHUCHAIN ACTIVE - Watching for evolutions... 🚀');
      console.log('⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡');
      console.log('');
    } catch (error) {
      console.error('Failed to start bot:', error);
      throw error;
    }
  }

  /**
   * Handle evolution sequence
   */
  private async handleMitosis(currentMint: string): Promise<void> {
    console.log('');
    console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');
    console.log('⚡ WHAT? POKEMON IS EVOLVING! ⚡');
    console.log('🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟');
    console.log('');

    // Pause holder broadcasting during evolution
    holderBroadcaster.pause();

    try {
      // Step 1: Capture snapshot
      console.log('📸 Scanning trainers in the area...');
      const topHolders = await this.snapshotService.captureSnapshot(currentMint);

      if (topHolders.length === 0) {
        throw new Error('No trainers found!');
      }

      console.log(`✅ Found ${topHolders.length} trainers to reward!`);

      // Step 2: Execute Jito bundle (Claim + Create + Buy)
      console.log('🎯 Preparing evolution sequence...');
      const executionResult = await this.executorService.executeMitosis(currentMint, topHolders);

      if (!executionResult.success || !executionResult.newMint) {
        throw new Error(`Evolution failed: ${executionResult.bundleResult.error}`);
      }

      console.log(`✅ Evolution successful!`);
      console.log(`🆕 New Pokemon: ${executionResult.newMint}`);

      // Step 3: Distribute tokens to top holders
      console.log('🎁 Airdropping evolved Pokemon to trainers...');
      const airdropResults = await this.dispenserService.distributeToHolders(
        executionResult.newMint,
        topHolders,
        executionResult.snipedAmount
      );

      const successfulBatches = airdropResults.filter(r => r.success).length;
      console.log(`✅ Airdrop complete: ${successfulBatches}/${airdropResults.length} Pokeballs sent!`);

      // Step 4: Cleanup old token data
      console.log('🧹 Cleaning up Pokemon Center...');
      await this.snapshotService.clearSnapshot(currentMint);

      // Step 5: Switch to monitoring new token
      console.log('👀 Now watching new Pokemon...');
      await this.monitorService.switchToken(executionResult.newMint);

      // Step 5b: Restart holder broadcaster with new mint
      holderBroadcaster.switchMint(executionResult.newMint);

      // Step 6: Broadcast evolution complete event
      const generation = await redisClient.getGeneration();
      const completeEvent: MitosisCompleteEvent = {
        event: WSEventType.MITOSIS_COMPLETE,
        oldMint: currentMint,
        newMint: executionResult.newMint,
        signature: executionResult.bundleResult.signature || '',
        generation,
        timestamp: Date.now()
      };
      streamServer.broadcast(completeEvent);

      console.log('');
      console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
      console.log('✨ POKEMON EVOLVED SUCCESSFULLY! ✨');
      console.log('🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉');
      console.log('');
    } catch (error) {
      console.log('');
      console.error('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
      console.error('❌ EVOLUTION FAILED! Pokemon fainted! ❌');
      console.error('💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥');
      console.error(error);

      // Broadcast error
      const errorEvent: ErrorEvent = {
        event: WSEventType.ERROR,
        error: error instanceof Error ? error.message : 'Evolution failed',
        timestamp: Date.now()
      };
      streamServer.broadcast(errorEvent);

      // Attempt recovery
      console.log('🏥 Rushing to Pokemon Center...');
      try {
        await this.monitorService.stop();
        await this.monitorService.start(currentMint);
        console.log('✅ Pokemon healed! Back to training!');
      } catch (restartError) {
        console.error('💀 Critical failure:', restartError);
      }
    }
  }

  /**
   * Stop the bot
   */
  public async stop(): Promise<void> {
    console.log('👋 Saving game and returning to Pallet Town...');

    this.isRunning = false;
    await this.monitorService.stop();
    holderBroadcaster.stop();
    pumpPortalWatcher.stop();
    tunnelService.stop();
    streamServer.stop();
    await redisClient.disconnect();

    console.log('✅ Game saved! See you next time, trainer!');
  }

  /**
   * Check if bot is running
   */
  public checkStatus(): void {
    console.log('');
    console.log('📊 ══ PIKACHUCHAIN STATUS ══ 📊');
    console.log(`🎮 Running: ${this.isRunning ? 'Yes' : 'No'}`);
    console.log(`👀 Watching: ${this.monitorService.isActive() ? 'Yes' : 'No'}`);
    console.log(`📈 Phase: ${this.monitorService.getCurrentPhase()}`);
    console.log(`🎯 Pokemon: ${this.monitorService.getActiveMint() || 'None'}`);
    console.log(`🏆 Leaderboard: ${holderBroadcaster.isActive() ? 'Active' : 'Inactive'}`);
    console.log(`🔭 Prof. Oak: ${pumpPortalWatcher.isConnected() ? 'Connected' : 'Disconnected'}`);
    console.log(`👥 Trainers online: ${streamServer.getClientCount()}`);
    console.log('═'.repeat(30));
    console.log('');
  }
}

// Main execution
const bot = new PikachuChainBot();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the bot
bot.start().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});

// Status check every 60 seconds
setInterval(() => {
  bot.checkStatus();
}, 60000);
