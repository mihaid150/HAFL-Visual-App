// src/components/flowchart/CustomNode.tsx

import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FedNodeType } from './FedNodes';
import CancelIcon from '../../assets/icons8-cancel.svg';
import ConfigIcon from '../../assets/icons8-config.svg';

const CustomNode: React.FC<NodeProps> = ({ id, data }) => {
    // Local state for modal visibility and editable properties.
    const [isEditing, setIsEditing] = useState(false);
    const [localLabel, setLocalLabel] = useState(data.label);
    const [localIp, setLocalIp] = useState(data.ip_address || '');
    const [localPort, setLocalPort] = useState(data.port || 0);

    // Create a ref for the node container.
    const nodeRef = useRef<HTMLDivElement>(null);

    // Determine background color based on the node type.
    const backgroundColor = (() => {
        switch (data.node_type) {
            case FedNodeType.CLOUD_NODE:
                return '#ADD8E6';
            case FedNodeType.FOG_NODE:
                return '#FFA500';
            case FedNodeType.EDGE_NODE:
                return '#90EE90';
            default:
                return '#fff';
        }
    })();

    // When saving, call the onEdit callback to update the node's data.
    const handleSave = () => {
        if (data.onEdit) {
            data.onEdit(id, { label: localLabel, ip_address: localIp, port: localPort });
        }
        setIsEditing(false);
    };

    return (
        <div
            ref={nodeRef}
            style={{
                position: 'relative', // Make container relative for absolute positioning of modal
                padding: 10,
                border: '1px solid #777',
                borderRadius: 5,
                background: backgroundColor,
                color: '#000',
                minWidth: 100,
                minHeight: 60,
                textAlign: 'center',
            }}
        >
            {/* Node Label */}
            <div>{data.label}</div>
            {/* Buttons container placed under the label */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                }}
            >
                <button
                    onClick={() => setIsEditing(true)}
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
            </div>

            {/* Standard center handles on each side */}
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
            <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
            <Handle type="source" position={Position.Right} style={{ background: '#555' }} />

            {/* Additional corner handles */}
            <Handle type="target" position={Position.Top} style={{ left: 0, background: '#555' }} />
            <Handle type="target" position={Position.Top} style={{ left: 'unset', right: 0, background: '#555' }} />
            <Handle type="source" position={Position.Bottom} style={{ left: 0, background: '#555' }} />
            <Handle type="source" position={Position.Bottom} style={{ left: 'unset', right: 0, background: '#555' }} />

            {/* Editing window placed directly on top of the node */}
            {isEditing && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '200%',   // Double the node's width
                        height: '200%',  // Double the node's height
                        background: '#fff',
                        padding: 20,
                        borderRadius: 5,
                        zIndex: 1000,
                    }}
                >
                    <h3>Edit Node Properties</h3>
                    <label>
                        Label:
                        <input
                            type="text"
                            value={localLabel}
                            onChange={(e) => setLocalLabel(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </label>
                    <br />
                    <label>
                        IP Address:
                        <input
                            type="text"
                            value={localIp}
                            onChange={(e) => setLocalIp(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </label>
                    <br />
                    <label>
                        Port:
                        <input
                            type="number"
                            value={localPort}
                            onChange={(e) => setLocalPort(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </label>
                    <br />
                    <br />
                    <button onClick={handleSave} style={{ marginRight: 10 }}>
                        Save
                    </button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default CustomNode;
