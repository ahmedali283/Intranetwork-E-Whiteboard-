import { io } from 'socket.io-client';

const SOCKET_URL = 'http://10.216.111.12:8080';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinSession(sessionId, username) {
    if (this.socket) {
      this.socket.emit('join_session', { session_id: sessionId, username });
    }
  }

  emitDrawing(data) {
    if (this.socket) {
      this.socket.emit('drawing', data);
    }
  }

  emitAddObject(data) {
    if (this.socket) {
      this.socket.emit('add_object', data);
    }
  }

  emitModifyObject(data) {
    if (this.socket) {
      this.socket.emit('modify_object', data);
    }
  }

  emitDeleteObject(data) {
    if (this.socket) {
      this.socket.emit('delete_object', data);
    }
  }

  emitClearCanvas() {
    if (this.socket) {
      this.socket.emit('clear_canvas');
    }
  }

  emitSaveCanvas(canvasState) {
    if (this.socket) {
      this.socket.emit('save_canvas', { canvas_state: canvasState });
    }
  }

  emitCursorMove(x, y) {
    if (this.socket) {
      this.socket.emit('cursor_move', { x, y });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
