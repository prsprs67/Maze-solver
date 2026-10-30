import { CellType, Point } from '../types/maze';

/**
 * Creates an empty grid of given dimensions with all cells set to 'empty'.
 */
export function createEmptyGrid(rows: number, cols: number): CellType[][] {
  const grid: CellType[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CellType[] = [];
    for (let c = 0; c < cols; c++) {
      row.push('empty');
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Helper to ensure start and end cells remain 'empty' (passable).
 */
export function sanitizeGrid(grid: CellType[][], start: Point, end: Point): CellType[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const copy = grid.map(row => [...row]);
  if (start.r >= 0 && start.r < rows && start.c >= 0 && start.c < cols) {
    copy[start.r][start.c] = 'empty';
  }
  if (end.r >= 0 && end.r < rows && end.c >= 0 && end.c < cols) {
    copy[end.r][end.c] = 'empty';
  }
  return copy;
}

/**
 * Generate a "Perfect Maze" using Randomized Depth-First Search (Iterative Backtracker).
 * A perfect maze has no loops, every cell is reachable, and there is a guaranteed single path
 * between start and destination.
 */
export function generateRandomizedDFS(
  rows: number,
  cols: number,
  start: Point = { r: 1, c: 1 },
  end: Point = { r: rows - 2, c: cols - 2 }
): CellType[][] {
  // 1. Initialize grid filled with walls
  const grid: CellType[][] = [];
  for (let r = 0; r < rows; r++) {
    grid.push(new Array(cols).fill('wall'));
  }

  // Ensure odd coordinates for passage carving if possible
  const startR = start.r % 2 === 1 ? start.r : Math.max(1, start.r - 1);
  const startC = start.c % 2 === 1 ? start.c : Math.max(1, start.c - 1);

  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack: Point[] = [];

  grid[startR][startC] = 'empty';
  visited[startR][startC] = true;
  stack.push({ r: startR, c: startC });

  // 4 directions step 2 cells: Up, Down, Left, Right
  const directions = [
    { dr: -2, dc: 0, wallR: -1, wallC: 0 },
    { dr: 2, dc: 0, wallR: 1, wallC: 0 },
    { dr: 0, dc: -2, wallR: 0, wallC: -1 },
    { dr: 0, dc: 2, wallR: 0, wallC: 1 },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    // Find unvisited neighbors at distance 2
    const unvisitedNeighbors: { next: Point; wall: Point }[] = [];

    // Shuffle directions for randomized carving
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);

    for (const dir of shuffledDirs) {
      const nr = current.r + dir.dr;
      const nc = current.c + dir.dc;

      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && !visited[nr][nc]) {
        unvisitedNeighbors.push({
          next: { r: nr, c: nc },
          wall: { r: current.r + dir.wallR, c: current.c + dir.wallC },
        });
      }
    }

    if (unvisitedNeighbors.length > 0) {
      // Choose random neighbor
      const chosen = unvisitedNeighbors[0];
      // Carve through wall
      grid[chosen.wall.r][chosen.wall.c] = 'empty';
      grid[chosen.next.r][chosen.next.c] = 'empty';
      visited[chosen.next.r][chosen.next.c] = true;
      stack.push(chosen.next);
    } else {
      // Backtrack
      stack.pop();
    }
  }

  // Ensure start and end are open and connected to maze passages
  grid[start.r][start.c] = 'empty';
  grid[end.r][end.c] = 'empty';

  // Ensure end has at least one adjacent opening if it got walled in
  const endNeighbors = [
    { r: end.r - 1, c: end.c },
    { r: end.r + 1, c: end.c },
    { r: end.r, c: end.c - 1 },
    { r: end.r, c: end.c + 1 },
  ].filter(p => p.r >= 0 && p.r < rows && p.c >= 0 && p.c < cols);

  const hasEndPassage = endNeighbors.some(p => grid[p.r][p.c] === 'empty');
  if (!hasEndPassage && endNeighbors.length > 0) {
    grid[endNeighbors[0].r][endNeighbors[0].c] = 'empty';
  }

  return grid;
}

/**
 * Generate a random maze based on wall density (e.g. 30%), while guaranteeing a clear route
 * between start and end by first carving a random walk / braided path.
 */
export function generateDensityMaze(
  rows: number,
  cols: number,
  wallDensity: number = 0.3,
  start: Point = { r: 1, c: 1 },
  end: Point = { r: rows - 2, c: cols - 2 }
): CellType[][] {
  const grid: CellType[][] = [];

  // Start with empty grid with outer perimeter walls
  for (let r = 0; r < rows; r++) {
    const row: CellType[] = [];
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push('wall');
      } else {
        row.push(Math.random() < wallDensity ? 'wall' : 'empty');
      }
    }
    grid.push(row);
  }

  // Guaranteed route carve from start to end (Random Walk / Manhattan Carve)
  let currR = start.r;
  let currC = start.c;
  grid[currR][currC] = 'empty';

  while (currR !== end.r || currC !== end.c) {
    // Choose whether to move towards destination or take a slight scenic detour
    const preferDetour = Math.random() < 0.25;

    if (!preferDetour) {
      if (currR < end.r && (currC === end.c || Math.random() < 0.5)) {
        currR++;
      } else if (currR > end.r && (currC === end.c || Math.random() < 0.5)) {
        currR--;
      } else if (currC < end.c) {
        currC++;
      } else if (currC > end.c) {
        currC--;
      }
    } else {
      const candidates: Point[] = [
        { r: currR + 1, c: currC },
        { r: currR - 1, c: currC },
        { r: currR, c: currC + 1 },
        { r: currR, c: currC - 1 },
      ].filter(p => p.r > 0 && p.r < rows - 1 && p.c > 0 && p.c < cols - 1);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      currR = chosen.r;
      currC = chosen.c;
    }

    grid[currR][currC] = 'empty';
  }

  grid[start.r][start.c] = 'empty';
  grid[end.r][end.c] = 'empty';

  return grid;
}

/**
 * Curated Preset Mazes for quick academic testing
 */
export function getPresetMaze(type: 'spiral' | 'rooms' | 'fork' | 'island', rows: number, cols: number): CellType[][] {
  const grid = createEmptyGrid(rows, cols);

  // Outer border
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        grid[r][c] = 'wall';
      }
    }
  }

  if (type === 'spiral') {
    // Inward winding spiral walls
    let top = 2, bottom = rows - 3, left = 2, right = cols - 3;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) grid[top][c] = 'wall';
      for (let r = top; r <= bottom; r++) grid[r][right] = 'wall';
      for (let c = right; c >= left; c--) grid[bottom][c] = 'wall';
      for (let r = bottom; r >= top + 2; r--) grid[r][left] = 'wall';

      // Openings for traversal
      grid[top + 1][right] = 'empty';
      grid[bottom][left + 1] = 'empty';

      top += 2;
      bottom -= 2;
      left += 2;
      right -= 2;
    }
  } else if (type === 'rooms') {
    // Two large chambers connected by a narrow single bottleneck passage
    const midCol = Math.floor(cols / 2);
    for (let r = 1; r < rows - 1; r++) {
      grid[r][midCol] = 'wall';
    }
    // Single bottleneck doorway
    const doorR = Math.floor(rows / 2);
    grid[doorR][midCol] = 'empty';

    // Interior obstacles
    for (let r = 3; r < rows - 3; r += 3) {
      grid[r][Math.floor(midCol / 2)] = 'wall';
      grid[r][Math.floor((midCol + cols) / 2)] = 'wall';
    }
  } else if (type === 'fork') {
    // Complex fork: One path is short but trapped/winding, one path is long
    const midR = Math.floor(rows / 2);
    for (let c = 2; c < cols - 2; c++) {
      grid[midR][c] = 'wall';
    }
    // Opening at beginning of partition and end
    grid[midR][3] = 'empty';
    grid[midR][cols - 4] = 'empty';

    // Vertical baffles creating alternating slalom
    for (let r = 2; r < midR; r++) {
      grid[r][Math.floor(cols / 3)] = 'wall';
    }
    for (let r = midR + 1; r < rows - 2; r++) {
      grid[r][Math.floor((cols * 2) / 3)] = 'wall';
    }
  } else if (type === 'island') {
    // Destination is completely walled off (No Path Exists test case)
    const endR = rows - 2;
    const endC = cols - 2;
    grid[endR - 1][endC] = 'wall';
    grid[endR][endC - 1] = 'wall';
    grid[endR - 1][endC - 1] = 'wall';
    // Extra obstacles
    for (let r = 3; r < rows - 3; r += 2) {
      for (let c = 3; c < cols - 3; c += 2) {
        grid[r][c] = 'wall';
      }
    }
  }

  // Ensure start and end
  grid[1][1] = 'empty';
  grid[rows - 2][cols - 2] = 'empty';

  return grid;
}
