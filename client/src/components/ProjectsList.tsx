import React from 'react';
import type { Project } from '../services/api';

type Props = {
    projects: Project[];
    selectedId?: string | null;
    onSelect: (p: Project) => void;
};

export const ProjectsList: React.FC<Props> = ({ projects, selectedId, onSelect }) => {
    return (
        <div style={{ width: 320, borderRight: '1px solid #eee', height: '100vh', overflow: 'auto' }}>
            <div style={{ padding: 16, fontWeight: 700 }}>Projects</div>
            {projects.map(p => (
                <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        border: 'none',
                        background: p.id === selectedId ? '#FFF3E8' : 'transparent',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        with {p.clientName} • {p.progressPercentage ?? 0}%
                    </div>
                </button>
            ))}
            {projects.length === 0 && (
                <div style={{ padding: 16, color: '#999' }}>No projects yet</div>
            )}
        </div>
    );
};
