#ifndef MAZE_H
#define MAZE_H

#include "queue.h"
#include <stdbool.h>

#define MAX_ROWS 65
#define MAX_COLS 65
#define MAX_CELLS (MAX_ROWS * MAX_COLS)

// Cell types in maze
#define CELL_EMPTY 0
#define CELL_WALL 1

/**
 * Result structure returned by maze solving algorithms
 */
typedef struct {
    Point visited_order[MAX_CELLS];
    int visited_count;
    Point path[MAX_CELLS];
    int path_length;
    bool found;
    double execution_time_ms;
} SolveResult;

/**
 * Directional vectors for 4-neighbor grid expansion (Up, Right, Down, Left)
 */
extern const int DIR_R[4];
extern const int DIR_C[4];

/**
 * Validates whether a cell coordinate is within grid bounds
 */
bool is_valid_cell(int r, int c, int rows, int cols);

/**
 * Reconstructs the solution path from parent pointers
 */
int reconstruct_path(Point parent[MAX_ROWS][MAX_COLS], Point start, Point end, Point* out_path);

/**
 * Generates a perfect maze using Randomized DFS with a Stack (Recursive Backtracker)
 * Fills out_grid with 0 (empty) and 1 (wall)
 */
void generate_randomized_dfs_maze(int rows, int cols, Point start, Point end, int out_grid[MAX_ROWS][MAX_COLS], unsigned int seed);

/**
 * Generates a maze with randomized wall density
 */
void generate_density_maze(int rows, int cols, double density, Point start, Point end, int out_grid[MAX_ROWS][MAX_COLS], unsigned int seed);

#endif // MAZE_H
