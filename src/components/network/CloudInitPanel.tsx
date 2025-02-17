// src/components/flowchart/CloudInitPanel.tsx
import React, { useState } from 'react';
import { useBackendWebSocket } from '../../hooks/useBackendWebSocket';
import './style/ButtonsStyle.sass'
import './style/CloudInitPanel.sass'

interface CloudInitPanelProps {
    ip_address: string;
    port: number;
    onClose: () => void;
}

const CloudInitPanel: React.FC<CloudInitPanelProps> = ({ ip_address, port, onClose }) => {
    const wsUrl = `ws://${ip_address}:${port}/cloud/ws`;
    const { sendOperation } = useBackendWebSocket(wsUrl);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCacheActive, setIsCacheActive] = useState(false);
    const [geneticStrategy, setGeneticStrategy] = useState('');
    const [modelType, setModelType] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await sendOperation("initialize_cloud_process", {
                start_date: startDate,
                end_date: endDate,
                is_cache_active: isCacheActive,
                genetic_evaluation_strategy: geneticStrategy,
                model_type: modelType,
            });
            alert("Cloud process initialized: " + JSON.stringify(response));
            onClose();
        } catch (error: unknown) {
            alert("Error: " + String(error));
        }
    };

    return (
        <div className="cloud-init-panel">
            <h3>Initialize Cloud Process</h3>
            <div className="cloud-init-field">
                <label>
                    Start Date:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
            </div>
            <div className="cloud-init-field">
                <label>
                    End Date:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
            </div>
            <div className="cloud-init-field">
                <label>
                    Cache Active:
                    <input type="checkbox" checked={isCacheActive} onChange={(e) => setIsCacheActive(e.target.checked)} />
                </label>
            </div>
            <div className="cloud-init-field">
                <label>
                    Genetic Strategy:
                    <input type="text" value={geneticStrategy} onChange={(e) => setGeneticStrategy(e.target.value)} />
                </label>
            </div>
            <div className="cloud-init-field">
                <label>
                    Model Type:
                    <input type="text" value={modelType} onChange={(e) => setModelType(e.target.value)} />
                </label>
            </div>
            <div className="button-group">
                <button className="green-button" onClick={handleSubmit}>
                    Initialize Cloud Process
                </button>
                <button className="red-button margin-left" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CloudInitPanel;
