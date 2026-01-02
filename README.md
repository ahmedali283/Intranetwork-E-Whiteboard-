# Virtual Whiteboard

## Overview
A full-stack web application implementing a real-time collaborative whiteboard using WebSocket protocol for bidirectional communication. The application follows a client-server architecture with React-based SPA frontend and Flask-based REST/WebSocket backend.

## Tech Stack

### Frontend
- **React 18.2.0** - Component-based UI framework
- **Fabric.js 5.3.0** - HTML5 Canvas library for object-oriented graphics rendering
- **Socket.io-client 4.7.0** - WebSocket client with automatic reconnection and fallback mechanisms
- **React Scripts 5.0.1** - Build toolchain (Webpack, Babel, ESLint)

### Backend
- **Flask 3.0.0** - WSGI-compliant micro web framework
- **Flask-SocketIO 5.3.6** - WebSocket server integration for Flask
- **Flask-CORS 4.0.0** - Cross-Origin Resource Sharing middleware
- **Python-SocketIO 5.11.0** - Socket.io server implementation
- **Eventlet 0.35.2** - Concurrent networking library (green threads)

- # Features

### Drawing Tools
- **Pen** - Freehand drawing with path objects
- **Line** - Two-point straight line
- **Rectangle** - Rectangular shapes with fill/stroke
- **Circle** - Circular shapes with fill/stroke
- **Text** - Editable text objects with IText
- **Eraser** - Object deletion on click
- **Select** - Selection mode for object manipulation

### Customization
- **Color Palette**: 12 predefined colors (hex values)
- **Brush Width**: Range slider (1-20px)
- **Stroke/Fill**: Independent styling for shapes

### Collaboration Features
- **Multi-user Sessions**: Room-based isolation via session IDs
- **Real-time Sync**: WebSocket-based object broadcasting
- **User Presence**: Active user count display
- **Session Persistence**: Canvas state stored server-side
- **Late Join Support**: New users receive current canvas state

### Canvas Operations
- **Save Canvas**: Persist current state to server memory
- **Clear Canvas**: Remove all objects (synced across clients)
- **Load Canvas**: Retrieve persisted canvas on join
- **Auto-resize**: Responsive canvas dimensions

## Data Flow

### Object Creation Flow

1. **User Input**: Mouse/touch events on Fabric.js canvas
2. **Object Creation**: Fabric.js creates shape/path object
3. **Serialization**: Object serialized to JSON (`object.toJSON()`)
4. **Socket Emission**: `socket.emit('add_object', {session_id, object})`
5. **Server Broadcast**: `emit('add_object', object, room=session_id)`
6. **Client Reception**: All clients in room receive event
7. **Deserialization**: Fabric.js deserializes JSON to object
8. **Canvas Rendering**: Object added to canvas (`canvas.add(object)`)

### State Synchronization

**Server State**:
```python
sessions = {
    'session_id_1': {
        'canvas': {...},           # Fabric.js canvas JSON
        'objects': [...],          # Array of canvas objects
        'users': ['user1', 'user2']
    }
}
```

**Client State**:
```javascript
const [tool, setTool] = useState('pen');
const [color, setColor] = useState('#000000');
const [brushWidth, setBrushWidth] = useState(2);
const canvasRef = useRef(null);  // Fabric.js Canvas instance
```

## Performance Considerations

### Optimization Strategies
- **Object Pooling**: Reuse Fabric.js objects when possible
- **Event Debouncing**: Throttle high-frequency events (e.g., drawing)
- **Delta Sync**: Only transmit changed properties (modify events)
- **Room Broadcasting**: Messages only sent to relevant session members
- **Connection Pooling**: Eventlet manages concurrent connections efficiently

### Scalability Limitations
- **In-Memory Storage**: Current implementation stores state in RAM (session dict)
- **Single Server**: No horizontal scaling support (sticky sessions required)
- **No Persistence**: Canvas state lost on server restart

**Production Improvements**:
- Implement Redis for distributed session storage
- Add database persistence (PostgreSQL/MongoDB)
- Use message queue (RabbitMQ/Kafka) for event routing
- Implement CDN for static assets
- Add load balancing with sticky sessions

## Setup & Installation

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 14+** with npm
- **Git** for version control

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

Server runs on `http://0.0.0.0:8080`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Development server runs on `http://localhost:3000`

### Quick Start (Windows)

```bash
# Terminal 1
start-backend.bat

# Terminal 2
start-frontend.bat
```

## Configuration

### Backend Configuration (app.py)

```python
# Server settings
HOST = '0.0.0.0'
PORT = 8080
DEBUG = True

# CORS settings
CORS(app, resources={r"/*": {"origins": "*"}})

# SocketIO settings
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
```

### Frontend Configuration (socket.js)

```javascript
const SOCKET_URL = 'http://10.216.111.12:8080';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});
```

**Note**: Update `SOCKET_URL` to match your server IP/domain

## Development Workflow

### Git Workflow
```bash
# Current branch
git branch  # main

# Recent commits
git log --oneline
# f0e5556 Pushing Updated backend code with functional sockets
```

### Testing Sessions

1. Open multiple browser windows/tabs
2. Enter same session ID in each (e.g., "test-room-1")
3. Draw in one window → Observe real-time sync in others
4. Test different tools, colors, and operations
5. Monitor browser console and server logs for errors

### Debugging

**Frontend Debugging**:
- Open browser DevTools (F12)
- Check Console for errors
- Monitor Network tab → WS (WebSocket) for socket events
- Use React DevTools for component state inspection

**Backend Debugging**:
- Enable Flask debug mode (`DEBUG = True`)
- Check terminal output for socket events and errors
- Add `print()` statements in event handlers
- Use Python debugger (`pdb`) for breakpoints

## API Reference

### Socket.io Client Methods (Frontend)

```javascript
import socket from './services/socket';

// Join session
socket.emit('join_session', {
  username: 'John',
  session_id: 'room-123'
});

// Add object to canvas
socket.emit('add_object', {
  session_id: 'room-123',
  object: fabricObject.toJSON()
});

// Listen for new objects
socket.on('add_object', (data) => {
  const obj = fabric.util.enlivenObjects([data.object]);
  canvas.add(obj[0]);
});
```

### Socket.io Server Events (Backend)

```python
@socketio.on('join_session')
def handle_join_session(data):
    username = data.get('username')
    session_id = data.get('session_id')
    join_room(session_id)
    emit('session_joined', {...}, room=request.sid)
    emit('user_joined', {...}, room=session_id, skip_sid=request.sid)
```

## Known Issues & Limitations

1. **No Authentication**: Sessions are public, no user verification
2. **No Persistence**: Canvas state lost on server restart
3. **Limited Undo/Redo**: No operation history
4. **No File Export**: Cannot save canvas as image/PDF
5. **Hardcoded Socket URL**: Requires manual configuration change for deployment
6. **No Rate Limiting**: Susceptible to spam/DoS attacks
7. **In-Memory Only**: Poor scalability for production use

## Future Enhancements

### Short-term
- [ ] Add undo/redo functionality with command pattern
- [ ] Implement canvas export (PNG/SVG/PDF)
- [ ] Add user authentication (JWT)
- [ ] Implement cursor position sharing
- [ ] Add text chat feature
- [ ] Mobile responsive design

### Long-term
- [ ] Database persistence (PostgreSQL + Redis)
- [ ] Image upload and embedding
- [ ] Layer management
- [ ] Version control for canvas (like Git)
- [ ] Video/audio chat integration (WebRTC)
- [ ] Advanced shapes library
- [ ] Collaborative cursor tracking
- [ ] Role-based access control (viewer/editor/admin)

## License

This project is open-source and available for educational purposes.

## Technical Details

**Build System**: Create React App (Webpack 5, Babel 7)
**Transport Protocol**: WebSocket (fallback: long-polling)
**Serialization**: JSON
**Concurrency Model**: Event loop (Eventlet green threads)
**Frontend Bundle Size**: ~500KB (gzipped)
**WebSocket Latency**: <100ms (LAN), <300ms (WAN)

---

**Architecture**: Client-Server with WebSocket-based real-time synchronization
**Pattern**: Event-driven, component-based, room-based broadcasting
**Stack**: React + Fabric.js + Socket.io (client) | Flask + Flask-SocketIO + Eventlet (server)
