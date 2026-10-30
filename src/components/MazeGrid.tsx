import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BrushMode, CellType, Point } from '../types/maze';

interface MazeGridProps {
  grid: CellType[][];
  start: Point;
  end: Point;
  visitedSet: Set<string>;
  pathSet: Set<string>;
  pathOrderMap: Map<string, number>;
  currentNode: Point | null;
  brushMode: BrushMode;
  onCellClick: (r: number, c: number) => void;
  onCellDrag: (r: number, c: number, mode: BrushMode) => void;
}

export const MazeGrid: React.FC<MazeGridProps> = ({
  grid,
  start,
  end,
  visitedSet,
  pathSet,
  pathOrderMap,
  currentNode,
  brushMode,
  onCellClick,
  onCellDrag,
}) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [draggedNode, setDraggedNode] = useState<'start' | 'end' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Release dragging anywhere
  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseDown(false);
      setDraggedNode(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const handleMouseDownCell = (r: number, c: number) => {
    if (r === start.r && c === start.c) {
      setDraggedNode('start');
      setIsMouseDown(true);
      return;
    }
    if (r === end.r && c === end.c) {
      setDraggedNode('end');
      setIsMouseDown(true);
      return;
    }

    setIsMouseDown(true);
    onCellClick(r, c);
  };

  const handleMouseEnterCell = (r: number, c: number) => {
    if (!isMouseDown) return;

    if (draggedNode === 'start') {
      if (r !== end.r || c !== end.c) {
        onCellDrag(r, c, 'start');
      }
      return;
    }

    if (draggedNode === 'end') {
      if (r !== start.r || c !== start.c) {
        onCellDrag(r, c, 'end');
      }
      return;
    }

    // Normal wall or erase dragging
    if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) {
      return;
    }

    onCellDrag(r, c, brushMode);
  };

  // Touch move handler for mobile devices
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isMouseDown || !containerRef.current) return;
      const touch = e.touches[0];
      const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
      if (targetElement && targetElement.hasAttribute('data-cell-pos')) {
        const [rStr, cStr] = targetElement.getAttribute('data-cell-pos')!.split('-');
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);
        if (!isNaN(r) && !isNaN(c)) {
          handleMouseEnterCell(r, c);
        }
      }
    },
    [isMouseDown, draggedNode, brushMode, start, end]
  );

  return (
    <div
      ref={containerRef}
      onTouchMove={handleTouchMove}
      className="w-full flex items-center justify-center p-3 sm:p-4 bg-white border border-rose-200/80 rounded-xl shadow-xs select-none"
    >
      <div
        className="grid gap-[1px] bg-rose-100/70 p-1.5 rounded-lg border border-rose-200/90 w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          aspectRatio: `${cols} / ${rows}`,
          maxWidth: `${Math.min(cols * 30, 720)}px`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cellType, c) => {
            const key = `${r},${c}`;
            const isStart = r === start.r && c === start.c;
            const isEnd = r === end.r && c === end.c;
            const isWall = cellType === 'wall';
            const isVisited = visitedSet.has(key);
            const isPath = pathSet.has(key);
            const isCurrent = currentNode?.r === r && currentNode?.c === c;
            const pathOrder = pathOrderMap.get(key);

            let cellBg = 'bg-white hover:bg-rose-50/60';
            let cellBorder = 'border-rose-100/80';
            let extraStyles = '';

            if (isWall) {
              cellBg = 'bg-slate-800';
              cellBorder = 'border-slate-850';
            } else if (isPath) {
              cellBg = 'bg-emerald-500 text-white font-bold z-10 shadow-xs';
              cellBorder = 'border-emerald-400';
              extraStyles = 'animate-cell-path';
            } else if (isCurrent) {
              cellBg = 'bg-rose-500 text-white ring-2 ring-emerald-400 z-20';
              cellBorder = 'border-rose-400';
            } else if (isVisited) {
              cellBg = 'bg-rose-100/90 text-rose-700';
              cellBorder = 'border-rose-300';
              extraStyles = 'animate-cell-visited';
            }

            if (isStart) {
              cellBg = 'bg-emerald-600 text-white font-bold z-20 shadow-xs';
              cellBorder = 'border-emerald-500';
            } else if (isEnd) {
              cellBg = 'bg-rose-600 text-white font-bold z-20 shadow-xs';
              cellBorder = 'border-rose-500';
            }

            return (
              <div
                key={key}
                data-cell-pos={`${r}-${c}`}
                onMouseDown={() => handleMouseDownCell(r, c)}
                onMouseEnter={() => handleMouseEnterCell(r, c)}
                className={`relative flex items-center justify-center border text-[9px] sm:text-[10px] transition-colors cursor-pointer ${cellBg} ${cellBorder} ${extraStyles}`}
                style={{
                  aspectRatio: '1 / 1',
                }}
                title={
                  isStart
                    ? 'Start (drag to move)'
                    : isEnd
                    ? 'Destination (drag to move)'
                    : isWall
                    ? 'Wall'
                    : isPath
                    ? `Path Step ${pathOrder ?? ''}`
                    : isVisited
                    ? 'Visited'
                    : 'Empty cell'
                }
              >
                {isStart ? (
                  <span className="font-mono font-bold text-[10px] sm:text-xs">S</span>
                ) : isEnd ? (
                  <span className="font-mono font-bold text-[10px] sm:text-xs">E</span>
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                ) : isPath && cols <= 25 ? (
                  <span className="text-[8px] font-mono font-bold">
                    {pathOrder !== undefined ? pathOrder : ''}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
