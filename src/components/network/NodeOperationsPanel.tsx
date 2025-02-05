// src/components/flowchart/NodeOperationsPanel.tsx
import React from 'react';
import { useBackendWebSocket } from '../../hooks/useBackendWebSocket';
import { useNodeOperations } from './NodeOperations';
import { NodeRecord } from '../../store/nodeSlice';
import './ButtonsStyle.sass';

interface NodeOperationsPanelProps {
    node: NodeRecord;
    onClose: () => void;
}

const NodeOperationsPanel: React.FC<NodeOperationsPanelProps> = ({ node, onClose }) => {
    const wsUrl = `ws://${node.ip_address}:${node.port}/ws`;
    const { sendOperation } = useBackendWebSocket(wsUrl);

    const { InitializeNodeButton, GetNodeInfoButton, GetParentNode } = useNodeOperations(
        node.localId,
        node.node_type,
        node.label,
        node.ip_address,
        node.port,
        sendOperation
    );

    return (
        <div>
            <h3>Node Operations</h3>
            <p>Label: {node.label}</p>
            <p>IP Address: {node.ip_address}</p>
            <p>Port: {node.port}</p>
            <InitializeNodeButton />
            <br />
            <GetNodeInfoButton />
            <br />
            <GetParentNode />
            <br />
            <button className="red-button" onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default NodeOperationsPanel;
