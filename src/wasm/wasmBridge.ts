import { CellType, Point, SolveResult } from '../types/maze';

interface WasmExports {
  memory: WebAssembly.Memory;
  wasm_ping: () => number;
  wasm_get_input_grid_ptr: () => number;
  wasm_set_grid_cell: (r: number, c: number, val: number) => void;
  wasm_get_visited_count: () => number;
  wasm_get_visited_ptr: () => number;
  wasm_get_path_length: () => number;
  wasm_get_path_ptr: () => number;
  wasm_get_path_found: () => number;
  wasm_get_generated_grid_ptr: () => number;
  wasm_solve_bfs: (rows: number, cols: number, start_r: number, start_c: number, end_r: number, end_c: number) => number;
  wasm_solve_dfs: (rows: number, cols: number, start_r: number, start_c: number, end_r: number, end_c: number) => number;
  wasm_generate_random_maze: (rows: number, cols: number, start_r: number, start_c: number, end_r: number, end_c: number, seed: number) => void;
  wasm_generate_density_maze: (rows: number, cols: number, density: number, start_r: number, start_c: number, end_r: number, end_c: number, seed: number) => void;
}

let wasmInstance: WasmExports | null = null;
let wasmInitPromise: Promise<boolean> | null = null;

const MAX_ROWS = 65;
const MAX_COLS = 65;

/**
 * Initializes and loads the compiled C WebAssembly binary
 */
export async function initWasm(): Promise<boolean> {
  if (wasmInstance) return true;
  if (wasmInitPromise) return wasmInitPromise;

  wasmInitPromise = (async () => {
    try {
      let wasmBuffer: BufferSource;

      // In browser environment
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        const response = await fetch('/wasm/maze.wasm');
        if (!response.ok) {
          throw new Error(`Failed to fetch /wasm/maze.wasm (status ${response.status})`);
        }
        wasmBuffer = await response.arrayBuffer();
      } else {
        // Node / Server environment fallback
        const fs = await import('fs');
        const path = await import('path');
        const wasmPath = path.resolve(process.cwd(), 'public/wasm/maze.wasm');
        const fileData = fs.readFileSync(wasmPath);
        wasmBuffer = new Uint8Array(fileData);
      }

      const { instance } = await WebAssembly.instantiate(wasmBuffer);
      wasmInstance = instance.exports as unknown as WasmExports;

      const ping = wasmInstance.wasm_ping();
      if (ping !== 42) {
        throw new Error(`WASM ping failed: expected 42, got ${ping}`);
      }

      return true;
    } catch (err) {
      console.error('Failed to load C WebAssembly module:', err);
      return false;
    }
  })();

  return wasmInitPromise;
}

export function isWasmReady(): boolean {
  return wasmInstance !== null;
}

/**
 * Copies a TypeScript 2D grid matrix into the C WebAssembly linear memory buffer
 */
function copyGridToWasm(grid: CellType[][], wasm: WasmExports): void {
  const inGridPtr = wasm.wasm_get_input_grid_ptr();
  const mem32 = new Int32Array(wasm.memory.buffer, inGridPtr, MAX_ROWS * MAX_COLS);

  // Clear memory
  mem32.fill(0);

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      mem32[r * MAX_COLS + c] = grid[r][c] === 'wall' ? 1 : 0;
    }
  }
}

/**
 * Executes Breadth-First Search (BFS) directly inside compiled C using the C Queue
 */
export function solveBFSWithC(
  grid: CellType[][],
  start: Point,
  end: Point
): SolveResult {
  if (!wasmInstance) {
    throw new Error('C WebAssembly module is not loaded. Call initWasm() first.');
  }

  const wasm = wasmInstance;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  copyGridToWasm(grid, wasm);

  const startTime = performance.now();
  const foundFlag = wasm.wasm_solve_bfs(rows, cols, start.r, start.c, end.r, end.c);
  const executionTimeMs = performance.now() - startTime;

  // Retrieve visited order array from C linear memory
  const visitedCount = wasm.wasm_get_visited_count();
  const visitedPtr = wasm.wasm_get_visited_ptr();
  const visitedRaw = new Int32Array(wasm.memory.buffer, visitedPtr, visitedCount * 2);

  const visitedOrder: Point[] = [];
  for (let i = 0; i < visitedCount; i++) {
    visitedOrder.push({
      r: visitedRaw[i * 2],
      c: visitedRaw[i * 2 + 1],
    });
  }

  // Retrieve final path array from C linear memory
  const pathLength = wasm.wasm_get_path_length();
  const pathPtr = wasm.wasm_get_path_ptr();
  const pathRaw = new Int32Array(wasm.memory.buffer, pathPtr, pathLength * 2);

  const path: Point[] = [];
  for (let i = 0; i < pathLength; i++) {
    path.push({
      r: pathRaw[i * 2],
      c: pathRaw[i * 2 + 1],
    });
  }

  return {
    algorithm: 'bfs',
    gridRows: rows,
    gridCols: cols,
    path,
    visitedOrder,
    cellsVisitedCount: visitedCount,
    pathLength,
    executionTimeMs,
    found: foundFlag === 1,
  };
}

/**
 * Executes Depth-First Search (DFS) directly inside compiled C using the C Stack
 */
export function solveDFSWithC(
  grid: CellType[][],
  start: Point,
  end: Point
): SolveResult {
  if (!wasmInstance) {
    throw new Error('C WebAssembly module is not loaded. Call initWasm() first.');
  }

  const wasm = wasmInstance;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  copyGridToWasm(grid, wasm);

  const startTime = performance.now();
  const foundFlag = wasm.wasm_solve_dfs(rows, cols, start.r, start.c, end.r, end.c);
  const executionTimeMs = performance.now() - startTime;

  // Retrieve visited order array from C linear memory
  const visitedCount = wasm.wasm_get_visited_count();
  const visitedPtr = wasm.wasm_get_visited_ptr();
  const visitedRaw = new Int32Array(wasm.memory.buffer, visitedPtr, visitedCount * 2);

  const visitedOrder: Point[] = [];
  for (let i = 0; i < visitedCount; i++) {
    visitedOrder.push({
      r: visitedRaw[i * 2],
      c: visitedRaw[i * 2 + 1],
    });
  }

  // Retrieve final path array from C linear memory
  const pathLength = wasm.wasm_get_path_length();
  const pathPtr = wasm.wasm_get_path_ptr();
  const pathRaw = new Int32Array(wasm.memory.buffer, pathPtr, pathLength * 2);

  const path: Point[] = [];
  for (let i = 0; i < pathLength; i++) {
    path.push({
      r: pathRaw[i * 2],
      c: pathRaw[i * 2 + 1],
    });
  }

  return {
    algorithm: 'dfs',
    gridRows: rows,
    gridCols: cols,
    path,
    visitedOrder,
    cellsVisitedCount: visitedCount,
    pathLength,
    executionTimeMs,
    found: foundFlag === 1,
  };
}

/**
 * Generates a perfect maze using Randomized DFS & Backtracking in C
 */
export function generateRandomDFSWithC(
  rows: number,
  cols: number,
  start: Point,
  end: Point
): CellType[][] {
  if (!wasmInstance) {
    throw new Error('C WebAssembly module is not loaded. Call initWasm() first.');
  }

  const wasm = wasmInstance;
  const seed = Math.floor(Math.random() * 2147483647);
  wasm.wasm_generate_random_maze(rows, cols, start.r, start.c, end.r, end.c, seed);

  const genGridPtr = wasm.wasm_get_generated_grid_ptr();
  const mem32 = new Int32Array(wasm.memory.buffer, genGridPtr, MAX_ROWS * MAX_COLS);

  const grid: CellType[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CellType[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(mem32[r * MAX_COLS + c] === 1 ? 'wall' : 'empty');
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Generates a scattered wall density maze in C
 */
export function generateDensityMazeWithC(
  rows: number,
  cols: number,
  density: number,
  start: Point,
  end: Point
): CellType[][] {
  if (!wasmInstance) {
    throw new Error('C WebAssembly module is not loaded. Call initWasm() first.');
  }

  const wasm = wasmInstance;
  const seed = Math.floor(Math.random() * 2147483647);
  wasm.wasm_generate_density_maze(rows, cols, density, start.r, start.c, end.r, end.c, seed);

  const genGridPtr = wasm.wasm_get_generated_grid_ptr();
  const mem32 = new Int32Array(wasm.memory.buffer, genGridPtr, MAX_ROWS * MAX_COLS);

  const grid: CellType[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CellType[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(mem32[r * MAX_COLS + c] === 1 ? 'wall' : 'empty');
    }
    grid.push(row);
  }

  return grid;
}
