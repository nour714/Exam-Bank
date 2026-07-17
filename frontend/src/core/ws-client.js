import { eventBus } from './event-bus.js';
import { store } from './state-store.js';

/**
 * WebSocket Client.
 * Connects to the backend WebSocket Gateway and bridges events into
 * the frontend EventBus so components remain transport-agnostic.
 */
class WSClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
  }

  /**
   * Connect to the WebSocket server.
   * @param {string} url - e.g., 'ws://localhost:3000'
   */
  connect(url) {
    const user = store.get('user');
    const tenant = store.get('tenant');

    if (!user || !tenant) {
      console.warn('[WS] Cannot connect: no user or tenant in store.');
      return;
    }

    // In production: this.socket = io(url, { auth: { userId, tenantId, token } });
    // For now, we use native WebSocket as a placeholder.
    try {
      this.socket = new WebSocket(url);
    } catch {
      console.warn('[WS] WebSocket not available in this environment.');
      return;
    }

    this.socket.onopen = () => {
      console.log('[WS] Connected.');
      this.reconnectAttempts = 0;
      eventBus.emit('ws:connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        // Bridge all server events directly to the frontend EventBus
        eventBus.emit(`ws:${type}`, data);
      } catch {
        console.warn('[WS] Unparseable message:', event.data);
      }
    };

    this.socket.onclose = () => {
      console.warn('[WS] Disconnected.');
      eventBus.emit('ws:disconnected');
      this._reconnect(url);
    };

    this.socket.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }

  /**
   * Auto-reconnect with exponential backoff.
   * @private
   */
  _reconnect(url) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached.');
      eventBus.emit('ws:reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

    setTimeout(() => this.connect(url), delay);
  }

  /**
   * Send a message to the server.
   */
  send(type, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }

  /**
   * Join a room (for Socket.IO compatibility, this would call socket.emit('join_room', room)).
   */
  joinRoom(room) {
    this.send('join_room', { room });
  }

  /**
   * Disconnect.
   */
  disconnect() {
    if (this.socket) {
      this.maxReconnectAttempts = 0; // Prevent auto-reconnect
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsClient = new WSClient();
