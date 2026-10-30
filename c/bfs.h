#ifndef BFS_H
#define BFS_H

#include "maze.h"

/**
 * Solves a 2D maze using Breadth-First Search (BFS) and a FIFO Queue
 * Guarantees the shortest path on unweighted uniform-cost grids
 * 
 * @param rows Number of rows in the maze
 * @param cols Number of columns in the maze
 * @param grid 2D matrix where 0 is empty and 1 is wall
 * @param start Start point coordinates
 * @param end Destination point coordinates
 * @param result Pointer to output SolveResult structure
 */
void solve_maze_bfs(int rows, int cols, const int grid[MAX_ROWS][MAX_COLS], Point start, Point end, SolveResult* result);

#endif // BFS_H
