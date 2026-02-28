import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Activity, Cpu, Hexagon, Sparkles } from 'lucide-react';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const AccurateAnalysisScreen: React.FC = () => {
    const navigate = useNavigate();
    const [analysisPhase, setAnalysisPhase] = useState<0 | 1 | 2>(0);
    const [filteredData, setFilteredData] = useState<number>(0);
    const [logs, setLogs] = useState<string[]>([]);

    useAutoFullscreen();

    useEffect(() => {
        // Phase 0: Triage & Noise Filtering (Cross Validation)
        const logSequence = [
            "12,042 Raw Frequencies Extracted...",
            "Cross-Checking with HeartMath Normative DB...",
            "Physical Stress Noise Detected (8,102 Hz bands)",
            "Applying Triage Filter: Discarding Fatigue Data...",
            "FACS Neutral Baseline Deviation Found: 0.12ms Micro-tremor",
            "Targeting Subconscious Emotional Blocks...",
            "Validating Autonomic Nervous System Imbalance...",
            "ROOT CAUSE ISOLATED."
        ];

        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < logSequence.length) {
                setLogs(prev => [...prev, logSequence[logIndex]]);
                setFilteredData(prev => prev + Math.floor(Math.random() * 1500) + 500);
                logIndex++;
            }
        }, 600);

        setTimeout(() => {
            clearInterval(logInterval);
            setAnalysisPhase(1); // Shift to Kingpin formulation

            setTimeout(() => {
                setAnalysisPhase(2); // Reveal Kingpin & Prescription button
            }, 3000);
        }, logSequence.length * 600 + 500);

        return () => clearInterval(logInterval);
    }, []);

    return (
        <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', position: 'relative', background: 'var(--color-bg-deep)' }}>

            {/* Header */}
            <div style={{ position: 'absolute', top: '30px', width: '100%', textAlign: 'center', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '10px' }}>
                    뒤로가기
                </button>
                <h2 style={{ fontSize: '1rem', letterSpacing: '3px', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0, flex: 1, textAlign: 'center' }}>PHASE 2: ACCURATE ANALYSIS</h2>
                <div style={{ width: '60px' }}></div> {/* Spacer for centering */}
            </div>

            <div style={{ width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Visual Logic Core */}
                <div style={{
                    height: '240px',
                    background: 'var(--color-bg-panel)',
                    borderRadius: '20px',
                    border: analysisPhase === 2 ? '1px solid var(--color-border-gold)' : '1px solid var(--color-border-subtle)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: analysisPhase === 2 ? '0 0 50px rgba(218, 165, 32, 0.15)' : 'none',
                    transition: 'all 1s ease'
                }}>

                    {/* Background Grid */}
                    <div style={{ position: 'absolute', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(218,165,32,0.05) 0%, transparent 60%)', opacity: analysisPhase >= 1 ? 1 : 0.2, transition: 'opacity 1s' }}></div>

                    {analysisPhase === 0 && (
                        <>
                            <Filter size={48} color="#EF4444" style={{ marginBottom: '20px', animation: 'pulse 1s infinite' }} />
                            <h3 style={{ color: '#EF4444', fontSize: '1.2rem', letterSpacing: '1px' }}>노이즈 필터링 중</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>단순 신체 피로 데이터 {filteredData.toLocaleString()}건 삭제</p>
                        </>
                    )}

                    {analysisPhase === 1 && (
                        <>
                            <Cpu size={48} color="#2563EB" style={{ marginBottom: '20px', animation: 'spin 4s linear infinite' }} />
                            <h3 style={{ color: '#2563EB', fontSize: '1.2rem', letterSpacing: '1px' }}>단일 근본 원인 도출</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>도미노 트리거 역추적 구조화...</p>
                        </>
                    )}

                    {analysisPhase === 2 && (
                        <div style={{ textAlign: 'center', padding: '0 20px', zIndex: 2, animation: 'fadeIn 1s ease-out' }}>
                            <Hexagon size={40} color="var(--color-gold-main)" style={{ margin: '0 auto 15px auto', filter: 'drop-shadow(0 0 10px rgba(184, 139, 74, 0.4))' }} />
                            <p style={{ color: 'var(--color-gold-dark)', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '5px' }}>ROOT CAUSE IDENTIFIED</p>
                            <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '10px' }}>제 2차크라 파동 붕괴</h2>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, background: 'var(--color-bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }}>
                                "과거의 억압된 상처가 하복부 에너지를 정체시켜, 상위 뇌신경으로 가는 기(Prana)의 흐름을 막고 있습니다."
                            </p>
                        </div>
                    )}
                </div>

                {/* Log Terminal */}
                <div style={{
                    background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', padding: '15px',
                    height: '160px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    opacity: analysisPhase === 2 ? 0.4 : 1, transition: 'opacity 1s', boxShadow: 'var(--shadow-deep)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                        <Activity size={14} color="var(--color-text-muted)" />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '1px' }}>AI 교차 검증 로그</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {logs.slice(-4).map((log, i) => (
                            <div key={i} style={{ color: i === 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                &gt; {log}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Area (Phase 3 & 4 Transition) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    {analysisPhase === 2 && (
                        <>
                            <button
                                onClick={() => navigate('/12d-report')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, var(--color-gold-main), #B8860B)',
                                    color: '#000',
                                    padding: '18px 20px',
                                    border: 'none',
                                    borderRadius: '15px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(218, 165, 32, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    animation: 'fadeInUp 0.6s ease-out'
                                }}
                            >
                                <Hexagon size={20} />
                                심층 에너지 필드 정보 리포트 확인
                            </button>
                            <button
                                onClick={() => navigate('/chat')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, var(--color-blue-mystic), #3A72B8)',
                                    color: '#FFF',
                                    padding: '18px 20px',
                                    border: 'none',
                                    borderRadius: '15px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(74, 144, 226, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    animation: 'fadeInUp 0.6s ease-out 0.2s backwards'
                                }}
                            >
                                <Cpu size={20} />
                                AI 수석 분석가와 1:1 심층 상담 (해석)
                            </button>
                            <button
                                onClick={() => navigate('/tarot')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #2D1A4A, #4B2780)', // Deep mystic purple
                                    color: '#E0B0FF', // Lavender text
                                    padding: '18px 20px',
                                    border: '1px solid #9370DB',
                                    borderRadius: '15px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(138, 43, 226, 0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    animation: 'fadeInUp 0.6s ease-out 0.4s backwards'
                                }}
                            >
                                <Sparkles size={20} />
                                에너지 필드 매칭 타로카드
                            </button>
                            <button
                                onClick={() => navigate('/elemental-therapy')}
                                style={{
                                    background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.85rem',
                                    textDecoration: 'underline', cursor: 'pointer', animation: 'fadeIn 1s ease 1s backwards',
                                    marginTop: '10px'
                                }}
                            >
                                상담 생략하고 즉시 호흡 동기화 시작하기
                            </button>
                        </>
                    )}
                </div>

            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0.6; transform: scale(0.95); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AccurateAnalysisScreen;
