import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AuraProfileScreen = () => {
    const navigate = useNavigate();
    const [auraData, setAuraData] = useState({
        head: { color: 'rgba(147, 112, 219, 0.8)', name: '보라 (영성/지혜)', desc: '현재 의식적 생각 및 상위 자아와의 강력한 연결 상태입니다.' },
        left: { color: 'rgba(59, 130, 246, 0.7)', name: '파랑 (수용/직관)', desc: '내면으로 평온함과 직관의 에너지를 깊이 받아들이고 있습니다.' },
        right: { color: 'rgba(239, 68, 68, 0.6)', name: '빨강 (열정/투사)', desc: '미래를 향해 생명력과 열정을 강하게 방출하고 있습니다.' },
        root: { color: 'rgba(234, 179, 8, 0.7)', name: '황금빛 밝음', desc: '에너지가 전반적으로 정화되고 균형 잡힌 긍정적 흐름입니다.' }
    });

    useEffect(() => {
        // Randomize loosely based on past data (Simulation of real data mapped to colors)
        const bioSeedsRaw = localStorage.getItem('psi_bio_seeds');
        const bioSeeds = bioSeedsRaw ? JSON.parse(bioSeedsRaw) : { energyLevel: 0.5, heartRateVariance: 0.5, vocalTension: 0.5 };

        // Logic based on bio seeds to map to colors
        const colors = [
            { color: 'rgba(239, 68, 68, 0.8)', name: '빨강 (생명력/열정)', desc: '지상과의 강한 연결과 물리적 에너지가 넘치는 상태입니다.' },
            { color: 'rgba(249, 115, 22, 0.8)', name: '주황 (창조력/감정)', desc: '감정의 순환이 활발하며 창의적인 영감이 가득합니다.' },
            { color: 'rgba(234, 179, 8, 0.8)', name: '노랑 (자신감/지성)', desc: '자아 존중감이 높고 지적 에너지가 뚜렷한 상태입니다.' },
            { color: 'rgba(34, 197, 94, 0.8)', name: '초록 (치유/균형)', desc: '심장의 차크라가 열려 중심이 잡히고 치유가 일어나고 있습니다.' },
            { color: 'rgba(59, 130, 246, 0.8)', name: '파랑 (소통/직관)', desc: '타인과의 소통과 직관적 깨달음이 맑게 흐르고 있습니다.' },
            { color: 'rgba(147, 112, 219, 0.8)', name: '보라 (영성/초월)', desc: '높은 수준의 영적 지혜와 상위 의식에 닿아 있습니다.' },
            { color: 'rgba(255, 255, 255, 0.8)', name: '순백 (정화/신성)', desc: '모든 에너지가 극도로 정화된 완전한 영적 순수 형태입니다.' }
        ];

        // Pseudo-random selection based on stress/energy variations
        const hIdx = Math.floor((bioSeeds.energyLevel * 10) % colors.length);
        const lIdx = Math.floor((bioSeeds.heartRateVariance * 10) % colors.length);
        const rIdx = Math.floor((bioSeeds.vocalTension * 10) % colors.length);

        setAuraData({
            head: colors[hIdx] || colors[5],
            left: colors[lIdx] || colors[4],
            right: colors[rIdx] || colors[0],
            root: bioSeeds.energyLevel > 0.6 ? { color: 'rgba(34, 197, 94, 0.6)', name: '에너지 조화로움', desc: '전체적인 차크라 밸런스가 매우 안정적입니다.' } : { color: 'rgba(100, 116, 139, 0.8)', name: '탁색 (에너지 정체)', desc: '피로감과 방어 기제로 인해 에너지가 정체되어 정화가 필요합니다.' }
        });
    }, []);

    return (
        <div style={{
            width: '100vw', minHeight: '100vh',
            backgroundColor: '#05050A', color: 'var(--color-text-primary)',
            fontFamily: '"Noto Sans KR", sans-serif', overflowX: 'hidden'
        }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 50 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-gold-main)', letterSpacing: '4px', fontWeight: 'bold' }}>AURA VISUALIZER</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '2px' }}>생체 에너지 시각화 투영도</p>
                </div>
                <div style={{ width: '44px' }}></div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Visual Aura Frame */}
                <div style={{
                    position: 'relative', width: '300px', height: '400px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    marginTop: '20px', marginBottom: '40px'
                }}>
                    {/* The physical body silhouette */}
                    <div style={{
                        position: 'absolute', bottom: '-20px', width: '120px', height: '180px',
                        background: 'linear-gradient(to top, rgba(20,20,30,1), rgba(40,40,50,0.8))',
                        borderRadius: '60px 60px 20px 20px', zIndex: 10,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}></div>
                    <div style={{
                        position: 'absolute', top: '120px', width: '80px', height: '100px',
                        background: 'rgba(30,30,40,1)', borderRadius: '50%', zIndex: 11,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}></div>

                    {/* Aura Layers using Framer Motion for organic breathing */}

                    {/* Head Aura (Top) */}
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', top: '20px', width: '220px', height: '220px',
                            background: `radial-gradient(circle, ${auraData.head.color} 0%, rgba(0,0,0,0) 70%)`,
                            borderRadius: '50%', zIndex: 5, filter: 'blur(20px)'
                        }}
                    />

                    {/* Left Aura (Receiving/Past) */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], x: [-10, -20, -10], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        style={{
                            position: 'absolute', left: '-40px', top: '150px', width: '160px', height: '240px',
                            background: `radial-gradient(ellipse, ${auraData.left.color} 0%, rgba(0,0,0,0) 70%)`,
                            borderRadius: '50%', zIndex: 4, filter: 'blur(25px)'
                        }}
                    />

                    {/* Right Aura (Projecting/Future) */}
                    <motion.div
                        animate={{ scale: [1, 1.25, 1], x: [10, 20, 10], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        style={{
                            position: 'absolute', right: '-40px', top: '150px', width: '160px', height: '240px',
                            background: `radial-gradient(ellipse, ${auraData.right.color} 0%, rgba(0,0,0,0) 70%)`,
                            borderRadius: '50%', zIndex: 4, filter: 'blur(25px)'
                        }}
                    />

                    {/* Overarching energy field */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', inset: '-50px',
                            border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1
                        }}
                    />
                </div>

                {/* Legend & Interpretation Panel */}
                <div style={{ width: '100%', background: 'rgba(20,20,30,0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={20} color="var(--color-gold-main)" /> 영적 차원에서의 다차원 투영 해석
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        {/* 머리 위 */}
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', borderLeft: `4px solid ${auraData.head.color.replace(/[\d.]+\)$/g, '1)')}` }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>머리 위 (현재의식 / 영적 목표)</div>
                            <div style={{ fontSize: '1.1rem', color: '#FFF', fontWeight: 'bold', marginBottom: '8px' }}>{auraData.head.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{auraData.head.desc}</div>
                        </div>

                        {/* 왼쪽 */}
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', borderLeft: `4px solid ${auraData.left.color.replace(/[\d.]+\)$/g, '1)')}` }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>좌측 (내면 수용 / 과거의 궤적)</div>
                            <div style={{ fontSize: '1.1rem', color: '#FFF', fontWeight: 'bold', marginBottom: '8px' }}>{auraData.left.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{auraData.left.desc}</div>
                        </div>

                        {/* 오른쪽 */}
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', borderLeft: `4px solid ${auraData.right.color.replace(/[\d.]+\)$/g, '1)')}` }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>우측 (외부 투사 / 미래의 방향)</div>
                            <div style={{ fontSize: '1.1rem', color: '#FFF', fontWeight: 'bold', marginBottom: '8px' }}>{auraData.right.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{auraData.right.desc}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(218, 165, 32, 0.05)', borderRadius: '16px', border: '1px dashed rgba(218, 165, 32, 0.3)' }}>
                        <h4 style={{ color: 'var(--color-gold-main)', margin: '0 0 10px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} /> 영적 성장을 위한 오라 클렌징 조언</h4>
                        <p style={{ color: '#E2E8F0', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                            {auraData.root.desc} 오라(Aura)는 고정된 운명이 아닙니다. 현재의 탁한 에너지를 인지하고 파동를 조율하는 것만으로도 언제든 무지갯빛 영성으로 완벽히 정화할 수 있습니다.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/chat')}
                        style={{
                            width: '100%', marginTop: '30px', padding: '18px', borderRadius: '15px',
                            background: 'linear-gradient(135deg, var(--color-gold-main), #B8860B)', color: '#000',
                            border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            boxShadow: '0 5px 20px rgba(218, 165, 32, 0.3)'
                        }}
                    >
                        <RefreshCw size={20} /> 나의 오라 이미지를 기반으로 심층 채팅 시작
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AuraProfileScreen;
