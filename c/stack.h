#ifndef STACK_H
#define STACK_H

#include "queue.h" // For Point definition
#include <stdbool.h>

/**
 * Array-based Stack implementation
 * Used for Depth-First Search (DFS) to enforce LIFO exploration
 */
typedef struct {
    Point* data;
    int top;
    int capacity;
} Stack;

/**
 * Creates and initializes a stack with the given capacity
 */
Stack* create_stack(int capacity);

/**
 * Frees memory allocated for the stack
 */
void destroy_stack(Stack* s);

/**
 * Checks if the stack is empty
 */
bool is_stack_empty(const Stack* s);

/**
 * Checks if the stack is full
 */
bool is_stack_full(const Stack* s);

/**
 * Pushes a point onto the stack
 * Returns true if successful, false if full
 */
bool push(Stack* s, Point p);

/**
 * Pops a point from the top of the stack
 * Returns true if successful, false if empty
 */
bool pop(Stack* s, Point* out);

/**
 * Peeks at the top point without removing it
 * Returns true if successful, false if empty
 */
bool peek(const Stack* s, Point* out);

#endif // STACK_H
