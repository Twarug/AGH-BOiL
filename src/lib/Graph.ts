
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

const convertGraphData = (data: CPM_Data[]): CPM_Graph => {
  const nodes: CPM_Node[] = data.map((node, i) => ({
    id: i,
    name: node.name,
    duration: node.duration,
    es: 0,
    ef: 0,
    ls: 0,
    lf: 0,
    critical: false,
    predecessors: node.dependencies,
    successors: []
  }));

  nodes.forEach(node => {
    node.predecessors.forEach(p => nodes[p].successors.push(node.id));
  });

  return {
    nodes: nodes,
  };
}
