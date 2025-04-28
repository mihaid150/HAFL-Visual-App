import { createContext, useContext } from 'react';

interface NodeContextProps {
    ip_address: string;
    port: number;
    label: string;
}

export const NodeContext = createContext<NodeContextProps | undefined>(undefined);

export const useNodeContext = () => {
    const context = useContext(NodeContext);
    if (!context) {
        throw new Error('useNodeContext must be used within a NodeProvider');
    }
    return context;
};