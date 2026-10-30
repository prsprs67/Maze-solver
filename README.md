# MazeVerse — Interactive Maze Generator & Solver Using Data Structures in C

> **B.Tech Second-Year Mini-Project in Data Structures & Algorithms**  
> A high-performance interactive maze generator and pathfinding visualizer powered by core data structures implemented in **C** and compiled to **WebAssembly (WASM)** for in-browser execution.

---

## 1. Project Overview

MazeVerse is an educational and interactive pathfinding workbench designed to demonstrate fundamental computer science data structures and search algorithms:

1. **Queue (FIFO)** applied to **Breadth-First Search (BFS)** to guarantee the optimal, unweighted shortest path.
2. **Stack (LIFO)** applied to **Depth-First Search (DFS)** to traverse deep topological tunnels with backtracking.
3. **Randomized Recursive Backtracker** in C using an explicit stack for generating perfect labyrinths.

All core algorithms and data structures are written in **pure standard C (C99)**. The compiled WebAssembly module executes directly in the client's browser, passing the exact exploration trace and reconstructed path coordinates to the React/TypeScript frontend for visualization.

---

## 2. Technologies Used

- **Core Algorithms & Data Structures**: C Language (`C99`)
- **Compilation Toolchain**: Emscripten (`emcc`) & GCC
- **Binary Format**: WebAssembly (`.wasm`)
- **Frontend Architecture**: React 19, TypeScript, Tailwind CSS
- **Build System**: Vite

---

## 3. Data Structures Implemented in C

All C source code resides in the dedicated `/c` directory:

| Component | File | Data Structure & Description |
| :--- | :--- | :--- |
| **Queue** | `c/queue.h`, `c/queue.c` | Circular array-based FIFO Queue (`enqueue`, `dequeue`, `front`, `rear`, `is_empty`, `is_full`). |
| **Stack** | `c/stack.h`, `c/stack.c` | Array-based LIFO Stack (`push`, `pop`, `peek`, `is_empty`, `is_full`). |
| **Maze Matrix** | `c/maze.h`, `c/maze.c` | 2D matrix representations, parent pointer array for back-tracing, and randomized DFS generator. |
| **BFS Solver** | `c/bfs.h`, `c/bfs.c` | Breadth-First Search using circular `Queue`, 2D `visited` matrix, and 2D `parent` matrix. |
| **DFS Solver** | `c/dfs.h`, `c/dfs.c` | Depth-First Search using array `Stack`, 2D `visited` matrix, and 2D `parent` matrix. |
| **WASM Bridge** | `c/wasm_bridge.c` | WebAssembly interface with exported linear memory buffers for zero-copy JS/C communication. |
| **Native CLI** | `c/main.c` | Standalone C terminal program for command-line verification and grading. |

---

## 4. Algorithms Explained

### A. Breadth-First Search (BFS)
- **Data Structure**: Circular Queue (FIFO)
- **Time Complexity**: $O(V + E) = O(R \times C)$
- **Space Complexity**: $O(V) = O(R \times C)$
- **Mechanism**: Explores nodes in concentric layers expanding outwards from the start. Guarantees finding the **shortest path** in unweighted grids.

### B. Depth-First Search (DFS)
- **Data Structure**: Array Stack (LIFO)
- **Time Complexity**: $O(V + E) = O(R \times C)$
- **Space Complexity**: $O(V) = O(R \times C)$
- **Mechanism**: Plunges deeply down an exploratory corridor until hitting a wall or dead end, then backtracks to the most recent branching cell. Path is not guaranteed to be optimal.

### C. Randomized DFS Maze Generator
- **Data Structure**: Stack (LIFO) with backtracker
- **Mechanism**: Starts with a solid grid of walls. Pushes start point to stack, chooses a random unvisited neighbor 2 cells away, carves the wall between them, and repeats. When a dead end is reached, it pops cells off the stack to backtrack.

---

## 5. WebAssembly (WASM) Architecture

The project connects C to TypeScript via WebAssembly without mock or duplicate code:

```
+-------------------------------------------------------------+
|                      Browser / Frontend                     |
|  [React + Tailwind UI]  <--->  [src/wasm/wasmBridge.ts]     |
+--------------------------------------|----------------------+
                                       | WebAssembly.instantiate
                                       v
+-------------------------------------------------------------+
|                     public/wasm/maze.wasm                   |
|        Compiled from C via Emscripten (emcc -O3)            |
|                                                             |
|   +-------------------+              +------------------+   |
|   | c/bfs.c (Queue)   |              | c/dfs.c (Stack)  |   |
|   +-------------------+              +------------------+   |
|   | c/maze.c (Matrix) |              | c/wasm_bridge.c  |   |
|   +-------------------+              +------------------+   |
+-------------------------------------------------------------+
```

1. The frontend passes grid dimensions, start/destination coordinates, and obstacle layouts into WebAssembly linear memory (`g_input_grid`).
2. C executes `wasm_solve_bfs` or `wasm_solve_dfs`.
3. The C solver records visited coordinates (`g_visited_coords`) and reconstructed path coordinates (`g_path_coords`).
4. TypeScript reads the arrays directly from WASM memory and drives the step-by-step playback animations.

---

## 6. How to Build & Run

### A. Run the Interactive Website

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Compile C code to WebAssembly**:
   ```bash
   npm run build:wasm
   ```
   *(This invokes `emcc` to build `public/wasm/maze.wasm`)*

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   ```

---

### B. Compile and Run the Standalone C CLI Application

To run or grade the C data structures directly in your Linux/macOS/Windows terminal without a browser:

```bash
# Using GCC directly:
gcc -Wall -Wextra -O2 -std=c99 -I c c/maze.c c/queue.c c/stack.c c/bfs.c c/dfs.c c/main.c -o maze_cli

# Run the compiled binary:
./maze_cli
```

Or using the provided Makefile:
```bash
make
./maze_cli
```

---

## 7. Verifying WebAssembly Execution

To verify that the browser is genuinely executing C code via WebAssembly:

1. Open the browser Developer Tools (**F12** or **Ctrl+Shift+I**).
2. Look at the **Network** tab: you will observe `GET /wasm/maze.wasm` returning HTTP 200 with the 16KB WebAssembly binary.
3. Look at the top navigation bar of the website: the status indicator displays **`C Core: Active (WASM)`**.
4. In the statistics panel above the maze, notice the **`Engine: C (WASM)`** metric confirming execution.
5. In the browser console, run:
   ```javascript
   fetch('/wasm/maze.wasm')
     .then(r => r.arrayBuffer())
     .then(bytes => WebAssembly.instantiate(bytes))
     .then(mod => console.log('WASM Ping from C:', mod.instance.exports.wasm_ping()));
   // Logs: WASM Ping from C: 42
   ```

---

## 8. Academic Project Details

- **Course**: Data Structures & Algorithms Lab (CS201)
- **Degree**: Bachelor of Technology (B.Tech)
- **Language**: C (C99 Standard) & WebAssembly
