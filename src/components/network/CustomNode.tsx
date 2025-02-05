// src/components/flowchart/CustomNode.tsx
import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FedNodeType } from './FedNodes';
import CancelIcon from '../../assets/icons8-cancel.svg';
import ConfigIcon from '../../assets/icons8-config.svg';
import OperationsIcon from '../../assets/icons8-bulb.svg';
import "./style/CustomNode.sass";

const CustomNode: React.FC<NodeProps> = ({ id, data }) => {
    const [localLabel, setLocalLabel] = useState(data.label);
    const [localIp, setLocalIp] = useState(data.ip_address || '');
    const [localPort, setLocalPort] = useState(data.port || 0);

    // Create a ref for the node container.
    const nodeRef = useRef<HTMLDivElement>(null);

    const handleEditRequested = () => {
        if (data.onEditRequested) {
            data.onEditRequested({
                type: 'edit',
                localLabel,
                localIp,
                localPort,
                setLocalLabel,
                setLocalIp,
                setLocalPort,
                sendOperation: data.sendOperation,
            });
        }
    };

    const handleOperationsRequested = () => {
        if (data.onOperationsRequested) {
            data.onOperationsRequested({
                type: 'operations',
                localLabel,
                localIp,
                localPort,
                setLocalLabel,
                setLocalIp,
                setLocalPort,
                sendOperation: data.sendOperation,
            });
        }
    };

    let nodeTypeClass = 'default-node';
    if (data.node_type === FedNodeType.CLOUD_NODE) {
        nodeTypeClass = 'cloud-node';
    } else if (data.node_type === FedNodeType.FOG_NODE) {
        nodeTypeClass = 'fog-node';
    } else if (data.node_type === FedNodeType.EDGE_NODE) {
        nodeTypeClass = 'edge-node';
    }

    return (
        <div ref={nodeRef} className={`custom-node ${nodeTypeClass}`}>
            <div className="node-label">{localLabel}</div>
            <div className="button-group">
                <button onClick={handleEditRequested} className="button edit-button">
                    <img src={ConfigIcon} alt="Edit" style={{width: '16px', height: '16px'}}/>
                </button>
                <button onClick={handleOperationsRequested} className="button operations-button">
                    <img src={OperationsIcon} alt="Operations" style={{width: '16px', height: '16px'}}/>
                </button>
                <button onClick={() => data.onRemove && data.onRemove(id)} className="button remove-button">
                    <img src={CancelIcon} alt="Remove" style={{width: '16px', height: '16px'}}/>
                </button>
            </div>
            <Handle type="target" position={Position.Top} className="handle"/>
            <Handle type="source" position={Position.Bottom} className="handle"/>
        </div>
    );
};

export default CustomNode;
