// src/components/simulation/node_actions/NodeEditPanel.tsx
import React, { useState } from 'react';
import { useAppDispatch } from '../../../store/storeHook.ts';
import { NodeRecord } from '../../../store/nodeSlice.ts';
import '../style/NodeEditPanel.sass';

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
        <div className="node-edit-panel">
            <div className="node-edit-header">Edit Node Properties</div>
            <div className="node-edit-field">
                <label>
                    Label:
                    <input
                        type="text"
                        value={localLabel}
                        onChange={(e) => setLocalLabel(e.target.value)}
                    />
                </label>
            </div>
            <div className="node-edit-field">
                <label>
                    IP Address:
                    <input
                        type="text"
                        value={localIp}
                        onChange={(e) => setLocalIp(e.target.value)}
                    />
                </label>
            </div>
            <div className="node-edit-field">
                <label>
                    Port:
                    <input
                        type="number"
                        value={localPort}
                        onChange={(e) => setLocalPort(Number(e.target.value))}
                    />
                </label>
            </div>
            <div className="button-group">
                <button onClick={handleSave} className="green-button">
                    Save
                </button>
                <button onClick={onClose} className="red-button margin-left">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default NodeEditPanel;
