import React, { useMemo, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Position,
    MarkerType,
    useReactFlow,
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import CpmNode from '@/components/cpm-node';
import { CPM_Graph, CPM_Node } from '@/lib/Graph';
type CpmNodeData = CPM_Node & { R: number };
type RFNode = Node<CpmNodeData>;
type RFEdge = Edge;

interface CpmGraphProps {
    graphData: CPM_Graph;
}

const nodeTypes = {
    cpmNode: CpmNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 180; 
const nodeHeight = 90; 

const getLayoutedElements = (nodes: RFNode[], edges: RFEdge[], direction = 'TB') => {
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 70 }); 

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Top; 
        node.sourcePosition = Position.Bottom; 
        // Przesunięcie pozycji węzła, aby był wyśrodkowany bo degre ustawia go w lewym górnym rogu
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

const LayoutFlow: React.FC<CpmGraphProps> = ({ graphData }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<CpmNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
    const { fitView } = useReactFlow();

    const { initialNodes, initialEdges } = useMemo(() => {
        const transformedNodes: RFNode[] = graphData.nodes.map((node: CPM_Node) => ({
            id: node.id.toString(),
            type: 'cpmNode', 
            data: {
                ...node,
                R: node.ls - node.es, // Obliczamy R (rezerwę)
            },
            position: { x: 0, y: 0 },
        }));

        const transformedEdges: RFEdge[] = [];
        graphData.nodes.forEach((node) => {
            node.successors.forEach((successorId) => {
                const targetNode = graphData.nodes.find(n => n.id === successorId.index);
                let isCritical = node.critical && targetNode?.critical; // Krawędź jest krytyczna, jeśli oba węzły są krytyczne

                if (isCritical && graphData.type == 'AOA') {
                   isCritical = node.ef + successorId.activity!.duration == targetNode?.es;
                }

                transformedEdges.push({
                    id: `e-${node.id}-${successorId.index}`,
                    source: node.id.toString(),
                    target: successorId.index.toString(),
                    label: graphData.type == "AOA" ?
                        `${successorId.activity!.name} | ${successorId.activity!.duration}` :
                        undefined,
                    labelBgStyle: {
                        backgroundColor: 'none',
                    },
                    style: {
                        strokeWidth: isCritical ? 2.5 : 1.5,
                        stroke: isCritical ? 'red' : '#aaa', 
                    },
                    markerEnd: { 
                        type: MarkerType.ArrowClosed,
                        color: isCritical ? 'red' : '#aaa',
                    },
                });
            });
        });

        return { initialNodes: transformedNodes, initialEdges: transformedEdges };
    }, [graphData]);

    useEffect(() => {
        if (initialNodes.length > 0) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                initialNodes,
                initialEdges,
                'TB' // Układ z góry na dół
            );
            setNodes([...layoutedNodes]); 
            setEdges([...layoutedEdges]);

             window.requestAnimationFrame(() => {
                 fitView({ padding: 0.1 }); 
            });

        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

    return (
        <div style={{ height: '100%', width: '100%', border: '1px solid #444', background: '#1a1a1a' }}> {/* Dostosuj wysokość i styl */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.1 }} 
                proOptions={{ hideAttribution: true }} 
            >
                <Controls />
                <Background />
                {/* Można dodać przycisk do ponownego layoutu */}
                {/* <button onClick={onLayout} style={{ position: 'absolute', top: 10, left: 10, zIndex: 4 }}>Recenter</button> */}
            </ReactFlow>
        </div>
    );
};


const CpmGraph: React.FC<CpmGraphProps> = ({ graphData }) => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        return <div style={{ padding: '20px', color: '#888' }}>Brak danych do wygenerowania grafu.</div>;
    }

    return (
        <ReactFlowProvider>
            <LayoutFlow graphData={graphData} />
        </ReactFlowProvider>
    );
};


export default CpmGraph;