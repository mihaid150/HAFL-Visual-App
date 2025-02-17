// src/store/nodeSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NodeRecord {
    localId: string;
    backedId: string;
    label: string;
    ip_address: string;
    port: number;
    node_type: number;
    flowchart_position: { x: number; y: number };
    parentId?: string;
    childrenIds?: string[];
    sendOperation?: (operation: string, data: unknown) => Promise<unknown>; // Add this line
}


interface NodeState {
    nodes: NodeRecord[];
}

const initialState: NodeState = {
    nodes: [],
}

const nodeSlice = createSlice({
    name: 'nodes',
    initialState,
    reducers: {
        addNode: (state, action: PayloadAction<NodeRecord>) => {
            state.nodes.push(action.payload);
        },
        updateNode: (
            state,
            action: PayloadAction<{ localId: string, changes: Partial<NodeRecord> }>
        ) => {
            const { localId, changes } = action.payload;
            const node = state.nodes.find((n) => n.localId === localId);
            if (node) {
                Object.assign(node, changes);
            }
        },
        setParentForNode: (
            state,
            action: PayloadAction<{ localId: string, parentId: string }>
        ) => {
            const { localId, parentId } = action.payload;
            const node = state.nodes.find((n) => n.localId === localId);
            if (node) {
                node.parentId = parentId;
            }
        },
        addChildToNode: (
            state,
            action: PayloadAction<{ localId: string, childId: string }>
        ) => {
            const { localId, childId } = action.payload;
            const node = state.nodes.find((n) => n.localId === localId);
            if (node) {
                if (!node.childrenIds) {
                    node.childrenIds = []
                }
                node.childrenIds.push(childId);
            }
        },
        removeNode: (
            state,
            action: PayloadAction<string>
        ) => {
            state.nodes = state.nodes.filter((node) => node.localId !== action.payload);
        },
        clearNodes: (state) => {
            state.nodes = []
        },
    },
});

export const { addNode, updateNode, setParentForNode, addChildToNode, removeNode, clearNodes } = nodeSlice.actions;
export default nodeSlice.reducer;