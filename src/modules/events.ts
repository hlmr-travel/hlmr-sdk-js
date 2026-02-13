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
  private bearerToken: string | null = null;
  private authResolve: ((msg: ConnectedMessage) => void) | null = null;
  private authReject: ((err: Error) => void) | null = null;

  /**
   * Update the bearer token used for WebSocket authentication.
   * Called when Supabase auto-refreshes the JWT.
   * The new token will be used for the next reconnect.
   */
  setBearerToken(token: string | null): void {
    this.bearerToken = token;
  }

  constructor(http: HttpClient, config?: EventsModuleConfig) {
    this.http = http;
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Extract bearer token from http client config
    const httpConfig = (http as any).config;
    this.bearerToken = httpConfig.bearerToken || null;
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
        // Store resolve/reject for auth flow
        this.authResolve = resolve;
        this.authReject = reject;
        
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
            this.authResolve = null;
            this.authReject = null;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          if (this.config.debug) {
            console.log('[EventsModule] WebSocket connected, sending auth...');
          }
          clearTimeout(connectionTimeout);
          
          // Send authentication token as first message
          if (this.bearerToken) {
            const authMessage = {
              type: 'auth',
              token: this.bearerToken
            };
            this.ws!.send(JSON.stringify(authMessage));
            
            if (this.config.debug) {
              console.log('[EventsModule] Sent auth message');
            }
            
            // Start ping interval after auth (will be started after 'connected' message)
          } else {
            // No token, reject connection
            this.isConnecting = false;
            this.authResolve = null;
            this.authReject = null;
            this.ws!.close(1008, 'Missing authentication token');
            reject(new Error('Missing authentication token'));
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this._handleMessage(message);
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
          this.authResolve = null;
          this.authReject = null;
          this._emit('error', new Error('WebSocket error'));
          reject(new Error('WebSocket error'));
        };

        this.ws.onclose = (event) => {
          if (this.config.debug) {
            console.log('[EventsModule] WebSocket closed:', event.code, event.reason);
          }
          clearTimeout(connectionTimeout);
          this._stopPingInterval();
          this.isConnecting = false;
          
          // Reject pending auth if connection closed before authentication
          if (this.authReject) {
            this.authReject(new Error(event.reason || 'Connection closed before authentication'));
            this.authResolve = null;
            this.authReject = null;
          }
          
          this._emit('disconnect', event.reason || 'Connection closed');

          // Handle reconnection
          if (!this.isManualDisconnect && this.config.autoReconnect) {
            this._scheduleReconnect();
          }
        };
      } catch (err) {
        this.isConnecting = false;
        this.authResolve = null;
        this.authReject = null;
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
      // Build object without undefined options (for exactOptionalPropertyTypes)
      const subscriptionData = options 
        ? { domain, resource, options }
        : { domain, resource };
      
      const pendingData = {
        resolve: (sub: Subscription) => {
          // Track for reconnection
          this.subscriptions.set(sub.id, subscriptionData);
          resolve(sub);
        },
        reject,
        ...subscriptionData
      };
      
      this.pendingSubscriptions.set(subscriptionId, pendingData);

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
   * Send a typing event
   * 
   * @param chatId The chat ID
   * @param event "started" or "stopped"
   */
  sendTypingEvent(chatId: string, event: 'started' | 'stopped'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (this.config.debug) {
        console.warn('[EventsModule] Cannot send typing event: not connected');
      }
      return;
    }

    const message = {
      type: 'typing_event',
      chat_id: chatId,
      event: event
    };

    this.ws.send(JSON.stringify(message));

    if (this.config.debug) {
      console.log('[EventsModule] Sent typing event:', message);
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
    
    // Convert HTTP URL to WebSocket URL
    const wsUrl = baseUrl
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    
    // Build WebSocket URL without token (token will be sent as first message)
    return `${wsUrl}/v1/events/ws`;
  }

  private _handleMessage(message: WebSocketMessage): void {
    if (this.config.debug) {
      console.log('[EventsModule] Message received:', message);
    }

    switch (message.type) {
      case 'connected':
        this.isConnecting = false;
        this.userId = message.user_id;
        this._emit('connect', message);
        
        // Resolve connect promise (from auth flow)
        if (this.authResolve) {
          this.authResolve(message);
          this.authResolve = null;
          this.authReject = null;
        }
        
        // Start ping interval after successful connection
        this._startPingInterval();
        
        // Re-subscribe to previous subscriptions after reconnection
        if (this.reconnectAttempts > 0) {
          this._resubscribeAll();
        }
        this.reconnectAttempts = 0;
        break;
      
      case 'auth_error':
        // Authentication failed
        this.isConnecting = false;
        const error = (message as any).error || 'Authentication failed';
        if (this.authReject) {
          this.authReject(new Error(error));
          this.authResolve = null;
          this.authReject = null;
        }
        this.ws?.close(1008, error);
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

