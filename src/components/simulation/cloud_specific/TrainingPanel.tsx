import React, {useCallback, useEffect, useState} from 'react';
import '../style/ButtonsStyle.sass';
import '../style/TrainingPanel.sass';
import {useBackendWebSocket} from "../../../hooks/useBackendWebSocket.ts";
import { useNodeContext } from '../NodeContext.tsx'

interface TrainingParameters {
    current_date: string;
    is_cache_active: boolean;
    genetic_strategy: string;
}

interface TrainingPanelProps {
    onClose: () => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({ onClose }) => {
    const { ip_address, port, label } = useNodeContext();
    const wsUrl = `ws://${ip_address}:${port}/cloud/ws`;
    const { sendOperation, connectionReady } = useBackendWebSocket(wsUrl);

    const [trainingParams, setTrainingParams] = useState<TrainingParameters>({
        current_date: '',
        is_cache_active: false,
        genetic_strategy: '',
    });

    const getCurrentParameters = useCallback(async () => {
        try {
            const response = await sendOperation("get_training_process_parameters", {});
            if (response && typeof response === "object") {
                const params = response as TrainingParameters;
                setTrainingParams({
                    current_date: params.current_date || "",
                    is_cache_active: params.is_cache_active ?? false,
                    genetic_strategy: params.genetic_strategy || "",
                });
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

    const handleTrainingSubmit = async () => {
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

            const response = await sendOperation("initialize_cloud_training", {
                end_date: trainingParams.current_date,
                is_cache_active: trainingParams.is_cache_active,
                genetic_evaluation_strategy: trainingParams.genetic_strategy,
            });
            alert("Cloud training initialized: " + JSON.stringify(response));
            onClose();
        } catch (error: unknown) {
            alert("Error: " + String(error));
        }
    };

    const handleEvaluationSubmit = async () => {
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

            const response = await sendOperation("perform_model_evaluation", {
                end_date: trainingParams.current_date,
            });
            alert("Cloud evaluation initialized: " + JSON.stringify(response));
            onClose();
        } catch (error: unknown) {
            alert("Error: " + String(error));
        }
    };

    return (
        <div className="training-panel">
            <h3>{label}</h3>
            <h3>Initialize Training Process</h3>
            <div className="training-field">
                <label>
                    Current Date:
                    <input
                        type="date"
                        value={trainingParams.current_date || ""}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                current_date: e.target.value,
                            })
                        }
                    />
                </label>
            </div>
            <div className="training-field">
                <label>
                    Cache Active:
                    <input
                        type="checkbox"
                        checked={trainingParams.is_cache_active || false}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                is_cache_active: e.target.checked,
                            })
                        }
                    />
                </label>
            </div>
            <div className="training-field">
                <label>
                    Genetic Strategy:
                    <input
                        type="text"
                        value={trainingParams.genetic_strategy || ""}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                genetic_strategy: e.target.value,
                            })
                        }
                        placeholder="Genetic Strategy"
                    />
                </label>
            </div>
            <div className="button-group">
                <button className="green-button" onClick={handleTrainingSubmit}>
                    Initialize Training Process
                </button>
                <button className="green-button" onClick={handleEvaluationSubmit}>
                    Initialize Evaluation Process
                </button>
                <button className="red-button margin-left" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default TrainingPanel;
