import React from 'react';
import { AlgorithmType, SolveResult, SolverStatus } from '../types/maze';

interface StatsPanelProps {
  algorithm: AlgorithmType;
  solveResult: SolveResult | null;
  solverStatus: SolverStatus;
  currentStepIndex: number;
  totalVisitedSteps: number;
  rows: number;
  cols: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  algorithm,
  solveResult,
  solverStatus,
  currentStepIndex,
  rows,
  cols,
}) => {
  const isRunning = solverStatus === 'running';
  const isPaused = solverStatus === 'paused';
  const isCompleted = solverStatus === 'completed';
  const isNoPath = solverStatus === 'no-path';

  const currentVisited = isRunning || isPaused ? currentStepIndex : solveResult ? solveResult.cellsVisitedCount : 0;
  const currentPathLen = solveResult && isCompleted ? solveResult.pathLength : 0;
  const executionTime = solveResult ? solveResult.executionTimeMs : 0;

  let statusText = 'Ready to solve';
  let statusBadgeClass = 'text-slate-700 bg-rose-50/80 border border-rose-200';

  if (isRunning) {
    statusText = `Exploring with ${algorithm.toUpperCase()}...`;
    statusBadgeClass =
      algorithm === 'bfs'
        ? 'text-emerald-800 bg-emerald-50 border border-emerald-300/80 font-medium'
        : 'text-rose-800 bg-rose-50 border border-rose-300/80 font-medium';
  } else if (isPaused) {
    statusText = `Paused at step ${currentStepIndex}`;
    statusBadgeClass = 'text-amber-800 bg-amber-50 border border-amber-300 font-medium';
  } else if (isCompleted) {
    statusText = algorithm === 'bfs' ? `Shortest path found (${currentPathLen} steps)` : `Path discovered (${currentPathLen} steps)`;
    statusBadgeClass = 'text-emerald-800 bg-emerald-50 border border-emerald-300 font-semibold';
  } else if (isNoPath) {
    statusText = 'No path exists to destination';
    statusBadgeClass = 'text-rose-800 bg-rose-50 border border-rose-300 font-medium';
  }

  return (
    <div className="bg-white border border-rose-200/80 rounded-lg p-3 text-xs shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Status:</span>
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] ${statusBadgeClass}`}>
            {statusText}
          </span>
        </div>

        {/* Live numerical metrics */}
        <div className="flex flex-wrap items-center gap-4 text-slate-700 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 font-sans mr-1.5">Visited:</span>
            <span className="font-bold text-rose-600">{currentVisited}</span>
            <span className="text-slate-400 font-sans text-[10px] ml-1">/ {rows * cols}</span>
          </div>

          <div>
            <span className="text-slate-500 font-sans mr-1.5">Path:</span>
            <span className="font-bold text-emerald-600">
              {currentPathLen > 0 ? `${currentPathLen} steps` : isNoPath ? '0' : '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-sans mr-1.5">Compute:</span>
            <span className="text-slate-700 font-semibold">
              {executionTime > 0 ? `${executionTime.toFixed(1)}ms` : '< 1ms'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-sans mr-1.5">Grid:</span>
            <span className="text-slate-700">{rows}×{cols}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
