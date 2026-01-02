# Backend - Virtual Whiteboard Server

Flask-SocketIO backend server for real-time whiteboard collaboration.

## Features

- WebSocket-based real-time communication
- Session management for multiple whiteboard rooms
- User tracking and presence
- Canvas state persistence per session
- Event broadcasting to session participants

## API Endpoints

### HTTP Endpoints

#### Health Check
```
GET /health
```
Returns server status and timestamp.

### WebSocket Events

#### Connection Events

**connect**
- Triggered when client connects
- Server assigns unique user ID
- Emits: `connected` with user_id and session_id

**disconnect**
- Triggered when client disconnects
- Removes user from session
- Broadcasts: `user_left` to session

#### Session Management

**join_session**
- Client joins a collaboration session
- Payload:
  ```json
  {
    "session_id": "string",
    "username": "string"
  }
  ```
- Creates session if doesn't exist
- Sends existing canvas state to new user
- Broadcasts: `user_joined` to existing users
- Emits: `session_joined` to joining user

#### Drawing Events

**drawing**
- Freehand drawing path
- Payload:
  ```json
  {
    "type": "path",
    "path": "string",
    "color": "string",
    "width": number
  }
  ```
- Broadcasts to all session users except sender

**add_object**
- Add shape or text object
- Payload (shape):
  ```json
  {
    "type": "line|rect|circle|text",
    "coords": [x1, y1, x2, y2],
    "color": "string",
    "width": number
  }
  ```
- Broadcasts to all session users except sender

**modify_object**
- Modify existing object
- Payload:
  ```json
  {
    "index": number,
    "properties": {}
  }
  ```
- Broadcasts to all session users except sender

**delete_object**
- Remove object from canvas
- Payload:
  ```json
  {
    "index": number
  }
  ```
- Broadcasts to all session users except sender

**clear_canvas**
- Clear entire canvas
- Broadcasts to all session users including sender

**save_canvas**
- Save current canvas state
- Payload:
  ```json
  {
    "canvas_state": {}
  }
  ```
- Stores state in session
- New users will receive this state on join

**cursor_move**
- Share cursor position (optional feature)
- Payload:
  ```json
  {
    "x": number,
    "y": number
  }
  ```
- Broadcasts to all session users except sender

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

```bash
python app.py
```

Server will start on `http://0.0.0.0:8080`

## Configuration

Edit `app.py` to change:
- `SECRET_KEY`: Flask secret key
- `port`: Server port (default: 8080)
- `host`: Server host (default: 0.0.0.0)
- `debug`: Debug mode (default: True)

## Data Structures

### Sessions
```python
sessions = {
    "session_id": {
        "users": set([session_id1, session_id2]),
        "canvas_state": {},
        "created_at": "ISO datetime"
    }
}
```

### Users
```python
users = {
    "request.sid": {
        "user_id": "uuid",
        "session_id": "string",
        "username": "string",
        "connected_at": "ISO datetime"
    }
}
```

## Dependencies

- **flask**: Web framework
- **flask-socketio**: WebSocket support
- **flask-cors**: Cross-origin resource sharing
- **python-socketio**: Socket.io implementation
- **eventlet**: Async networking library

## Testing

Test with multiple clients:
```bash
# Terminal 1
python app.py

# Browser 1
Open http://localhost:3000

# Browser 2
Open http://localhost:3000 (incognito)
```

## Performance

- Handles 5+ concurrent users per session
- Low latency (<200ms on LAN)
- Efficient JSON message serialization
- Room-based broadcasting reduces network overhead

## Security Considerations

For production deployment:
- Change SECRET_KEY to random string
- Enable HTTPS/WSS
- Add authentication middleware
- Rate limit connections
- Validate all incoming data
- Add session timeouts
- Implement user permissions

## Troubleshooting

**Port already in use**:
```bash
# Change port in app.py or kill existing process
lsof -ti:8080 | xargs kill -9
```

**CORS errors**:
- Ensure `flask-cors` is installed
- Check `cors_allowed_origins` setting

**Connection issues**:
- Verify firewall settings
- Check if eventlet is installed
- Ensure client uses correct WebSocket URL
