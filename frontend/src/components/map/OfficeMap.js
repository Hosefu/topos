import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { DESK_STATUS_COLORS, DESK_STATUSES } from '../../config';

const OfficeMap = ({ layout, desks, selectedDesk, onDeskSelect }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);

  // Устанавливаем размер сцены при монтировании и изменении размера окна
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Сбрасываем позицию и масштаб при изменении схемы
  useEffect(() => {
    if (layout) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [layout]);

  // Обработчик масштабирования (зум)
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    let newScale = e.evt.deltaY < 0 ? scale * scaleBy : scale / scaleBy;

    // Ограничиваем масштаб
    newScale = Math.max(0.5, Math.min(newScale, 3));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  // Обработчик клика по столу
  const handleDeskClick = (desk) => {
    if (desk.status !== DESK_STATUSES.AVAILABLE) {
      // Нельзя выбрать недоступный стол
      return;
    }
    onDeskSelect(desk);
  };

  // Получаем цвет для статуса стола
  const getDeskColor = (status) => {
    return DESK_STATUS_COLORS[status] || DESK_STATUS_COLORS[DESK_STATUSES.AVAILABLE];
  };

  // Проверяем, выбран ли стол
  const isSelected = (deskId) => {
    return selectedDesk && selectedDesk.id === deskId;
  };

  // Получаем цвет границы стола
  const getDeskStrokeColor = (desk) => {
    return isSelected(desk.id) ? '#000' : '#666';
  };

  // Получаем толщину границы стола
  const getDeskStrokeWidth = (desk) => {
    return isSelected(desk.id) ? 2 : 1;
  };

  // Рендерим стол
  const renderDesk = (desk) => {
    const deskWidth = 50;
    const deskHeight = 30;

    return (
      <Group
        key={desk.id}
        x={desk.x_coordinate}
        y={desk.y_coordinate}
        onClick={() => handleDeskClick(desk)}
        onTap={() => handleDeskClick(desk)}
        opacity={desk.status === DESK_STATUSES.MAINTENANCE ? 0.5 : 1}
        draggable={false}
        cursor={desk.status === DESK_STATUSES.AVAILABLE ? 'pointer' : 'not-allowed'}
      >
        <Rect
          width={deskWidth}
          height={deskHeight}
          fill={getDeskColor(desk.status)}
          stroke={getDeskStrokeColor(desk)}
          strokeWidth={getDeskStrokeWidth(desk)}
          cornerRadius={3}
        />
        <Text
          text={desk.desk_number}
          fontSize={10}
          fontFamily="Arial"
          fill="white"
          width={deskWidth}
          height={deskHeight}
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  };

  // Рендерим элементы схемы (стены, двери и т.д.)
  const renderLayoutElements = () => {
    if (!layout?.elements) return null;

    return layout.elements.map((element) => {
      if (element.element_type === 'wall') {
        return (
          <Rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.color || '#888'}
            rotation={element.rotation || 0}
          />
        );
      }
      
      if (element.element_type === 'area') {
        return (
          <Group key={element.id}>
            <Rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill={element.color || '#f0f0f0'}
              opacity={0.3}
              rotation={element.rotation || 0}
            />
            {element.name && (
              <Text
                text={element.name}
                x={element.x + 5}
                y={element.y + 5}
                fontSize={12}
                fontFamily="Arial"
                fill="#666"
              />
            )}
          </Group>
        );
      }
      
      return null;
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        <Layer>
          {/* Фон */}
          <Rect
            x={0}
            y={0}
            width={layout?.width || 1000}
            height={layout?.height || 800}
            fill="#f9fafb"
          />
          
          {/* Элементы схемы */}
          {renderLayoutElements()}
          
          {/* Столы */}
          {desks?.map(renderDesk)}
        </Layer>
      </Stage>
      
      {/* Элементы управления */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={() => setScale(Math.min(scale * 1.2, 3))}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => setScale(Math.max(scale / 1.2, 0.5))}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OfficeMap;