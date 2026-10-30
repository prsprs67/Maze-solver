#include "queue.h"
#include <stdlib.h>

Queue* create_queue(int capacity) {
    if (capacity <= 0) return NULL;

    Queue* q = (Queue*)malloc(sizeof(Queue));
    if (!q) return NULL;

    q->data = (Point*)malloc(sizeof(Point) * capacity);
    if (!q->data) {
        free(q);
        return NULL;
    }

    q->capacity = capacity;
    q->front = 0;
    q->rear = -1;
    q->size = 0;
    return q;
}

void destroy_queue(Queue* q) {
    if (q) {
        if (q->data) {
            free(q->data);
        }
        free(q);
    }
}

bool is_queue_empty(const Queue* q) {
    return (q == NULL || q->size == 0);
}

bool is_queue_full(const Queue* q) {
    return (q != NULL && q->size >= q->capacity);
}

bool enqueue(Queue* q, Point p) {
    if (!q || is_queue_full(q)) return false;

    q->rear = (q->rear + 1) % q->capacity;
    q->data[q->rear] = p;
    q->size++;
    return true;
}

bool dequeue(Queue* q, Point* out) {
    if (!q || is_queue_empty(q)) return false;

    if (out) {
        *out = q->data[q->front];
    }
    q->front = (q->front + 1) % q->capacity;
    q->size--;
    return true;
}
