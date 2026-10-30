/**
 * Queue Data Structure (FIFO - First In, First Out)
 * Used by Breadth-First Search (BFS) to explore nodes level-by-level.
 * Implemented using a linked or pointer-based structure to ensure O(1) enqueue and dequeue operations.
 */
class QueueNode<T> {
  value: T;
  next: QueueNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private count: number = 0;

  /**
   * Add an element to the back of the queue (Enqueue)
   * Time Complexity: O(1)
   */
  enqueue(item: T): void {
    const newNode = new QueueNode(item);
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.count++;
  }

  /**
   * Remove and return the front element of the queue (Dequeue)
   * Time Complexity: O(1)
   */
  dequeue(): T | undefined {
    if (!this.head) {
      return undefined;
    }
    const val = this.head.value;
    this.head = this.head.next;
    if (!this.head) {
      this.tail = null;
    }
    this.count--;
    return val;
  }

  /**
   * Return the front element without removing it
   * Time Complexity: O(1)
   */
  peek(): T | undefined {
    return this.head?.value;
  }

  /**
   * Check if queue is empty
   * Time Complexity: O(1)
   */
  isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Return current number of elements in the queue
   */
  size(): number {
    return this.count;
  }

  /**
   * Convert queue elements to an array (for educational inspection)
   */
  toArray(): T[] {
    const result: T[] = [];
    let curr = this.head;
    while (curr) {
      result.push(curr.value);
      curr = curr.next;
    }
    return result;
  }
}
