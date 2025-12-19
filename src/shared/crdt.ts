import type { CharNode } from "./crdtTypes.js";

export class SharedCRDT {
  siteId: string;
  struct: CharNode[];
  clock: number;

  constructor(siteId: string = Math.random().toString(36).slice(2)) {
    this.siteId = siteId;
    this.clock = 0;
    this.struct = [
      {
        id: "ROOT",
        value: "",
        origin: "",
        tombstone: false,
        timestamp: Date.now(),
        lamport: 0,
      },
    ];
  }

  private getSortedNodes(): CharNode[] {
    const active = this.struct.filter((n) => !n.tombstone && n.id !== "ROOT");
    const childMap = new Map<string, CharNode[]>();

    for (const node of active) {
      if (!childMap.has(node.origin)) childMap.set(node.origin, []);
      childMap.get(node.origin)!.push(node);
    }

    for (const children of childMap.values()) {
      children.sort((a, b) => {
        if (a.lamport !== b.lamport) return b.lamport - a.lamport;
        return b.id.localeCompare(a.id);
      });
    }

    const result: CharNode[] = [];
    const traverse = (parentId: string) => {
      const children = childMap.get(parentId) || [];
      for (const child of children) {
        result.push(child);
        traverse(child.id);
      }
    };
    traverse("ROOT");
    return result;
  }

  localInsert(char: string, visibleIndex: number): CharNode {
    this.clock++;

    const sortedNodes = this.getSortedNodes();
    const leftNode =
      visibleIndex === 0 ? this.struct[0] : sortedNodes[visibleIndex - 1];

    if (!leftNode) throw new Error("Origin missing");

    const newNode: CharNode = {
      id: `${this.siteId}-${this.clock}`,
      value: char,
      origin: leftNode.id,
      tombstone: false,
      timestamp: Date.now(),
      lamport: this.clock,
    };

    this.struct.push(newNode);
    return newNode;
  }

  localDelete(visibleIndex: number): CharNode {
    this.clock++;

    const sortedNodes = this.getSortedNodes();
    const targetNode = sortedNodes[visibleIndex];

    if (targetNode) {
      targetNode.tombstone = true;
      return targetNode;
    }
    throw new Error("Node not found");
  }

  merge(node: CharNode): boolean {
    if (node.lamport > this.clock) {
      this.clock = node.lamport;
    }

    const existing = this.struct.find((n) => n.id === node.id);
    if (existing) {
      if (node.tombstone) {
        existing.tombstone = true;
        return true;
      }
      return false;
    }

    this.struct.push(node);
    return true;
  }

  toString(): string {
    return this.getSortedNodes()
      .map((n) => n.value)
      .join("");
  }

  getAll() {
    return this.struct;
  }

  load(state: CharNode[]) {
    this.struct = state;
    let maxLamport = 0;
    for (const node of state) {
      if (node.lamport > maxLamport) maxLamport = node.lamport;
    }
    this.clock = maxLamport;
  }

  private findNthVisibleNode(n: number): CharNode | undefined {
    if (n === -1) return this.struct[0];
    const sorted = this.getSortedNodes();
    return sorted[n];
  }
}
