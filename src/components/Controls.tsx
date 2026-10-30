import React from 'react';
import {
  AlgorithmType,
  BrushMode,
  GridSize,
  SolverStatus,
} from '../types/maze';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Trash2,
  Sliders,
} from 'lucide-react';

interface ControlsProps {
  algorithm: AlgorithmType;
  onAlgorithmChange: (algo: AlgorithmType) => void;
  brushMode: BrushMode;
  onBrushModeChange: (mode: BrushMode) => void;
  solverStatus: SolverStatus;
  speedMs: number;
  onSpeedChange: (speed: number) => void;
  gridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  wallDensity: number;
  onWallDensityChange: (density: number) => void;
  onStartSolve: () => void;
  onPauseResume: () => void;
  onStepForward: () => void;
  onResetSolution: () => void;
  onClearMaze: () => void;
  onGenerateRandomMaze: () => void;
  onGenerateDensityMaze: () => void;
  onLoadPreset: (preset: 'spiral' | 'rooms' | 'fork' | 'island') => void;
}

export const GRID_PRESETS: GridSize[] = [
  { rows: 15, cols: 15, label: '15 × 15' },
  { rows: 21, cols: 21, label: '21 × 21' },
  { rows: 31, cols: 31, label: '31 × 31' },
];

export const Controls: React.FC<ControlsProps> = ({
  algorithm,
  onAlgorithmChange,
  brushMode,
  onBrushModeChange,
  solverStatus,
  speedMs,
  onSpeedChange,
  gridSize,
  onGridSizeChange,
  wallDensity,
  onWallDensityChange,
  onStartSolve,
  onPauseResume,
  onStepForward,
  onResetSolution,
  onClearMaze,
  onGenerateRandomMaze,
  onGenerateDensityMaze,
  onLoadPreset,
}) => {
  const isRunning = solverStatus === 'running';
  const isPaused = solverStatus === 'paused';

  return (
    <div className="bg-white border border-rose-200/80 rounded-xl p-4 space-y-4 text-xs shadow-xs text-slate-800">
      {/* 1. Algorithm & Solving Controls */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-slate-800 font-medium">
          <span>Algorithm</span>
          <span className="text-[11px] font-mono">
            {algorithm === 'bfs' ? (
              <span className="text-emerald-700 font-semibold">FIFO Queue (Shortest path)</span>
            ) : (
              <span className="text-rose-700 font-semibold">LIFO Stack (Exploratory)</span>
            )}
          </span>
        </div>

        {/* Algorithm Segmented Buttons */}
        <div className="grid grid-cols-2 gap-1.5 bg-rose-50/80 p-1 rounded-lg border border-rose-200/80">
          <button
            onClick={() => onAlgorithmChange('bfs')}
            className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
              algorithm === 'bfs'
                ? 'bg-white text-emerald-800 border-emerald-300 shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            BFS (Breadth-First)
          </button>

          <button
            onClick={() => onAlgorithmChange('dfs')}
            className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
              algorithm === 'dfs'
                ? 'bg-white text-rose-800 border-rose-300 shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            DFS (Depth-First)
          </button>
        </div>

        {/* Action Buttons: Start/Pause, Step, Reset, Clear */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
          {isRunning ? (
            <button
              onClick={onPauseResume}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={onPauseResume}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={onStartSolve}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{solverStatus === 'completed' || solverStatus === 'no-path' ? 'Solve Again' : 'Start'}</span>
            </button>
          )}

          <button
            onClick={onStepForward}
            disabled={!isPaused}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border transition-colors ${
              isPaused
                ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 cursor-pointer font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title={isPaused ? 'Advance one step' : 'Pause first to step'}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <button
            onClick={onResetSolution}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-md border border-rose-200 transition-colors cursor-pointer"
            title="Reset exploration progress and path"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Path</span>
          </button>

          <button
            onClick={onClearMaze}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
            title="Clear all walls"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear Grid</span>
          </button>
        </div>
      </div>

      {/* 2. Speed Slider */}
      <div className="space-y-1 pt-2 border-t border-rose-100">
        <div className="flex items-center justify-between text-slate-600 text-xs">
          <span className="flex items-center gap-1">
            <Sliders className="w-3 h-3 text-emerald-600" />
            <span>Animation Delay</span>
          </span>
          <span className="font-mono text-emerald-700 font-bold text-[11px] tabular-nums">
            {speedMs === 0 ? 'Instant (0ms)' : `${speedMs}ms`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="80"
          step="5"
          value={speedMs}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-1.5 bg-rose-100 rounded appearance-none cursor-pointer accent-emerald-600"
        />
      </div>

      {/* 3. Maze Generation */}
      <div className="space-y-2 pt-2 border-t border-rose-100">
        <span className="text-slate-800 font-medium block">Maze Generation</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onGenerateRandomMaze}
            className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-800 rounded-md text-center transition-colors cursor-pointer font-medium"
          >
            Random Maze (DFS)
          </button>
          <button
            onClick={onGenerateDensityMaze}
            className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-800 rounded-md text-center transition-colors cursor-pointer font-medium"
          >
            Scattered Walls ({(wallDensity * 100).toFixed(0)}%)
          </button>
        </div>

        {/* Density slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Wall density</span>
            <span className="font-mono text-rose-600 font-bold tabular-nums">{(wallDensity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={wallDensity}
            onChange={(e) => onWallDensityChange(Number(e.target.value))}
            className="w-full h-1.5 bg-rose-100 rounded appearance-none cursor-pointer accent-rose-500"
          />
        </div>
      </div>

      {/* 4. Brush Tool */}
      <div className="space-y-1.5 pt-2 border-t border-rose-100">
        <span className="text-slate-800 font-medium block">Edit Tool</span>
        <div className="grid grid-cols-4 gap-1 text-[11px]">
          <button
            onClick={() => onBrushModeChange('wall')}
            className={`py-1 rounded border transition-colors cursor-pointer text-center font-medium ${
              brushMode === 'wall'
                ? 'bg-slate-800 border-slate-800 text-white shadow-xs'
                : 'bg-rose-50/70 border-rose-200 text-slate-700 hover:bg-rose-100'
            }`}
          >
            Wall
          </button>
          <button
            onClick={() => onBrushModeChange('erase')}
            className={`py-1 rounded border transition-colors cursor-pointer text-center font-medium ${
              brushMode === 'erase'
                ? 'bg-slate-800 border-slate-800 text-white shadow-xs'
                : 'bg-rose-50/70 border-rose-200 text-slate-700 hover:bg-rose-100'
            }`}
          >
            Erase
          </button>
          <button
            onClick={() => onBrushModeChange('start')}
            className={`py-1 rounded border transition-colors cursor-pointer text-center font-medium ${
              brushMode === 'start'
                ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-xs'
                : 'bg-rose-50/70 border-rose-200 text-slate-700 hover:text-emerald-700'
            }`}
          >
            Start (S)
          </button>
          <button
            onClick={() => onBrushModeChange('end')}
            className={`py-1 rounded border transition-colors cursor-pointer text-center font-medium ${
              brushMode === 'end'
                ? 'bg-rose-100 border-rose-500 text-rose-800 shadow-xs'
                : 'bg-rose-50/70 border-rose-200 text-slate-700 hover:text-rose-700'
            }`}
          >
            End (E)
          </button>
        </div>
      </div>

      {/* 5. Presets & Grid Dimensions */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rose-100">
        {/* Presets */}
        <div className="space-y-1">
          <span className="text-slate-500 text-[11px] block">Test Presets</span>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <button
              onClick={() => onLoadPreset('spiral')}
              className="py-1 px-1 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded text-slate-700 text-center transition-colors cursor-pointer font-medium"
            >
              Spiral
            </button>
            <button
              onClick={() => onLoadPreset('rooms')}
              className="py-1 px-1 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded text-slate-700 text-center transition-colors cursor-pointer font-medium"
            >
              Rooms
            </button>
            <button
              onClick={() => onLoadPreset('fork')}
              className="py-1 px-1 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded text-slate-700 text-center transition-colors cursor-pointer font-medium"
            >
              Fork
            </button>
            <button
              onClick={() => onLoadPreset('island')}
              className="py-1 px-1 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded text-slate-600 text-center transition-colors cursor-pointer font-medium"
              title="Destination surrounded by walls"
            >
              No Exit
            </button>
          </div>
        </div>

        {/* Grid Scale */}
        <div className="space-y-1">
          <span className="text-slate-500 text-[11px] block">Grid Size</span>
          <div className="grid grid-cols-3 gap-1 text-[11px]">
            {GRID_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => onGridSizeChange(p)}
                className={`py-1 rounded border text-center transition-colors cursor-pointer font-medium ${
                  gridSize.rows === p.rows && gridSize.cols === p.cols
                    ? 'bg-white border-rose-400 text-rose-800 shadow-xs'
                    : 'bg-rose-50/70 border-rose-200 text-slate-700 hover:bg-rose-100'
                }`}
              >
                {p.rows}×{p.cols}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
