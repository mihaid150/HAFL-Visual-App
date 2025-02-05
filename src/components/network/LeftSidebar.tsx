import React from 'react';
import { FedNodeType } from './FedNodes'; // Adjust the import path as needed
import './ButtonsStyle.sass'

interface SidebarProps {
    onSaveTopology: () => void;
    onLoadTopology: () => void;
    onRemoveTopology: () => void;
    onNotifyParents: () => void;
    onNotifyChildren: () => void;
}

const LeftSidebar: React.FC<SidebarProps> = ({
    onSaveTopology,
    onLoadTopology,
    onRemoveTopology,
    onNotifyParents,
    onNotifyChildren
}) => {

    const onDragStart = (event: React.DragEvent, nodeType: FedNodeType) => {
        // Store the node type as a string so it can be later interpreted by the drop handler.
        event.dataTransfer.setData('application/reactflow', String(nodeType));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside style={{padding: '1rem', borderRight: '1px solid #ccc', width: '200px'}}>
            <div
                onDragStart={(event) => onDragStart(event, FedNodeType.CLOUD_NODE)}
                draggable
                style={{
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    background: '#ADD8E6', // light blue for Cloud Node
                    cursor: 'grab',
                    width: '90%'
                }}
            >
                Cloud Node
            </div>
            <div
                onDragStart={(event) => onDragStart(event, FedNodeType.FOG_NODE)}
                draggable
                style={{
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    background: '#FFA500', // orange for Fog Node
                    cursor: 'grab',
                    width: '90%'
                }}
            >
                Fog Node
            </div>
            <div
                onDragStart={(event) => onDragStart(event, FedNodeType.EDGE_NODE)}
                draggable
                style={{
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    background: '#90EE90', // light green for Edge Node
                    cursor: 'grab',
                    width: '90%'
                }}
            >
                Edge Node
            </div>

            <hr style={{margin: '1rem 0'}}/>

            {/* Persistence buttons */}
            <button onClick={onSaveTopology} className="blue-button">
                Save Topology
            </button>
            <button
                onClick={onLoadTopology}
                className="blue-button"
            >
                Load Saved Topology
            </button>
            <button
                onClick={onRemoveTopology}
                className="blue-button"
            >
                Clear Topology
            </button>

            <button onClick={onNotifyParents} className="blue-button">
                Notify Parents
            </button>

            <button onClick={onNotifyChildren} className="blue-button">
                Notify Children
            </button>
        </aside>
    );
};

export default LeftSidebar;
