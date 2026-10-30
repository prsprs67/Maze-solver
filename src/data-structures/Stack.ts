/**
 * Stack Data Structure (LIFO - Last In, First Out)
 * Used by Depth-First Search (DFS) to explore paths deeply before backtracking.
 * Implemented using an internal top pointer to ensure O(1) push, pop, and peek operations.
 */
class StackNode<T> {
  value: T;
  next: StackNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class Stack<T> {
  private topNode: StackNode<T> | null = null;
  private count: number = 0;

  /**
   * Push an element onto the stack
   * Time Complexity: O(1)
   */
  push(item: T): void {
    const newNode = new StackNode(item);
    newNode.next = this.topNode;
    this.topNode = newNode;
    this.count++;
  }

  /**
   * Pop the topmost element off the stack
   * Time Complexity: O(1)
   */
  pop(): T | undefined {
    if (!this.topNode) {
      return undefined;
    }
    const val = this.topNode.value;
    this.topNode = this.topNode.next;
    this.count--;
    return val;
  }

  /**
   * View the top element without popping
   * Time Complexity: O(1)
   */
  peek(): T | undefined {
    return this.topNode?.value;
  }

  /**
   * Check if stack is empty
   * Time Complexity: O(1)
   */
  isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Return number of elements in the stack
   */
  size(): number {
    return this.count;
  }

  /**
   * Convert stack elements to an array (top-to-bottom) for inspection
   */
  toArray(): T[] {
    const result: T[] = [];
    let curr = this.topNode;
    while (curr) {
      result.push(curr.value);
      curr = curr.next;
    }
    return result;
  }
}
