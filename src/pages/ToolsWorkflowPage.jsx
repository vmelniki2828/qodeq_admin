import { useState, useRef, useEffect, useMemo } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Layout } from 'components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { HiWrench, HiCog, HiXMark } from 'react-icons/hi2';

const PageContent = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 69px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SelectLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const SelectIcon = styled(HiWrench)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
`;

const Select = styled.select`
  min-width: 300px;
  padding: 8px 32px 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B6B6B' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ToolsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
  flex-shrink: 0;
`;

const ToolButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }
`;

const ToolSettingsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.accent};
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: auto;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentHover || theme.colors.accent};
    opacity: 0.9;
  }
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  background-image: 
    radial-gradient(circle, ${({ theme }) => 
      theme.colors.surface === '#F9FAFB' 
        ? 'rgba(0,0,0,0.05)' 
        : 'rgba(255,255,255,0.05)'} 1px, transparent 1px);
  background-size: 20px 20px;

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 6px;

    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const WorkflowCanvas = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100%;
  min-width: 100%;
  padding: 40px;
  cursor: ${({ $isPanning }) => ($isPanning ? 'grabbing' : 'grab')};
  user-select: none;
  transform: translate(${({ $panX }) => $panX}px, ${({ $panY }) => $panY}px);
  
  /* Убеждаемся, что canvas может получать события мыши */
  pointer-events: auto;
  
  /* Позволяем блокам выходить за пределы видимой области */
  overflow: visible;
`;

const Node = styled.div`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  min-width: 120px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme, $isDragging }) => 
    $isDragging ? theme.colors.accent : theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  font-weight: 500;
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  box-shadow: ${({ theme, $isDragging }) => 
    $isDragging
      ? `0 4px 16px ${theme.colors.surface === '#F9FAFB' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)'}`
      : `0 2px 8px ${theme.colors.surface === '#F9FAFB' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'}`};
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: ${({ $isDragging }) => ($isDragging ? 20 : 10)};
  pointer-events: auto;
  transition: ${({ $isDragging }) => ($isDragging ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease')};
  user-select: none;

  /* Текст и иконки внутри узла не должны перехватывать события */
  span {
    pointer-events: none;
  }

  &:hover {
    box-shadow: 0 4px 12px ${({ theme }) => 
      theme.colors.surface === '#F9FAFB' 
        ? 'rgba(0, 0, 0, 0.15)' 
        : 'rgba(0, 0, 0, 0.4)'};
    border-color: ${({ theme, $isDragging }) => 
      $isDragging ? theme.colors.accent : theme.colors.accent};
  }
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-left: auto;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) =>
      theme.colors.primary === '#0D0D0D' ? '#f0f0f0' : 'rgba(255,255,255,0.08)'};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SettingsPanel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background-color: #1A1A1A;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform 0.3s ease;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const SettingsTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ECECEC;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #ACACAC;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ECECEC;
  }
`;

const SettingsContent = styled.div`
  padding: 20px;
  flex: 1;
`;

const SettingItem = styled.div`
  margin-bottom: 20px;
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #ECECEC;
  margin-bottom: 8px;
`;

const SettingInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  color: #ECECEC;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    background-color: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: #8E8E8E;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ConnectionPoint = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $type, theme, $connected }) => 
    $connected 
      ? theme.colors.accent
      : $type === 'input' 
        ? theme.colors.accent 
        : theme.colors.background};
  border: 2px solid ${({ $type, theme, $connected, $hovered }) => 
    $hovered
      ? theme.colors.accent
      : $connected
        ? theme.colors.accentHover || theme.colors.accent
        : $type === 'input' 
          ? theme.colors.accentHover || theme.colors.accent 
          : theme.colors.border};
  cursor: ${({ $type }) => ($type === 'output' ? 'crosshair' : 'pointer')};
  z-index: 20;
  transition: all 0.2s ease;

  ${({ $position }) => {
    if ($position === 'left') return 'left: -6px; top: 50%; transform: translateY(-50%);';
    if ($position === 'right') return 'right: -6px; top: 50%; transform: translateY(-50%);';
    return '';
  }}

  &:hover {
    transform: ${({ $position }) =>
      $position === 'left' || $position === 'right'
        ? 'translateY(-50%) scale(1.3)'
        : 'scale(1.3)'};
    border-color: ${({ theme }) => theme.colors.accent};
    background-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ConnectionLine = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
  
  /* Линии могут получать события мыши для удаления */
  path {
    pointer-events: all;
    cursor: pointer;
  }
  
  line {
    pointer-events: all;
    cursor: pointer;
  }
`;


const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 16px;
  text-align: center;
  padding: 40px;
`;

export const ToolsWorkflowPage = () => {
  const { theme } = useTheme();
  const [selectedTool, setSelectedTool] = useState('');
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [connections, setConnections] = useState([]);
  const [drawingConnection, setDrawingConnection] = useState(null);
  const [hoveredInput, setHoveredInput] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeForSettings, setSelectedNodeForSettings] = useState(null);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const nodeRefs = useRef({});

  const tools = [
    'Choose a tool...',
    'Transfer chat HM',
    'Transfer chat AUF',
    'Transfer chat Hype',
    'Transfer chat UNLIM',
    'Transfer chat CB',
    'Make Deposit Ticket AUF',
    'Make Deposit Ticket UNLIM',
    'Make Deposit Ticket Hype',
    'Make Deposit Ticket HM',
    'Make Deposit Ticket CB',
  ];

  const availableTools = [
    'Cast',
    'Get',
    'Set',
    'Message',
    'API',
    'Condition',
    'Transfer',
    'Regex',
    'Error',
    'Stop',
    'Result',
    'Group',
    'Jinja',
  ];

  // Пример данных для workflow (будет генерироваться на основе выбранного инструмента)
  const initialNodes = useMemo(() => {
    if (!selectedTool) return [];
    
    return [
      { id: 'start', name: 'Start', x: 50, y: 100, hasInput: false, hasOutput: true },
      { id: 'get', name: 'Get', x: 250, y: 100, hasInput: true, hasOutput: true },
      { id: 'regex', name: 'Regex', x: 450, y: 100, hasInput: true, hasOutput: true },
      { id: 'condition', name: 'Condition', x: 650, y: 100, hasInput: true, hasOutput: true },
      { id: 'set1', name: 'Set', x: 850, y: 50, hasInput: true, hasOutput: true },
      { id: 'error', name: 'Error', x: 850, y: 150, hasInput: true, hasOutput: false },
      { id: 'cast', name: 'Cast', x: 1050, y: 50, hasInput: true, hasOutput: true },
      { id: 'group', name: 'Group', x: 1250, y: 50, hasInput: true, hasOutput: false },
    ];
  }, [selectedTool]);

  const [workflowNodes, setWorkflowNodes] = useState(initialNodes);
  const [nodeIdCounter, setNodeIdCounter] = useState(100);

  // Обновляем узлы при изменении selectedTool
  useEffect(() => {
    setWorkflowNodes(initialNodes);
    setConnections([]);
    setNodeIdCounter(100);
  }, [initialNodes]);

  // Функция для определения, имеет ли инструмент входные/выходные точки
  const getToolProperties = (toolName) => {
    const toolProps = {
      'Cast': { hasInput: true, hasOutput: true },
      'Get': { hasInput: true, hasOutput: true },
      'Set': { hasInput: true, hasOutput: true },
      'Message': { hasInput: true, hasOutput: true },
      'API': { hasInput: true, hasOutput: true },
      'Condition': { hasInput: true, hasOutput: true },
      'Transfer': { hasInput: true, hasOutput: true },
      'Regex': { hasInput: true, hasOutput: true },
      'Error': { hasInput: true, hasOutput: false },
      'Stop': { hasInput: true, hasOutput: false },
      'Result': { hasInput: true, hasOutput: false },
      'Group': { hasInput: true, hasOutput: true },
      'Jinja': { hasInput: true, hasOutput: true },
    };
    return toolProps[toolName] || { hasInput: true, hasOutput: true };
  };

  // Функция для добавления нового узла на canvas
  const handleAddNode = (toolName) => {
    const properties = getToolProperties(toolName);
    const newId = `node-${nodeIdCounter}`;
    
    // Вычисляем позицию для нового узла (по центру видимой области или рядом с последним узлом)
    let newX = 200;
    let newY = 200;
    
    if (workflowNodes.length > 0) {
      // Размещаем новый узел правее самого правого узла
      const rightmostNode = workflowNodes.reduce((prev, current) => 
        (current.x > prev.x) ? current : prev
      );
      newX = rightmostNode.x + 250;
      newY = rightmostNode.y;
    }
    
    const newNode = {
      id: newId,
      name: toolName,
      x: newX,
      y: newY,
      hasInput: properties.hasInput,
      hasOutput: properties.hasOutput,
    };

    setWorkflowNodes(prevNodes => [...prevNodes, newNode]);
    setNodeIdCounter(prev => prev + 1);
  };

  const getConnectionPointPosition = (nodeId, type) => {
    const node = workflowNodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const nodeElement = nodeRefs.current[nodeId];
    const canvasElement = canvasRef.current;
    
    if (!nodeElement || !canvasElement) {
      // Fallback к позиции из данных узла (с учетом padding 40px)
      const baseX = node.x + 40 + (type === 'output' ? 120 : 0);
      const baseY = node.y + 40 + 20; // Центр по вертикали + padding
      return { x: baseX, y: baseY };
    }
    
    const nodeRect = nodeElement.getBoundingClientRect();
    const canvasRect = canvasElement.getBoundingClientRect();
    
    // Получаем позицию точки соединения относительно canvas
    // Учитываем, что canvas имеет padding: 40px
    const nodeCenterY = nodeRect.top - canvasRect.top + nodeRect.height / 2;
    const connectionX = type === 'output' 
      ? nodeRect.right - canvasRect.left  // Правая сторона узла
      : nodeRect.left - canvasRect.left;  // Левая сторона узла
    
    return {
      x: connectionX,
      y: nodeCenterY,
    };
  };

  const handleConnectionPointClick = (e, nodeId, type) => {
    e.stopPropagation();
    
    if (type === 'output') {
      // Начинаем рисование линии от выходной точки
      const node = workflowNodes.find(n => n.id === nodeId);
      if (!node || !node.hasOutput) return;
      
      const pointPos = getConnectionPointPosition(nodeId, 'output');
      setDrawingConnection({
        fromNode: nodeId,
        fromX: pointPos.x,
        fromY: pointPos.y,
        toX: pointPos.x,
        toY: pointPos.y,
      });
    } else if (type === 'input' && drawingConnection) {
      // Завершаем соединение на входной точке
      const node = workflowNodes.find(n => n.id === nodeId);
      if (!node || !node.hasInput) return;
      
      // Проверяем, что не соединяем узел сам с собой
      if (drawingConnection.fromNode === nodeId) {
        setDrawingConnection(null);
        return;
      }
      
      // Проверяем, что соединение еще не существует
      const exists = connections.some(
        conn => conn.from === drawingConnection.fromNode && conn.to === nodeId
      );
      
      if (!exists) {
        setConnections([...connections, {
          from: drawingConnection.fromNode,
          to: nodeId,
        }]);
      }
      
      setDrawingConnection(null);
      setHoveredInput(null);
    }
  };

  const handleConnectionPointHover = (nodeId, type) => {
    if (type === 'input' && drawingConnection) {
      setHoveredInput(nodeId);
      // Обновляем позицию линии, чтобы она "прилипала" к входной точке
      const pointPos = getConnectionPointPosition(nodeId, 'input');
      setDrawingConnection(prev => ({
        ...prev,
        toX: pointPos.x,
        toY: pointPos.y,
      }));
    }
  };

  const handleConnectionPointLeave = () => {
    setHoveredInput(null);
    // При уходе с точки, продолжаем следовать за курсором
    if (drawingConnection) {
      // Позиция будет обновлена в handleCanvasMouseMove
    }
  };

  const handleCanvasMouseMove = (e) => {
    // Если идет панорамирование, не обрабатываем другие события
    // Панорамирование обрабатывается глобальными обработчиками
    if (isPanning) {
      return;
    }

    // Обработка перетаскивания узла
    if (draggingNode) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      // Вычисляем новую позицию узла в координатах canvas
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Новая позиция узла (вычитаем смещение и padding)
      const newX = mouseX - dragOffset.x - 40; // 40px padding
      const newY = mouseY - dragOffset.y - 40; // 40px padding

      setWorkflowNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggingNode
            ? { ...node, x: newX, y: newY }
            : node
        )
      );
      return;
    }

    // Обработка рисования соединения
    if (drawingConnection) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      // Если наведены на входную точку, не обновляем позицию (она уже обновлена в handleConnectionPointHover)
      if (hoveredInput) return;
      
      // Получаем позицию курсора относительно canvas
      // Canvas имеет transform: translate(), но getBoundingClientRect уже учитывает это
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      
      setDrawingConnection(prev => ({
        ...prev,
        toX: x,
        toY: y,
      }));
    }
  };

  const handleCanvasClick = (e) => {
    // Если клик не на точке соединения и мы рисуем линию - отменяем
    if (drawingConnection && !e.target.closest('[data-connection-point]')) {
      setDrawingConnection(null);
      setHoveredInput(null);
    }
  };

  const handleConnectionDoubleClick = (e, fromNodeId, toNodeId) => {
    e.stopPropagation();
    e.preventDefault();
    deleteConnection(fromNodeId, toNodeId);
  };

  const handleConnectionClick = (e, fromNodeId, toNodeId) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedConnection({ from: fromNodeId, to: toNodeId });
  };

  const handleConnectionHover = (fromNodeId, toNodeId) => {
    // Не обновляем hover если идет панорамирование или перетаскивание
    if (!isPanning && !draggingNode) {
      setHoveredConnection({ from: fromNodeId, to: toNodeId });
    }
  };

  const handleConnectionLeave = () => {
    setHoveredConnection(null);
  };

  const deleteConnection = (fromNodeId, toNodeId) => {
    setConnections(prevConnections =>
      prevConnections.filter(
        conn => !(conn.from === fromNodeId && conn.to === toNodeId)
      )
    );
    setSelectedConnection(null);
    setHoveredConnection(null);
  };

  // Обработка удаления по клавише Delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedConnection) {
        e.preventDefault();
        deleteConnection(selectedConnection.from, selectedConnection.to);
      }
      // Сброс выбора при клике вне соединения
      if (e.key === 'Escape') {
        setSelectedConnection(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedConnection]);

  // Сброс выбора соединения при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectedConnection && !e.target.closest('path')) {
        setSelectedConnection(null);
      }
    };

    if (selectedConnection) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [selectedConnection]);

  const handleNodeMouseDown = (e, nodeId) => {
    // Не начинаем перетаскивание, если клик на точке соединения
    if (e.target.closest('[data-connection-point]')) {
      return;
    }

    // Останавливаем всплытие события, чтобы оно не доходило до handleMouseDown на canvas
    e.stopPropagation();
    e.preventDefault();
    
    const node = workflowNodes.find(n => n.id === nodeId);
    if (!node) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Вычисляем смещение от точки клика до позиции узла в координатах canvas
    // Учитываем padding canvas (40px) и текущую позицию узла
    const clickX = e.clientX - canvasRect.left;
    const clickY = e.clientY - canvasRect.top;
    
    // Позиция узла в координатах canvas (с учетом padding)
    const nodeX = node.x + 40; // padding
    const nodeY = node.y + 40; // padding
    
    // Смещение от точки клика до позиции узла
    const offsetX = clickX - nodeX;
    const offsetY = clickY - nodeY;

    setDraggingNode(nodeId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseDown = (e) => {
    // Проверяем, что клик не на узле или точке соединения
    const isNode = e.target.closest('[data-node]');
    const isConnectionPoint = e.target.closest('[data-connection-point]');
    const isSVG = e.target.closest('svg') || e.target.tagName === 'svg';
    const isPath = e.target.tagName === 'path' || e.target.tagName === 'line';
    const isNodeIcon = e.target.closest('svg[data-node-icon]') || e.target.closest('.node-icon');
    
    // Если клик на узле (включая его содержимое), точке соединения или на линии соединения - не начинаем панорамирование
    if (isNode || isConnectionPoint || isNodeIcon) {
      return;
    }

    // Если клик на SVG элементах (кроме линий соединения) - не начинаем панорамирование
    if (isSVG && !isPath) {
      return;
    }

    // Если рисуем соединение, не начинаем панорамирование
    if (drawingConnection) {
      return;
    }

    // Если перетаскиваем узел, не начинаем панорамирование
    if (draggingNode) {
      return;
    }

    // Начинаем панорамирование только если клик на пустом пространстве
    e.preventDefault();
    setIsPanning(true);
    setStartPan({
      x: e.clientX - panX,
      y: e.clientY - panY,
    });
  };

  // Глобальный обработчик для начала панорамирования за пределами canvas
  const handleContainerMouseDown = (e) => {
    // Проверяем, что клик не на элементах интерфейса вне canvas
    const isToolbar = e.target.closest('[data-tools-bar]');
    const isHeader = e.target.closest('[data-header]');
    const isSelect = e.target.closest('select');
    const isButton = e.target.closest('button');
    
    // Если клик на элементах интерфейса - не начинаем панорамирование
    if (isToolbar || isHeader || isSelect || isButton) {
      return;
    }

    // Проверяем, что клик в пределах контейнера canvas
    const containerRect = canvasContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const clickX = e.clientX;
    const clickY = e.clientY;

    // Проверяем, что клик внутри контейнера
    if (
      clickX < containerRect.left ||
      clickX > containerRect.right ||
      clickY < containerRect.top ||
      clickY > containerRect.bottom
    ) {
      return;
    }

    // Проверяем, что клик не на узле или точке соединения
    const isNode = e.target.closest('[data-node]');
    const isConnectionPoint = e.target.closest('[data-connection-point]');
    
    if (isNode || isConnectionPoint) {
      return;
    }

    // Если рисуем соединение или перетаскиваем узел - не начинаем панорамирование
    if (drawingConnection || draggingNode) {
      return;
    }

    // Начинаем панорамирование
    e.preventDefault();
    setIsPanning(true);
    setStartPan({
      x: e.clientX - panX,
      y: e.clientY - panY,
    });
  };


  const handleMouseUp = () => {
    // Панорамирование и перетаскивание обрабатываются глобальными обработчиками
    // Этот обработчик нужен только для локальных событий
  };

  const handleMouseLeave = () => {
    // Не сбрасываем панорамирование при выходе курсора за пределы canvas
    // Глобальные обработчики продолжат работать
  };

  useEffect(() => {
    if (isPanning) {
      const handleMouseMoveGlobal = (e) => {
        setPanX(e.clientX - startPan.x);
        setPanY(e.clientY - startPan.y);
      };

      const handleMouseUpGlobal = () => {
        setIsPanning(false);
      };

      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUpGlobal);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isPanning, startPan]);

  useEffect(() => {
    if (draggingNode) {
      const handleMouseMoveGlobal = (e) => {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;

        // Вычисляем новую позицию узла в координатах canvas
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;
        
        // Новая позиция узла (вычитаем смещение и padding)
        const newX = mouseX - dragOffset.x - 40; // 40px padding
        const newY = mouseY - dragOffset.y - 40; // 40px padding

        setWorkflowNodes(prevNodes =>
          prevNodes.map(node =>
            node.id === draggingNode
              ? { ...node, x: newX, y: newY }
              : node
          )
        );
      };

      const handleMouseUpGlobal = () => {
        setDraggingNode(null);
        setDragOffset({ x: 0, y: 0 });
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUpGlobal);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [draggingNode, dragOffset]);

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <PageContent>
          <HeaderSection data-header>
            <Title>Tools Workflow</Title>
            <SelectContainer>
              <SelectLabel>
                <SelectIcon />
                Select Tool
              </SelectLabel>
              <Select value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}>
                {tools.map((tool) => (
                  <option key={tool} value={tool === 'Choose a tool...' ? '' : tool}>
                    {tool}
                  </option>
                ))}
              </Select>
            </SelectContainer>
          </HeaderSection>

          {selectedTool && (
            <>
              <ToolsBar data-tools-bar>
                {availableTools.map((tool) => (
                  <ToolButton 
                    key={tool} 
                    theme={theme}
                    onClick={() => handleAddNode(tool)}
                  >
                    {tool}
                  </ToolButton>
                ))}
                <ToolSettingsButton 
                  theme={theme}
                  onClick={() => {
                    // Открываем панель настроек для первого узла или создаем общие настройки
                    if (workflowNodes.length > 0 && !selectedNodeForSettings) {
                      setSelectedNodeForSettings(workflowNodes[0].id);
                    } else if (selectedNodeForSettings) {
                      setSelectedNodeForSettings(null);
                    }
                  }}
                >
                  <HiCog size={14} />
                  Tool Settings
                </ToolSettingsButton>
              </ToolsBar>

              <CanvasContainer 
                ref={canvasContainerRef}
                theme={theme}
                onMouseDown={handleContainerMouseDown}
              >
                {workflowNodes.length > 0 ? (
                  <>
                    <WorkflowCanvas
                      ref={canvasRef}
                      $panX={panX}
                      $panY={panY}
                      $isPanning={isPanning}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                      onClick={handleCanvasClick}
                    >
                      <ConnectionLine>
                        {/* Рендерим реальные соединения */}
                        {connections.map((conn, index) => {
                          const fromNode = workflowNodes.find(n => n.id === conn.from);
                          const toNode = workflowNodes.find(n => n.id === conn.to);
                          if (!fromNode || !toNode) return null;

                          // Используем реальные позиции точек соединения
                          const fromPos = getConnectionPointPosition(conn.from, 'output');
                          const toPos = getConnectionPointPosition(conn.to, 'input');

                          // Кривая линия с контрольными точками
                          const midX = (fromPos.x + toPos.x) / 2;
                          const d = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${fromPos.y} ${midX} ${(fromPos.y + toPos.y) / 2} T ${toPos.x} ${toPos.y}`;

                          const isHovered = hoveredConnection?.from === conn.from && hoveredConnection?.to === conn.to;
                          const isSelected = selectedConnection?.from === conn.from && selectedConnection?.to === conn.to;
                          const strokeColor = isSelected 
                            ? '#EF4444' // Красный для выбранной
                            : isHovered 
                              ? theme.colors.accentHover || theme.colors.accent
                              : theme.colors.accent;
                          const strokeWidth = isHovered || isSelected ? '3' : '2';

                          return (
                            <g key={`conn-${conn.from}-${conn.to}-${index}`}>
                              {/* Невидимая область для лучшей интерактивности - увеличенная */}
                              <path
                                d={d}
                                stroke="transparent"
                                strokeWidth="20"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConnectionClick(e, conn.from, conn.to);
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  handleConnectionDoubleClick(e, conn.from, conn.to);
                                }}
                                onMouseEnter={(e) => {
                                  e.stopPropagation();
                                  handleConnectionHover(conn.from, conn.to);
                                }}
                                onMouseLeave={(e) => {
                                  e.stopPropagation();
                                  handleConnectionLeave();
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                              {/* Визуальная линия */}
                              <path
                                d={d}
                                stroke={strokeColor}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                                pointerEvents="none"
                                style={{
                                  transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
                                  filter: isSelected ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : 'none'
                                }}
                              />
                            </g>
                          );
                        })}

                        {/* Временная линия при рисовании */}
                        {drawingConnection && (
                          <line
                            x1={drawingConnection.fromX}
                            y1={drawingConnection.fromY}
                            x2={drawingConnection.toX}
                            y2={drawingConnection.toY}
                            stroke={theme.colors.accent}
                            strokeWidth="2"
                            strokeDasharray="5, 5"
                            fill="none"
                            pointerEvents="none"
                          />
                        )}
                      </ConnectionLine>

                      {workflowNodes.map((node) => {
                        const hasInputConnection = connections.some(c => c.to === node.id);
                        const hasOutputConnection = connections.some(c => c.from === node.id);
                        
                        return (
                          <Node 
                            key={node.id} 
                            theme={theme} 
                            $x={node.x} 
                            $y={node.y} 
                            data-node
                            $isDragging={draggingNode === node.id}
                            ref={(el) => {
                              if (el) nodeRefs.current[node.id] = el;
                            }}
                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                          >
                            {node.hasInput && (
                              <ConnectionPoint 
                                $type="input" 
                                $position="left"
                                $connected={hasInputConnection}
                                $hovered={hoveredInput === node.id}
                                data-connection-point
                                onClick={(e) => handleConnectionPointClick(e, node.id, 'input')}
                                onMouseEnter={() => handleConnectionPointHover(node.id, 'input')}
                                onMouseLeave={handleConnectionPointLeave}
                                theme={theme}
                              />
                            )}
                            <span>{node.name}</span>
                            <SettingsButton
                              theme={theme}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNodeForSettings(node.id);
                              }}
                              title="Настройки блока"
                            >
                              <HiCog />
                            </SettingsButton>
                            {node.hasOutput && (
                              <ConnectionPoint 
                                $type="output" 
                                $position="right"
                                $connected={hasOutputConnection}
                                data-connection-point
                                onClick={(e) => handleConnectionPointClick(e, node.id, 'output')}
                                theme={theme}
                              />
                            )}
                          </Node>
                        );
                      })}
                    </WorkflowCanvas>

                    {/* Панель настроек блока */}
                    <SettingsPanel 
                      theme={theme} 
                      $isOpen={!!selectedNodeForSettings}
                    >
                      {selectedNodeForSettings && (
                        <>
                          <SettingsHeader theme={theme}>
                            <SettingsTitle theme={theme}>
                              Настройки: {workflowNodes.find(n => n.id === selectedNodeForSettings)?.name || 'Блок'}
                            </SettingsTitle>
                            <CloseButton
                              theme={theme}
                              onClick={() => setSelectedNodeForSettings(null)}
                              title="Закрыть"
                            >
                              <HiXMark size={20} />
                            </CloseButton>
                          </SettingsHeader>
                          <SettingsContent theme={theme}>
                            <SettingItem>
                              <SettingLabel theme={theme}>Название блока</SettingLabel>
                              <SettingInput
                                theme={theme}
                                type="text"
                                value={workflowNodes.find(n => n.id === selectedNodeForSettings)?.name || ''}
                                onChange={(e) => {
                                  const newName = e.target.value;
                                  setWorkflowNodes(prevNodes =>
                                    prevNodes.map(node =>
                                      node.id === selectedNodeForSettings
                                        ? { ...node, name: newName }
                                        : node
                                    )
                                  );
                                }}
                                placeholder="Введите название"
                              />
                            </SettingItem>
                            <SettingItem>
                              <SettingLabel theme={theme}>ID блока</SettingLabel>
                              <SettingInput
                                theme={theme}
                                type="text"
                                value={selectedNodeForSettings}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                              />
                            </SettingItem>
                          </SettingsContent>
                        </>
                      )}
                    </SettingsPanel>
                  </>
                ) : (
                  <EmptyState theme={theme}>
                    <div>Выберите инструмент для отображения workflow</div>
                  </EmptyState>
                )}
              </CanvasContainer>
            </>
          )}

          {!selectedTool && (
            <CanvasContainer theme={theme}>
              <EmptyState theme={theme}>
                <div>Выберите инструмент из списка для начала работы</div>
              </EmptyState>
            </CanvasContainer>
          )}
        </PageContent>
      </ThemeProvider>
    </Layout>
  );
};
