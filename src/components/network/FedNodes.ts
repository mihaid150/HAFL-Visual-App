// FedNodes.ts

// Define the node type enum to match your Python reference.
export enum FedNodeType {
    CLOUD_NODE = 1,
    FOG_NODE = 2,
    EDGE_NODE = 3,
}

// A generic node interface with common properties.
export interface GenericNode {
    name: string;
    ip_address: string;
    port: number;
}

// Extend the generic node interface for a Cloud node.
export interface CloudNode extends GenericNode {
    node_type: FedNodeType.CLOUD_NODE;
}

// Extend the generic node interface for a Fog node.
export interface FogNode extends GenericNode {
    node_type: FedNodeType.FOG_NODE;
}

// Extend the generic node interface for an Edge node.
export interface EdgeNode extends GenericNode {
    node_type: FedNodeType.EDGE_NODE;
}
