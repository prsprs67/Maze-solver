#include "maze.h"
#include "bfs.h"
#include "dfs.h"
#include <emscripten.h>
#include <string.h>

// Static buffers for WebAssembly shared linear memory
static int g_input_grid[MAX_ROWS][MAX_COLS];
static int g_generated_grid[MAX_ROWS][MAX_COLS];

// Flat coordinate arrays [r0, c0, r1, c1, ...] for zero-copy reading by JavaScript/TypeScript
static int g_visited_coords[MAX_CELLS * 2];
static int g_visited_count = 0;

static int g_path_coords[MAX_CELLS * 2];
static int g_path_length = 0;

static int g_found = 0;

EMSCRIPTEN_KEEPALIVE
int wasm_ping(void) {
    return 42;
}

EMSCRIPTEN_KEEPALIVE
int* wasm_get_input_grid_ptr(void) {
    return (int*)g_input_grid;
}

EMSCRIPTEN_KEEPALIVE
void wasm_set_grid_cell(int r, int c, int val) {
    if (r >= 0 && r < MAX_ROWS && c >= 0 && c < MAX_COLS) {
        g_input_grid[r][c] = val;
    }
}

EMSCRIPTEN_KEEPALIVE
int wasm_get_visited_count(void) {
    return g_visited_count;
}

EMSCRIPTEN_KEEPALIVE
int* wasm_get_visited_ptr(void) {
    return g_visited_coords;
}

EMSCRIPTEN_KEEPALIVE
int wasm_get_path_length(void) {
    return g_path_length;
}

EMSCRIPTEN_KEEPALIVE
int* wasm_get_path_ptr(void) {
    return g_path_coords;
}

EMSCRIPTEN_KEEPALIVE
int wasm_get_path_found(void) {
    return g_found;
}

EMSCRIPTEN_KEEPALIVE
int* wasm_get_generated_grid_ptr(void) {
    return (int*)g_generated_grid;
}

EMSCRIPTEN_KEEPALIVE
int wasm_solve_bfs(int rows, int cols, int start_r, int start_c, int end_r, int end_c) {
    SolveResult result;
    Point start = {start_r, start_c};
    Point end = {end_r, end_c};

    solve_maze_bfs(rows, cols, g_input_grid, start, end, &result);

    g_visited_count = result.visited_count;
    for (int i = 0; i < result.visited_count; i++) {
        g_visited_coords[i * 2] = result.visited_order[i].r;
        g_visited_coords[i * 2 + 1] = result.visited_order[i].c;
    }

    g_path_length = result.path_length;
    for (int i = 0; i < result.path_length; i++) {
        g_path_coords[i * 2] = result.path[i].r;
        g_path_coords[i * 2 + 1] = result.path[i].c;
    }

    g_found = result.found ? 1 : 0;
    return g_found;
}

EMSCRIPTEN_KEEPALIVE
int wasm_solve_dfs(int rows, int cols, int start_r, int start_c, int end_r, int end_c) {
    SolveResult result;
    Point start = {start_r, start_c};
    Point end = {end_r, end_c};

    solve_maze_dfs(rows, cols, g_input_grid, start, end, &result);

    g_visited_count = result.visited_count;
    for (int i = 0; i < result.visited_count; i++) {
        g_visited_coords[i * 2] = result.visited_order[i].r;
        g_visited_coords[i * 2 + 1] = result.visited_order[i].c;
    }

    g_path_length = result.path_length;
    for (int i = 0; i < result.path_length; i++) {
        g_path_coords[i * 2] = result.path[i].r;
        g_path_coords[i * 2 + 1] = result.path[i].c;
    }

    g_found = result.found ? 1 : 0;
    return g_found;
}

EMSCRIPTEN_KEEPALIVE
void wasm_generate_random_maze(int rows, int cols, int start_r, int start_c, int end_r, int end_c, unsigned int seed) {
    Point start = {start_r, start_c};
    Point end = {end_r, end_c};
    generate_randomized_dfs_maze(rows, cols, start, end, g_generated_grid, seed);
}

EMSCRIPTEN_KEEPALIVE
void wasm_generate_density_maze(int rows, int cols, double density, int start_r, int start_c, int end_r, int end_c, unsigned int seed) {
    Point start = {start_r, start_c};
    Point end = {end_r, end_c};
    generate_density_maze(rows, cols, density, start, end, g_generated_grid, seed);
}
