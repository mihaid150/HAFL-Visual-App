// src/components/network/NodeEditPanel.tsx
import React, { useState } from 'react';
import { useAppDispatch } from '../../store/storeHook';
import { NodeRecord } from '../../store/nodeSlice';
import './ButtonsStyle.sass';

interface NodeEditPanelProps {
    node: NodeRecord;
    onClose: () => void;
}

const NodeEditPanel: React.FC<NodeEditPanelProps> = ({ node, onClose }) => {
    const dispatch = useAppDispatch();
    const [localLabel, setLocalLabel] = useState(node.label);
    const [localIp, setLocalIp] = useState(node.ip_address);
    const [localPort, setLocalPort] = useState(node.port);

    const handleSave = () => {
        dispatch({
            type: 'nodes/updateNode',
            payload: {
                localId: node.localId,
                changes: { label: localLabel, ip_address: localIp, port: localPort },
            },
        });
        onClose();
    };

    return (
        <div style={{ padding: '10px' }}>
            <h3>Edit Node Properties</h3>
            <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block' }}>
                    Label:
                    <input
                        type="text"
                        value={localLabel}
                        onChange={(e) => setLocalLabel(e.target.value)}
                        style={{ width: '100%', padding: '4px' }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block' }}>
                    IP Address:
                    <input
                        type="text"
                        value={localIp}
                        onChange={(e) => setLocalIp(e.target.value)}
                        style={{ width: '100%', padding: '4px' }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block' }}>
                    Port:
                    <input
                        type="number"
                        value={localPort}
                        onChange={(e) => setLocalPort(Number(e.target.value))}
                        style={{ width: '100%', padding: '4px' }}
                    />
                </label>
            </div>
            <button onClick={handleSave} className="green-button">
                Save
            </button>
            <button onClick={onClose} className="red-button margin-left">
                Cancel
            </button>
        </div>
    );
};

export default NodeEditPanel;
