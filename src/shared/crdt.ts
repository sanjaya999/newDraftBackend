import type { CharNode } from "./crdtTypes.js";
export class SharedCRDT {
    siteId: string;
    struct: CharNode[];
    clock: number;

    constructor(siteId: string = Math.random().toString(36).slice(2)){
        this.siteId = siteId;
        this.clock = 0;

        this.struct = [{
            id: "ROOT", 
            value: "",
            origin: "",
            tombstone:false,
            timestamp: Date.now(),
            lamport:0
        }];
    }

    localInsert(char: string, visibleIndex: number): CharNode{
        this.clock++;

        const leftNode = this.findNthVisibleNode(visibleIndex - 1);
        if(!leftNode) throw new Error("Origin missing");

        const newNode : CharNode = {
            id: `${this.siteId}-${this.clock}`,
            value: char,
            origin: leftNode.id,
            tombstone: false,
            timestamp: Date.now(),
            lamport: this.clock
        }

        const realIndex = this.struct.findIndex(n => n.id === leftNode.id);
        this.struct.splice(realIndex + 1, 0 , newNode);
        return newNode;
    }

    localDelete(visibleIndex: number) : CharNode {
        this.clock++;
        const targetNode = this.findNthVisibleNode(visibleIndex);
        if(targetNode){
            targetNode.tombstone = true;
            return targetNode;
        }
        throw new Error("Node not found");
    }
     merge(node: CharNode): boolean{
        if(node.lamport > this.clock){
            this.clock = node.lamport;
        }
        const existing = this.struct.find(n=> n.id === node.id);
        if(existing){
            if(node.tombstone) existing.tombstone = true;
            return false;
        }

        let insertIndex = this.struct.findIndex( n => node.origin === n.id);
        if(insertIndex === -1) insertIndex = 0;
        let i = insertIndex + 1;
       while (i < this.struct.length) {
            const other = this.struct[i];
            if (!other) break;
            if (other.lamport > node.lamport) break;
            if (other.lamport === node.lamport && other.id > node.id) break;
            
            i++;
        }
        this.struct.splice(i, 0 , node);
        return true;
     }
  toString(): string {
    return this.struct
      .filter(n => !n.tombstone && n.id !== 'ROOT')
      .map(n => n.value)
      .join('');
  }

    private findNthVisibleNode(n: number): CharNode | undefined{
        if(n === -1 )return this.struct[0];
        let count = 0;
        for(let i = 1 ; i < this.struct.length; i++){
            const currentNode = this.struct[i];
            if(!currentNode.tombstone){
                if(count === n)return currentNode;
                count++;
            }
            
        }return undefined;
    }
    
    getAll() {
        return this.struct;
    }
}
