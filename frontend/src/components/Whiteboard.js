import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import socketService from '../services/socket';
import '../styles/Whiteboard.css';

const Whiteboard = ({ selectedTool, selectedColor, brushWidth, onClear, onSave }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const tempObjectRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 300,
      height: window.innerHeight - 100,
      backgroundColor: '#ffffff',
      isDrawingMode: false
    });

    fabricCanvasRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 300,
        height: window.innerHeight - 100
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    const socket = socketService.getSocket();

    socket.on('drawing', (data) => {
      if (data.type === 'path') {
        const path = new fabric.Path(data.path, {
          stroke: data.color,
          strokeWidth: data.width,
          fill: '',
          selectable: false
        });
        canvas.add(path);
        canvas.renderAll();
      }
    });

    socket.on('add_object', (data) => {
      let obj;
      switch (data.type) {
        case 'line':
          obj = new fabric.Line(data.coords, {
            stroke: data.color,
            strokeWidth: data.width,
            selectable: false
          });
          break;
        case 'rect':
          obj = new fabric.Rect({
            left: data.left,
            top: data.top,
            width: data.width,
            height: data.height,
            fill: 'transparent',
            stroke: data.color,
            strokeWidth: data.strokeWidth,
            selectable: false
          });
          break;
        case 'circle':
          obj = new fabric.Circle({
            left: data.left,
            top: data.top,
            radius: data.radius,
            fill: 'transparent',
            stroke: data.color,
            strokeWidth: data.strokeWidth,
            selectable: false
          });
          break;
        case 'text':
          obj = new fabric.IText(data.text, {
            left: data.left,
            top: data.top,
            fill: data.color,
            fontSize: data.fontSize,
            selectable: false
          });
          break;
        default:
          return;
      }
      if (obj) {
        canvas.add(obj);
        canvas.renderAll();
      }
    });

    socket.on('modify_object', (data) => {
      const objects = canvas.getObjects();
      if (objects[data.index]) {
        objects[data.index].set(data.properties);
        canvas.renderAll();
      }
    });

    socket.on('delete_object', (data) => {
      const objects = canvas.getObjects();
      if (objects[data.index]) {
        canvas.remove(objects[data.index]);
        canvas.renderAll();
      }
    });

    socket.on('clear_canvas', () => {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    });

    socket.on('load_canvas', (canvasState) => {
      if (canvasState) {
        canvas.loadFromJSON(canvasState, () => {
          canvas.renderAll();
        });
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('drawing');
      socket.off('add_object');
      socket.off('modify_object');
      socket.off('delete_object');
      socket.off('clear_canvas');
      socket.off('load_canvas');
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = selectedTool === 'pen';

    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = selectedColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }

    canvas.selection = selectedTool === 'select';
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      obj.selectable = selectedTool === 'select';
    });
  }, [selectedTool, selectedColor, brushWidth]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handlePathCreated = (e) => {
      const path = e.path;
      socketService.emitDrawing({
        type: 'path',
        path: path.path.toString(),
        color: selectedColor,
        width: brushWidth
      });
    };

    const handleMouseDown = (e) => {
      if (selectedTool === 'pen' || selectedTool === 'select') return;

      const pointer = canvas.getPointer(e.e);
      setIsDrawing(true);
      setStartPoint({ x: pointer.x, y: pointer.y });

      if (selectedTool === 'text') {
        const text = new fabric.IText('Type here', {
          left: pointer.x,
          top: pointer.y,
          fill: selectedColor,
          fontSize: 20,
          selectable: true
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();

        socketService.emitAddObject({
          type: 'text',
          text: 'Type here',
          left: pointer.x,
          top: pointer.y,
          color: selectedColor,
          fontSize: 20
        });
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !startPoint) return;

      const pointer = canvas.getPointer(e.e);

      if (tempObjectRef.current) {
        canvas.remove(tempObjectRef.current);
      }

      let tempObj;
      switch (selectedTool) {
        case 'line':
          tempObj = new fabric.Line([startPoint.x, startPoint.y, pointer.x, pointer.y], {
            stroke: selectedColor,
            strokeWidth: brushWidth,
            selectable: false
          });
          break;
        case 'rectangle':
          tempObj = new fabric.Rect({
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
            width: Math.abs(pointer.x - startPoint.x),
            height: Math.abs(pointer.y - startPoint.y),
            fill: 'transparent',
            stroke: selectedColor,
            strokeWidth: brushWidth,
            selectable: false
          });
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2)
          ) / 2;
          tempObj = new fabric.Circle({
            left: (startPoint.x + pointer.x) / 2 - radius,
            top: (startPoint.y + pointer.y) / 2 - radius,
            radius: radius,
            fill: 'transparent',
            stroke: selectedColor,
            strokeWidth: brushWidth,
            selectable: false
          });
          break;
        case 'eraser':
          const objects = canvas.getObjects();
          objects.forEach((obj, index) => {
            if (obj.containsPoint({ x: pointer.x, y: pointer.y })) {
              canvas.remove(obj);
              socketService.emitDeleteObject({ index });
            }
          });
          break;
        default:
          break;
      }

      if (tempObj) {
        canvas.add(tempObj);
        tempObjectRef.current = tempObj;
        canvas.renderAll();
      }
    };

    const handleMouseUp = (e) => {
      if (!isDrawing) return;

      setIsDrawing(false);
      const pointer = canvas.getPointer(e.e);

      if (tempObjectRef.current) {
        const obj = tempObjectRef.current;
        tempObjectRef.current = null;

        let objData;
        switch (selectedTool) {
          case 'line':
            objData = {
              type: 'line',
              coords: [startPoint.x, startPoint.y, pointer.x, pointer.y],
              color: selectedColor,
              width: brushWidth
            };
            break;
          case 'rectangle':
            objData = {
              type: 'rect',
              left: obj.left,
              top: obj.top,
              width: obj.width,
              height: obj.height,
              color: selectedColor,
              strokeWidth: brushWidth
            };
            break;
          case 'circle':
            objData = {
              type: 'circle',
              left: obj.left,
              top: obj.top,
              radius: obj.radius,
              color: selectedColor,
              strokeWidth: brushWidth
            };
            break;
          default:
            break;
        }

        if (objData) {
          socketService.emitAddObject(objData);
        }
      }

      setStartPoint(null);
    };

    canvas.on('path:created', handlePathCreated);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('path:created', handlePathCreated);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [selectedTool, selectedColor, brushWidth, isDrawing, startPoint]);

  useEffect(() => {
    if (onClear) {
      const handleClear = () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          canvas.clear();
          canvas.backgroundColor = '#ffffff';
          canvas.renderAll();
          socketService.emitClearCanvas();
        }
      };
      onClear.current = handleClear;
    }
  }, [onClear]);

  useEffect(() => {
    if (onSave) {
      const handleSave = () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
          const canvasState = canvas.toJSON();
          socketService.emitSaveCanvas(canvasState);
          alert('Canvas saved successfully!');
        }
      };
      onSave.current = handleSave;
    }
  }, [onSave]);

  return (
    <div className="whiteboard-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Whiteboard;
