import {useNodeContext} from "../NodeContext.tsx";
import React, {useCallback, useEffect, useState} from "react";
import {useBackendWebSocket} from "../../../hooks/useBackendWebSocket.ts";

interface TrainingParameters {
    learning_rate_lower_bound: number;
    learning_rate_upper_bound: number;
    batch_size_lower_bound: number;
    batch_size_upper_bound: number;
    epochs_lower_bound: number;
    epochs_upper_bound: number;
    patience_lower_bound: number;
    patience_upper_bound: number;
    fine_tune_layers_lower_bound: number;
    fine_tune_layers_upper_bound: number;
}

interface TrainingParametersPanelProps {
    onClose: () => void;
}

export const TrainingParametersPanel: React.FC<TrainingParametersPanelProps> = ({onClose}) => {
    const {ip_address, port} = useNodeContext();
    const wsUrl = `ws://${ip_address}:${port}/fog/ws`;
    const {sendOperation, connectionReady} = useBackendWebSocket(wsUrl);

    const [trainingParams, setTrainingParams] = useState<TrainingParameters>({
        learning_rate_lower_bound: 0,
        learning_rate_upper_bound: 0,
        batch_size_lower_bound: 0,
        batch_size_upper_bound: 0,
        epochs_lower_bound: 0,
        epochs_upper_bound: 0,
        patience_lower_bound: 0,
        patience_upper_bound: 0,
        fine_tune_layers_lower_bound: 0,
        fine_tune_layers_upper_bound: 0,
    });

    // Memoize the function so its reference remains stable
    const getCurrentParameters = useCallback(async () => {
        try {
            const response = await sendOperation("get_current_training_parameter_bounds", {});
            // Check if response is an object and cast to TrainingParameters.
            if (response && typeof response === "object") {
                setTrainingParams(response as TrainingParameters);
            }
        } catch (error: unknown) {
            console.error("Error fetching training parameters:", error);
        }
    }, [sendOperation]);

    // Call getCurrentParameters when the component mounts.
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
            const stateResponse = await sendOperation("get_fog_service_state", {});
            if (!stateResponse || typeof stateResponse !== "object") {
                alert("Invalid response from get_fog_service_state");
                return;
            }
            const { fog_service_state } = stateResponse as { fog_service_state: number };

            if (fog_service_state !== 1) {
                alert("Fog Service is operational and cannot be configured. Wait until termination.");
                return;
            }

            const configResponse = await sendOperation("configure_training_parameters", {
                learning_rate_lower_bound: trainingParams.learning_rate_lower_bound,
                learning_rate_upper_bound: trainingParams.learning_rate_upper_bound,
                batch_size_lower_bound: trainingParams.batch_size_lower_bound,
                batch_size_upper_bound: trainingParams.batch_size_upper_bound,
                epochs_lower_bound: trainingParams.epochs_lower_bound,
                epochs_upper_bound: trainingParams.epochs_upper_bound,
                patience_lower_bound: trainingParams.patience_lower_bound,
                patience_upper_bound: trainingParams.patience_upper_bound,
                fine_tune_layers_lower_bound: trainingParams.fine_tune_layers_lower_bound,
                fine_tune_layers_upper_bound: trainingParams.fine_tune_layers_upper_bound,
            });
            alert("Cloud training parameters configured: " + JSON.stringify(configResponse));
            onClose();
        } catch (error: unknown) {
            alert("Error: " + String(error));
        }
    };

    return (
        <div className="training-parameters-conf-panel">
            <h3>Learning Hyper-parameters Configuration</h3>
            <div className="number-field">
                <label>
                    Learning Rate Bounds:
                    <input
                        type="number"
                        value={trainingParams.learning_rate_lower_bound}
                        onChange={(e) =>
                            setTrainingParams({
                            ...trainingParams,
                            learning_rate_lower_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Learning Rate Lower Bound"
                    />
                    <input
                        type="number"
                        value={trainingParams.learning_rate_upper_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                learning_rate_upper_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Learning Rate Upper Bound"
                    />
                </label>
            </div>
            <div className="number-field">
                <label>
                    Batch Size Bounds:
                    <input
                        type="number"
                        value={trainingParams.batch_size_lower_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                batch_size_lower_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Batch Size Lower Bound"
                    />
                    <input
                        type="number"
                        value={trainingParams.batch_size_upper_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                batch_size_upper_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Batch Size Upper Bound"
                    />
                </label>
            </div>
            <div className="number-field">
                <label>
                    Epochs Bounds:
                    <input
                        type="number"
                        value={trainingParams.epochs_lower_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                epochs_lower_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Epochs Lower Bound"
                    />
                    <input
                        type="number"
                        value={trainingParams.epochs_upper_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                epochs_upper_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Epochs Upper Bound"
                    />
                </label>
            </div>
            <div className="number-field">
                <label>
                    Patience Bounds:
                    <input
                        type="number"
                        value={trainingParams.patience_lower_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                patience_lower_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Patience Lower Bound"
                    />
                    <input
                        type="number"
                        value={trainingParams.patience_upper_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                patience_upper_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Patience Upper Bound"
                    />
                </label>
            </div>
            <div className="number-field">
                <label>
                    Fine Tune Layers Bounds:
                    <input
                        type="number"
                        value={trainingParams.fine_tune_layers_lower_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                fine_tune_layers_lower_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Fine Tune Layers Lower Bound"
                    />
                    <input
                        type="number"
                        value={trainingParams.fine_tune_layers_upper_bound}
                        onChange={(e) =>
                            setTrainingParams({
                                ...trainingParams,
                                fine_tune_layers_upper_bound: parseInt(e.target.value),
                            })
                        }
                        placeholder="Fine Tune Layers Upper Bound"
                    />
                </label>
            </div>
            <div className="button-group">
                <button className="green-button" onClick={handleSubmit}>
                    Set Training Hyper-parameters
                </button>
                <button className="red-button margin-left" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    )
}