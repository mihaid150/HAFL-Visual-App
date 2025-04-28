// src/components/simulation/NotifyConnections.ts
import {Edge} from 'reactflow';
import {sendOperationToUrl} from '../../hooks/useBackendWebSocket.ts';
import {NodeRecord, updateNode} from '../../store/nodeSlice.ts';
import {AppDispatch} from "../../store/store.ts";
import {FedNodeType} from "./FedNodes.ts";

export const notifyParents = (
    reduxNodes: NodeRecord[],
    edges: Edge[],
    dispatch: AppDispatch
) => {
    // Loop over each edge to determine parent–child relationships.
    edges.forEach((edge) => {
        // Assume edge.source is parent's localId and edge.target is child's localId.
        const parentNode = reduxNodes.find((node) => node.localId === edge.source);
        const childNode = reduxNodes.find((node) => node.localId === edge.target);
        if (parentNode && childNode && parentNode.backedId) {
            // Update child record if necessary.
            if (childNode.parentId !== parentNode.backedId) {
                dispatch({
                    type: 'nodes/updateNode',
                    payload: {localId: childNode.localId, changes: {parentId: parentNode.backedId}},
                });
            }
            // Notify the child's backend.
            const wsUrl = `ws://${childNode.ip_address}:${childNode.port}/node/ws`;
            sendOperationToUrl(wsUrl, 'set_parent', {
                id: parentNode.backedId,
                name: parentNode.label,
                node_type: parentNode.node_type,
                ip_address: parentNode.ip_address,
                port: parentNode.port,
            })
                .then((response) => {
                    console.log(`Notified parent for node ${childNode.localId}:`, response);
                })
                .catch((err) => {
                    console.error(`Error notifying parent for node ${childNode.localId}:`, err);
                });
        }
    });
};

export const notifyChildren = (
    reduxNodes: NodeRecord[],
    edges: Edge[],
    dispatch: AppDispatch
) => {
    const parentToChildrenMap: { [parentLocalId: string]: string[] } = {};
    edges.forEach((edge) => {
        if (!parentToChildrenMap[edge.source]) {
            parentToChildrenMap[edge.source] = [];
        }
        parentToChildrenMap[edge.source].push(edge.target);
    });

    Object.entries(parentToChildrenMap).forEach(([parentLocalId, childrenLocalIds]) => {
        const parentNode = reduxNodes.find((node) => node.localId === parentLocalId);
        if (parentNode && parentNode.backedId) {
            const childrenNodes = reduxNodes.filter((node) =>
                childrenLocalIds.includes(node.localId)
            );
            const newChildrenIds = childrenNodes
                .filter((child) => !!child.backedId)
                .map((child) => child.backedId);
            if (
                !parentNode.childrenIds ||
                JSON.stringify(parentNode.childrenIds.sort()) !== JSON.stringify(newChildrenIds.sort())
            ) {
                dispatch({
                    type: 'nodes/updateNode',
                    payload: {localId: parentNode.localId, changes: {childrenIds: newChildrenIds}},
                });
            }
            const wsUrl = `ws://${parentNode.ip_address}:${parentNode.port}/node/ws`;
            sendOperationToUrl(wsUrl, 'set_children', childrenNodes.map((child) => ({
                id: child.backedId,
                name: child.label,
                node_type: child.node_type,
                ip_address: child.ip_address,
                port: child.port,
            })))
                .then((response) => {
                    console.log(`Notified children for node ${parentNode.localId}:`, response);
                })
                .catch((err) => {
                    console.error(`Error notifying children for node ${parentNode.localId}:`, err);
                });
        }
    });
};

export const fetchNodesConnections = async (
    reduxNodes: NodeRecord[],
    dispatch: AppDispatch
) => {
    for (const node of reduxNodes) {
        const wsUrl = `ws://${node.ip_address}:${node.port}/node/ws`;
        try {
            const response = await sendOperationToUrl(wsUrl, "get_node_info", {});
            if (typeof response === "object" && response !== null && "node" in response) {
                const nodeInfo = response as {
                    message: string;
                    node: { id: string; name: string; type: number; ip_address: string; port: number,
                        device_mac: string };
                };
                dispatch(updateNode({localId: node.localId, changes: {backedId: nodeInfo.node.id,
                        device_mac: nodeInfo.node.device_mac}}));
            }
        } catch (error) {
            console.error(`Error fetching node info for node ${node.localId}:`, error);
        }
    }
};

export const executeNodesInitialization = async (
    reduxNodes: NodeRecord[],
    dispatch: AppDispatch
) => {
    const isNodeInitialize: Record<string, boolean> = {};
    for (const node of reduxNodes) {
        if (node.label && node.ip_address && node.port) {
            try {
                const wsUrl = `ws://${node.ip_address}:${node.port}/node/ws`;
                const response = await sendOperationToUrl(wsUrl, "initialize", {
                    name: node.label,
                    node_type: node.node_type,
                    ip_address: node.ip_address,
                    port: node.port,
                });
                if (typeof response === "object" && response !== null && "node" in response) {
                    isNodeInitialize[node.label] = true;

                    const nodeInfo = response as {
                        message: string;
                        node: { id: string; name: string; type: number; ip_address: string; port: number,
                            device_mac: string};
                    };
                    dispatch(updateNode({localId: node.localId, changes: {backedId: nodeInfo.node.id,
                            device_mac: nodeInfo.node.device_mac}}));
                } else {
                    isNodeInitialize[node.label] = false;
                }
            } catch (error: unknown) {
                alert("Error: " + String(error));
            }
        }
    }

    const allTrue = Object.values(isNodeInitialize).every(value => value);

    if (allTrue) {
        alert("All nodes have been initialized successfully!");
    } else {
        alert("There was a problem initializing all the nodes.");
    }
}

export const executeClearCloudResults = async (
    reduxNodes: NodeRecord[]) => {
    const cloudNode = reduxNodes.filter((node) => node.node_type === FedNodeType.CLOUD_NODE)[0];
    const wsUrl = `ws://${cloudNode.ip_address}:${cloudNode.port}/cloud/ws`;

    const response = await sendOperationToUrl(wsUrl, "clear_cloud_results", {});
    if (typeof response === "object" && response !== null && "message" in response) {
        const nodeInfo = response as {
            message: string;
        }
        alert(nodeInfo.message);
    }
    else {
        alert("Error clearing the cloud results.");
    }
}

export const recordNodesToCloudDb = (reduxNodes: NodeRecord[]) => {
    // Build the list of nodes to record:

    const nodesToRecord = get_structured_nodes(reduxNodes);

    // Find the cloud node to which we will send the operation.
    const cloudNode = reduxNodes.find((node) => node.node_type === FedNodeType.CLOUD_NODE);
    if (!cloudNode) {
        console.error("Cloud node not found");
        return;
    }

    // Construct the WebSocket URL for the cloud node.
    const wsUrl = `ws://${cloudNode.ip_address}:${cloudNode.port}/cloud/ws`;

    // Send the operation using sendOperationToUrl.
    sendOperationToUrl(wsUrl, "record_nodes_to_cloud_db", nodesToRecord)
        .then((response) => {
            console.log("Recorded nodes:", response);
        })
        .catch((err) => {
            console.error("Error recording nodes:", err);
        });
};

export const update_node_records = (reduxNodes: NodeRecord[]) => {
    // Build the list of nodes to record:

    const nodesToRecord = get_structured_nodes(reduxNodes);

    // Find the cloud node to which we will send the operation.
    const cloudNode = reduxNodes.find((node) => node.node_type === FedNodeType.CLOUD_NODE);
    if (!cloudNode) {
        console.error("Cloud node not found");
        return;
    }

    // Construct the WebSocket URL for the cloud node.
    const wsUrl = `ws://${cloudNode.ip_address}:${cloudNode.port}/cloud/ws`;

    // Send the operation using sendOperationToUrl.
    sendOperationToUrl(wsUrl, "update_node_records_and_relink_ids", nodesToRecord)
        .then((response) => {
            console.log("Updated recorded nodes:", response);
        })
        .catch((err) => {
            console.error("Error recording nodes:", err);
        });
};

export const get_structured_nodes = (reduxNodes: NodeRecord[]) => {
    return  reduxNodes.map((node) => {
        // Look up the parent node using node.parentId.
        const parent = reduxNodes.find((n) => n.backedId === node.parentId);
        return {
            id: node.backedId || null,            // backend id (or null if not available)
            label: node.label,
            parent_id: node.parentId || null,       // parent's local id (or null)
            parent_label: parent ? parent.label : null, // parent's label, if found
            device_mac: node.device_mac,
        };
    });
}
