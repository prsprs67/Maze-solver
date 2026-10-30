import React from 'react';
import { SolverStatus } from '../types/maze';

export type NavTab = 'visualizer' | 'comparison';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  solverStatus: SolverStatus;
  onStartSolve: () => void;
  onPauseResume: () => void;
  wasmReady?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  wasmReady = true,
}) => {
  return (
    <header className="border-b border-rose-200/70 bg-white/90 backdrop-blur-xs sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight">
              <span className="text-emerald-600">Maze</span>
              <span className="text-rose-600">Verse</span>
            </span>
            <span className="text-rose-300 text-xs hidden sm:inline">/</span>
            <span className="text-slate-500 text-xs font-normal hidden sm:inline">
              Data Structures & Pathfinding Visualizer
            </span>
          </div>
        </div>

        {/* View Segmented Tabs */}
        <div className="flex items-center gap-1 bg-rose-50/90 p-1 rounded-lg border border-rose-200/80 text-xs">
          <button
            onClick={() => onTabChange('visualizer')}
            className={`px-3 py-1 rounded-md transition-colors font-medium cursor-pointer ${
              activeTab === 'visualizer'
                ? 'bg-white text-emerald-700 border border-emerald-300/80 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visualizer
          </button>
          <button
            onClick={() => onTabChange('comparison')}
            className={`px-3 py-1 rounded-md transition-colors font-medium cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-white text-rose-700 border border-rose-300/80 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Compare BFS & DFS
          </button>
        </div>

        {/* Header Right Indicator */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{wasmReady ? 'C Core: Active (WASM)' : 'Loading C Core...'}</span>
          </div>
          <span className="text-rose-200">·</span>
          <span className="font-mono text-[11px] text-slate-500">
            Space: Start/Pause
          </span>
        </div>
      </div>
    </header>
  );
};
