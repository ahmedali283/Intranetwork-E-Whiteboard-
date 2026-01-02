from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'virtual-whiteboard-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store active sessions and users
sessions = {}
users = {}

@app.route('/health')
def health_check():
    return {'status': 'ok', 'timestamp': datetime.now().isoformat()}

@socketio.on('connect')
def handle_connect():
    user_id = str(uuid.uuid4())
    users[request.sid] = {
        'user_id': user_id,
        'session_id': None,
        'connected_at': datetime.now().isoformat()
    }
    emit('connected', {'user_id': user_id, 'session_id': request.sid})
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in users:
        session_id = users[request.sid].get('session_id')
        if session_id and session_id in sessions:
            sessions[session_id]['users'].discard(request.sid)
            emit('user_left', {
                'user_id': users[request.sid]['user_id'],
                'session_id': request.sid
            }, room=session_id)
        del users[request.sid]
    print(f"Client disconnected: {request.sid}")

@socketio.on('join_session')
def handle_join_session(data):
    session_id = data.get('session_id', 'default')
    username = data.get('username', 'Anonymous')

    if session_id not in sessions:
        sessions[session_id] = {
            'users': set(),
            'canvas_state': None,
            'created_at': datetime.now().isoformat()
        }

    join_room(session_id)
    sessions[session_id]['users'].add(request.sid)
    users[request.sid]['session_id'] = session_id
    users[request.sid]['username'] = username

    # Send current canvas state to the new user
    if sessions[session_id]['canvas_state']:
        emit('load_canvas', sessions[session_id]['canvas_state'])

    # Notify others in the session
    emit('user_joined', {
        'user_id': users[request.sid]['user_id'],
        'username': username,
        'session_id': request.sid,
        'user_count': len(sessions[session_id]['users'])
    }, room=session_id, include_self=False)

    emit('session_joined', {
        'session_id': session_id,
        'user_count': len(sessions[session_id]['users'])
    })

    print(f"User {username} joined session {session_id}")

@socketio.on('drawing')
def handle_drawing(data):
    session_id = users[request.sid].get('session_id')
    if session_id:
        data['user_id'] = users[request.sid]['user_id']
        data['username'] = users[request.sid].get('username', 'Anonymous')
        emit('drawing', data, room=session_id, include_self=False)

@socketio.on('add_object')
def handle_add_object(data):
    session_id = users[request.sid].get('session_id')
    if session_id:
        data['user_id'] = users[request.sid]['user_id']
        emit('add_object', data, room=session_id, include_self=False)

@socketio.on('modify_object')
def handle_modify_object(data):
    session_id = users[request.sid].get('session_id')
    if session_id:
        data['user_id'] = users[request.sid]['user_id']
        emit('modify_object', data, room=session_id, include_self=False)

@socketio.on('delete_object')
def handle_delete_object(data):
    session_id = users[request.sid].get('session_id')
    if session_id:
        data['user_id'] = users[request.sid]['user_id']
        emit('delete_object', data, room=session_id, include_self=False)

@socketio.on('clear_canvas')
def handle_clear_canvas():
    session_id = users[request.sid].get('session_id')
    if session_id:
        sessions[session_id]['canvas_state'] = None
        emit('clear_canvas', room=session_id, include_self=True)

@socketio.on('save_canvas')
def handle_save_canvas(data):
    session_id = users[request.sid].get('session_id')
    if session_id:
        sessions[session_id]['canvas_state'] = data.get('canvas_state')
        emit('canvas_saved', {'status': 'success'})

@socketio.on('cursor_move')
def handle_cursor_move(data):
    session_id = users[request.sid].get('session_id')
    if session_id:
        data['user_id'] = users[request.sid]['user_id']
        data['username'] = users[request.sid].get('username', 'Anonymous')
        emit('cursor_move', data, room=session_id, include_self=False)

if __name__ == '__main__':
    print("Starting Virtual Whiteboard Server...")
    print("Server running on http://localhost:8080")
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
