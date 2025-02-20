import React from "react";
import FlowChartWrapper from "../components/simulation/FlowChartWrapper.tsx";
import "./SimulationPage.sass"

const SimulationPage: React.FC = () => {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold center">Simulation Dashboard</h2>
            <br />
            <FlowChartWrapper />
        </div>
    );
};

export default SimulationPage;
