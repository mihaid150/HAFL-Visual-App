import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useBackendWebSocket } from "../../../hooks/useBackendWebSocket.ts";
import { useAppSelector } from "../../../store/storeHook.ts";
import { RootState } from "../../../store/store.ts";
import {CloudNode, FedNodeType} from "../FedNodes.ts";
import '../style/PerformanceChart.sass';

Chart.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);
Chart.defaults.font.family = "'Ubuntu', sans-serif";

interface NumericPerformanceRecord {
    evaluation_date: string;
    average: number | null;
}

interface PredictionPerformanceRecord {
    evaluation_date: string;
    prediction_pairs: [number, number][];
}

type PerformanceRecord = NumericPerformanceRecord | PredictionPerformanceRecord;

interface PerformanceResponse {
    performance_results?: PerformanceRecord[];
    prediction_results?: PredictionPerformanceRecord[];
    genetic_results?: GeneticResult[];
    system_metrics?: SystemMetricsResult[];
    error?: string;
}

interface AvailableMetrics {
    model_performance_metrics: string[];
    prediction_metrics: string[];
    genetic_metrics: string[];
    system_metric_metrics: string[];
}

interface AvailableMetricsResponse {
    model_performance_metrics: string[];
    prediction_metrics: string[];
    genetic_metrics: string[];
    system_metric_metrics: string[];
    error?: string;
}

interface GeneticResult {
    evaluation_date: string;
    generations: {
        gen: number;
        value: number | null;
    }[];
}

interface SystemMetricsResult {
    evaluation_date: string;
    generations: {
        gen: number;
        value: number | null;
    }[];
}

export const PerformanceChart: React.FC = () => {
    const reduxNodes = useAppSelector((state: RootState) => state.nodes.nodes);
    // const cloudNode = reduxNodes.find((node) => node.node_type === FedNodeType.CLOUD_NODE);
    const [cloudNode, setCloudNode] = useState<CloudNode | undefined>(undefined);
    // Create a state for the WebSocket URL.
    const [wsUrl, setWsUrl] = useState<string>("");

    /// When reduxNodes change, update the cloud node and wsUrl.
    useEffect(() => {
        const foundNode = reduxNodes.find((node) => node.node_type === FedNodeType.CLOUD_NODE) as CloudNode | undefined;
        setCloudNode(foundNode);
        if (foundNode) {
            setWsUrl(`ws://${foundNode.ip_address}:${foundNode.port}/cloud/ws`);
        } else {
            setWsUrl("");
        }
    }, [reduxNodes]);

    const { sendOperation, connectionReady} = useBackendWebSocket(wsUrl);
    const statusMessages = useAppSelector((state: RootState) => state.status.messages);

    // State for selected metric and available metrics (fetched from backend)
    const [selectedMetric, setSelectedMetric] = useState<string>("");
    const [availableMetrics, setAvailableMetrics] = useState<AvailableMetrics>({
        model_performance_metrics: [],
        prediction_metrics: [],
        genetic_metrics: [],
        system_metric_metrics: [],
    });
    // State for selected edge id (used when the metric is "prediction_pairs")
    const [selectedEdgeId, setSelectedEdgeId] = useState<string>("");
    const [selectedFogId, setSelectedFogId] = useState<string>("");

    // New states for date filtering.
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [filterEnabled, setFilterEnabled] = useState<boolean>(false);

    // Get the edge nodes from redux (only nodes with type EDGE_NODE)
    const edgeNodes = reduxNodes.filter((node) => node.node_type === FedNodeType.EDGE_NODE);
    const fogNodes = reduxNodes.filter((node) => node.node_type === FedNodeType.FOG_NODE);

    const [chartData, setChartData] = useState<ChartData<"line", (number | null)[], string>>({
        labels: [],
        datasets: [],
    });


    // Add a ref for the chart instance
    const chartRef = useRef<Chart<"line", number[], string> | null>(null);

    // Process numeric performance (including prediction_pairs)
    const processNumericPerformanceData = useCallback((records: PerformanceRecord[]) => {
        // Sort by evaluation_date.
        const sortedRecords = records.sort((a, b) => a.evaluation_date.localeCompare(b.evaluation_date));
        const filteredRecords = filterEnabled
            ? sortedRecords.filter(record => {
                const date = record.evaluation_date;
                if (startDate && endDate) return date >= startDate && date <= endDate;
                else if (startDate && !endDate) return date >= startDate;
                else if (!startDate && endDate) return date <= endDate;
                else return true;
            })
            : sortedRecords;

        if (selectedMetric !== "prediction_pairs") {
            // For numeric evaluation metrics.
            const labels = filteredRecords.map(record => record.evaluation_date);
            const numericRecords = filteredRecords as NumericPerformanceRecord[];
            const averages = numericRecords.map(record => record.average ?? 0);
            const newChartData: ChartData<"line", number[], string> = {
                labels,
                datasets: [
                    {
                        label: `${selectedMetric.toUpperCase()} (Average)`,
                        data: averages,
                        borderColor: "rgba(75,192,192,1)",
                        backgroundColor: "rgba(75,192,192,0.2)",
                        fill: false,
                    },
                ],
            };
            setChartData(newChartData);
        } else {
            // For prediction_pairs.
            const flattenedReal: number[] = [];
            const flattenedPred: number[] = [];
            const flattenedLabels: string[] = [];
            filteredRecords.forEach(record => {
                const predRecord = record as PredictionPerformanceRecord;
                const pairs = predRecord.prediction_pairs;
                if (pairs && pairs.length > 0) {
                    for (let i = 0; i < pairs.length; i++) {
                        flattenedReal.push(pairs[i][0]);
                        flattenedPred.push(pairs[i][1]);
                        if (i === 0 || i === pairs.length - 1) {
                            flattenedLabels.push(record.evaluation_date);
                        } else {
                            flattenedLabels.push("");
                        }
                    }
                }
            });
            const newChartData: ChartData<"line", number[], string> = {
                labels: flattenedLabels,
                datasets: [
                    {
                        label: "REAL VALUES",
                        data: flattenedReal,
                        borderColor: "rgba(75,192,192,1)",
                        backgroundColor: "rgba(75,192,192,0.2)",
                        fill: false,
                    },
                    {
                        label: "PREDICTED VALUES",
                        data: flattenedPred,
                        borderColor: "rgba(153,102,255,1)",
                        backgroundColor: "rgba(153,102,255,0.2)",
                        fill: false,
                    },
                ],
            };
            setChartData(newChartData);
        }
    }, [selectedMetric, filterEnabled, startDate, endDate]);

    // Define a separate processing function for prediction records.
    const processPredictionPerformanceData = useCallback(
        (records: PredictionPerformanceRecord[]) => {
            // Sort records by evaluation_date.
            const sortedRecords = records.sort((a, b) =>
                a.evaluation_date.localeCompare(b.evaluation_date)
            );
            const filteredRecords = filterEnabled
                ? sortedRecords.filter(record => {
                    const date = record.evaluation_date;
                    if (startDate && endDate) return date >= startDate && date <= endDate;
                    else if (startDate && !endDate) return date >= startDate;
                    else if (!startDate && endDate) return date <= endDate;
                    else return true;
                })
                : sortedRecords;

            // Flatten prediction pairs.
            const flattenedReal: number[] = [];
            const flattenedPred: number[] = [];
            const flattenedLabels: string[] = [];

            // Keep track of the last encountered date.
            let currentDate = "";

            filteredRecords.forEach(record => {
                const pairs = record.prediction_pairs;
                if (pairs && pairs.length > 0) {
                    // If the record's date is new, update currentDate and label all pairs.
                    const isNewDate = record.evaluation_date !== currentDate;
                    if (isNewDate) {
                        currentDate = record.evaluation_date;
                    }
                    pairs.forEach(pair => {
                        flattenedReal.push(pair[0]);
                        flattenedPred.push(pair[1]);
                        // If this record's date is new, label it; otherwise leave blank.
                        flattenedLabels.push(isNewDate ? record.evaluation_date : "");
                    });
                }
            });

            const newChartData: ChartData<"line", (number | null)[], string> = {
                labels: flattenedLabels,
                datasets: [
                    {
                        label: "REAL VALUES",
                        data: flattenedReal,
                        borderColor: "rgba(75,192,192,1)",
                        backgroundColor: "rgba(75,192,192,0.2)",
                        fill: false,
                    },
                    {
                        label: "PREDICTED VALUES",
                        data: flattenedPred,
                        borderColor: "rgba(153,102,255,1)",
                        backgroundColor: "rgba(153,102,255,0.2)",
                        fill: false,
                    },
                ],
            };
            setChartData(newChartData);
        },
        [filterEnabled, startDate, endDate]
    );

    const processGeneticPerformanceData = useCallback(
        (geneticRecords: {
            evaluation_date: string;
            generations: { gen: number; value: number | null }[];
        }[]) => {
            // Sort by date
            const sortedRecords = geneticRecords.sort((a, b) =>
                a.evaluation_date.localeCompare(b.evaluation_date)
            );
            // Filter if needed
            const filteredRecords = filterEnabled
                ? sortedRecords.filter((record) => {
                    const date = record.evaluation_date;
                    if (startDate && endDate) return date >= startDate && date <= endDate;
                    else if (startDate && !endDate) return date >= startDate;
                    else if (!startDate && endDate) return date <= endDate;
                    else return true;
                })
                : sortedRecords;

            // Collect all generation indices
            const generationSet = new Set<number>();
            filteredRecords.forEach((record) => {
                record.generations.forEach((g) => {
                    generationSet.add(g.gen);
                });
            });
            const generationsArray = Array.from(generationSet).sort((a, b) => a - b);

            // Build labels (one per evaluation_date)
            const labels = filteredRecords.map((r) => r.evaluation_date);

            // Some colors
            const colors = [
                "rgba(75,192,192,1)",
                "rgba(153,102,255,1)",
                "rgba(255,159,64,1)",
                "rgba(255,99,132,1)",
                "rgba(54,162,235,1)",
            ];

            // Build one dataset per generation
            const datasets = generationsArray.map((gen, index) => {
                const dataPoints = filteredRecords.map((record) => {
                    const match = record.generations.find((g) => g.gen === gen);
                    return match ? match.value : null;
                });
                return {
                    label: `Generation ${gen}`,
                    data: dataPoints,
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length].replace("1)", "0.2)"),
                    fill: false,
                };
            });

            const newChartData: ChartData<"line", (number | null)[], string> = {
                labels,
                datasets,
            };
            setChartData(newChartData);
        },
        [filterEnabled, startDate, endDate]
    );

    const processSystemMetricsData = useCallback(
        (systemMetricRecords: {
            evaluation_date: string;
            generations: { gen: number; value: number | null }[];
        }[]) => {
            // Sort by date
            const sortedRecords = systemMetricRecords.sort((a, b) =>
                a.evaluation_date.localeCompare(b.evaluation_date)
            );
            // Filter if needed
            const filteredRecords = filterEnabled
                ? sortedRecords.filter((record) => {
                    const date = record.evaluation_date;
                    if (startDate && endDate) return date >= startDate && date <= endDate;
                    else if (startDate && !endDate) return date >= startDate;
                    else if (!startDate && endDate) return date <= endDate;
                    else return true;
                })
                : sortedRecords;

            // Collect all generation indices
            const generationSet = new Set<number>();
            filteredRecords.forEach((record) => {
                record.generations.forEach((g) => {
                    generationSet.add(g.gen);
                });
            });
            const generationsArray = Array.from(generationSet).sort((a, b) => a - b);

            // Build labels (one per evaluation_date)
            const labels = filteredRecords.map((r) => r.evaluation_date);

            // Some colors
            const colors = [
                "rgba(75,192,192,1)",
                "rgba(153,102,255,1)",
                "rgba(255,159,64,1)",
                "rgba(255,99,132,1)",
                "rgba(54,162,235,1)",
            ];

            // Build one dataset per generation
            const datasets = generationsArray.map((gen, index) => {
                const dataPoints = filteredRecords.map((record) => {
                    const match = record.generations.find((g) => g.gen === gen);
                    return match ? match.value : null;
                });
                return {
                    label: `Generation ${gen}`,
                    data: dataPoints,
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length].replace("1)", "0.2)"),
                    fill: false,
                };
            });

            const newChartData: ChartData<"line", (number | null)[], string> = {
                labels,
                datasets,
            };
            setChartData(newChartData);
        },
        [filterEnabled, startDate, endDate]
    );

    // Fetch performance data from backend.
    const fetchPerformanceData = useCallback(async () => {
        if (!selectedMetric) {
            return;
        }
        try {
            const params: { metric: string; edge_id?: string; fog_id?: string, metric_type: number } = {
                metric: selectedMetric.split(" ")[0],
                metric_type: 1, // default
            };
            if (selectedMetric.includes("Model Performance")) {
                params.metric_type = 1;
            }
            if (selectedMetric.includes("Prediction")) {
                if (!selectedEdgeId) return;
                params.edge_id = selectedEdgeId;
                params.metric_type = 2;
            }
            if (selectedMetric.includes("Genetic")) {
                if (selectedFogId) params.fog_id = selectedFogId;
                params.metric_type = 3;
            }
            if (selectedMetric.includes("System Metric")) {
                if (selectedFogId) params.fog_id = selectedFogId;
                params.metric_type = 4;
            }

            const response = (await sendOperation("get_model_performance_evaluation", params)) as PerformanceResponse;
            // Check which results we received.

            if (response.prediction_results) {
                // Type assertion is safe because we expect prediction records.
                processPredictionPerformanceData(response.prediction_results);
            } else if (response.performance_results) {
                processNumericPerformanceData(response.performance_results);
            } else if (response.genetic_results) {
                processGeneticPerformanceData(response.genetic_results);
            } else if (response.system_metrics) {
               processSystemMetricsData(response.system_metrics);
            } else {
                console.error("No evaluation results received:", response.error);
            }
        } catch (error) {
            console.error("Error fetching performance data:", error);
        }
    }, [
        sendOperation,
        selectedMetric,
        selectedEdgeId,
        selectedFogId,
        processNumericPerformanceData,
        processGeneticPerformanceData,
        processPredictionPerformanceData,
        processSystemMetricsData
    ]);


    useEffect(() => {
        if (statusMessages.length > 0) {
            const latestStatus = statusMessages[statusMessages.length - 1];
            if (latestStatus.code === 1) {
                void fetchPerformanceData();
            }
        }
    }, [statusMessages, fetchPerformanceData]);

    // Updated searchMetrics function using the new return structure.
    const searchMetrics = useCallback(async () => {
        try {
            console.info("Requesting available performance metrics...");
            const response = (await sendOperation("get_available_performance_metrics", {})) as AvailableMetricsResponse;
            // console.info("Received available metrics response:", response);
            if (
                response &&
                response.model_performance_metrics &&
                response.prediction_metrics &&
                response.genetic_metrics &&
                response.system_metric_metrics
            ) {
                setAvailableMetrics({
                    model_performance_metrics: response.model_performance_metrics,
                    prediction_metrics: response.prediction_metrics,
                    genetic_metrics: response.genetic_metrics,
                    system_metric_metrics: response.system_metric_metrics,
                });
                // If no metric selected yet, choose one by default in this order.
                if (!selectedMetric) {
                    if (response.model_performance_metrics.length > 0) {
                        setSelectedMetric(`${response.model_performance_metrics[0]} (Model Performance)`);
                    } else if (response.prediction_metrics.length > 0) {
                        setSelectedMetric(`${response.prediction_metrics[0]} (Prediction)`);
                    } else if (response.genetic_metrics.length > 0) {
                        setSelectedMetric(`${response.genetic_metrics[0]} (Genetic)`);
                    } else if (response.system_metric_metrics.length > 0) {
                        setSelectedMetric(`${response.system_metric_metrics[0]} (System Metric)`)
                    }
                }
            } else {
                console.error("No available metrics received:", response.error);
            }
        } catch (error) {
            console.error("Error searching performance metrics:", error);
        }
    }, [sendOperation, selectedMetric]);

    const handleSaveChartImage = useCallback(() => {
        if (chartRef.current) {
            // Get today's date in dd-mm-yyyy format
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const dateStr = `${day}-${month}-${year}`;

            // Extract clean metric name (remove content inside parentheses)
            const metricName = selectedMetric.replace(/\s*\(.*?\)\s*/g, "").replace(/\s+/g, "_");

            // Determine suffix based on type
            let nodeSuffix = "";
            if (selectedMetric.includes("Prediction") && selectedEdgeId) {
                const selectedEdge = edgeNodes.find(node => node.backedId === selectedEdgeId);
                if (selectedEdge) {
                    nodeSuffix = `_${selectedEdge.label.toUpperCase().replace(/\s+/g, "_")}`;
                }
            } else if (
                (selectedMetric.includes("Genetic") || selectedMetric.includes("System Metric")) &&
                selectedFogId
            ) {
                const selectedFog = fogNodes.find(node => node.backedId === selectedFogId);
                if (selectedFog) {
                    nodeSuffix = `_${selectedFog.label.toUpperCase().replace(/\s+/g, "_")}`;
                }
            }

            // Construct the final filename
            const fileName = `performance_chart_${metricName}${nodeSuffix}_${dateStr}.png`;

            const imageUrl = chartRef.current.toBase64Image();
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error("Chart reference not available.");
        }
    }, [selectedMetric, selectedEdgeId, selectedFogId, edgeNodes, fogNodes]);

    // When available metrics or connectionReady change, fetch data.
    useEffect(() => {
        if (connectionReady && selectedMetric !== "") {
            if (selectedMetric === "prediction_pairs" && !selectedEdgeId) return;
            console.info("Fetching performance data due to selected metric change");
            void fetchPerformanceData();
        }
    }, [selectedMetric, selectedEdgeId, connectionReady, fetchPerformanceData]);

    if (!cloudNode) {
        return <div>Cloud node is not available.</div>;
    }

    // Combine available metrics into one list for the dropdown.
    const combinedMetrics = [
        ...availableMetrics.model_performance_metrics.map((metric) => ({
            value: `${metric} (Model Performance)`,
            label: `${metric.toUpperCase()} (Model Performance)`,
            type: "Model Performance",
            color: "#4BC0C0", // example color
        })),
        ...availableMetrics.prediction_metrics.map((metric) => ({
            value: `${metric} (Prediction)`,
            label: `${metric.toUpperCase()} (Prediction)`,
            type: "Prediction",
            color: "#9966FF",
        })),
        ...availableMetrics.genetic_metrics.map((metric) => ({
            value: `${metric} (Genetic)`,
            label: `${metric.toUpperCase()} (Genetic)`,
            type: "Genetic",
            color: "#FF6384",
        })),
        ...availableMetrics.system_metric_metrics.map((metric) => ({
            value: `${metric} (System Metric)`,
            label: `${metric.toUpperCase()} (System Metric)`,
            type: "System Metric",
            color: "#9aff63",
        }))
    ];


    return (
        <div className="performance-chart">
            <div className="controls">
                <button onClick={searchMetrics}>
                    Search Performance Metrics
                </button>
                {combinedMetrics.length > 0 ? (
                    <>
                        <label htmlFor="metricSelect">Select Metric: </label>
                        <select
                            id="metricSelect"
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                        >
                            {combinedMetrics.map((item) => (
                                <option
                                    key={`${item.value}-${item.type}`}
                                    value={item.value}
                                    style={{ color: item.color }}
                                >
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </>
                ) : (
                    <p>Please press "Search Performance Metrics" to load available metrics.</p>
                )}
                {selectedMetric.includes("prediction") && edgeNodes.length > 0 && (
                    <>
                        <label htmlFor="edgeSelect">Select Edge Node: </label>
                        <select
                            id="edgeSelect"
                            value={selectedEdgeId}
                            onChange={(e) => setSelectedEdgeId(e.target.value)}
                        >
                            <option value="">-- Select an Edge --</option>
                            {edgeNodes.map((node) => (
                                <option key={node.localId} value={node.backedId}>
                                    {node.label.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                {(selectedMetric.includes("Genetic") || selectedMetric.includes("System Metric")) && fogNodes.length > 0 && (
                    <>
                        <label htmlFor="fogSelect">Select Fog Node (optional): </label>
                        <select
                            id="fogSelect"
                            value={selectedFogId}
                            onChange={(e) => setSelectedFogId(e.target.value)}
                        >
                            <option value="">-- All Fogs --</option>
                            {fogNodes.map((node) => (
                                <option key={node.localId} value={node.backedId}>
                                    {node.label.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                <div className="date-filter">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <label>End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            setFilterEnabled(true);
                            // When filter is applied, re-fetch the data.
                            void fetchPerformanceData();
                        }}
                    >
                        Apply Date Filter
                    </button>
                    <button
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setFilterEnabled(false);
                            // Re-fetch data without date filtering.
                            void fetchPerformanceData();
                        }}
                    >
                        Clear Date Filter
                    </button>
                </div>
                <button className="save-chart" onClick={handleSaveChartImage} style={{marginLeft: "1rem"}}>
                    Save Chart as Image
                </button>
            </div>
            <div className="chart-wrapper">
                <div className="chart-container">
                    {chartData.labels && chartData.labels.length > 0 ? (
                        <Line
                            ref={chartRef}
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: "top" },
                                    title: {
                                        display: true,
                                        text:
                                            availableMetrics.genetic_metrics.includes(selectedMetric)
                                                ? `Genetic Metric: ${selectedMetric.toUpperCase()} (Averages by Generation & Evaluation Date)`
                                                : availableMetrics.system_metric_metrics.includes(selectedMetric)
                                                ? `System Metric: ${selectedMetric.toUpperCase()} (Values by Generation & Evaluation Date)`
                                                : `Performance Metric: ${selectedMetric.toUpperCase()} (Averages by Evaluation Date)`,

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
                        <p>
                            Chart is not loaded yet. Please search for available metrics{" "}
                            {selectedMetric === "prediction_pairs"
                                ? "and select an edge"
                                : availableMetrics.genetic_metrics.includes(selectedMetric)
                                    ? "and optionally select a fog node"
                                    : ""}.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};


export default PerformanceChart;
