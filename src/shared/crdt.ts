import type { CRDTUpdate } from "./crdtTypes.js";

export class SharedCRDT {
    state: Record<string, { value: any, timestamp: number}> ={}

    merge(update: CRDTUpdate):boolean {
        const { key, value, timestamp } = update;
        const local = this.state[key];

        if(!local || timestamp > local.timestamp){
            this.state[key] = { value, timestamp};
            return true;
        }return false;
    }

    get(key: string){
        return this.state[key]?.value;
    }

    getAll(){
        return this.state;
    }
}