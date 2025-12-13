/**
 * Events Module - Real-time WebSocket event subscriptions
 * 
 * Provides:
 * - WebSocket connection management with auto-reconnect
 * - Subscription-based event filtering (domain/resource/filters)
 * - Automatic ping/pong for keep-alive
 * - System notification handling
 * 
 * Usage:
 * ```typescript
 * const client = new HlmrClient({ appId: 'my-app', bearerToken: '...' });
 * 
 * // Connect to events
 * await client.events.connect();
 * 
 * // Subscribe to chat messages
 * const sub = await client.events.subscribe('chat', 'message', {
 *   filters: { chat_ids: ['chat-123'] }
 * });
 * 
 * // Listen for notifications
 * client.events.on('notification', (notification) => {
 *   console.log('New event:', notification);
 * });
 * 
 * // Disconnect when done
 * client.events.disconnect();
 * ```
 */

import type { HttpClient } from '../utils/http';
import type {
  Subscription,
  SubscriptionOptions,
  SubscriptionFilters,
  EventNotification,
  SystemNotification,
  ConnectedMessage,
  SubscriptionConfirmedMessage,
  UnsubscribedMessage,
  ErrorMessage,
  WebSocketMessage,
  EventsModuleConfig,
  EventsModuleEvents
} from '../types/events';

// Default configuration
const DEFAULT_CONFIG: Required<EventsModuleConfig> = {
  pingInterval: 30000,      // 30 seconds
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,     // 1 second
  maxReconnectDelay: 30000, // 30 seconds
  debug: false
};

type EventCallback<K extends keyof EventsModuleEvents> = EventsModuleEvents[K];

/**
 * Events Module for real-time WebSocket notifications
 */
export class EventsModule {
  private http: HttpClient;
  private config: Required<EventsModuleConfig>;
  private ws: WebSocket | null = null;
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private isManualDisconnect = false;
  
  // Subscriptions tracking for reconnection
  private subscriptions: Map<string, { domain: string; resource: string; options?: SubscriptionOptions }> = new Map();
  private pendingSubscriptions: Map<string, { 
    resolve: (sub: Subscription) => void; 
    reject: (err: Error) => void;
    domain: string;
    resource: string;
    options?: SubscriptionOptions;
  }> = new Map();
  
  // Event listeners
  private listeners: Map<keyof EventsModuleEvents, Set<Function>> = new Map();
  
  // Connection state
  private userId: string | null = null;

  constructor(http: HttpClient, config?: EventsModuleConfig) {
    this.http = http;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Connect to the WebSocket events endpoint
   * 
   * @returns Promise that resolves when connected
   */
  async connect(): Promise<ConnectedMessage> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      throw new Error('Already connected');
    }

    if (this.isConnecting) {
      throw new Error('Connection in progress');
    }

    this.isConnecting = true;
    this.isManualDisconnect = false;
    this.reconnectAttempts = 0;

    return this._connect();
  }

  private async _connect(): Promise<ConnectedMessage> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this._buildWebSocketUrl();
        
        if (this.config.debug) {
          console.log('[EventsModule] Connecting to:', wsUrl);
        }

        this.ws = new WebSocket(wsUrl);

        // Connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          if (this.config.debug) {
            console.log('[EventsModule] WebSocket connected');
          }
          clearTimeout(connectionTimeout);
          this._startPingInterval();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this._handleMessage(message, resolve);
          } catch (err) {
            if (this.config.debug) {
              console.error('[EventsModule] Failed to parse message:', err);
            }
          }
        };

        this.ws.onerror = (error) => {
          if (this.config.debug) {
            console.error('[EventsModule] WebSocket error:', error);
          }
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this._emit('error', new Error('WebSocket error'));
        };

        this.ws.onclose = (event) => {
          if (this.config.debug) {
            console.log('[EventsModule] WebSocket closed:', event.code, event.reason);
          }
          clearTimeout(connectionTimeout);
          this._stopPingInterval();
          this.isConnecting = false;
          this._emit('disconnect', event.reason || 'Connection closed');

          // Handle reconnection
          if (!this.isManualDisconnect && this.config.autoReconnect) {
            this._scheduleReconnect();
          }
        };
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this._cleanup();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    if (this.config.debug) {
      console.log('[EventsModule] Disconnected');
    }
  }

  /**
   * Subscribe to events for a domain/resource
   * 
   * @param domain Domain to subscribe to (e.g., "chat", "trip")
   * @param resource Resource type (e.g., "message", "itinerary")
   * @param options Optional subscription options with filters
   * @returns Promise that resolves with the subscription
   */
  async subscribe(
    domain: string,
    resource: string,
    options?: SubscriptionOptions
  ): Promise<Subscription> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }

    const subscriptionId = this._generateId();

    return new Promise((resolve, reject) => {
      // Store pending subscription
      this.pendingSubscriptions.set(subscriptionId, {
        resolve: (sub) => {
          // Track for reconnection
          this.subscriptions.set(sub.id, { domain, resource, options });
          resolve(sub);
        },
        reject,
        domain,
        resource,
        options
      });

      // Send subscribe message
      const message = {
        type: 'subscribe',
        subscription_id: subscriptionId,
        domain,
        resource,
        options: {
          filters: options?.filters || {},
          include_data: options?.include_data || false
        }
      };

      this.ws!.send(JSON.stringify(message));

      if (this.config.debug) {
        console.log('[EventsModule] Subscribing:', message);
      }

      // Timeout for subscription confirmation
      setTimeout(() => {
        if (this.pendingSubscriptions.has(subscriptionId)) {
          this.pendingSubscriptions.delete(subscriptionId);
          reject(new Error('Subscription timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Unsubscribe from an active subscription
   * 
   * @param subscriptionId The subscription ID to unsubscribe
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      const message = {
        type: 'unsubscribe',
        subscription_id: subscriptionId
      };

      this.ws!.send(JSON.stringify(message));
      
      // Remove from tracked subscriptions
      this.subscriptions.delete(subscriptionId);

      if (this.config.debug) {
        console.log('[EventsModule] Unsubscribing:', subscriptionId);
      }

      // We don't wait for confirmation, just resolve
      resolve();
    });
  }

  /**
   * Add event listener
   * 
   * @param event Event name
   * @param callback Callback function
   */
  on<K extends keyof EventsModuleEvents>(
    event: K,
    callback: EventCallback<K>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   * 
   * @param event Event name
   * @param callback Callback function
   */
  off<K extends keyof EventsModuleEvents>(
    event: K,
    callback: EventCallback<K>
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current user ID (after connection)
   */
  get currentUserId(): string | null {
    return this.userId;
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): Map<string, { domain: string; resource: string; options?: SubscriptionOptions }> {
    return new Map(this.subscriptions);
  }

  /**
   * Send a manual ping
   */
  ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EventsModuleConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart ping interval if connected and interval changed
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this._stopPingInterval();
      this._startPingInterval();
    }
  }

  // Private methods

  private _buildWebSocketUrl(): string {
    // Get base URL from http client config
    const httpConfig = (this.http as any).config;
    const baseUrl = httpConfig.baseUrl;
    const bearerToken = httpConfig.bearerToken;
    
    // Convert HTTP URL to WebSocket URL
    const wsUrl = baseUrl
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    
    // Build WebSocket URL with token as query param (fallback auth method)
    const url = new URL(`${wsUrl}/v1/events/ws`);
    if (bearerToken) {
      url.searchParams.set('token', bearerToken);
    }
    
    return url.toString();
  }

  private _handleMessage(message: WebSocketMessage, connectResolve?: (msg: ConnectedMessage) => void): void {
    if (this.config.debug) {
      console.log('[EventsModule] Message received:', message);
    }

    switch (message.type) {
      case 'connected':
        this.isConnecting = false;
        this.userId = message.user_id;
        this._emit('connect', message);
        
        // Resolve connect promise
        if (connectResolve) {
          connectResolve(message);
        }
        
        // Re-subscribe to previous subscriptions after reconnection
        if (this.reconnectAttempts > 0) {
          this._resubscribeAll();
        }
        this.reconnectAttempts = 0;
        break;

      case 'subscription_confirmed':
        this._handleSubscriptionConfirmed(message);
        break;

      case 'unsubscribed':
        this.subscriptions.delete(message.subscription_id);
        break;

      case 'notification':
        this._emit('notification', message as EventNotification);
        break;

      case 'system_notification':
        this._emit('system_notification', message as SystemNotification);
        break;

      case 'pong':
        // Ping acknowledged, nothing to do
        break;

      case 'error':
        this._emit('error', message);
        break;

      default:
        if (this.config.debug) {
          console.warn('[EventsModule] Unknown message type:', (message as any).type);
        }
    }
  }

  private _handleSubscriptionConfirmed(message: SubscriptionConfirmedMessage): void {
    const pending = this.pendingSubscriptions.get(message.subscription_id);
    
    if (pending) {
      this.pendingSubscriptions.delete(message.subscription_id);
      
      const subscription: Subscription = {
        id: message.subscription_id,
        domain: message.domain,
        resource: message.resource,
        filters: message.filters
      };
      
      pending.resolve(subscription);
    }
    
    this._emit('subscription_confirmed', message);
  }

  private _emit<K extends keyof EventsModuleEvents>(
    event: K,
    ...args: Parameters<EventsModuleEvents[K]>
  ): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          (callback as Function)(...args);
        } catch (err) {
          console.error(`[EventsModule] Error in ${event} listener:`, err);
        }
      });
    }
  }

  private _startPingInterval(): void {
    if (this.config.pingInterval > 0) {
      this.pingIntervalId = setInterval(() => {
        this.ping();
      }, this.config.pingInterval);
      
      if (this.config.debug) {
        console.log('[EventsModule] Ping interval started:', this.config.pingInterval);
      }
    }
  }

  private _stopPingInterval(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      if (this.config.debug) {
        console.log('[EventsModule] Max reconnect attempts reached');
      }
      this._emit('error', new Error('Max reconnect attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );

    if (this.config.debug) {
      console.log(`[EventsModule] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    }
    
    this._emit('reconnecting', this.reconnectAttempts);

    this.reconnectTimeoutId = setTimeout(async () => {
      try {
        await this._connect();
      } catch (err) {
        if (this.config.debug) {
          console.error('[EventsModule] Reconnect failed:', err);
        }
        // onclose will trigger another reconnect attempt
      }
    }, delay);
  }

  private async _resubscribeAll(): Promise<void> {
    if (this.config.debug) {
      console.log('[EventsModule] Re-subscribing to', this.subscriptions.size, 'subscriptions');
    }

    const subscriptionsToRestore = new Map(this.subscriptions);
    this.subscriptions.clear();

    for (const [id, sub] of subscriptionsToRestore) {
      try {
        await this.subscribe(sub.domain, sub.resource, sub.options);
        if (this.config.debug) {
          console.log('[EventsModule] Re-subscribed:', sub.domain, sub.resource);
        }
      } catch (err) {
        if (this.config.debug) {
          console.error('[EventsModule] Failed to re-subscribe:', err);
        }
      }
    }
  }

  private _cleanup(): void {
    this._stopPingInterval();
    
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    // Reject all pending subscriptions
    for (const pending of this.pendingSubscriptions.values()) {
      pending.reject(new Error('Connection closed'));
    }
    this.pendingSubscriptions.clear();
  }

  private _generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

