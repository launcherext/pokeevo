import WebSocket, { WebSocketServer } from 'ws';
import { config } from '../config';
import { WSEvent, WSEventType, CurveUpdateEvent, InitialStateEvent } from '../types';
import { redisClient } from '../utils/redis';

/**
 * WebSocket Stream Server
 * Broadcasts real-time events to connected frontend clients
 */
export class StreamServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Start WebSocket server
   */
  public start(): void {
    const port = config.websocket.port;

    this.wss = new WebSocketServer({ port });

    this.wss.on('listening', () => {
      console.log(`WebSocket server listening on port ${port}`);
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial connection confirmation
      this.sendToClient(ws, {
        event: WSEventType.HEARTBEAT,
        timestamp: Date.now()
      });

      // Send initial state immediately when client connects
      this.sendInitialStateToClient(ws);
    });

    // Start heartbeat
    this.startHeartbeat();

    console.log('WebSocket server started successfully');
  }

  /**
   * Stop WebSocket server
   */
  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach(client => {
      client.close();
    });

    if (this.wss) {
      this.wss.close();
    }

    console.log('WebSocket server stopped');
  }

  /**
   * Broadcast event to all connected clients
   */
  public broadcast(event: WSEvent): void {
    const message = JSON.stringify(event);
    let sentCount = 0;

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sentCount++;
      }
    });

    console.log(`Broadcasted ${event.event} to ${sentCount} clients`);
  }

  /**
   * Send event to specific client
   */
  private sendToClient(client: WebSocket, event: WSEvent): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  }

  /**
   * Send initial state to a newly connected client
   */
  private async sendInitialStateToClient(client: WebSocket): Promise<void> {
    try {
      const activeMint = await redisClient.getActiveMint();
      const generation = await redisClient.getGeneration();
      
      if (activeMint) {
        // Send initial curve update with current state
        const initialState: CurveUpdateEvent = {
          event: WSEventType.CURVE_UPDATE,
          progress: 0, // Will be updated on next poll
          marketCap: 0, // Will be updated on next poll
          mint: activeMint,
          timestamp: Date.now()
        };
        this.sendToClient(client, initialState);
        
        // Also send initial state event with generation
        const initialStateEvent: InitialStateEvent = {
          event: 'initial_state',
          mint: activeMint,
          generation,
          timestamp: Date.now()
        };
        setTimeout(() => {
          this.sendToClient(client, initialStateEvent);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to send initial state to client:', error);
    }
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const heartbeat: WSEvent = {
        event: WSEventType.HEARTBEAT,
        timestamp: Date.now()
      };
      this.broadcast(heartbeat);
    }, 30000); // Every 30 seconds
  }

  /**
   * Get number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }
}

// Export singleton instance
export const streamServer = new StreamServer();
