import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header, NavTab } from './components/Header';
import { Legend } from './components/Legend';
import { StatsPanel } from './components/StatsPanel';
import { MazeGrid } from './components/MazeGrid';
import { Controls, GRID_PRESETS } from './components/Controls';
import { ComparisonView } from './components/ComparisonView';
import {
  AlgorithmType,
  BrushMode,
  CellType,
  GridSize,
  Point,
  SolveResult,
  SolverStatus,
} from './types/maze';
import {
  createEmptyGrid,
  generateDensityMaze,
  generateRandomizedDFS,
  getPresetMaze,
  sanitizeGrid,
} from './algorithms/mazeGenerators';
import {
  initWasm,
  isWasmReady,
  solveBFSWithC,
  solveDFSWithC,
  generateRandomDFSWithC,
  generateDensityMazeWithC,
} from './wasm/wasmBridge';
import { solveBFS, solveDFS } from './algorithms/mazeSolvers';

interface SolveContext {
  solveId: number;
  visitedList: Point[];
  pathList: Point[];
  visitedIndex: number;
  pathIndex: number;
  found: boolean;
  algorithm: AlgorithmType;
  visitedSet: Set<string>;
  pathSet: Set<string>;
  pathOrderMap: Map<string, number>;
}

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('visualizer');

  // Grid Dimensions & Matrix State
  const [gridSize, setGridSize] = useState<GridSize>(GRID_PRESETS[1]); // Default 21x21
  const [start, setStart] = useState<Point>({ r: 1, c: 1 });
  const [end, setEnd] = useState<Point>({ r: 19, c: 19 });
  const [grid, setGrid] = useState<CellType[][]>(() =>
    generateRandomizedDFS(21, 21, { r: 1, c: 1 }, { r: 19, c: 19 })
  );

  // Algorithm & Settings
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bfs');
  const [brushMode, setBrushMode] = useState<BrushMode>('wall');
  const [wallDensity, setWallDensity] = useState<number>(0.3);
  const [speedMs, setSpeedMs] = useState<number>(20);

  // Solver State Machine: 'idle' | 'running' | 'paused' | 'completed' | 'no-path'
  const [solverStatus, setSolverStatus] = useState<SolverStatus>('idle');
  const [solveResult, setSolveResult] = useState<SolveResult | null>(null);
  const [wasmReady, setWasmReady] = useState<boolean>(false);

  // Initialize WebAssembly C core on mount
  useEffect(() => {
    initWasm().then(ready => {
      setWasmReady(ready);
      if (ready) {
        // Regenerate maze using compiled C Randomized DFS algorithm
        try {
          const cGrid = generateRandomDFSWithC(gridSize.rows, gridSize.cols, start, end);
          setGrid(cGrid);
        } catch (e) {
          console.warn('Initial C maze generation notice:', e);
        }
      }
    });
  }, []);

  // Display Sets for rendering visited and solution path
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());
  const [pathSet, setPathSet] = useState<Set<string>>(new Set());
  const [pathOrderMap, setPathOrderMap] = useState<Map<string, number>>(new Map());
  const [currentNode, setCurrentNode] = useState<Point | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Mutable execution references to eliminate race conditions
  const solveIdRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speedMsRef = useRef<number>(20);
  const solverStatusRef = useRef<SolverStatus>('idle');
  const solveContextRef = useRef<SolveContext | null>(null);

  // Synchronize ref with speed slider
  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  // Synchronize ref with solverStatus
  useEffect(() => {
    solverStatusRef.current = solverStatus;
  }, [solverStatus]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Stop active animation completely
  const stopAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Reset exploration paths without altering walls
  const resetSolutionState = useCallback(() => {
    stopAnimation();
    solveIdRef.current++;
    solveContextRef.current = null;
    setSolverStatus('idle');
    setSolveResult(null);
    setVisitedSet(new Set());
    setPathSet(new Set());
    setPathOrderMap(new Map());
    setCurrentNode(null);
    setCurrentStepIndex(0);
  }, [stopAnimation]);

  // Execute a single step of the algorithm
  const executeStep = useCallback((ctx: SolveContext): boolean => {
    // Phase 1: Visiting cells
    if (ctx.visitedIndex < ctx.visitedList.length) {
      const pt = ctx.visitedList[ctx.visitedIndex];
      ctx.visitedSet.add(`${pt.r},${pt.c}`);
      ctx.visitedIndex++;

      setVisitedSet(new Set(ctx.visitedSet));
      setCurrentNode(pt);
      setCurrentStepIndex(ctx.visitedIndex);

      return true; // Still has more work
    }

    // Visited phase finished: clear current frontier pulse
    setCurrentNode(null);

    // Phase 2: Drawing final path if destination was reached
    if (ctx.found) {
      if (ctx.pathIndex < ctx.pathList.length) {
        const pt = ctx.pathList[ctx.pathIndex];
        ctx.pathSet.add(`${pt.r},${pt.c}`);
        ctx.pathOrderMap.set(`${pt.r},${pt.c}`, ctx.pathIndex);
        ctx.pathIndex++;

        setPathSet(new Set(ctx.pathSet));
        setPathOrderMap(new Map(ctx.pathOrderMap));

        return true;
      }

      // Path complete!
      setSolverStatus('completed');
      return false;
    }

    // No path found!
    setSolverStatus('no-path');
    return false;
  }, []);

  // Schedule the next animation tick
  const scheduleTick = useCallback(() => {
    stopAnimation();

    const currentSolveId = solveIdRef.current;

    timeoutRef.current = setTimeout(() => {
      // Abort if execution was cancelled, replaced or paused
      if (solveIdRef.current !== currentSolveId) return;
      if (solverStatusRef.current !== 'running') return;
      if (!solveContextRef.current) return;

      const hasMore = executeStep(solveContextRef.current);
      if (hasMore && solverStatusRef.current === 'running') {
        scheduleTick();
      }
    }, speedMsRef.current);
  }, [stopAnimation, executeStep]);

  // Start solving from beginning
  const startSolving = useCallback(() => {
    stopAnimation();
    solveIdRef.current++;
    const thisSolveId = solveIdRef.current;

    // 1. Compute algorithmic solution using compiled C WebAssembly core
    const cleanGrid = sanitizeGrid(grid, start, end);
    const result = isWasmReady()
      ? (algorithm === 'bfs' ? solveBFSWithC(cleanGrid, start, end) : solveDFSWithC(cleanGrid, start, end))
      : (algorithm === 'bfs' ? solveBFS(cleanGrid, start, end) : solveDFS(cleanGrid, start, end));

    setSolveResult(result);

    // 2. Initialize execution context
    const context: SolveContext = {
      solveId: thisSolveId,
      visitedList: result.visitedOrder,
      pathList: result.path,
      visitedIndex: 0,
      pathIndex: 0,
      found: result.found,
      algorithm,
      visitedSet: new Set(),
      pathSet: new Set(),
      pathOrderMap: new Map(),
    };
    solveContextRef.current = context;

    // Clear UI state
    setVisitedSet(new Set());
    setPathSet(new Set());
    setPathOrderMap(new Map());
    setCurrentNode(null);
    setCurrentStepIndex(0);

    // Instant Mode (0ms delay)
    if (speedMsRef.current === 0) {
      const allVisited = new Set(result.visitedOrder.map(p => `${p.r},${p.c}`));
      const allPath = new Set(result.path.map(p => `${p.r},${p.c}`));
      const orderMap = new Map<string, number>();
      result.path.forEach((p, idx) => orderMap.set(`${p.r},${p.c}`, idx));

      setVisitedSet(allVisited);
      setPathSet(allPath);
      setPathOrderMap(orderMap);
      setCurrentStepIndex(result.visitedOrder.length);
      setSolverStatus(result.found ? 'completed' : 'no-path');
      return;
    }

    // Animated mode
    setSolverStatus('running');

    // Run first step immediately, then schedule subsequent
    const hasMore = executeStep(context);
    if (hasMore) {
      stopAnimation();
      timeoutRef.current = setTimeout(() => {
        if (solveIdRef.current !== thisSolveId) return;
        if (solverStatusRef.current !== 'running') return;
        scheduleTick();
      }, speedMsRef.current);
    }
  }, [grid, start, end, algorithm, stopAnimation, executeStep, scheduleTick]);

  // Pause / Resume
  const handlePauseResume = useCallback(() => {
    if (solverStatus === 'running') {
      stopAnimation();
      setSolverStatus('paused');
    } else if (solverStatus === 'paused') {
      if (!solveContextRef.current) {
        startSolving();
        return;
      }
      setSolverStatus('running');
      // Schedule immediately with current speed
      stopAnimation();
      timeoutRef.current = setTimeout(() => {
        scheduleTick();
      }, speedMsRef.current);
    }
  }, [solverStatus, stopAnimation, scheduleTick, startSolving]);

  // Step Forward (When Paused)
  const handleStepForward = useCallback(() => {
    if (solverStatus !== 'paused' || !solveContextRef.current) return;
    executeStep(solveContextRef.current);
  }, [solverStatus, executeStep]);

  // Handle Algorithm Change
  const handleAlgorithmChange = (newAlgo: AlgorithmType) => {
    if (newAlgo === algorithm) return;
    resetSolutionState();
    setAlgorithm(newAlgo);
  };

  // Handle Speed Slider Change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeedMs(newSpeed);
    speedMsRef.current = newSpeed;

    // If running and user slides to 0ms (Instant), fast-forward immediately
    if (solverStatus === 'running' && newSpeed === 0 && solveContextRef.current && solveResult) {
      stopAnimation();
      const allVisited = new Set(solveResult.visitedOrder.map(p => `${p.r},${p.c}`));
      const allPath = new Set(solveResult.path.map(p => `${p.r},${p.c}`));
      const orderMap = new Map<string, number>();
      solveResult.path.forEach((p, idx) => orderMap.set(`${p.r},${p.c}`, idx));

      setVisitedSet(allVisited);
      setPathSet(allPath);
      setPathOrderMap(orderMap);
      setCurrentNode(null);
      setCurrentStepIndex(solveResult.visitedOrder.length);
      setSolverStatus(solveResult.found ? 'completed' : 'no-path');
    }
  };

  // Handle Grid Size Change
  const handleGridSizeChange = (newSize: GridSize) => {
    resetSolutionState();
    const newStart = { r: 1, c: 1 };
    const newEnd = { r: newSize.rows - 2, c: newSize.cols - 2 };
    setGridSize(newSize);
    setStart(newStart);
    setEnd(newEnd);
    const newGrid = isWasmReady()
      ? generateRandomDFSWithC(newSize.rows, newSize.cols, newStart, newEnd)
      : generateRandomizedDFS(newSize.rows, newSize.cols, newStart, newEnd);
    setGrid(newGrid);
  };

  // Generate Perfect Maze (DFS Backtracker in C)
  const handleGenerateRandomMaze = () => {
    resetSolutionState();
    const newGrid = isWasmReady()
      ? generateRandomDFSWithC(gridSize.rows, gridSize.cols, start, end)
      : generateRandomizedDFS(gridSize.rows, gridSize.cols, start, end);
    setGrid(newGrid);
  };

  // Generate Random Wall Density Maze (in C)
  const handleGenerateDensityMaze = () => {
    resetSolutionState();
    const newGrid = isWasmReady()
      ? generateDensityMazeWithC(gridSize.rows, gridSize.cols, wallDensity, start, end)
      : generateDensityMaze(gridSize.rows, gridSize.cols, wallDensity, start, end);
    setGrid(newGrid);
  };

  // Load Sample Preset
  const handleLoadPreset = (type: 'spiral' | 'rooms' | 'fork' | 'island') => {
    resetSolutionState();
    const newGrid = getPresetMaze(type, gridSize.rows, gridSize.cols);
    setGrid(newGrid);
  };

  // Clear All Walls
  const handleClearMaze = () => {
    resetSolutionState();
    const empty = createEmptyGrid(gridSize.rows, gridSize.cols);
    for (let r = 0; r < gridSize.rows; r++) {
      for (let c = 0; c < gridSize.cols; c++) {
        if (r === 0 || r === gridSize.rows - 1 || c === 0 || c === gridSize.cols - 1) {
          empty[r][c] = 'wall';
        }
      }
    }
    setGrid(empty);
  };

  // Cell Click / Edit Handlers (automatically cancels active solve)
  const handleCellClick = (r: number, c: number) => {
    if (solverStatus !== 'idle') {
      resetSolutionState();
    }

    if (brushMode === 'start') {
      if (r !== end.r || c !== end.c) {
        setStart({ r, c });
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          next[r][c] = 'empty';
          return next;
        });
      }
      return;
    }

    if (brushMode === 'end') {
      if (r !== start.r || c !== start.c) {
        setEnd({ r, c });
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          next[r][c] = 'empty';
          return next;
        });
      }
      return;
    }

    if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) {
      return;
    }

    setGrid(prev => {
      const next = prev.map(row => [...row]);
      if (brushMode === 'wall') {
        next[r][c] = next[r][c] === 'wall' ? 'empty' : 'wall';
      } else if (brushMode === 'erase') {
        next[r][c] = 'empty';
      }
      return next;
    });
  };

  const handleCellDrag = (r: number, c: number, mode: BrushMode) => {
    if (solverStatus !== 'idle') {
      resetSolutionState();
    }

    if (mode === 'start') {
      if (r !== end.r || c !== end.c) {
        setStart({ r, c });
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          next[r][c] = 'empty';
          return next;
        });
      }
      return;
    }

    if (mode === 'end') {
      if (r !== start.r || c !== start.c) {
        setEnd({ r, c });
        setGrid(prev => {
          const next = prev.map(row => [...row]);
          next[r][c] = 'empty';
          return next;
        });
      }
      return;
    }

    if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) {
      return;
    }

    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = mode === 'wall' ? 'wall' : 'empty';
      return next;
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (solverStatus === 'idle' || solverStatus === 'completed' || solverStatus === 'no-path') {
          startSolving();
        } else {
          handlePauseResume();
        }
      } else if (e.code === 'KeyS' && solverStatus === 'paused') {
        e.preventDefault();
        handleStepForward();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetSolutionState();
      } else if (e.code === 'KeyG') {
        e.preventDefault();
        handleGenerateRandomMaze();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [solverStatus, startSolving, handlePauseResume, handleStepForward, resetSolutionState]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fff5f5] text-slate-800">
      {/* 3-Zone Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        solverStatus={solverStatus}
        onStartSolve={startSolving}
        onPauseResume={handlePauseResume}
        wasmReady={wasmReady}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Tab 1: Visualizer */}
        {activeTab === 'visualizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Zone: Maze Stage & Feedback (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-3">
              <StatsPanel
                algorithm={algorithm}
                solveResult={solveResult}
                solverStatus={solverStatus}
                currentStepIndex={currentStepIndex}
                totalVisitedSteps={solveResult?.visitedOrder.length || 0}
                rows={gridSize.rows}
                cols={gridSize.cols}
              />

              <MazeGrid
                grid={grid}
                start={start}
                end={end}
                visitedSet={visitedSet}
                pathSet={pathSet}
                pathOrderMap={pathOrderMap}
                currentNode={currentNode}
                brushMode={brushMode}
                onCellClick={handleCellClick}
                onCellDrag={handleCellDrag}
              />

              <Legend />
            </div>

            {/* Right Zone: Controls (5 cols on lg) */}
            <div className="lg:col-span-5">
              <Controls
                algorithm={algorithm}
                onAlgorithmChange={handleAlgorithmChange}
                brushMode={brushMode}
                onBrushModeChange={setBrushMode}
                solverStatus={solverStatus}
                speedMs={speedMs}
                onSpeedChange={handleSpeedChange}
                gridSize={gridSize}
                onGridSizeChange={handleGridSizeChange}
                wallDensity={wallDensity}
                onWallDensityChange={setWallDensity}
                onStartSolve={startSolving}
                onPauseResume={handlePauseResume}
                onStepForward={handleStepForward}
                onResetSolution={resetSolutionState}
                onClearMaze={handleClearMaze}
                onGenerateRandomMaze={handleGenerateRandomMaze}
                onGenerateDensityMaze={handleGenerateDensityMaze}
                onLoadPreset={handleLoadPreset}
              />
            </div>
          </div>
        )}

        {/* Tab 2: BFS vs DFS Comparison */}
        {activeTab === 'comparison' && (
          <ComparisonView grid={grid} start={start} end={end} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-200/80 bg-white/70 py-4 mt-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              <span className="text-emerald-600">Maze</span>
              <span className="text-rose-600">Verse</span>
            </span>
            <span>—</span>
            <span>Interactive Data Structures & Pathfinding Visualizer</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`hover:text-slate-900 transition-colors ${activeTab === 'visualizer' ? 'text-emerald-700 font-semibold' : ''}`}
            >
              Visualizer
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`hover:text-slate-900 transition-colors ${activeTab === 'comparison' ? 'text-rose-700 font-semibold' : ''}`}
            >
              Compare Algorithms
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
