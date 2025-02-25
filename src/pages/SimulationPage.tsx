import React from "react";
import FlowChartWrapper from "../components/simulation/FlowChartWrapper.tsx";
import "./SimulationPage.sass"
import TutorialInfo from "../components/tutorial/TutorialInfo.tsx";

const SimulationPage: React.FC = () => {
    return (
        <div className="simulation-page p-6">
            <h2 className="text-2xl font-semibold center">Simulation Dashboard</h2>
            <br/>
            <div className="flowchart-container bg-white p-4 rounded shadow">
                <FlowChartWrapper/>
            </div>
            <TutorialInfo />
        </div>
    );
};

export default SimulationPage;
