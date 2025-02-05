// src/components/network/NodeOperations.ts
import {updateNode} from "../../store/nodeSlice";
import {useAppDispatch} from "../../store/storeHook";
import './ButtonsStyle.sass'

export const useNodeOperations = (id: string, nodeType: number, localLabel: string, localIp: string, localPort: number, sendOperation: (operation: string, data: unknown) => Promise<unknown>) => {
    const dispatch = useAppDispatch();

    const handleInitializeOperation = async () => {
        if (localLabel && localIp && localPort) {
            try {
                const response = await sendOperation("initialize", {
                    name: localLabel,
                    node_type: nodeType,
                    ip_address: localIp,
                    port: localPort,
                });
                if (typeof response === "object" && response !== null && "node" in response) {
                    const nodeInfo = response as {
                        message: string;
                        node: { id: number; name: string; type: number; ip_address: string; port: number };
                    };
                    alert(`Node initialized: id ${nodeInfo.node.id}, name ${nodeInfo.node.name}`);
                    dispatch(updateNode({localId: id, changes: {backedId: nodeInfo.node.id}}));
                } else {
                    alert("Unexpected response: " + JSON.stringify(response));
                }
            } catch (error: unknown) {
                alert("Error: " + String(error));
            }
        } else {
            alert("Label, IP address, and Port must be set before initialization.");
        }
    };

    const InitializeNodeButton = () => {
        return (
            <button
                onClick={handleInitializeOperation}
                className="green-button"
                disabled={!localLabel || !localIp || !localPort}
            >
                Initialize Node
            </button>
        )
    }

    const handleGetNodeInfoOperation = async () => {
        if (localLabel && localIp && localPort) {
            try {
                const response = await sendOperation("get_node_info", {});
                if (typeof response === "object" && response !== null && "node" in response) {
                    const nodeInfo = response as {
                        message: string;
                        node: { id: number; name: string; type: number; ip_address: string; port: number }
                    };
                    alert("Node status: id " + nodeInfo.node.id + " name " + nodeInfo.node.name);
                    dispatch(updateNode({localId: id, changes: { backedId: nodeInfo.node.id}}));
                } else {
                    alert("Unexpected response: " + JSON.stringify(response));
                }
            } catch (error: unknown) {
                alert("Error: " + String(error));
            }
        } else {
            alert("Label, IP address, and Port must be set before initialization.");
        }
    };

    const GetNodeInfoButton = () => {
        return (
            <button
                onClick={handleGetNodeInfoOperation}
                className="green-button"
                disabled={!localLabel || !localIp || !localPort}
            >
                Get Node Info
            </button>
        )
    };

    const handleGetParentNodeOperation = async () => {
        if (localLabel && localIp && localPort) {
            try {
                const response = await sendOperation("get_parent", {});
                if (
                    typeof response === "object" &&
                    response !== null &&
                    "parent_node" in response
                ) {
                    const nodeInfo = response as {
                        message: string;
                        parent_node: {
                            id: number;
                            name: string;
                            type: number;
                            ip_address: string;
                            port: number;
                        };
                    };
                    alert(
                        "Parent Node status: id " +
                        nodeInfo.parent_node.id +
                        " name " +
                        nodeInfo.parent_node.name
                    );
                } else {
                    alert("Unexpected response: " + JSON.stringify(response));
                }
            } catch (error: unknown) {
                alert("Error: " + String(error));
            }
        } else {
            alert("Label, IP address, and Port must be set before initialization.");
        }
    };

    const GetParentNode = () => {
        return (
            <button
                onClick={handleGetParentNodeOperation}
                className="green-button"
                disabled={!localLabel || !localIp || !localPort}
            >
                Get Parent Node
            </button>
        )
    };

    return {
        InitializeNodeButton,
        GetNodeInfoButton,
        GetParentNode
    };
};