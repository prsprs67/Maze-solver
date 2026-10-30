#ifndef QUEUE_H
#define QUEUE_H

#include <stdbool.h>

/**
 * Coordinate point representation in 2D grid matrix
 */
typedef struct {
    int r;
    int c;
} Point;

/**
 * Circular Queue implementation using an array buffer
 * Used for Breadth-First Search (BFS) to guarantee FIFO order
 */
typedef struct {
    Point* data;
    int front;
    int rear;
    int size;
    int capacity;
} Queue;

/**
 * Creates and initializes a queue with the given capacity
 */
Queue* create_queue(int capacity);

/**
 * Frees memory allocated for the queue
 */
void destroy_queue(Queue* q);

/**
 * Checks if the queue is empty
 */
bool is_queue_empty(const Queue* q);

/**
 * Checks if the queue is full
 */
bool is_queue_full(const Queue* q);

/**
 * Inserts a point at the rear of the queue
 * Returns true if successful, false if full
 */
bool enqueue(Queue* q, Point p);

/**
 * Removes and returns the front point from the queue
 * Returns true if successful, false if empty
 */
bool dequeue(Queue* q, Point* out);

#endif // QUEUE_H
