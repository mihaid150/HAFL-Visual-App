// src/components/simulation/FlowChart.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
    addEdge,
    Controls,
    Background,
    Connection,
    Node as RFNode,
    Edge,
    applyEdgeChanges,
    NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import LeftSidebar from './side_bars/LeftSidebar.tsx';
import CustomNode from './CustomNode.tsx';
import { FedNodeType } from './FedNodes.ts';
import { useAppDispatch, useAppSelector } from '../../store/storeHook.ts';
import { RootState } from '../../store/store.ts';
import { addNode, clearNodes} from '../../store/nodeSlice.ts';
import { v4 as uuidv4 } from 'uuid';
import RightSidebar from './side_bars/RightSideBar.tsx';
import './style/ButtonsStyle.sass';
import NodeEditPanel from './node_actions/NodeEditPanel.tsx';
import NodeOperationsPanel from './node_actions/NodeOperationsPanel.tsx';
import { notifyParents, notifyChildren, fetchNodesConnections, executeNodesInitialization } from './NotifyConnections.ts';
import CloudPanelsWrapper from "./cloud_specific/CloudPanelsWrapper.tsx";
import {FogPanelsWrapper} from "./fog_specific/FogPanelsWrapper.tsx";

const nodeTypes = { custom: CustomNode };

interface LoadedNodeData {
    backedId: string;
    label: string;
    ip_address: string;
    port: number;
    node_type: number;
    parentId?: number;
    childrenIds?: number[];
}

interface LoadedNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: LoadedNodeData;
}

const FlowChart: React.FC = () => {
    const [edges, setEdges] = useState<Edge[]>([]);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [rightSidebarContent, setRightSidebarContent] = useState<React.ReactNode | null>(null);
    const dispatch = useAppDispatch();
    const reduxNodes = useAppSelector((state: RootState) => state.nodes.nodes);

    const nodes: RFNode[] = reduxNodes.map((n) => ({
        id: n.localId,
        type: 'custom',
        position: n.flowchart_position,
        data: {
            ...n,
            onRemove: (localId: string) => dispatch({ type: 'nodes/removeNode', payload: localId }),
            onEditRequested: () => {
                setRightSidebarContent(<NodeEditPanel node={n} onClose={() => setRightSidebarContent(null)} />);
            },
            onOperationsRequested: () => {
                setRightSidebarContent(<NodeOperationsPanel node={n} onClose={() => setRightSidebarContent(null)} />);
            },
            onCloudTrainingInitializationRequested: n.node_type === FedNodeType.CLOUD_NODE
                ? () => setRightSidebarContent(
                    <CloudPanelsWrapper
                        ip_address={n.ip_address}
                        port={n.port}
                        label={n.label}
                        onClose={() => setRightSidebarContent(null)}
                    />
                )
                : undefined,
            onGeneticEngineConfigurationRequested: n.node_type === FedNodeType.FOG_NODE
            ? () => setRightSidebarContent(
                <FogPanelsWrapper
                    ip_address={n.ip_address}
                    port={n.port}
                    label={n.label}
                    onClose={() => setRightSidebarContent(null)}
                />
                )
                : undefined,
        },
    }));

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

            let label;
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

            const localId = uuidv4().toString();
            const newNode = {
                localId,
                backedId: '',
                label,
                ip_address: '',
                port: 0,
                node_type: nodeType,
                flowchart_position: position,
                parentId: undefined,
                childrenIds: [],
            };
            dispatch(addNode(newNode));
        },
        [dispatch]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);
    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            changes.forEach((change: NodeChange) => {
                if (change.type === 'position' && change.position) {
                    dispatch({
                        type: 'nodes/updateNode',
                        payload: { localId: change.id, changes: { flowchart_position: change.position } },
                    });
                }
            });
        },
        [dispatch]
    );

    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
        setSelectedEdgeId(edge.id);
    }, []);
    const onPaneClick = useCallback(() => setSelectedEdgeId(null), []);
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdgeId) {
                setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdgeId));
                setSelectedEdgeId(null);
            }
        },
        [selectedEdgeId]
    );
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const saveTopology = useCallback(() => {
        const topology = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([topology], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const now = new Date();
        const formattedDateTime = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(
            now.getDate()
        ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}`;
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
                    const parsed = JSON.parse(result) as { nodes: unknown; edges: Edge[] };
                    const loadedNodes = parsed.nodes as LoadedNode[];
                    const transformedNodes = loadedNodes.map((node) => ({
                        localId: node.id,
                        backedId: node.data.backedId ?? '',
                        label: node.data.label,
                        ip_address: node.data.ip_address,
                        port: node.data.port,
                        node_type: node.data.node_type,
                        flowchart_position: node.position,
                        parentId: node.data.parentId !== undefined ? String(node.data.parentId) : undefined,
                        childrenIds: node.data.childrenIds ? node.data.childrenIds.map(id => String(id)) : undefined,
                    }));
                    dispatch(clearNodes());
                    transformedNodes.forEach((n) => dispatch(addNode(n)));
                    setEdges(parsed.edges);
                } catch (error) {
                    console.error('Error parsing file:', error);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [dispatch]);

    const removeTopology = useCallback(() => {
        dispatch(clearNodes());
        setEdges([]);
    }, [dispatch]);

    const fetchNodes = useCallback(async () => {
        await fetchNodesConnections(reduxNodes, dispatch);
    }, [reduxNodes, dispatch]);

    const initializeNodes = useCallback(async () => {
        await executeNodesInitialization(reduxNodes, dispatch);
    }, [reduxNodes, dispatch])

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <LeftSidebar
                onSaveTopology={saveTopology}
                onLoadTopology={loadTopology}
                onRemoveTopology={removeTopology}
                onNodesInitialization={initializeNodes}
                onFetchNodes={fetchNodes}
                onNotifyParents={() => notifyParents(reduxNodes, edges, dispatch)}
                onNotifyChildren={() => notifyChildren(reduxNodes, edges, dispatch)}
            />
            <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
                    onNodesChange={onNodesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
            {rightSidebarContent && <RightSidebar content={rightSidebarContent} onClose={() => setRightSidebarContent(null)} />}
        </div>
    );
};

export default FlowChart;
