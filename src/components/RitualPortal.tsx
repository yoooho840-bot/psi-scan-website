import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Music, Volume2, Sparkles } from 'lucide-react';

interface RitualPortalProps {
    currentPath: string;
}

const RitualPortal: React.FC<RitualPortalProps> = ({ currentPath }) => {
    const navigate = useNavigate();

    const rituals = [
        { path: '/elemental-therapy', label: '불멍/물멍', icon: <Flame size={16} /> },
        { path: '/sound-bath', label: '싱잉볼', icon: <Volume2 size={16} /> },
        { path: '/frequency-lab', label: '파동', icon: <Music size={16} /> },
        { path: '/color-therapy', label: '컬러', icon: <Sparkles size={16} /> },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            background: 'rgba(10, 10, 12, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '8px 15px',
            borderRadius: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10000,
            animation: 'slide-up 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
        }}>
            {rituals.map((r) => {
                const isActive = currentPath === r.path;
                return (
                    <button
                        key={r.path}
                        onClick={() => navigate(r.path)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isActive ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
                            border: 'none',
                            color: isActive ? '#DAA520' : '#888',
                            padding: '6px 12px',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        {r.icon}
                        <span style={{ display: 'none' }}>{r.label}</span>
                        {isActive && <span>{r.label}</span>}
                    </button>
                );
            })}
            <style>{`
                @keyframes slide-up {
                    from { transform: translate(-50%, 50px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default RitualPortal;
