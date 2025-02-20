// src/components/simulation/side_bars/RightSidebar.tsx
import React from 'react';

interface RightSidebarProps {
    content: React.ReactNode | null;
    onClose: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ content, onClose }) => {
    return (
        <aside
            style={{
                padding: '1rem',
                borderLeft: '1px solid #ccc',
                width: '300px',
                background: '#fff',
                overflowY: 'auto',
                height: '100%',  // Ensure it matches the flowchart height
            }}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                }}
            >
                ×
            </button>
            {content}
        </aside>
    );
};

export default RightSidebar;
