export type CPM_Data = {
    name: string;
    duration: number;
    dependencies: number[];
    successors: number[];
};

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
    successors: {index: number, activity?: CMP_Activity}[];
};

export type CMP_Activity = {
    name: string;
    duration: number;
}

export type CMP_GraphType = 'AON' | 'AOA';

export type CPM_Graph = {
    type: CMP_GraphType;
    nodes: CPM_Node[];
};

const generate_CPM_AON_graph = (data: CPM_Data[]): CPM_Graph => {

    // generate order that allows for calculating earliest start and finish times correctly
    const topologicalSort = (nodes: CPM_Node[]): number[] => {
        const n = nodes.length;
        const sorted: number[] = [];
        const visited: boolean[] = new Array(n).fill(false);

        const dfs = (node: number) => {
            visited[node] = true;
            nodes[node].successors.forEach((s) => {
                if (!visited[s.index]) dfs(s.index);
            });
            sorted.push(node);
        };

        for (let i = 0; i < n; i++) {
            if (!visited[i]) dfs(i);
        }

        return sorted.reverse();
    };

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
        successors: [],
    }));

    nodes.forEach((node) => {
        node.predecessors.forEach((p) => nodes[p].successors.push({index: node.id}));
    });

    const graph: CPM_Graph = {
        type: "AON",
        nodes,
    };
    const n = graph.nodes.length;
    // Sort nodes topologically
    const sorted = topologicalSort(graph.nodes);

    // Calculate earliest start and finish times
    for (let i = 0; i < n; i++) {
        const node = graph.nodes[sorted[i]];
        node.es = node.predecessors.reduce(
            (max, p) => Math.max(max, graph.nodes[p].ef),
            0
        );
        node.ef = node.es + node.duration;
    }

    const maxEF = Math.max(...graph.nodes.map((node) => node.ef));
    // Calculate latest start and finish times
    for (let i = n - 1; i >= 0; i--) {
        const node = graph.nodes[sorted[i]];
        node.lf = node.successors.reduce(
            (min, s) => Math.min(min, graph.nodes[s.index].ls),
            maxEF
        );
        node.ls = node.lf - node.duration;
    }

    // Check for critical path
    for (let i = 0; i < n; i++) {
        const node = graph.nodes[sorted[i]];
        node.critical = node.ef === node.lf;
    }

    return graph;
};

const generate_CPM_AOA_graph = (data: CPM_Data[]): CPM_Graph => {
    const nodeMap = new Map<number, CPM_Node>();

    data.forEach((activity) => {
        // For each activity, ensure we have nodes for all dependencies
        activity.dependencies.forEach((depId) => {
            if (!nodeMap.has(depId)) {
                nodeMap.set(depId, {
                    id: depId,
                    name: `Event ${depId}`,
                    duration: 0, // Events have no duration in AOA
                    es: 0,
                    ef: 0,
                    ls: 0,
                    lf: 0,
                    critical: false,
                    predecessors: [],
                    successors: [],
                });
            }
        });

        // For each activity, ensure we have nodes for all successors
        activity.successors.forEach((succId) => {
            if (!nodeMap.has(succId)) {
                nodeMap.set(succId, {
                    id: succId,
                    name: `Event ${succId}`,
                    duration: 0, // Events have no duration in AOA
                    es: 0,
                    ef: 0,
                    ls: 0,
                    lf: 0,
                    critical: false,
                    predecessors: [],
                    successors: [],
                });
            }
        });
    });

    // Second pass: Connect the nodes based on activities
    data.forEach((activity) => {
        // In AOA, activities are represented as arcs between events
        activity.dependencies.forEach((fromId) => {
            activity.successors.forEach((toId) => {
                const fromNode = nodeMap.get(fromId)!;
                const toNode = nodeMap.get(toId)!;

                // Add the connection
                fromNode.successors.push({
                    index: toId,
                    activity: {
                        name: activity.name,
                        duration: activity.duration,
                    },
                });
                toNode.predecessors.push(fromId);
            });
        });
    });

    // Forward pass - Calculate Early Start (ES) and Early Finish (EF)
    const calculateEarlyTimes = () => {
        // Find start nodes (those with no predecessors)
        const startNodes = Array.from(nodeMap.values()).filter(
            (node) => node.predecessors.length === 0
        );

        // Initialize a queue with start nodes
        const queue = [...startNodes];
        const visited = new Set<number>();

        while (queue.length > 0) {
            const currentNode = queue.shift()!;

            if (visited.has(currentNode.id)) continue;
            visited.add(currentNode.id);

            // For each successor
            for (const succId of currentNode.successors) {
                const successor = nodeMap.get(succId.index)!;

                // Find the activity connecting these nodes
                const activity = data.find(
                    (act) =>
                        act.dependencies.includes(currentNode.id) &&
                        act.successors.includes(successor.id)
                );

                if (!activity) continue;

                // Calculate EF of current node + activity duration
                const newES = currentNode.ef + activity.duration;

                // Update successor's ES if this path results in a later ES
                if (newES > successor.es) {
                    successor.es = newES;
                    successor.ef = newES; // For events, ES = EF
                }

                // Add to queue if all predecessors have been processed
                const allPredecessorsVisited = successor.predecessors.every((predId) =>
                    visited.has(predId)
                );

                if (allPredecessorsVisited && !queue.includes(successor)) {
                    queue.push(successor);
                }
            }
        }
    };

    // Backward pass - Calculate Late Start (LS) and Late Finish (LF)
    const calculateLateTimes = () => {
        // Find end nodes (those with no successors)
        const endNodes = Array.from(nodeMap.values()).filter(
            (node) => node.successors.length === 0
        );

        // Set LF of end nodes to their EF
        endNodes.forEach((node) => {
            node.lf = node.ef;
            node.ls = node.lf;
        });

        // Initialize a queue with end nodes
        const queue = [...endNodes];
        const visited = new Set<number>();

        while (queue.length > 0) {
            const currentNode = queue.shift()!;

            if (visited.has(currentNode.id)) continue;
            visited.add(currentNode.id);

            // For each predecessor
            for (const predId of currentNode.predecessors) {
                const predecessor = nodeMap.get(predId)!;

                // Find the activity connecting these nodes
                const activity = data.find(
                    (act) =>
                        act.dependencies.includes(predecessor.id) &&
                        act.successors.includes(currentNode.id)
                );

                if (!activity) continue;

                // Calculate LS of current node - activity duration
                const newLF = currentNode.ls - activity.duration;

                // Update predecessor's LF if this path results in an earlier LF
                if (predecessor.lf === 0 || newLF < predecessor.lf) {
                    predecessor.lf = newLF;
                    predecessor.ls = newLF; // For events, LS = LF
                }

                // Add to queue if all successors have been processed
                const allSuccessorsVisited = predecessor.successors.every((succId) =>
                    visited.has(succId.index)
                );

                if (allSuccessorsVisited && !queue.includes(predecessor)) {
                    queue.push(predecessor);
                }
            }
        }
    };

    // Determine critical path
    const determineCriticalPath = () => {
        nodeMap.forEach((node) => {
            // A node is critical if its slack (LS - ES) is zero
            node.critical = node.ls === node.es;
        });
    };

    // Execute the CPM algorithm
    calculateEarlyTimes();
    calculateLateTimes();
    determineCriticalPath();

    return {
        type: "AOA",
        nodes: Array.from(nodeMap.values()),
    };
};

export const generate_CPM_graph = (data: CPM_Data[], type: CMP_GraphType): CPM_Graph => {
    if (type == "AOA")
        return generate_CPM_AOA_graph(data);
    return generate_CPM_AON_graph(data);
}