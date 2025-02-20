import React, { useState } from 'react';
import '../style/ButtonsStyle.sass';
import '../style/TrainingPanel.sass';
import {useBackendWebSocket} from "../../../hooks/useBackendWebSocket.ts";
import { useCloudNode } from './CloudNodeContext.tsx';

interface TrainingPanelProps {
    onClose: () => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({ onClose }) => {
    const { ip_address, port } = useCloudNode();
    const wsUrl = `ws://${ip_address}:${port}/cloud/ws`;
    const { sendOperation } = useBackendWebSocket(wsUrl);

    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isCacheActive, setIsCacheActive] = useState(false);
    const [geneticStrategy, setGeneticStrategy] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await sendOperation("initialize_cloud_training", {
                end_date: currentDate,
                is_cache_active: isCacheActive,
                genetic_evaluation_strategy: geneticStrategy,
                model_type: "model",
            });
            alert("Cloud training initialized: " + JSON.stringify(response));
            onClose();
        } catch (error: unknown) {
            alert("Error: " + String(error));
        }
    };

    return (
        <div className="training-panel">
            <h3>Initialize Training Process</h3>
            <div className="training-field">
                <label>
                    Current Date:
                    <input
                        type="date"
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                    />
                </label>
            </div>
            <div className="training-field">
                <label>
                    Cache Active:
                    <input type="checkbox" checked={isCacheActive}
                           onChange={(e) => setIsCacheActive(e.target.checked)}/>
                </label>
            </div>
            <div className="training-field">
                <label>
                    Genetic Strategy:
                    <input
                        type="text"
                        value={geneticStrategy}
                        onChange={(e) => setGeneticStrategy(e.target.value)}
                    />
                </label>
            </div>
            <div className="button-group">
                <button className="green-button" onClick={handleSubmit}>
                    Initialize Training Process
                </button>
                <button className="red-button margin-left" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default TrainingPanel;
