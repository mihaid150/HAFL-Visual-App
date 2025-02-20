import { createContext, useContext } from 'react';

interface CloudNodeContextProps {
    ip_address: string;
    port: number;
}

const CloudNodeContext = createContext<CloudNodeContextProps | undefined>(undefined);

export const useCloudNode = () => {
    const context = useContext(CloudNodeContext);
    if (!context) {
        throw new Error('useCloudNode must be used within a CloudNodeProvider');
    }
    return context;
};

export default CloudNodeContext;
