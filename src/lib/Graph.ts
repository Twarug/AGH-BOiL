
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

// generate order that allows for calculating earliest start and finish times correctly
const topologicalSort = (nodes: CPM_Node[]): number[] => {
  const n = nodes.length;
  const sorted: number[] = [];
  const visited: boolean[] = new Array(n).fill(false);

  const dfs = (node: number) => {
    visited[node] = true;
    nodes[node].successors.forEach(s => {
      if (!visited[s]) dfs(s);
    });
    sorted.push(node);
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i]) dfs(i);
  }

  return sorted.reverse();
}

export const generate_CPM_graph = (data: CPM_Data[]): CPM_Graph => {
  const graph = convertGraphData(data);
  const n = graph.nodes.length;
  // Sort nodes topologically
  const sorted = topologicalSort(graph.nodes);

  // Calculate earliest start and finish times
  for (let i = 0; i < n; i++) {
    const node = graph.nodes[sorted[i]];
    node.es = node.predecessors.reduce((max, p) => Math.max(max, graph.nodes[p].ef), 0);
    node.ef = node.es + node.duration;
  }

  const maxEF = Math.max(...graph.nodes.map(node => node.ef));
  // Calculate latest start and finish times
  for (let i = n - 1; i >= 0; i--) {
    const node = graph.nodes[sorted[i]];
    node.lf = node.successors.reduce((min, s) => Math.min(min, graph.nodes[s].ls), maxEF);
    node.ls = node.lf - node.duration;
  }

  // Check for critical path
  for (let i = 0; i < n; i++) {
    const node = graph.nodes[sorted[i]];
    node.critical = node.ef === node.lf;
  }

  return graph;
}