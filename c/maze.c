#include "maze.h"
#include "stack.h"
#include <stdlib.h>
#include <string.h>

const int DIR_R[4] = {-1, 0, 1, 0};
const int DIR_C[4] = {0, 1, 0, -1};

bool is_valid_cell(int r, int c, int rows, int cols) {
    return (r >= 0 && r < rows && c >= 0 && c < cols);
}

int reconstruct_path(Point parent[MAX_ROWS][MAX_COLS], Point start, Point end, Point* out_path) {
    Point temp[MAX_CELLS];
    int count = 0;

    Point curr = end;
    temp[count++] = curr;

    while (!(curr.r == start.r && curr.c == start.c)) {
        Point p = parent[curr.r][curr.c];
        if (p.r == -1 && p.c == -1) {
            // No valid path
            return 0;
        }
        curr = p;
        temp[count++] = curr;
        if (count >= MAX_CELLS) break;
    }

    // Reverse path so that start is at index 0 and end is at index count - 1
    for (int i = 0; i < count; i++) {
        out_path[i] = temp[count - 1 - i];
    }

    return count;
}

// Pseudo-random number generator for deterministic seeds
static unsigned int prng_next(unsigned int* state) {
    *state = (*state * 1103515245 + 12345) & 0x7fffffff;
    return *state;
}

void generate_randomized_dfs_maze(int rows, int cols, Point start, Point end, int out_grid[MAX_ROWS][MAX_COLS], unsigned int seed) {
    if (seed == 0) seed = 1337;

    // Initialize all cells as walls
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            out_grid[r][c] = CELL_WALL;
        }
    }

    // Align start carving cell to odd coordinates
    int start_r = (start.r % 2 == 1) ? start.r : 1;
    int start_c = (start.c % 2 == 1) ? start.c : 1;
    if (start_r >= rows - 1) start_r = rows - 2;
    if (start_c >= cols - 1) start_c = cols - 2;

    out_grid[start_r][start_c] = CELL_EMPTY;

    // Use our Stack data structure for iterative backtracker
    Stack* stack = create_stack(MAX_CELLS);
    if (!stack) return;

    Point curr = {start_r, start_c};
    push(stack, curr);

    while (!is_stack_empty(stack)) {
        peek(stack, &curr);

        // Find unvisited neighbors 2 steps away
        int valid_dirs[4];
        int valid_count = 0;

        for (int i = 0; i < 4; i++) {
            int nr = curr.r + DIR_R[i] * 2;
            int nc = curr.c + DIR_C[i] * 2;

            if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1) {
                if (out_grid[nr][nc] == CELL_WALL) {
                    valid_dirs[valid_count++] = i;
                }
            }
        }

        if (valid_count > 0) {
            // Pick a random unvisited neighbor
            int pick = prng_next(&seed) % valid_count;
            int dir = valid_dirs[pick];

            int wall_r = curr.r + DIR_R[dir];
            int wall_c = curr.c + DIR_C[dir];
            int next_r = curr.r + DIR_R[dir] * 2;
            int next_c = curr.c + DIR_C[dir] * 2;

            // Carve wall and next cell
            out_grid[wall_r][wall_c] = CELL_EMPTY;
            out_grid[next_r][next_c] = CELL_EMPTY;

            Point next_pt = {next_r, next_c};
            push(stack, next_pt);
        } else {
            // Backtrack
            Point discarded;
            pop(stack, &discarded);
        }
    }

    destroy_stack(stack);

    // Guarantee Start and End are open
    out_grid[start.r][start.c] = CELL_EMPTY;
    out_grid[end.r][end.c] = CELL_EMPTY;

    // Ensure entrance to start and end
    if (start.r + 1 < rows - 1) out_grid[start.r + 1][start.c] = CELL_EMPTY;
    else if (start.c + 1 < cols - 1) out_grid[start.r][start.c + 1] = CELL_EMPTY;

    if (end.r - 1 > 0) out_grid[end.r - 1][end.c] = CELL_EMPTY;
    else if (end.c - 1 > 0) out_grid[end.r][end.c - 1] = CELL_EMPTY;
}

void generate_density_maze(int rows, int cols, double density, Point start, Point end, int out_grid[MAX_ROWS][MAX_COLS], unsigned int seed) {
    if (seed == 0) seed = 42;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            // Border is always wall
            if (r == 0 || r == rows - 1 || c == 0 || c == cols - 1) {
                out_grid[r][c] = CELL_WALL;
            } else {
                double rnd = (double)(prng_next(&seed) % 10000) / 10000.0;
                out_grid[r][c] = (rnd < density) ? CELL_WALL : CELL_EMPTY;
            }
        }
    }

    // Ensure start and end are always open
    out_grid[start.r][start.c] = CELL_EMPTY;
    out_grid[end.r][end.c] = CELL_EMPTY;

    // Guarantee at least one path neighborhood is open
    if (start.r + 1 < rows) out_grid[start.r + 1][start.c] = CELL_EMPTY;
    if (start.c + 1 < cols) out_grid[start.r][start.c + 1] = CELL_EMPTY;
    if (end.r - 1 >= 0) out_grid[end.r - 1][end.c] = CELL_EMPTY;
    if (end.c - 1 >= 0) out_grid[end.r][end.c - 1] = CELL_EMPTY;
}
