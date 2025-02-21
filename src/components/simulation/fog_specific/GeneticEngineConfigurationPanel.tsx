import {useNodeContext} from "../NodeContext.tsx";
import React, {useCallback, useEffect, useState} from "react";
import {useBackendWebSocket} from "../../../hooks/useBackendWebSocket.ts";
import '../style/GeneticEngineConfigurationPanel.sass'

interface GeneticEngineParameters {
    population_size: number;
    number_of_generations: number;
    stagnation_limit: number;
}

interface GeneticEngineConfigurationPanelProps {
    onClose: () => void;
}

export const GeneticEngineConfigurationPanel: React.FC<GeneticEngineConfigurationPanelProps> = ({onClose}) => {
    const {ip_address, port} = useNodeContext();
    const wsUrl = `ws://${ip_address}:${port}/fog/ws`;
    const {sendOperation, connectionReady} = useBackendWebSocket(wsUrl);

    const [geneticEngineParams, setGeneticEngineParams] = useState<GeneticEngineParameters>({
        population_size: 0,
        number_of_generations: 0,
        stagnation_limit: 0,
    });

    const getCurrentParameters = useCallback( async () => {
        try {
            const response = await sendOperation("get_genetic_engine_configuration", {});
            if (response && typeof response === "object") {
                setGeneticEngineParams(response as GeneticEngineParameters);
            }
        } catch (error: unknown) {
            console.error("Error fetching genetic engine configuration:", error);
        }
    }, [sendOperation]);

    useEffect(() => {
        const fetchParameters = async () => {
            await getCurrentParameters();
        };
        if (connectionReady) {
            void fetchParameters();
        }
    }, [getCurrentParameters, connectionReady])

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

            const configResponse = await sendOperation("configure_genetic_engine", {
                population_size: geneticEngineParams.population_size,
                number_of_generations: geneticEngineParams.number_of_generations, // corrected here
                stagnation_limit: geneticEngineParams.stagnation_limit,
            });

            alert(`Fog with IP ${ip_address} has configured genetic engine: ${JSON.stringify(configResponse)}`);
            onClose();
        } catch (error: unknown) {
            alert(`Error: ${String(error)}`);
        }
    };

    return (
        <div className="genetic-engine-conf-panel">
            <h3>Configure Genetic Engine</h3>
            <div className="population-size-field">
                <label>
                    Population Size:
                    <input
                        type="number"
                        value={geneticEngineParams.population_size}
                        onChange={(e) =>
                            setGeneticEngineParams({
                                ...geneticEngineParams,
                                population_size: parseInt(e.target.value),
                            })
                        }
                        placeholder="Population Size"
                    />
                </label>
            </div>
            <div className="number-generations-field">
                <label>
                    Number of Generations:
                    <input
                        type="number"
                        value={geneticEngineParams.number_of_generations}
                        onChange={(e) =>
                        setGeneticEngineParams({
                            ...geneticEngineParams,
                            number_of_generations: parseInt(e.target.value),
                        })
                        }
                        placeholder="Number of Generations"
                    />
                </label>
            </div>
            <div className="stagnation-limit-field">
                <label>
                    Stagnation Limit:
                    <input
                        type="number"
                        value={geneticEngineParams.stagnation_limit}
                        onChange={(e) =>
                        setGeneticEngineParams({
                            ...geneticEngineParams,
                            stagnation_limit: parseInt(e.target.value),
                        })
                        }
                        placeholder="Stagnation Limit"
                    />
                </label>
            </div>
            <div className="button-group">
                <button className="green-button" onClick={handleSubmit}>
                    Set Genetic Configuration
                </button>
                <button className="red-button margin-left" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    )
}