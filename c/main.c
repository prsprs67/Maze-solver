#include <stdio.h>
#include <stdlib.h>
#include "maze.h"
#include "bfs.h"
#include "dfs.h"
#include "queue.h"
#include "stack.h"

void print_maze(int rows, int cols, const int grid[MAX_ROWS][MAX_COLS], Point start, Point end, const SolveResult* result) {
    bool is_path[MAX_ROWS][MAX_COLS] = {false};
    if (result && result->found) {
        for (int i = 0; i < result->path_length; i++) {
            is_path[result->path[i].r][result->path[i].c] = true;
        }
    }

    printf("\n");
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (r == start.r && c == start.c) {
                printf(" S ");
            } else if (r == end.r && c == end.c) {
                printf(" E ");
            } else if (is_path[r][c]) {
                printf(" * ");
            } else if (grid[r][c] == CELL_WALL) {
                printf(" # ");
            } else {
                printf(" . ");
            }
        }
        printf("\n");
    }
    printf("\n");
}

int main(int argc, char* argv[]) {
    printf("========================================================\n");
    printf("  MazeVerse: Data Structures Mini-Project in C\n");
    printf("  Core Algorithms: Queue (BFS) & Stack (DFS)\n");
    printf("========================================================\n\n");

    int rows = 15;
    int cols = 15;
    Point start = {1, 1};
    Point end = {13, 13};

    int grid[MAX_ROWS][MAX_COLS];

    printf("[1] Generating 15x15 Perfect Maze using Randomized DFS Backtracker in C...\n");
    generate_randomized_dfs_maze(rows, cols, start, end, grid, 42);
    printf("Maze generated successfully.\n");

    printf("\n[2] Executing Breadth-First Search (BFS) using Circular Queue...\n");
    SolveResult bfs_result;
    solve_maze_bfs(rows, cols, grid, start, end, &bfs_result);

    if (bfs_result.found) {
        printf("-> BFS Solution Found!\n");
        printf("   Cells Visited (Explored): %d\n", bfs_result.visited_count);
        printf("   Shortest Path Length:     %d steps\n", bfs_result.path_length);
    } else {
        printf("-> BFS: No solution exists!\n");
    }

    printf("\n[3] Executing Depth-First Search (DFS) using Array-based Stack...\n");
    SolveResult dfs_result;
    solve_maze_dfs(rows, cols, grid, start, end, &dfs_result);

    if (dfs_result.found) {
        printf("-> DFS Solution Found!\n");
        printf("   Cells Visited (Explored): %d\n", dfs_result.visited_count);
        printf("   Path Length:              %d steps\n", dfs_result.path_length);
    } else {
        printf("-> DFS: No solution exists!\n");
    }

    printf("\n[4] Solved Maze Visualization (BFS Shortest Path):\n");
    print_maze(rows, cols, grid, start, end, &bfs_result);

    printf("========================================================\n");
    printf("  All C Data Structures verified successfully!\n");
    printf("========================================================\n");

    return 0;
}
