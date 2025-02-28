import React, {useState, useEffect, useRef, useCallback} from "react";
import { Line } from "react-chartjs-2";
import {
    Chart,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend,
    ChartData,
} from "chart.js";
import {useBackendWebSocket} from "../../../hooks/useBackendWebSocket.ts";
import {useAppSelector} from "../../../store/storeHook.ts";
import {RootState} from "../../../store/store.ts";
import {FedNodeType} from "../FedNodes.ts";
import '../style/PerformanceChart.sass';

Chart.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);
Chart.defaults.font.family = "'Ubuntu', sans-serif";

interface PerformanceRecord {
    fog_id: string;
    results: {
        edge_id: string;
        metrics: {
            before_training: { [key: string]: number };
            after_training: { [key: string]: number };
        };
    }[];
    evaluation_date: string;
}

interface PerformanceResponse {
    performance_results?: PerformanceRecord[];
    error?: string;
}

export const PerformanceChart: React.FC = () => {
    const reduxNodes = useAppSelector((state: RootState) => state.nodes.nodes);
    const cloudNode = reduxNodes.find((node) => node.node_type === FedNodeType.CLOUD_NODE);
    const wsUrl = cloudNode ? `ws://${cloudNode.ip_address}:${cloudNode.port}/cloud/ws` : "";
    const { sendOperation, connectionReady } = useBackendWebSocket(wsUrl);

    const [selectedMetric, setSelectedMetric] = useState<string>("mse");
    const [chartData, setChartData] = useState<ChartData<"line", number[], string>>({
        labels: [],
        datasets: [],
    });
    const [continuousFetch, setContinuousFetch] = useState<boolean>(false);
    const fetchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const processPerformanceData = useCallback((records: PerformanceRecord[]) => {
        const grouped: { [date: string]: PerformanceRecord["results"] } = {};
        records.forEach((record) => {
            const date = record.evaluation_date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date] = grouped[date].concat(record.results);
        });

        const labels: string[] = [];
        const beforeAverages: number[] = [];
        const afterAverages: number[] = [];

        Object.keys(grouped)
            .sort()
            .forEach((date) => {
                labels.push(date);
                const edges = grouped[date];
                const beforeValues = edges
                    .map((edge) => edge.metrics.before_training[selectedMetric])
                    .filter(() => true);
                const afterValues = edges
                    .map((edge) => edge.metrics.after_training[selectedMetric])
                    .filter(() => true);

                const beforeAvg =
                    beforeValues.reduce((sum, v) => sum + v, 0) / (beforeValues.length || 1);
                const afterAvg =
                    afterValues.reduce((sum, v) => sum + v, 0) / (afterValues.length || 1);

                beforeAverages.push(beforeAvg);
                afterAverages.push(afterAvg);
            });

        const newChartData: ChartData<"line", number[], string> = {
            labels,
            datasets: [
                {
                    label: `Before Training (${selectedMetric.toUpperCase()})`,
                    data: beforeAverages,
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    fill: false,
                },
                {
                    label: `After Training (${selectedMetric.toUpperCase()})`,
                    data: afterAverages,
                    borderColor: "rgba(153,102,255,1)",
                    backgroundColor: "rgba(153,102,255,0.2)",
                    fill: false,
                },
            ],
        };

        setChartData(newChartData);
    }, [selectedMetric]);

    const fetchPerformanceData = useCallback(async () => {
        try {
            const response = (await sendOperation(
                "get_model_performance_evaluation",
                {}
            )) as PerformanceResponse;
            if (response.performance_results) {
                processPerformanceData(response.performance_results);
            } else {
                console.error("No evaluation results received:", response.error);
            }
        } catch (error) {
            console.error("Error fetching performance data:", error);
        }
    }, [sendOperation, processPerformanceData]);

    useEffect(() => {
        if (!continuousFetch && connectionReady) {
            void fetchPerformanceData();
        }
    }, [selectedMetric, continuousFetch, connectionReady, fetchPerformanceData]);

    useEffect(() => {
        if (continuousFetch && connectionReady) {
            void fetchPerformanceData();
            fetchIntervalRef.current = setInterval(() => {
                void fetchPerformanceData();
            }, 60000);
        } else if (fetchIntervalRef.current) {
            clearInterval(fetchIntervalRef.current);
            fetchIntervalRef.current = null;
        }
        return () => {
            if (fetchIntervalRef.current) {
                clearInterval(fetchIntervalRef.current);
            }
        };
    }, [continuousFetch, connectionReady, fetchPerformanceData]);

    if (!cloudNode) {
        return <div>Cloud node is not available.</div>;
    }

    return (
        <div className="performance-chart">
            <div className="controls">
                <label htmlFor="metricSelect">Select Metric: </label>
                <select
                    id="metricSelect"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                >
                    <option value="mae">MAE</option>
                    <option value="mse">MSE</option>
                    <option value="rmse">RMSE</option>
                    <option value="r2">R2</option>
                </select>
                <label className="continuous-fetch">
                    <input
                        type="checkbox"
                        checked={continuousFetch}
                        onChange={(e) => setContinuousFetch(e.target.checked)}
                    />
                    Continuous Fetch
                </label>
            </div>
            {/* New container with padding around the chart */}
            <div className="chart-wrapper">
                <div className="chart-container">
                    {chartData.labels && chartData.labels.length > 0 ? (
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: "top" },
                                    title: {
                                        display: true,
                                        text: `Performance Metric: ${selectedMetric.toUpperCase()} (Averages by Evaluation Date)`,
                                    },
                                },
                                scales: {
                                    y: {
                                        title: { display: true, text: selectedMetric.toUpperCase() },
                                    },
                                    x: {
                                        title: { display: true, text: "Evaluation Date" },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p>Loading chart data...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;
