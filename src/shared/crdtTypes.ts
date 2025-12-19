export interface CharNode {
  id: string;
  value: string;
  origin: string;
  tombstone: boolean;
  timestamp: number;
  lamport: number;
}
