export type CellType = 'empty' | 'wall' | 'start' | 'end';

export interface Point {
  r: number;
  c: number;
}

export type AlgorithmType = 'bfs' | 'dfs';

export type SolverStatus = 'idle' | 'running' | 'paused' | 'completed' | 'no-path';

export type BrushMode = 'wall' | 'erase' | 'start' | 'end';

export type GeneratorType = 'dfs-backtrack' | 'density' | 'preset-spiral' | 'preset-rooms' | 'preset-fork' | 'preset-island';

export interface GridSize {
  rows: number;
  cols: number;
  label: string;
}

export interface CellState {
  r: number;
  c: number;
  type: CellType;
  isVisited?: boolean;
  isCurrent?: boolean;
  isPath?: boolean;
  pathIndex?: number;
  visitIndex?: number;
}

export interface SolveResult {
  algorithm: AlgorithmType;
  found: boolean;
  visitedOrder: Point[];
  path: Point[];
  executionTimeMs: number;
  cellsVisitedCount: number;
  pathLength: number;
  gridRows: number;
  gridCols: number;
}

export interface AlgorithmComparisonData {
  bfs: SolveResult | null;
  dfs: SolveResult | null;
}
