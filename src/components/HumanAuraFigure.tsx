import React, { useEffect, useState } from 'react';
import './HumanAuraFigure.css';

interface HumanAuraFigureProps {
    primaryColor: string;
    secondaryColor?: string;
    energyLevel: 'low' | 'medium' | 'high';
    isScanning?: boolean;
}

const HumanAuraFigure: React.FC<HumanAuraFigureProps> = ({
    primaryColor,
    secondaryColor = '#ffffff',
    energyLevel,
    isScanning = false
}) => {
    const [activePulse, setActivePulse] = useState(false);

    useEffect(() => {
        // Randomly trigger an intense pulse effect every few seconds
        const pulseInterval = setInterval(() => {
            setActivePulse(true);
            setTimeout(() => setActivePulse(false), 1500);
        }, 5000);
        return () => clearInterval(pulseInterval);
    }, []);

    const intensityClass = `intensity-${energyLevel}`;
    const scanningClass = isScanning ? 'scanning-active' : '';
    const pulseClass = activePulse ? 'aura-pulse' : '';

    return (
        <div className="human-aura-container">
            {/* Background Grid / Ambient light */}
            <div className="aura-ambient" style={{
                background: `radial-gradient(circle at center, ${primaryColor}20 0%, transparent 60%)`
            }}></div>

            {/* The primary glowing fields */}
            <div className={`aura-field primary-field ${intensityClass} ${pulseClass}`}
                style={{
                    background: `radial-gradient(ellipse at 50% 40%, ${primaryColor} 0%, transparent 70%)`
                }}>
            </div>

            <div className={`aura-field secondary-field ${intensityClass}`}
                style={{
                    background: `radial-gradient(ellipse at 50% 60%, ${secondaryColor} 0%, transparent 70%)`
                }}>
            </div>

            {/* Scanning Laser Line (if active) */}
            <div className={`scan-laser ${scanningClass}`}></div>

            {/* Chakra Points Overlay */}
            <div className="chakras-container">
                <div className="chakra crown" style={{ boxShadow: '0 0 20px #8A2BE2' }}></div>
                <div className="chakra third-eye" style={{ boxShadow: '0 0 15px #4B0082' }}></div>
                <div className="chakra throat" style={{ boxShadow: '0 0 15px #00BFFF' }}></div>
                <div className="chakra heart" style={{ boxShadow: '0 0 20px #00FA9A' }}></div>
                <div className="chakra solar-plexus" style={{ boxShadow: '0 0 25px #FFD700' }}></div>
                <div className="chakra sacral" style={{ boxShadow: '0 0 15px #FF8C00' }}></div>
                <div className="chakra root" style={{ boxShadow: '0 0 20px #FF0000' }}></div>
            </div>

            {/* Sacred Geometry Overlay */}
            <div className="sacred-geometry"></div>

            {/* The SVG Human Silhouette Mask */}
            <div className="silhouette-mask">
                <svg viewBox="0 0 200 500" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Minimalist abstract human shape */}
                    <path
                        d="M100 20 C85 20, 75 35, 75 55 C75 75, 85 90, 100 90 C115 90, 125 75, 125 55 C125 35, 115 20, 100 20 Z 
                           M100 100 C60 100, 40 120, 30 150 C20 180, 25 250, 25 250 C25 250, 40 240, 50 200 C60 160, 70 140, 80 140 C80 140, 80 250, 80 300 C80 350, 75 450, 75 480 C75 490, 85 490, 85 480 C85 450, 95 350, 100 300 C105 350, 115 450, 115 480 C115 490, 125 490, 125 480 C125 450, 120 350, 120 300 C120 250, 120 140, 120 140 C130 140, 140 160, 150 200 C160 240, 175 250, 175 250 C175 250, 180 180, 170 150 C160 120, 140 100, 100 100 Z"
                        fill="rgba(10, 14, 23, 0.95)"
                        stroke={primaryColor}
                        strokeWidth="1.5"
                        filter="url(#glow)"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            {/* Front glass overlay to lock it in the UI */}
            <div className="aura-glass-shield"></div>
        </div>
    );
};

export default HumanAuraFigure;
