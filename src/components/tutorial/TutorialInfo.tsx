import React, { useState } from "react";
import ConfigIcon from '../../assets/icons8-config.svg';

const TutorialInfo: React.FC = () => {
    const [showDataflowSteps, setShowDataflowSteps] = useState(false);

    return (
        <div className="tutorial-info bg-gray-100 p-4 rounded shadow">
            <h3 className="text-xl font-bold mb-2">Tutorial</h3>
            <p className="mb-2">
                Welcome to the Heuristic Adaptive Federated Learning Simulation Dashboard! Here you can interact with the simulation flow and monitor key events in the process.
            </p>
            <ul className="list-disc list-inside mb-2">
                <li>
                    <strong>Flowchart Overview:</strong> The chart shows the current simulation flow, including various stages and transitions. You can construct your own federated network by drag-n-dropping nodes and connecting them with links.
                </li>
                <li>
                    <strong>Node Types:</strong> There are 3 types of nodes: Cloud Node, Fog Node, and EdgeNode. The connections between them are limited to Cloud-to-Fog and Fog-to-Edge (and vice versa).
                </li>
                <li>
                    <strong>Interactivity:</strong> Hover over nodes to see more details, and click on them to explore further. Many actions can be performed on a single node.
                </li>
                <li>
                    <strong>Live Updates:</strong> The dashboard updates automatically as the simulation state evolves.
                </li>
            </ul>
            <p>
                Use this guide to better understand how to navigate the dashboard and interpret the simulation data. For more detailed documentation, please refer to the help section or contact support.
            </p>

            <button
                className="toggle-button"
                onClick={() => setShowDataflowSteps(!showDataflowSteps)}
            >
                {showDataflowSteps ? "Hide Dataflow Steps" : "Show Dataflow Steps"}
            </button>

            {showDataflowSteps && (
                <div className="dataflow-steps">
                    <h4 className="dataflow-title">Dataflow Steps</h4>
                    <ol className="steps-list">
                        <li className="step-item">
                            <h5 className="step-title">Step 1: Network Building</h5>
                            <div className="step-description">
                                <ul>
                                    <li>
                                        Drag and drop nodes from the left side bar into the flowchart. Keep in mind that
                                        the
                                        current version of the framework allows you to build 3 layers of nodes, each for
                                        each node
                                        type with just one cloud node in the cloud layer. The children nodes for cloud
                                        or fog
                                        are not constrained in size. Also, the connections are limited: you can link
                                        nodes in this
                                        way: Cloud to Fog and Fog to Edge.
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        Note: You can save the current configuration at any time in a JSON file for ease
                                        of use later.
                                        Use <strong>Save Topology</strong> or <strong>Load Saved
                                        Topology</strong> buttons for these operations.
                                    </li>
                                </ul>
                            </div>

                        </li>
                        <li className="step-item">
                            <h5 className="step-title">Step 2: Node Setup</h5>
                            <p className="step-description">
                                <ul>
                                    After the network was created its time to setup each node. By pressing on {" "}
                                    <img
                                        src={ConfigIcon}
                                        alt="Cloud Training"
                                        style={{width: "20px", height: "20px"}}
                                    />
                                    {" "} button you can set the name or label, the IP Address and the Port of the node.
                                    After you press save, a request will be made to the backend deployed node to configure
                                    it with these properties.
                                </ul>
                            </p>
                        </li>
                        <li className="step-item">
                            <h5 className="step-title">Step 3: Federated Learning</h5>
                            <p className="step-description">
                                Process data locally on nodes while updating shared model parameters.
                            </p>
                        </li>
                        <li className="step-item">
                            <h5 className="step-title">Step 4: Aggregation</h5>
                            <p className="step-description">
                                Combine the outputs from different nodes to form a global model.
                            </p>
                        </li>
                        <li className="step-item">
                            <h5 className="step-title">Step 5: Results Visualization</h5>
                            <p className="step-description">
                                Display the simulation outcomes and performance metrics for analysis.
                            </p>
                        </li>
                    </ol>
                </div>
            )}
        </div>
    );
};

export default TutorialInfo;
