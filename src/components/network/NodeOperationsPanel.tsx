// src/components/flowchart/NodeOperationsPanel.tsx
import React from 'react';
import { useBackendWebSocket } from '../../hooks/useBackendWebSocket';
import { useNodeOperations } from './NodeOperations';
import { NodeRecord } from '../../store/nodeSlice';
import { useAppSelector } from '../../store/storeHook';
import { RootState } from '../../store/store';
import './style/ButtonsStyle.sass';
import './style/NodeOperationsPanel.sass';

interface NodeOperationsPanelProps {
    node: NodeRecord;
    onClose: () => void;
}

const NodeOperationsPanel: React.FC<NodeOperationsPanelProps> = ({ node, onClose }) => {
    const wsUrl = `ws://${node.ip_address}:${node.port}/node/ws`;
    const { sendOperation } = useBackendWebSocket(wsUrl);

    // Look up the parent node in the Redux state by matching backedId with node.parentId.
    const reduxNodes = useAppSelector((state: RootState) => state.nodes.nodes);
    const parentNode = reduxNodes.find((n) => n.backedId === node.parentId);

    // If a parent exists, extract its connection info.
    const parentIp = parentNode ? parentNode.ip_address : undefined;
    const parentPort = parentNode ? parentNode.port : undefined;

    const { InitializeNodeButton, GetNodeInfoButton, GetParentNodeButton, GetChildrenNodesButton, RemoveParentButton,
        RemoveChildButton } = useNodeOperations(
        node.localId,
        node.node_type,
        node.label,
        node.ip_address,
        node.port,
        sendOperation,
        node.backedId,
        parentIp,
        parentPort
    );

    return (
        <div className="node-operations-panel">
            <div className="node-operations-header">Node Operations</div>
            <div className="node-operations-details">
                <p><strong>Label:</strong> {node.label}</p>
                <p><strong>IP Address:</strong> {node.ip_address}</p>
                <p><strong>Port:</strong> {node.port}</p>
            </div>
            <div className="button-group">
                <InitializeNodeButton />
                <GetNodeInfoButton />
                <GetParentNodeButton />
                <GetChildrenNodesButton />
                <RemoveParentButton />
                <RemoveChildButton />
            </div>
            <br />
            <button className="red-button" onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default NodeOperationsPanel;
