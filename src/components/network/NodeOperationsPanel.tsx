// src/components/flowchart/NodeOperationsPanel.tsx
import React from 'react';
import { useBackendWebSocket } from '../../hooks/useBackendWebSocket';
import { useNodeOperations } from './NodeOperations';
import { NodeRecord } from '../../store/nodeSlice';
import './ButtonsStyle.sass';
import {useAppSelector} from "../../store/storeHook.ts";
import {RootState} from "../../store/store.ts";

interface NodeOperationsPanelProps {
    node: NodeRecord;
    onClose: () => void;
}

const NodeOperationsPanel: React.FC<NodeOperationsPanelProps> = ({ node, onClose }) => {
    const wsUrl = `ws://${node.ip_address}:${node.port}/ws`;
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
        <div>
            <h3>Node Operations</h3>
            <p>Label: {node.label}</p>
            <p>IP Address: {node.ip_address}</p>
            <p>Port: {node.port}</p>
            <InitializeNodeButton />
            <br />
            <GetNodeInfoButton />
            <br />
            <GetParentNodeButton />
            <br />
            <GetChildrenNodesButton />
            <br />
            <RemoveParentButton />
            <br />
            <RemoveChildButton />
            <br />
            <button className="red-button" onClick={onClose}>
                Close
            </button>
        </div>
    );
};

export default NodeOperationsPanel;
