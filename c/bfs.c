#include "bfs.h"
#include "queue.h"
#include <string.h>

void solve_maze_bfs(int rows, int cols, const int grid[MAX_ROWS][MAX_COLS], Point start, Point end, SolveResult* result) {
    if (!result) return;

    // Reset result structure
    result->visited_count = 0;
    result->path_length = 0;
    result->found = false;
    result->execution_time_ms = 0.0;

    // Edge case: start or end out of bounds or on wall
    if (!is_valid_cell(start.r, start.c, rows, cols) ||
        !is_valid_cell(end.r, end.c, rows, cols) ||
        grid[start.r][start.c] == CELL_WALL ||
        grid[end.r][end.c] == CELL_WALL) {
        return;
    }

    // Edge case: start is already destination
    if (start.r == end.r && start.c == end.c) {
        result->visited_order[result->visited_count++] = start;
        result->path[result->path_length++] = start;
        result->found = true;
        return;
    }

    // 2D Visited matrix and Parent pointer matrix
    static bool visited[MAX_ROWS][MAX_COLS];
    static Point parent[MAX_ROWS][MAX_COLS];

    memset(visited, 0, sizeof(visited));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            parent[r][c].r = -1;
            parent[r][c].c = -1;
        }
    }

    // Initialize circular Queue
    Queue* queue = create_queue(MAX_CELLS);
    if (!queue) return;

    // Enqueue start node and mark visited
    visited[start.r][start.c] = true;
    enqueue(queue, start);
    result->visited_order[result->visited_count++] = start;

    bool reached = false;

    // Standard BFS traversal loop
    while (!is_queue_empty(queue)) {
        Point curr;
        if (!dequeue(queue, &curr)) break;

        // Check if destination has been reached
        if (curr.r == end.r && curr.c == end.c) {
            reached = true;
            break;
        }

        // Explore 4-directional adjacent neighbors
        for (int i = 0; i < 4; i++) {
            int nr = curr.r + DIR_R[i];
            int nc = curr.c + DIR_C[i];

            if (is_valid_cell(nr, nc, rows, cols) &&
                grid[nr][nc] != CELL_WALL &&
                !visited[nr][nc]) {

                visited[nr][nc] = true;
                parent[nr][nc] = curr;

                Point next_pt = {nr, nc};
                enqueue(queue, next_pt);

                if (result->visited_count < MAX_CELLS) {
                    result->visited_order[result->visited_count++] = next_pt;
                }

                // Early exit if neighbor is the destination
                if (nr == end.r && nc == end.c) {
                    reached = true;
                    goto bfs_finished;
                }
            }
        }
    }

bfs_finished:
    destroy_queue(queue);

    if (reached) {
        result->found = true;
        result->path_length = reconstruct_path(parent, start, end, result->path);
    }
}
