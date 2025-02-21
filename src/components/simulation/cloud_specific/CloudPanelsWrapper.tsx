import React, {useEffect, useState} from 'react';
import PretrainingPanel from './PretrainingPanel.tsx';
import TrainingPanel from './TrainingPanel.tsx';
import '../style/ButtonsStyle.sass';
import { NodeContext } from '../NodeContext.tsx'
import {useBackendWebSocket} from "../../../hooks/useBackendWebSocket.ts";

interface CloudPanelsWrapperProps {
    ip_address: string;
    port: number;
    onClose: () => void;
}

interface FederatedSimulationStateResponse {
    federated_simulation_state: number;
}

const CloudPanelsWrapper: React.FC<CloudPanelsWrapperProps> = ({ip_address, port, onClose,
                                                               }) => {
    const [activePanel, setActivePanel] = useState<'pretraining' | 'training'>('pretraining');
    const wsUrl = `ws://${ip_address}:${port}/cloud/ws`;
    const { sendOperation, connectionReady } = useBackendWebSocket(wsUrl);

    useEffect(() => {
        if (connectionReady) {
            sendOperation("get_federated_simulation_state", {})
                .then((response) => {
                    const simResponse = response as FederatedSimulationStateResponse;
                    const simState = simResponse.federated_simulation_state;
                    if (simState === 2) {
                        setActivePanel("pretraining");
                    } else if (simState === 3) {
                        setActivePanel("training");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching federated simulation state:", error);
                });
        }
    }, [connectionReady, sendOperation]);


    const handleToggle = () => {
        setActivePanel(prev => (prev === 'pretraining' ? 'training' : 'pretraining'));
    };

    return (
        <NodeContext.Provider value={{ ip_address, port }}>
            <div>
                {activePanel === 'pretraining' ? (
                    <PretrainingPanel onClose={onClose} />
                ) : (
                    <TrainingPanel onClose={onClose} />
                )}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <button className="blue-button" onClick={handleToggle}>
                        {activePanel === 'pretraining' ? 'Switch to Training Panel' : 'Switch to Pretraining Panel'}
                    </button>
                </div>
            </div>
        </NodeContext.Provider>
    );
};

export default CloudPanelsWrapper;
