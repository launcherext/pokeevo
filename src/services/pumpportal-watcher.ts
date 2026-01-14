import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { config } from '../config';

const PUMPPORTAL_WS_URL = 'wss://pumpportal.fun/api/data';

/**
 * PumpPortal WebSocket message types
 */
interface PumpPortalTradeMessage {
  signature: string;
  mint: string;
  traderPublicKey: string;
  txType: 'buy' | 'sell' | 'create';
  tokenAmount: number;
  solAmount: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;
  name?: string;
  symbol?: string;
  uri?: string;
  pool?: string;
}

/**
 * PumpPortal Watcher Events
 */
export enum PumpPortalEvent {
  TOKEN_CREATED = 'token_created',
  TRADE_UPDATE = 'trade_update',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/**
 * Token Trade Update Data (real-time bonding curve updates)
 */
export interface TokenTradeData {
  mint: string;
  txType: 'buy' | 'sell';
  signature: string;
  trader: string;
  tokenAmount: number;
  solAmount: number;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;
  timestamp: number;
}

/**
 * Token Created Event Data
 */
export interface TokenCreatedData {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  creator: string;
  signature: string;
  timestamp: number;
}

/**
 * PumpPortal Watcher Service
 * Monitors deployer wallet for new token creations on Pump.fun
 */
export class PumpPortalWatcher extends EventEmitter {
  private ws: WebSocket | null = null;
  private deployerAddress: string;
  private isRunning: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscribed: boolean = false;
  private subscribedTokens: Set<string> = new Set(); // Tokens we're monitoring for trades

  constructor() {
    super();
    this.deployerAddress = config.deployer.publicKey.toBase58();
    console.log(`PumpPortal Watcher initialized for deployer: ${this.deployerAddress}`);
  }

  /**
   * Start the watcher service
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('PumpPortal watcher already running');
      return;
    }

    this.isRunning = true;
    this.connect();
  }

  /**
   * Stop the watcher service
   */
  public stop(): void {
    this.isRunning = false;
    this.subscribed = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('PumpPortal watcher stopped');
  }

  /**
   * Connect to PumpPortal WebSocket
   */
  private connect(): void {
    if (!this.isRunning) return;

    console.log(`Connecting to PumpPortal WebSocket: ${PUMPPORTAL_WS_URL}`);

    try {
      this.ws = new WebSocket(PUMPPORTAL_WS_URL);

      this.ws.on('open', () => {
        console.log('PumpPortal WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit(PumpPortalEvent.CONNECTED);
        this.subscribe();
        this.startHeartbeat();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', () => {
        console.log('PumpPortal WebSocket disconnected');
        this.subscribed = false;
        this.emit(PumpPortalEvent.DISCONNECTED);
        this.scheduleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        console.error('PumpPortal WebSocket error:', error.message);
        this.emit(PumpPortalEvent.ERROR, error);
      });

    } catch (error) {
      console.error('Failed to create PumpPortal WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Subscribe to deployer account trades
   */
  private subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot subscribe: WebSocket not open');
      return;
    }

    // Subscribe to deployer account trades to detect token creation
    const subscribeMessage = {
      method: 'subscribeAccountTrade',
      keys: [this.deployerAddress]
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    console.log(`Subscribed to account trades for: ${this.deployerAddress}`);
    this.subscribed = true;

    // Also subscribe to new tokens as backup detection method
    const subscribeNewTokens = {
      method: 'subscribeNewToken'
    };

    this.ws.send(JSON.stringify(subscribeNewTokens));
    console.log('Subscribed to new token events');

    // Resubscribe to any tokens we were monitoring before disconnect
    this.resubscribeTokens();
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle different message types
      if (message.txType === 'create') {
        // Token creation detected
        this.handleTokenCreation(message as PumpPortalTradeMessage);
      } else if (message.traderPublicKey === this.deployerAddress) {
        // Any trade by deployer - check if it's a creation
        if (message.txType === 'create' || (message.name && message.symbol && !message.pool)) {
          this.handleTokenCreation(message as PumpPortalTradeMessage);
        }
      }

      // Also check newToken events where creator matches deployer
      if (message.creator && message.creator === this.deployerAddress) {
        this.handleTokenCreation(message as PumpPortalTradeMessage);
      }

      // Handle trade updates for subscribed tokens (real-time monitoring)
      if (message.mint && this.subscribedTokens.has(message.mint)) {
        if (message.txType === 'buy' || message.txType === 'sell') {
          this.handleTradeUpdate(message as PumpPortalTradeMessage);
        }
      }

    } catch (error) {
      // Ignore parse errors for non-JSON messages (like pings)
    }
  }

  /**
   * Handle trade update for monitored token
   */
  private handleTradeUpdate(message: PumpPortalTradeMessage): void {
    const tradeData: TokenTradeData = {
      mint: message.mint,
      txType: message.txType as 'buy' | 'sell',
      signature: message.signature,
      trader: message.traderPublicKey,
      tokenAmount: message.tokenAmount,
      solAmount: message.solAmount,
      vTokensInBondingCurve: message.vTokensInBondingCurve,
      vSolInBondingCurve: message.vSolInBondingCurve,
      marketCapSol: message.marketCapSol,
      timestamp: Date.now()
    };

    this.emit(PumpPortalEvent.TRADE_UPDATE, tradeData);
  }

  /**
   * Handle token creation event
   */
  private handleTokenCreation(message: PumpPortalTradeMessage): void {
    // Verify this is from our deployer
    if (message.traderPublicKey !== this.deployerAddress) {
      return;
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('NEW TOKEN CREATED BY DEPLOYER!');
    console.log('='.repeat(60));
    console.log(`Mint: ${message.mint}`);
    console.log(`Name: ${message.name || 'Unknown'}`);
    console.log(`Symbol: ${message.symbol || 'Unknown'}`);
    console.log(`Signature: ${message.signature}`);
    console.log('='.repeat(60));
    console.log('');

    const tokenData: TokenCreatedData = {
      mint: message.mint,
      name: message.name || 'Unknown',
      symbol: message.symbol || 'Unknown',
      uri: message.uri || '',
      creator: message.traderPublicKey,
      signature: message.signature,
      timestamp: Date.now()
    };

    this.emit(PumpPortalEvent.TOKEN_CREATED, tokenData);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (!this.isRunning) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Stopping PumpPortal watcher.');
      this.isRunning = false;
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Reconnecting to PumpPortal in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Re-subscribe periodically to ensure subscription is active
        if (this.subscribed) {
          const pingMessage = {
            method: 'subscribeAccountTrade',
            keys: [this.deployerAddress]
          };
          this.ws.send(JSON.stringify(pingMessage));
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Check if watcher is connected and subscribed
   */
  public isConnected(): boolean {
    return this.ws !== null &&
           this.ws.readyState === WebSocket.OPEN &&
           this.subscribed;
  }

  /**
   * Get deployer address being watched
   */
  public getDeployerAddress(): string {
    return this.deployerAddress;
  }

  /**
   * Subscribe to trades for a specific token (real-time monitoring)
   * @param mint Token mint address
   */
  public subscribeToToken(mint: string): void {
    if (this.subscribedTokens.has(mint)) {
      console.log(`Already subscribed to token: ${mint}`);
      return;
    }

    this.subscribedTokens.add(mint);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        method: 'subscribeTokenTrade',
        keys: [mint]
      };
      this.ws.send(JSON.stringify(subscribeMessage));
      console.log(`Subscribed to token trades: ${mint}`);
    } else {
      console.log(`Token ${mint} queued for subscription (WebSocket not connected)`);
    }
  }

  /**
   * Unsubscribe from trades for a specific token
   * @param mint Token mint address
   */
  public unsubscribeFromToken(mint: string): void {
    if (!this.subscribedTokens.has(mint)) {
      return;
    }

    this.subscribedTokens.delete(mint);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = {
        method: 'unsubscribeTokenTrade',
        keys: [mint]
      };
      this.ws.send(JSON.stringify(unsubscribeMessage));
      console.log(`Unsubscribed from token trades: ${mint}`);
    }
  }

  /**
   * Get list of tokens currently subscribed to
   */
  public getSubscribedTokens(): string[] {
    return Array.from(this.subscribedTokens);
  }

  /**
   * Resubscribe to all tracked tokens (after reconnect)
   */
  private resubscribeTokens(): void {
    if (this.subscribedTokens.size === 0) return;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const tokens = Array.from(this.subscribedTokens);
      const subscribeMessage = {
        method: 'subscribeTokenTrade',
        keys: tokens
      };
      this.ws.send(JSON.stringify(subscribeMessage));
      console.log(`Resubscribed to ${tokens.length} token(s) after reconnect`);
    }
  }
}

// Export singleton instance
export const pumpPortalWatcher = new PumpPortalWatcher();
