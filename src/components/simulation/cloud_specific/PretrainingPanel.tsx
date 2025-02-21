// src/components/simulation/cloud_specific/PretrainingPanel.tsx
import React, {useCallback, useEffect, useState} from 'react';
import { useBackendWebSocket } from '../../../hooks/useBackendWebSocket.ts';
import '../style/ButtonsStyle.sass'
import '../style/PretrainingPanel.sass'
import { useNodeContext } from '../NodeContext.tsx'

interface PretrainingParameters {
    start_date: string;
    current_date: string;
    is_cache_active: boolean;
    genetic_strategy: string;
    model_type: string;
}

interface PretrainingPanelProps {
    onClose: () => void;
}

const PretrainingPanel: React.FC<PretrainingPanelProps> = ({ onClose }) => {
    const { ip_address, port } = useNodeContext();
    const wsUrl = `ws://${ip_address}:${port}/cloud/ws`;
    const { sendOperation, connectionReady } = useBackendWebSocket(wsUrl);

    const [pretrainingParams, setPretrainingParams] = useState<PretrainingParameters>({
        start_date: '',
        current_date: '',
        is_cache_active: false,
        genetic_strategy: '',
        model_type: ''
    });

    const getCurrentParameters = useCallback(async () => {
        try {
            const response = await sendOperation("get_training_process_parameters", {});
            if (response && typeof response === "object") {
                setPretrainingParams(response as PretrainingParameters);
            }
        } catch (error: unknown) {
            console.error("Error fetching training process parameters:", error);
        }
    }, [sendOperation]);

    useEffect(() => {
        const fetchParameters = async () => {
            await getCurrentParameters();
        };
        if (connectionReady) {
            void fetchParameters();
        }
    }, [getCurrentParameters, connectionReady]);

    const handleSubmit = async () => {
        try {
            const stateResponse = await sendOperation("get_cloud_service_state", {});
            if (!stateResponse || typeof stateResponse !== "object") {
                alert("Invalid response from get_fog_service_state");
                return;
            }
            const { cloud_service_state } = stateResponse as { cloud_service_state: number };

            if (cloud_service_state !== 1) {
                alert("Cloud Service is operational and cannot be configured. Wait until termination.");
                return;
            }

            const response = await sendOperation("initialize_cloud_pretraining", {
                start_date: pretrainingParams.start_date,
                end_date: pretrainingParams.current_date,
                is_cache_active: pretrainingParams.is_cache_active,
                genetic_evaluation_strategy: pretrainingParams.genetic_strategy,
                model_type: pretrainingParams.model_type,
            });
            alert("Cloud pretraining initialized: " + JSON.stringify(response));
            onClose();
        } catch (error: unknown) {
            alert("Error: " + String(error));
        }
    };

    return (
        <div className="pretraining-panel">
            <h3>Initialize Pretraining Process</h3>
            <div className="pretraining-field">
                <label>
                    Start Date:
                    <input
                        type="date"
                        value={pretrainingParams.start_date}
                        onChange={(e) =>
                            setPretrainingParams({
                                ...pretrainingParams,
                                start_date: e.target.value,
                            })
                        }
                    />
                </label>
            </div>
            <div className="pretraining-field">
                <label>
                    End Date:
                    <input
                        type="date"
                        value={pretrainingParams.current_date}
                        onChange={(e) =>
                            setPretrainingParams({
                                ...pretrainingParams,
                                current_date: e.target.value,
                            })
                        }
                    />
                </label>
            </div>
            <div className="pretraining-field">
                <label>
                    Caching Active:
                    <input
                        type="checkbox"
                        checked={pretrainingParams.is_cache_active}
                        onChange={(e) =>
                            setPretrainingParams({
                                ...pretrainingParams,
                                is_cache_active: e.target.checked,
                            })
                        }
                    />
                </label>
            </div>
            <div className="pretraining-field">
                <label>
                    Genetic Strategy:
                    <input
                        type="text"
                        value={pretrainingParams.genetic_strategy}
                        onChange={(e) =>
                            setPretrainingParams({
                                ...pretrainingParams,
                                genetic_strategy: e.target.value
                            })
                        }
                        placeholder="Genetic Strategy"
                    />
                </label>
            </div>
            <div className="pretraining-field">
                <label>
                    Model Type:
                    <input
                        type="text"
                        value={pretrainingParams.model_type}
                        onChange={(e) =>
                            setPretrainingParams({
                                ...pretrainingParams,
                                model_type: e.target.value,
                            })
                        }
                        placeholder="Model Type"
                    />
                </label>
            </div>
            <div className="button-group">
                <button className="green-button" onClick={handleSubmit}>
                    Initialize Pretraining Process
                </button>
                <button className="red-button margin-left" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default PretrainingPanel;
