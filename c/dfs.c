#include "dfs.h"
#include "stack.h"
#include <string.h>

void solve_maze_dfs(int rows, int cols, const int grid[MAX_ROWS][MAX_COLS], Point start, Point end, SolveResult* result) {
    if (!result) return;

    // Reset result structure
    result->visited_count = 0;
    result->path_length = 0;
    result->found = false;
    result->execution_time_ms = 0.0;

    // Boundary & wall validation
    if (!is_valid_cell(start.r, start.c, rows, cols) ||
        !is_valid_cell(end.r, end.c, rows, cols) ||
        grid[start.r][start.c] == CELL_WALL ||
        grid[end.r][end.c] == CELL_WALL) {
        return;
    }

    // Start is destination
    if (start.r == end.r && start.c == end.c) {
        result->visited_order[result->visited_count++] = start;
        result->path[result->path_length++] = start;
        result->found = true;
        return;
    }

    // 2D Visited matrix and Parent matrix
    static bool visited[MAX_ROWS][MAX_COLS];
    static Point parent[MAX_ROWS][MAX_COLS];

    memset(visited, 0, sizeof(visited));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            parent[r][c].r = -1;
            parent[r][c].c = -1;
        }
    }

    // Initialize LIFO Stack
    Stack* stack = create_stack(MAX_CELLS);
    if (!stack) return;

    // Push start node
    push(stack, start);

    bool reached = false;

    // Standard iterative DFS loop using explicit stack
    while (!is_stack_empty(stack)) {
        Point curr;
        if (!pop(stack, &curr)) break;

        // Skip if already visited
        if (visited[curr.r][curr.c]) continue;

        visited[curr.r][curr.c] = true;
        if (result->visited_count < MAX_CELLS) {
            result->visited_order[result->visited_count++] = curr;
        }

        // Check if destination has been reached
        if (curr.r == end.r && curr.c == end.c) {
            reached = true;
            break;
        }

        // Push unvisited adjacent neighbors onto stack
        // Traversing in reverse order ensures standard direction priority on pop
        for (int i = 3; i >= 0; i--) {
            int nr = curr.r + DIR_R[i];
            int nc = curr.c + DIR_C[i];

            if (is_valid_cell(nr, nc, rows, cols) &&
                grid[nr][nc] != CELL_WALL &&
                !visited[nr][nc]) {

                // Record parent pointer if not yet assigned
                if (parent[nr][nc].r == -1) {
                    parent[nr][nc] = curr;
                }

                Point next_pt = {nr, nc};
                push(stack, next_pt);
            }
        }
    }

    destroy_stack(stack);

    if (reached) {
        result->found = true;
        result->path_length = reconstruct_path(parent, start, end, result->path);
    }
}
