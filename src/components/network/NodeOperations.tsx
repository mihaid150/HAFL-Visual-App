// src/components/network/NodeOperations.ts
import {updateNode} from "../../store/nodeSlice";
import {useAppDispatch} from "../../store/storeHook";
import { sendOperationToUrl } from '../../hooks/useBackendWebSocket';
import './ButtonsStyle.sass'

export const useNodeOperations = (id: string, nodeType: number, localLabel: string, localIp: string, localPort: number,
                                  sendOperation: (operation: string, data: unknown) => Promise<unknown>, backendId:number,
                                  parentIp:string | undefined, parentPort:number | undefined) => {
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

    const GetParentNodeButton = () => {
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

    const handleGetChildrenNodesOperation = async () => {
        if (localLabel && localIp && localPort) {
            try {
                const response = await sendOperation("get_children", {})
                if (
                    typeof response === "object" &&
                    response !== null &&
                    "children" in response
                ) {
                    const childrenArray = response.children as Array<{
                        id: number;
                        name: string;
                        type: number;
                        ip_address: string;
                        port: number;
                    }>;

                    childrenArray.forEach((child) => {
                        alert(
                            `Child Node: id=${child.id}, name=${child.name}, type=${child.type}, ip=${child.ip_address}, port=${child.port}`
                        );
                    });
                } else {
                    alert("Unexpected response: " + JSON.stringify(response));
                }
            } catch (error: unknown) {
                alert("Error: " + String(error));
            }
        } else {
            alert("Label, IP address, and Port must be set before fetching children nodes.");
        }
    }

    const GetChildrenNodesButton = () => {
        return (
            <button
                onClick={handleGetChildrenNodesOperation}
                className="green-button"
                disabled={!localLabel || !localIp || !localPort}
            >
                Get Children Nodes
            </button>
        )
    };

    // New: Remove Parent Operation
    const handleRemoveParentOperation = async () => {
        if (localLabel && localIp && localPort) {
            try {
                const response = await sendOperation("remove_parent", {});
                alert("Parent removed: " + JSON.stringify(response));
            } catch (error: unknown) {
                alert("Error: " + String(error));
            }
        } else {
            alert("Label, IP address, and Port must be set before removing parent.");
        }
    };

    const RemoveParentButton = () => {
        return (
            <button
                onClick={handleRemoveParentOperation}
                className="red-button"
                disabled={!localLabel || !localIp || !localPort}
            >
                Remove Parent
            </button>
        );
    };

    // New: Remove Child Operation
    // This operation will be executed on the parent's backend.
    // It requires that the current node (child) has a backedId and that parent's connection info is provided.
    const handleRemoveChildOperation = async () => {
        if (localLabel && localIp && localPort && parentIp && parentPort && backendId) {
            try {
                const wsUrl = `ws://${parentIp}:${parentPort}/ws`;
                const response = await sendOperationToUrl(wsUrl, "remove_child", { child_id: backendId });
                alert("Child removed: " + JSON.stringify(response));
            } catch (error: unknown) {
                alert("Error: " + String(error));
            }
        } else {
            alert("Required fields not set for removing child node.");
        }
    };

    const RemoveChildButton = () => {
        return (
            <button
                onClick={handleRemoveChildOperation}
                className="red-button"
                disabled={!localLabel || !localIp || !localPort || !backendId}
            >
                Remove Child
            </button>
        );
    };

    return {
        InitializeNodeButton,
        GetNodeInfoButton,
        GetParentNodeButton,
        GetChildrenNodesButton,
        RemoveParentButton,
        RemoveChildButton,
    };
};