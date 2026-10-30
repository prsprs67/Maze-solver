import { Queue } from '../data-structures/Queue';
import { Stack } from '../data-structures/Stack';
import { CellType, Point, SolveResult } from '../types/maze';

// 4-directional moves: Up, Right, Down, Left
export const CARDINAL_DIRECTIONS: { dr: number; dc: number; name: string }[] = [
  { dr: -1, dc: 0, name: 'Up' },
  { dr: 0, dc: 1, name: 'Right' },
  { dr: 1, dc: 0, name: 'Down' },
  { dr: 0, dc: -1, name: 'Left' },
];

/**
 * Encodes row and col into a string key "r,c" for lookup maps
 */
export function pointToKey(p: Point): string {
  return `${p.r},${p.c}`;
}

/**
 * Decodes string key "r,c" into a Point object
 */
export function keyToPoint(key: string): Point {
  const [r, c] = key.split(',').map(Number);
  return { r, c };
}

/**
 * Validates if a cell coordinate is within grid bounds and not a wall.
 */
export function isValidMove(r: number, c: number, grid: CellType[][]): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== 'wall';
}

/**
 * Breadth-First Search (BFS) Maze Solver
 * - Guarantees the SHORTEST path on an unweighted grid.
 * - Uses a genuine FIFO Queue.
 * - Time Complexity: O(V + E) = O(R * C)
 * - Space Complexity: O(V) = O(R * C)
 */
export function solveBFS(
  grid: CellType[][],
  start: Point,
  end: Point
): SolveResult {
  const startTime = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const visitedOrder: Point[] = [];
  const parentMap = new Map<string, string | null>();
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  const queue = new Queue<Point>();

  // Initialize
  const startKey = pointToKey(start);
  const endKey = pointToKey(end);

  queue.enqueue(start);
  visited[start.r][start.c] = true;
  parentMap.set(startKey, null);

  let targetFound = false;

  // Edge case: start is already end
  if (start.r === end.r && start.c === end.c) {
    targetFound = true;
    visitedOrder.push(start);
  } else {
    while (!queue.isEmpty()) {
      const current = queue.dequeue()!;
      visitedOrder.push(current);

      if (current.r === end.r && current.c === end.c) {
        targetFound = true;
        break;
      }

      // Explore neighbors in 4 directions
      for (const dir of CARDINAL_DIRECTIONS) {
        const nr = current.r + dir.dr;
        const nc = current.c + dir.dc;

        if (isValidMove(nr, nc, grid) && !visited[nr][nc]) {
          visited[nr][nc] = true;
          const nextPoint = { r: nr, c: nc };
          parentMap.set(pointToKey(nextPoint), pointToKey(current));
          queue.enqueue(nextPoint);
        }
      }
    }
  }

  // Reconstruct path from End back to Start
  const path: Point[] = [];
  if (targetFound) {
    let currKey: string | null = endKey;
    while (currKey !== null) {
      path.unshift(keyToPoint(currKey));
      currKey = parentMap.get(currKey) ?? null;
    }
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

  return {
    algorithm: 'bfs',
    found: targetFound,
    visitedOrder,
    path,
    executionTimeMs,
    cellsVisitedCount: visitedOrder.length,
    pathLength: path.length > 0 ? path.length - 1 : 0, // number of steps/edges
    gridRows: rows,
    gridCols: cols,
  };
}

/**
 * Depth-First Search (DFS) Maze Solver
 * - Explores deep down each corridor before backtracking.
 * - Does NOT guarantee the shortest path.
 * - Uses a genuine LIFO Stack.
 * - Time Complexity: O(V + E) = O(R * C)
 * - Space Complexity: O(V) = O(R * C)
 */
export function solveDFS(
  grid: CellType[][],
  start: Point,
  end: Point
): SolveResult {
  const startTime = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const visitedOrder: Point[] = [];
  const parentMap = new Map<string, string | null>();
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  const stack = new Stack<Point>();

  const startKey = pointToKey(start);
  const endKey = pointToKey(end);

  stack.push(start);
  parentMap.set(startKey, null);

  let targetFound = false;

  // Edge case: start is already end
  if (start.r === end.r && start.c === end.c) {
    targetFound = true;
    visitedOrder.push(start);
  } else {
    while (!stack.isEmpty()) {
      const current = stack.pop()!;

      if (visited[current.r][current.c]) {
        continue;
      }

      visited[current.r][current.c] = true;
      visitedOrder.push(current);

      if (current.r === end.r && current.c === end.c) {
        targetFound = true;
        break;
      }

      // Add neighbors to stack in reverse order so direction priority is preserved
      for (let i = CARDINAL_DIRECTIONS.length - 1; i >= 0; i--) {
        const dir = CARDINAL_DIRECTIONS[i];
        const nr = current.r + dir.dr;
        const nc = current.c + dir.dc;

        if (isValidMove(nr, nc, grid) && !visited[nr][nc]) {
          const nextPoint = { r: nr, c: nc };
          // Only set parent if not already visited
          const nKey = pointToKey(nextPoint);
          if (!parentMap.has(nKey)) {
            parentMap.set(nKey, pointToKey(current));
          }
          stack.push(nextPoint);
        }
      }
    }
  }

  // Reconstruct path from End back to Start
  const path: Point[] = [];
  if (targetFound) {
    let currKey: string | null = endKey;
    while (currKey !== null) {
      path.unshift(keyToPoint(currKey));
      currKey = parentMap.get(currKey) ?? null;
    }
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

  return {
    algorithm: 'dfs',
    found: targetFound,
    visitedOrder,
    path,
    executionTimeMs,
    cellsVisitedCount: visitedOrder.length,
    pathLength: path.length > 0 ? path.length - 1 : 0,
    gridRows: rows,
    gridCols: cols,
  };
}
