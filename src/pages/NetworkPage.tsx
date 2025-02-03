import React from "react";
import FlowChartWrapper from "../components/network/FlowChartWrapper.tsx";
import "./NetworkPage.sass"

const NetworkPage: React.FC = () => {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold center">Network Page</h2>
            <br />
            <FlowChartWrapper />
        </div>
    );
};

export default NetworkPage;
