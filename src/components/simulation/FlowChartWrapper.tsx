import { ReactFlowProvider } from 'reactflow';
import FlowChart from './FlowChart.tsx';

const FlowChartWrapper = () => (
    <ReactFlowProvider>
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                width: '100%',
                background: '#f0f0f0',
            }}
        >
            <div
                style={{
                    width: '90%',
                    height: '70vh',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    background: '#fff',
                    overflow: 'hidden',
                }}
            >
                <FlowChart />
            </div>
        </div>
    </ReactFlowProvider>
);

export default FlowChartWrapper;
