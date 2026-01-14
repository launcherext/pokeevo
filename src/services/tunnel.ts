import { spawn, ChildProcess } from 'child_process';
import { config } from '../config';

/**
 * Tunnel Service
 * Automatically starts a localtunnel to expose the WebSocket server
 * for production frontend (Vercel) to connect to
 */
class TunnelService {
  private tunnelProcess: ChildProcess | null = null;
  private tunnelUrl: string | null = null;
  private isRunning: boolean = false;

  /**
   * Start the tunnel
   */
  public async start(): Promise<string | null> {
    if (this.isRunning) {
      console.log('Tunnel already running');
      return this.tunnelUrl;
    }

    const port = config.websocket.port;
    const subdomain = 'chain-reaction-ws';

    return new Promise((resolve) => {
      console.log(`Starting tunnel for port ${port}...`);

      // Use npx to run localtunnel
      this.tunnelProcess = spawn('npx', ['localtunnel', '--port', port.toString(), '--subdomain', subdomain], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.isRunning = true;
      let resolved = false;

      this.tunnelProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString().trim();
        console.log(`[Tunnel] ${output}`);

        // Parse the URL from localtunnel output
        const urlMatch = output.match(/your url is: (https?:\/\/[^\s]+)/i);
        if (urlMatch && !resolved) {
          this.tunnelUrl = urlMatch[1];
          // Convert https to wss for WebSocket
          const wsUrl = this.tunnelUrl.replace('https://', 'wss://').replace('http://', 'ws://');

          console.log('');
          console.log('═'.repeat(60));
          console.log('🚇 TUNNEL ACTIVE');
          console.log('═'.repeat(60));
          console.log(`HTTP URL: ${this.tunnelUrl}`);
          console.log(`WebSocket URL: ${wsUrl}`);
          console.log('');
          console.log('📋 Set this in Vercel Environment Variables:');
          console.log(`   NEXT_PUBLIC_WS_URL=${wsUrl}`);
          console.log('═'.repeat(60));
          console.log('');

          resolved = true;
          resolve(wsUrl);
        }
      });

      this.tunnelProcess.stderr?.on('data', (data: Buffer) => {
        const error = data.toString().trim();
        if (error && !error.includes('npm WARN')) {
          console.error(`[Tunnel Error] ${error}`);
        }
      });

      this.tunnelProcess.on('close', (code) => {
        console.log(`Tunnel process exited with code ${code}`);
        this.isRunning = false;
        this.tunnelUrl = null;

        if (!resolved) {
          resolve(null);
        }
      });

      this.tunnelProcess.on('error', (error) => {
        console.error('Failed to start tunnel:', error.message);
        this.isRunning = false;
        if (!resolved) {
          resolve(null);
        }
      });

      // Timeout after 30 seconds if no URL received
      setTimeout(() => {
        if (!resolved) {
          console.warn('Tunnel startup timed out - continuing without tunnel');
          resolved = true;
          resolve(null);
        }
      }, 30000);
    });
  }

  /**
   * Stop the tunnel
   */
  public stop(): void {
    if (this.tunnelProcess) {
      console.log('Stopping tunnel...');
      this.tunnelProcess.kill();
      this.tunnelProcess = null;
      this.isRunning = false;
      this.tunnelUrl = null;
    }
  }

  /**
   * Get current tunnel URL
   */
  public getUrl(): string | null {
    return this.tunnelUrl;
  }

  /**
   * Check if tunnel is active
   */
  public isActive(): boolean {
    return this.isRunning && this.tunnelUrl !== null;
  }
}

export const tunnelService = new TunnelService();
