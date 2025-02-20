import React, { useState } from 'react';
import PretrainingPanel from './PretrainingPanel.tsx';
import TrainingPanel from './TrainingPanel.tsx';
import '../style/ButtonsStyle.sass';
import CloudNodeContext from './CloudNodeContext.tsx';

interface CloudPanelsWrapperProps {
    ip_address: string;
    port: number;
    onClose: () => void;
}

const CloudPanelsWrapper: React.FC<CloudPanelsWrapperProps> = ({
                                                                   ip_address,
                                                                   port,
                                                                   onClose,
                                                               }) => {
    const [activePanel, setActivePanel] = useState<'cloud' | 'training'>('cloud');

    const handleToggle = () => {
        setActivePanel(prev => (prev === 'cloud' ? 'training' : 'cloud'));
    };

    return (
        <CloudNodeContext.Provider value={{ ip_address, port }}>
            <div>
                {activePanel === 'cloud' ? (
                    <PretrainingPanel onClose={onClose} />
                ) : (
                    <TrainingPanel onClose={onClose} />
                )}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <button className="blue-button" onClick={handleToggle}>
                        {activePanel === 'cloud' ? 'Switch to Training Panel' : 'Switch to Pretraining Panel'}
                    </button>
                </div>
            </div>
        </CloudNodeContext.Provider>
    );
};

export default CloudPanelsWrapper;
