import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Activity, BrainCircuit } from 'lucide-react';
import { dimensionData } from '../data/dimensionData';

const DimensionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const data = id ? dimensionData[id] : null;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!data) {
        return (
            <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: 'white' }}>Dimension not found</h2>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--color-gold-main)', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="screen">
            {/* Navigation Bar */}
            <div className="top-nav" style={{ justifyContent: 'space-between', padding: '15px 20px', background: 'rgba(10, 5, 20, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(218, 165, 32, 0.2)', position: 'sticky', top: 0, zIndex: 100 }}>
                <button className="icon-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={24} color="var(--color-gold-light)" />
                </button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '1px' }} className="gold-text serif-font">ENERGY FIELD</h1>
                </div>
                <div style={{ width: 24 }}></div> {/* Spacer for alignment */}
            </div>

            {/* Hero Section */}
            <div style={{ padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Background Glow */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${data.color}40 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                    zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                        <div style={{ padding: '15px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${data.color}80`, boxShadow: `0 0 20px ${data.color}40` }}>
                            {data.id === 'aura' || data.id === 'chakra' ? <Sparkles size={40} color={data.color} /> :
                                data.id === 'ans' || data.id === 'allergy' ? <Activity size={40} color={data.color} /> :
                                    <BrainCircuit size={40} color={data.color} />}
                        </div>
                    </div>
                    <h2 className="serif-font" style={{ fontSize: '2rem', marginBottom: '10px', color: '#FFF' }}>{data.title}</h2>
                    <p style={{ color: data.color, fontSize: '1rem', letterSpacing: '1px', opacity: 0.9 }}>{data.subtitle}</p>
                </div>
            </div>

            {/* Content Sections */}
            <div style={{ padding: '0 20px 40px 20px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1, position: 'relative' }}>
                {data.sections.map((section, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '25px', borderTop: `2px solid ${data.color}50` }}>
                        <h3 style={{ color: 'var(--color-gold-light)', fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {section.type === 'definition' && <Sparkles size={18} />}
                            {section.type === 'spectrum' && <Activity size={18} />}
                            {section.type === 'action' && <BrainCircuit size={18} />}
                            {section.title}
                        </h3>

                        {section.content && (
                            <p style={{ color: '#E0E0E0', fontSize: '0.95rem', lineHeight: '1.7', letterSpacing: '0.3px', wordBreak: 'keep-all' }}>
                                {section.content}
                            </p>
                        )}

                        {section.items && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: section.content ? '20px' : '0' }}>
                                {section.items.map((item, i) => (
                                    <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', borderLeft: `4px solid ${item.color || data.color}` }}>
                                        <h4 style={{ color: item.color || '#FFF', fontSize: '1rem', marginBottom: '8px' }}>{item.label}</h4>
                                        <p style={{ color: '#BBB', fontSize: '0.85rem', lineHeight: '1.5' }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ padding: '0 20px 40px 20px' }}>
                <button
                    onClick={() => navigate('/scan')}
                    className="action-btn"
                    style={{ width: '100%', padding: '18px', background: `linear-gradient(135deg, ${data.color}DD, ${data.color}88)`, boxShadow: `0 4px 15px ${data.color}50` }}
                >
                    현재 나의 {data.title.split(' ')[0]} 스캔하기
                </button>
            </div>
        </div>
    );
};

export default DimensionDetail;
