import React, { useState, useEffect, useRef } from 'react';
import Whiteboard from './components/Whiteboard';
import Toolbar from './components/Toolbar';
import socketService from './services/socket';
import './styles/App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [userCount, setUserCount] = useState(1);
  const clearRef = useRef(null);
  const saveRef = useRef(null);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connected', (data) => {
      console.log('Connected with user ID:', data.user_id);
      setConnected(true);
    });

    socket.on('session_joined', (data) => {
      console.log('Joined session:', data.session_id);
      setUserCount(data.user_count);
    });

    socket.on('user_joined', (data) => {
      console.log('User joined:', data.username);
      setUserCount(data.user_count);
    });

    socket.on('user_left', (data) => {
      console.log('User left:', data.user_id);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleJoinSession = (e) => {
    e.preventDefault();
    if (sessionId && username) {
      socketService.joinSession(sessionId, username);
      setJoined(true);
    }
  };

  const handleClear = () => {
    if (clearRef.current) {
      clearRef.current();
    }
  };

  const handleSave = () => {
    if (saveRef.current) {
      saveRef.current();
    }
  };

  if (!connected) {
    return (
      <div className="app loading">
        <div className="loading-container">
          <h1>Connecting to server...</h1>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="app login">
        <div className="login-container">
          <h1>Virtual Whiteboard</h1>
          <p className="subtitle">Real-time Collaboration Tool</p>
          <form onSubmit={handleJoinSession}>
            <div className="form-group">
              <label>Your Name:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="form-group">
              <label>Session ID:</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID (e.g., default)"
                required
              />
            </div>
            <button type="submit" className="join-btn">
              Join Session
            </button>
          </form>
          <div className="info-box">
            <h3>Features:</h3>
            <ul>
              <li>✏️ Freehand Drawing</li>
              <li>📐 Shapes (Rectangle, Circle, Line)</li>
              <li>🎨 Color Palette</li>
              <li>🧹 Eraser Tool</li>
              <li>👥 Real-time Multi-user Collaboration</li>
              <li>💾 Save & Load Canvas</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Virtual Whiteboard</h1>
        <div className="session-info">
          <span>Session: <strong>{sessionId}</strong></span>
          <span>User: <strong>{username}</strong></span>
        </div>
      </header>
      <div className="app-content">
        <Toolbar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          brushWidth={brushWidth}
          setBrushWidth={setBrushWidth}
          onClear={handleClear}
          onSave={handleSave}
          userCount={userCount}
        />
        <Whiteboard
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          brushWidth={brushWidth}
          onClear={clearRef}
          onSave={saveRef}
        />
      </div>
    </div>
  );
}

export default App;
