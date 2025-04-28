import { ReactFlowProvider } from 'reactflow';
import FlowChart from './FlowChart.tsx';
import UpSideBar from './side_bars/UpSideBar.tsx';

const FlowChartWrapper = () => (
    <ReactFlowProvider>
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '80vh',
                width: '100%',
                background: '#f0f0f0',
            }}
        >
            {/* UpSideBar at the top */}
            <UpSideBar />

            {/* Main content area centered below the upbar */}
            <div
                style={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
        </div>
    </ReactFlowProvider>
);

export default FlowChartWrapper;
