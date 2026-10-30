#include "stack.h"
#include <stdlib.h>

Stack* create_stack(int capacity) {
    if (capacity <= 0) return NULL;

    Stack* s = (Stack*)malloc(sizeof(Stack));
    if (!s) return NULL;

    s->data = (Point*)malloc(sizeof(Point) * capacity);
    if (!s->data) {
        free(s);
        return NULL;
    }

    s->capacity = capacity;
    s->top = -1;
    return s;
}

void destroy_stack(Stack* s) {
    if (s) {
        if (s->data) {
            free(s->data);
        }
        free(s);
    }
}

bool is_stack_empty(const Stack* s) {
    return (s == NULL || s->top < 0);
}

bool is_stack_full(const Stack* s) {
    return (s != NULL && s->top >= s->capacity - 1);
}

bool push(Stack* s, Point p) {
    if (!s || is_stack_full(s)) return false;

    s->top++;
    s->data[s->top] = p;
    return true;
}

bool pop(Stack* s, Point* out) {
    if (!s || is_stack_empty(s)) return false;

    if (out) {
        *out = s->data[s->top];
    }
    s->top--;
    return true;
}

bool peek(const Stack* s, Point* out) {
    if (!s || is_stack_empty(s)) return false;

    if (out) {
        *out = s->data[s->top];
    }
    return true;
}
