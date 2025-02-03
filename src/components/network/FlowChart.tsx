// src/components/flowchart/FlowChart.tsx

import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Connection,
    Node,
    Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './Sidebar';
import CustomNode from './CustomNode';
import { FedNodeType } from './FedNodes';

const nodeTypes = { custom: CustomNode };

let id = 4;
const getId = () => `${id++}`;

const FlowChart: React.FC = () => {
    // Start with an empty topology.
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    // State to store the selected edge's ID.
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

    // Callback to remove a node by id.
    const removeNode = useCallback(
        (nodeId: string) => {
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        },
        [setNodes]
    );

    // Update a node's data (used for editing properties).
    const updateNode = useCallback(
        (nodeId: string, newData: Partial<{ label: string; ip_address: string; port: number }>) => {
            setNodes((nds) =>
                nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node))
            );
        },
        [setNodes]
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // onDrop: Create a new node when a draggable item is dropped.
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const nodeTypeStr = event.dataTransfer.getData('application/reactflow');
            if (!reactFlowBounds || !nodeTypeStr) return;
            const nodeType = Number(nodeTypeStr) as FedNodeType;
            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };
            let label = '';
            switch (nodeType) {
                case FedNodeType.CLOUD_NODE:
                    label = 'Cloud Node';
                    break;
                case FedNodeType.FOG_NODE:
                    label = 'Fog Node';
                    break;
                case FedNodeType.EDGE_NODE:
                    label = 'Edge Node';
                    break;
                default:
                    label = 'Default Node';
            }
            const newNode: Node = {
                id: getId(),
                type: 'custom',
                position,
                data: { label, ip_address: '', port: 0, node_type: nodeType, onRemove: removeNode, onEdit: updateNode },
            };
            setNodes((nds) => nds.concat(newNode));
        },
        [setNodes, removeNode, updateNode]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
        setSelectedEdgeId(edge.id);
    }, []);

    // Clear selection on pane click.
    const onPaneClick = useCallback(() => {
        setSelectedEdgeId(null);
    }, []);

    // Global keydown handler to remove selected edge if Delete or Backspace is pressed.
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdgeId) {
                setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdgeId));
                setSelectedEdgeId(null);
            }
        },
        [selectedEdgeId, setEdges]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Persistence functions.
    const saveTopology = useCallback(() => {
        const topology = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([topology], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedDateTime = `${year}_${month}_${day}_${hours}_${minutes}`;
        link.download = `federated_topology_${formattedDateTime}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [nodes, edges]);

    const loadTopology = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files ? target.files[0] : null;
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const result = event.target?.result as string;
                    const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(result);
                    setNodes(loadedNodes);
                    setEdges(loadedEdges);
                } catch (error) {
                    console.error('Error parsing file:', error);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [setNodes, setEdges]);

    const removeTopology = useCallback(() => {
        setNodes([]);
        setEdges([]);
    }, [setNodes, setEdges]);

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <Sidebar
                onSaveTopology={saveTopology}
                onLoadTopology={loadTopology}
                onRemoveTopology={removeTopology}
            />
            <div style={{ flexGrow: 1 }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </div>
    );
};

export default FlowChart;
