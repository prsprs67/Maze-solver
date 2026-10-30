import React, { useMemo } from 'react';
import { CellType, Point } from '../types/maze';
import { solveBFSWithC, solveDFSWithC, isWasmReady } from '../wasm/wasmBridge';
import { solveBFS, solveDFS } from '../algorithms/mazeSolvers';
import { Trophy, CheckCircle2 } from 'lucide-react';

interface ComparisonViewProps {
  grid: CellType[][];
  start: Point;
  end: Point;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  grid,
  start,
  end,
}) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Compute both solutions using C compiled into WebAssembly
  const bfsResult = useMemo(() => {
    return isWasmReady() ? solveBFSWithC(grid, start, end) : solveBFS(grid, start, end);
  }, [grid, start, end]);

  const dfsResult = useMemo(() => {
    return isWasmReady() ? solveDFSWithC(grid, start, end) : solveDFS(grid, start, end);
  }, [grid, start, end]);

  const bfsPathSet = useMemo(() => new Set(bfsResult.path.map((p) => `${p.r},${p.c}`)), [bfsResult]);
  const dfsPathSet = useMemo(() => new Set(dfsResult.path.map((p) => `${p.r},${p.c}`)), [dfsResult]);

  const bfsVisitedSet = useMemo(() => new Set(bfsResult.visitedOrder.map((p) => `${p.r},${p.c}`)), [bfsResult]);
  const dfsVisitedSet = useMemo(() => new Set(dfsResult.visitedOrder.map((p) => `${p.r},${p.c}`)), [dfsResult]);

  const bothFound = bfsResult.found && dfsResult.found;
  const pathDifference = dfsResult.pathLength - bfsResult.pathLength;

  return (
    <div className="space-y-4">
      {/* Workbench Header */}
      <div className="bg-white border border-rose-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="text-xs font-mono font-medium flex items-center gap-2 mb-1">
            <span className="text-emerald-700 font-semibold">BFS (Green)</span>
            <span className="text-rose-300">&middot;</span>
            <span className="text-rose-700 font-semibold">DFS (Pink)</span>
            <span className="text-rose-300">&middot;</span>
            <span className="text-slate-500">Identical Maze Matrix</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Breadth-First Search vs Depth-First Search
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            BFS guarantees the shortest path on unweighted grids using a FIFO queue. DFS explores as far along a branch as possible before backtracking using a LIFO stack.
          </p>
        </div>

        {/* Outcome Summary */}
        {bothFound && pathDifference > 0 ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-lg shrink-0 text-left shadow-xs">
            <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-800">BFS found a shorter route</div>
              <div className="text-[11px] text-slate-600 font-mono">
                {pathDifference} fewer steps ({bfsResult.pathLength} vs {dfsResult.pathLength})
              </div>
            </div>
          </div>
        ) : bothFound ? (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-lg shrink-0 text-left shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800">Identical Path Length</div>
              <div className="text-[11px] text-slate-600 font-mono">Both paths: {bfsResult.pathLength} steps</div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Side-by-Side Visual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: BFS Panel (Green Identity) */}
        <div className="bg-white border border-emerald-300/80 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
              <h3 className="text-sm font-bold text-emerald-800">Breadth-First Search (BFS)</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              FIFO Queue
            </span>
          </div>

          {/* Mini Grid Canvas */}
          <div className="w-full flex items-center justify-center p-2.5 bg-rose-50/50 border border-rose-200/70 rounded-lg">
            <div
              className="grid gap-[1px] bg-rose-100/60 p-1 rounded max-w-full"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                aspectRatio: `${cols} / ${rows}`,
                width: '100%',
                maxWidth: '420px',
              }}
            >
              {grid.map((row, r) =>
                row.map((cellType, c) => {
                  const key = `${r},${c}`;
                  const isStart = r === start.r && c === start.c;
                  const isEnd = r === end.r && c === end.c;
                  const isWall = cellType === 'wall';
                  const isPath = bfsPathSet.has(key);
                  const isVisited = bfsVisitedSet.has(key);

                  let bg = 'bg-white';
                  if (isWall) bg = 'bg-slate-800';
                  else if (isPath) bg = 'bg-emerald-500 text-white font-bold z-10';
                  else if (isVisited) bg = 'bg-emerald-100/80 border border-emerald-200';

                  if (isStart) bg = 'bg-emerald-600 text-white font-bold';
                  if (isEnd) bg = 'bg-rose-600 text-white font-bold';

                  return (
                    <div
                      key={key}
                      className={`relative flex items-center justify-center rounded-[1px] ${bg} text-[7px] select-none`}
                      style={{ aspectRatio: '1 / 1' }}
                    >
                      {isStart && 'S'}
                      {isEnd && 'E'}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Path Length</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {bfsResult.found ? `${bfsResult.pathLength} steps` : 'None'}
              </span>
            </div>
            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Cells Explored</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {bfsResult.cellsVisitedCount}
              </span>
            </div>
            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Optimality</span>
              <span className="font-mono font-bold text-emerald-600 text-xs">
                Guaranteed Shortest
              </span>
            </div>
          </div>
        </div>

        {/* Right: DFS Panel (Pink Identity) */}
        <div className="bg-white border border-rose-300/80 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <h3 className="text-sm font-bold text-rose-800">Depth-First Search (DFS)</h3>
            </div>
            <span className="text-[11px] font-mono text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
              LIFO Stack
            </span>
          </div>

          {/* Mini Grid Canvas */}
          <div className="w-full flex items-center justify-center p-2.5 bg-rose-50/50 border border-rose-200/70 rounded-lg">
            <div
              className="grid gap-[1px] bg-rose-100/60 p-1 rounded max-w-full"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                aspectRatio: `${cols} / ${rows}`,
                width: '100%',
                maxWidth: '420px',
              }}
            >
              {grid.map((row, r) =>
                row.map((cellType, c) => {
                  const key = `${r},${c}`;
                  const isStart = r === start.r && c === start.c;
                  const isEnd = r === end.r && c === end.c;
                  const isWall = cellType === 'wall';
                  const isPath = dfsPathSet.has(key);
                  const isVisited = dfsVisitedSet.has(key);

                  let bg = 'bg-white';
                  if (isWall) bg = 'bg-slate-800';
                  else if (isPath) bg = 'bg-emerald-500 text-white font-bold z-10';
                  else if (isVisited) bg = 'bg-rose-100/80 border border-rose-200';

                  if (isStart) bg = 'bg-emerald-600 text-white font-bold';
                  if (isEnd) bg = 'bg-rose-600 text-white font-bold';

                  return (
                    <div
                      key={key}
                      className={`relative flex items-center justify-center rounded-[1px] ${bg} text-[7px] select-none`}
                      style={{ aspectRatio: '1 / 1' }}
                    >
                      {isStart && 'S'}
                      {isEnd && 'E'}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Path Length</span>
              <span className="font-mono font-bold text-rose-700 text-sm">
                {dfsResult.found ? `${dfsResult.pathLength} steps` : 'None'}
              </span>
            </div>
            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Cells Explored</span>
              <span className="font-mono font-bold text-rose-700 text-sm">
                {dfsResult.cellsVisitedCount}
              </span>
            </div>
            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-center">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Optimality</span>
              <span className="font-mono font-medium text-slate-500 text-xs">
                Not Guaranteed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
