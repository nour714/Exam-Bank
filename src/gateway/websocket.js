const { eventBus } = require('../shared/events');
const { configProvider } = require('../shared/config');

/**
 * WebSocket Gateway Abstraction.
 * 
 * Supports both user-specific pushes and Room-based broadcasting:
 * - Tenant Rooms: `tenant:{tenantId}`
 * - Study Group Rooms: `group:{groupId}`
 * - Exam Rooms: `exam:{examId}`
 * - Notification Rooms: `notifications:{userId}`
 * - Broadcast Rooms: `broadcast:global`
 */
class WebSocketGateway {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map<userId, Set<socketId>>
  }

  initialize(server) {
    // In production: this.io = new Server(server, { ... });
    console.log('[WebSocket Gateway] Initialized (Rooms Architecture)');
    // this.io.on('connection', (socket) => this._handleConnection(socket));
    this._setupEventSubscriptions();
  }

  _handleConnection(socket) {
    const userId = socket.handshake.auth?.userId;
    const tenantId = socket.handshake.auth?.tenantId;
    if (!userId || !tenantId) return socket.disconnect();

    // 1. Maintain user -> socket map for direct messaging
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);

    // 2. Automatically join default rooms
    socket.join(`tenant:${tenantId}`);
    socket.join(`notifications:${userId}`);
    socket.join(`broadcast:global`);

    // 3. Allow clients to explicitly join dynamic rooms (if authorized)
    socket.on('join_room', (room, callback) => {
      // Add authorization checks here (e.g., verifying user is in the study group)
      socket.join(room);
      if (callback) callback({ success: true, room });
    });

    socket.on('leave_room', (room, callback) => {
      socket.leave(room);
      if (callback) callback({ success: true, room });
    });

    socket.on('disconnect', () => {
      this.userSockets.get(userId).delete(socket.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    });
  }

  /**
   * Translates internal domain events into WebSocket Room broadcasts.
   */
  _setupEventSubscriptions() {
    // Notification Room (User specific)
    eventBus.subscribe('notification:inapp', (payload) => {
      this._emitToRoom(`notifications:${payload.userId}`, 'notification:new', payload);
    });

    // Exam Room (Proctoring/Live Sync)
    eventBus.subscribe('attempt:started', (payload) => {
      this._emitToRoom(`exam:${payload.examId}`, 'exam:sync', payload);
    });

    // Study Group Room
    eventBus.subscribe('study_group:member_joined', (payload) => {
      this._emitToRoom(`group:${payload.groupId}`, 'group:member_joined', payload);
    });

    // Tenant Broadcast Room
    eventBus.subscribe('tenant:settings_updated', (payload) => {
      this._emitToRoom(`tenant:${payload.tenantId}`, 'tenant:config_refresh', payload);
    });
  }

  /**
   * Emit a message to a specific room.
   */
  _emitToRoom(room, eventName, payload) {
    // if (this.io) {
    //   this.io.to(room).emit(eventName, payload);
    // }
    console.log(`[WS] Emitted '${eventName}' to Room [${room}]`);
  }

  /**
   * Emit a message directly to a specific user across all their connected devices.
   */
  _sendToUser(userId, eventName, payload) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds || socketIds.size === 0) return;

    // if (this.io) {
    //   for (const socketId of socketIds) {
    //     this.io.to(socketId).emit(eventName, payload);
    //   }
    // }
    console.log(`[WS] Pushed '${eventName}' directly to User ${userId}`);
  }
}

module.exports = new WebSocketGateway();
