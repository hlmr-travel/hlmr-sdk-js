/**
 * Types for WebSocket events module
 */

/**
 * Subscription filter options
 */
export interface SubscriptionFilters {
  /** Filter by specific chat IDs (for chat domain) */
  chat_ids?: string[];
  /** Filter by specific trip IDs (for trip domain) */
  trip_ids?: string[];
  /** Filter by specific user IDs (for user domain) */
  user_ids?: string[];
  /** Filter by specific event types (e.g., ["created", "updated"]) */
  events?: string[];
}

/**
 * Options for creating a subscription
 */
export interface SubscriptionOptions {
  /** Filters to apply to the subscription */
  filters?: SubscriptionFilters;
  /** Whether to include full data in notifications (default: false) */
  include_data?: boolean;
}

/**
 * Represents an active subscription
 */
export interface Subscription {
  /** Unique subscription ID */
  id: string;
  /** Domain (e.g., "chat", "trip") */
  domain: string;
  /** Resource type (e.g., "message", "itinerary") */
  resource: string;
  /** Applied filters */
  filters: SubscriptionFilters;
}

/**
 * Event notification received via WebSocket
 */
export interface EventNotification {
  /** Type is always "notification" */
  type: 'notification';
  /** The subscription that matched this event */
  subscription_id: string;
  /** Domain (e.g., "chat", "trip") */
  domain: string;
  /** Resource type (e.g., "message", "itinerary") */
  resource: string;
  /** Event type (e.g., "created", "updated", "deleted") */
  event: string;
  /** Resource ID */
  resource_id: string;
  /** Chat ID (if applicable) */
  chat_id?: string;
  /** Trip ID (if applicable) */
  trip_id?: string;
  /** User ID (if applicable) */
  user_id?: string;
  /** Event timestamp */
  timestamp: string;
  /** Additional data (if include_data was true) */
  [key: string]: any;
}

/**
 * System notification (always delivered to all connected users)
 */
export interface SystemNotification {
  /** Type is always "system_notification" */
  type: 'system_notification';
  /** Event name (e.g., "token.refresh", "app.update") */
  event: string;
  /** Domain (always "system") */
  domain: 'system';
  /** Resource type */
  resource: string;
  /** Action to take (e.g., "refresh_token", "update_app") */
  action?: string;
  /** Optional message */
  message?: string;
  /** Additional data */
  [key: string]: any;
}

/**
 * Connected message received after successful WebSocket connection
 */
export interface ConnectedMessage {
  type: 'connected';
  user_id: string;
  message: string;
  system_subscriptions: string[];
}

/**
 * Subscription confirmed message
 */
export interface SubscriptionConfirmedMessage {
  type: 'subscription_confirmed';
  subscription_id: string;
  domain: string;
  resource: string;
  filters: SubscriptionFilters;
}

/**
 * Unsubscribed message
 */
export interface UnsubscribedMessage {
  type: 'unsubscribed';
  subscription_id: string;
}

/**
 * Pong message (response to ping)
 */
export interface PongMessage {
  type: 'pong';
}

/**
 * Error message
 */
export interface ErrorMessage {
  type: 'error';
  message: string;
  code: number;
}

/**
 * All possible WebSocket messages from server
 */
export type WebSocketMessage =
  | ConnectedMessage
  | SubscriptionConfirmedMessage
  | UnsubscribedMessage
  | EventNotification
  | SystemNotification
  | PongMessage
  | ErrorMessage;

/**
 * Events emitted by the EventsModule
 */
export interface EventsModuleEvents {
  /** Emitted when WebSocket connects */
  connect: (message: ConnectedMessage) => void;
  /** Emitted when WebSocket disconnects */
  disconnect: (reason?: string) => void;
  /** Emitted when an event notification is received */
  notification: (notification: EventNotification) => void;
  /** Emitted when a system notification is received */
  system_notification: (notification: SystemNotification) => void;
  /** Emitted when an error occurs */
  error: (error: ErrorMessage | Error) => void;
  /** Emitted when a subscription is confirmed */
  subscription_confirmed: (subscription: SubscriptionConfirmedMessage) => void;
  /** Emitted when reconnecting */
  reconnecting: (attempt: number) => void;
}

/**
 * Configuration options for EventsModule
 */
export interface EventsModuleConfig {
  /** 
   * Auto-ping interval in milliseconds (default: 30000 = 30 seconds)
   * Set to 0 to disable auto-ping
   */
  pingInterval?: number;
  /** 
   * Auto-reconnect on disconnect (default: true)
   */
  autoReconnect?: boolean;
  /**
   * Maximum reconnection attempts (default: 5)
   */
  maxReconnectAttempts?: number;
  /**
   * Reconnection delay in milliseconds (default: 1000)
   * Doubles after each failed attempt up to maxReconnectDelay
   */
  reconnectDelay?: number;
  /**
   * Maximum reconnection delay in milliseconds (default: 30000)
   */
  maxReconnectDelay?: number;
  /**
   * Enable debug logging (default: false)
   */
  debug?: boolean;
}
