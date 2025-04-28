import React from 'react';
import { FedNodeType } from '../FedNodes.ts';
import '../style/ButtonsStyle.sass';
import '../style/LeftSidebar.sass';

interface SidebarProps {
    onSaveTopology: () => void;
    onLoadTopology: () => void;
    onRemoveTopology: () => void;
    onNodesInitialization: () => void;
    onFetchNodes: () => void;
    onNotifyParents: () => void;
    onNotifyChildren: () => void;
    onClearCloudResults: () => void;
    onRecordNodesToCloudDb: () => void;
    onUpdateRecordNodesToCloudDb: () => void;
}

const LeftSidebar: React.FC<SidebarProps> = ({
                                                 onSaveTopology,
                                                 onLoadTopology,
                                                 onRemoveTopology,
                                                 onNodesInitialization,
                                                 onFetchNodes,
                                                 onNotifyParents,
                                                 onNotifyChildren,
                                                 onClearCloudResults,
                                                 onRecordNodesToCloudDb,
                                                 onUpdateRecordNodesToCloudDb,
                                             }) => {
    const onDragStart = (event: React.DragEvent, nodeType: FedNodeType) => {
        // Store the node type so that the drop handler can interpret it.
        event.dataTransfer.setData('application/reactflow', String(nodeType));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="left-sidebar">
            <div
                className="node-item cloud-node"
                onDragStart={(event) => onDragStart(event, FedNodeType.CLOUD_NODE)}
                draggable
            >
                Cloud Node
            </div>
            <div
                className="node-item fog-node"
                onDragStart={(event) => onDragStart(event, FedNodeType.FOG_NODE)}
                draggable
            >
                Fog Node
            </div>
            <div
                className="node-item edge-node"
                onDragStart={(event) => onDragStart(event, FedNodeType.EDGE_NODE)}
                draggable
            >
                Edge Node
            </div>

            <hr className="hr-separator" />

            <div className="button-group">
                <button onClick={onSaveTopology} className="blue-button">
                    Save Topology
                </button>
                <button onClick={onLoadTopology} className="blue-button">
                    Load Saved Topology
                </button>
                <button onClick={onRemoveTopology} className="blue-button">
                    Clear Topology
                </button>
                <button onClick={onNodesInitialization} className="blue-button">
                    Initialize Nodes
                </button>
                <button onClick={onFetchNodes} className="blue-button">
                    Fetch Nodes
                </button>
                <button onClick={onNotifyParents} className="blue-button">
                    Notify Parents
                </button>
                <button onClick={onNotifyChildren} className="blue-button">
                    Notify Children
                </button>
                <button onClick={onClearCloudResults} className="blue-button">
                    Clear Cloud Results
                </button>
                <button onClick={onRecordNodesToCloudDb} className="blue-button">
                    Record Nodes To Database
                </button>
                <button onClick={onUpdateRecordNodesToCloudDb} className="blue-button">
                    Update Nodes in Database
                </button>
            </div>
        </aside>
    );
};

export default LeftSidebar;
