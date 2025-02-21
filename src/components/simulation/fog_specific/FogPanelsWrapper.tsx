import React, {useState} from "react";
import {NodeContext} from "../NodeContext.tsx";
import {GeneticEngineConfigurationPanel} from "./GeneticEngineConfigurationPanel.tsx";
import {TrainingParametersPanel} from "./TrainingParametersPanel.tsx";

interface FogPanelsWrapperProps {
    ip_address: string;
    port: number;
    onClose: () => void;
}

export const FogPanelsWrapper: React.FC<FogPanelsWrapperProps> = ({ip_address, port, onClose}) => {
    const [activePanel, setActivePanel] = useState<'genetic-conf' | 'training-hyper-parameters'>('genetic-conf');

    const handleToggle = () => {
        setActivePanel(prev => (prev === 'genetic-conf' ? 'training-hyper-parameters' : 'genetic-conf'));
    }

    return (
        <NodeContext.Provider value={{ ip_address, port }}>
            <div>
                {activePanel === 'genetic-conf' ? (
                    <GeneticEngineConfigurationPanel onClose={onClose} />
                ) : (
                    <TrainingParametersPanel onClose={onClose} />
                )}
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '1rem'}}>
                    <button className="blue-button" onClick={handleToggle}>
                        {activePanel === 'genetic-conf' ? 'Switch to Training Hyper-parameters Configuration' :
                            'Switch to Genetic Engine Configuration'}
                    </button>
                </div>
            </div>
        </NodeContext.Provider>
    );
};