import React from 'react';
import '../styles/Toolbar.css';

const Toolbar = ({
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
  brushWidth,
  setBrushWidth,
  onClear,
  onSave,
  userCount
}) => {
  const tools = [
    { name: 'pen', icon: '✏️', label: 'Pen' },
    { name: 'line', icon: '📏', label: 'Line' },
    { name: 'rectangle', icon: '▭', label: 'Rectangle' },
    { name: 'circle', icon: '⭕', label: 'Circle' },
    { name: 'text', icon: 'T', label: 'Text' },
    { name: 'eraser', icon: '🧹', label: 'Eraser' },
    { name: 'select', icon: '👆', label: 'Select' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#FFC0CB', '#A52A2A'
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.name}
              className={`tool-btn ${selectedTool === tool.name ? 'active' : ''}`}
              onClick={() => setSelectedTool(tool.name)}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Color</h3>
        <div className="color-palette">
          {colors.map(color => (
            <button
              key={color}
              className={`color-btn ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Brush Width</h3>
        <input
          type="range"
          min="1"
          max="20"
          value={brushWidth}
          onChange={(e) => setBrushWidth(parseInt(e.target.value))}
          className="brush-slider"
        />
        <span className="brush-width-label">{brushWidth}px</span>
      </div>

      <div className="toolbar-section">
        <h3>Actions</h3>
        <button className="action-btn" onClick={onSave}>
          💾 Save
        </button>
        <button className="action-btn danger" onClick={onClear}>
          🗑️ Clear
        </button>
      </div>

      <div className="toolbar-section user-info">
        <h3>Active Users</h3>
        <div className="user-count">{userCount}</div>
      </div>
    </div>
  );
};

export default Toolbar;
