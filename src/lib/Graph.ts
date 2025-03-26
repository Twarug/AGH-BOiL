
export type CPM_Data = {
  name: string;
  duration: number;
  dependencies: number[];
}

export type CPM_Node = {
  id: number;
  name: string;
  duration: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  critical: boolean;
  predecessors: number[];
  successors: number[];
}

export type CPM_Graph = {
  nodes: CPM_Node[]
}
