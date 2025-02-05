// src/components/flowchart/CustomNode.tsx
import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FedNodeType } from './FedNodes';
import CancelIcon from '../../assets/icons8-cancel.svg';
import ConfigIcon from '../../assets/icons8-config.svg';
import OperationsIcon from '../../assets/icons8-bulb.svg';

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

    return (
        <div
            ref={nodeRef}
            style={{
                position: 'relative',
                padding: 10,
                border: '1px solid #777',
                borderRadius: 5,
                background:
                    data.node_type === FedNodeType.CLOUD_NODE
                        ? '#ADD8E6'
                        : data.node_type === FedNodeType.FOG_NODE
                            ? '#FFA500'
                            : data.node_type === FedNodeType.EDGE_NODE
                                ? '#90EE90'
                                : '#fff',
                color: '#000',
                minWidth: 100,
                minHeight: 60,
                textAlign: 'center',
            }}
        >
            <div>{localLabel}</div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                }}
            >
                <button
                    onClick={handleEditRequested}
                    style={{
                        background: '#6db1ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        padding: '4px 8px',
                    }}
                >
                    <img src={ConfigIcon} alt="Edit" style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                    onClick={() => data.onRemove && data.onRemove(id)}
                    style={{
                        background: '#fe7070',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        padding: '4px 8px',
                    }}
                >
                    <img src={CancelIcon} alt="Remove" style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                    onClick={handleOperationsRequested}
                    style={{
                        background: '#9391ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        padding: '4px 8px',
                    }}
                >
                    <img src={OperationsIcon} alt="Operations" style={{ width: '16px', height: '16px' }} />
                </button>
            </div>
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        </div>
    );
};

export default CustomNode;
