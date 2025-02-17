// src/components/network/NotifyConnections.ts
import {Edge} from 'reactflow';
import {sendOperationToUrl} from '../../hooks/useBackendWebSocket';
import {NodeRecord, updateNode} from '../../store/nodeSlice';
import {AppDispatch} from "../../store/store.ts";

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
                    node: { id: string; name: string; type: number; ip_address: string; port: number };
                };
                dispatch(updateNode({localId: node.localId, changes: {backedId: nodeInfo.node.id}}));
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
                        node: { id: string; name: string; type: number; ip_address: string; port: number };
                    };
                    dispatch(updateNode({localId: node.localId, changes: {backedId: nodeInfo.node.id}}));
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