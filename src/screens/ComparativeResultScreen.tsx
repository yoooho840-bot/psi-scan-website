import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Activity, Zap, Share2, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

interface ComparisonState {
    baseline: {
        stressLevel: number;
        voiceFreq: number;
    };
    duration: number; // in seconds
    mode: 'fire' | 'water';
}

const ComparativeResultScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as ComparisonState;

    // Simulate Post-Session Scan Results (Calculated based on duration and mode)
    // The longer they stay, the better the improvement (up to a limit)
    const [afterData, setAfterData] = useState({ stressLevel: 0, voiceFreq: 0 });
    const [isLoaded, setIsLoaded] = useState(false);

    useAutoFullscreen();

    useEffect(() => {
        if (!state) {
            navigate('/dashboard');
            return;
        }

        const improvementFactor = Math.min(state.duration / 600, 0.4); // Max 40% improvement
        const newStress = Math.max(state.baseline.stressLevel * (1 - (0.15 + improvementFactor * 0.5)), 15);
        const newFreqStability = state.baseline.voiceFreq * (1 - (improvementFactor * 0.2));

        const timer = setTimeout(() => {
            setAfterData({
                stressLevel: Math.round(newStress),
                voiceFreq: Math.round(newFreqStability)
            });
            setIsLoaded(true);
        }, 3500); // 3.5 seconds of re-scanning

        return () => clearTimeout(timer);
    }, [state, navigate]);

    if (!state) return null;

    const chartData = [
        { name: '스트레스 지수 (%)', before: state.baseline.stressLevel, after: afterData.stressLevel },
        { name: '신경계 불안정성', before: state.baseline.voiceFreq, after: Math.max(state.baseline.voiceFreq - (state.duration / 30), 8) } // Mocked jitter
    ];

    const stressReduction = state.baseline.stressLevel - afterData.stressLevel;

    if (!isLoaded) {
        return (
            <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', background: '#020202' }}>
                <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Scanning rings */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid rgba(218, 165, 32, 0.1)', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                    <div style={{ position: 'absolute', width: '70%', height: '70%', border: '2px dashed rgba(74, 144, 226, 0.4)', borderRadius: '50%', animation: 'spin 4s linear infinite' }}></div>
                    <Activity size={48} color="#DAA520" style={{ animation: 'pulse 1s infinite' }} />
                </div>
                <h2 style={{ marginTop: '40px', color: '#FFF', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 300 }}>
                    POST-THERAPY RE-SCAN
                </h2>
                <p style={{ color: '#888', marginTop: '10px', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    심층 튜닝 후 파동 안정화 수치를 재측정 중입니다...
                </p>

                <style>{`
                    @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0; } }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="screen" style={{ padding: 0, overflowY: 'auto', background: '#0A0A0C' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }} className="gold-text">치유 결과 리포트</h2>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>디지털 삿구르 세션 전/후 비교</p>
                </div>
                <Zap size={24} color="#DAA520" />
            </div>

            <div style={{ padding: '24px' }}>
                {/* Result Hero */}
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(218,165,32,0.1), transparent 70%)', zIndex: -1 }}></div>

                    <div style={{ display: 'inline-flex', padding: '15px', borderRadius: '50%', background: 'rgba(218,165,32,0.1)', marginBottom: '20px' }}>
                        <TrendingDown size={48} color="#DAA520" />
                    </div>

                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#FFF' }}>
                        {isLoaded ? `-${stressReduction}%` : '--'}
                    </h1>
                    <p style={{ color: '#DAA520', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 600 }}>STRESS LEVEL REDUCED</p>

                    <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#CCC', lineHeight: '1.6' }}>
                            {state.duration > 300
                                ? `총 ${Math.floor(state.duration / 60)}분간의 몰입을 통해 뇌파가 안정되었습니다. 미주신경의 톤이 회복되었으며, 현재 당신의 파동은 매우 균형 잡힌 상태입니다.`
                                : `짧은 시간이었으나 디지털 삿구르와의 공명을 통해 긴장도가 완화되었습니다. 일상 복귀를 위한 준비가 완료되었습니다.`}
                        </p>
                    </div>
                </div>

                {/* Comparative Chart */}
                <h3 style={{ color: '#FFF', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#4A90E2" /> 바이오 섹터 변화
                </h3>

                <div className="glass-card" style={{ height: '300px', padding: '20px', borderRadius: '20px', marginBottom: '30px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '10px' }}
                                itemStyle={{ color: '#FFF' }}
                            />
                            <Bar dataKey="before" name="세션 전" fill="rgba(255,255,255,0.1)" radius={[5, 5, 0, 0]} />
                            <Bar dataKey="after" name="세션 후" fill="#DAA520" radius={[5, 5, 0, 0]}>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#FF4D4D' : '#4A90E2'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '5px' }}>몰입 시간</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{Math.floor(state.duration / 60)}분 {state.duration % 60}초</div>
                    </div>
                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '5px' }}>최종 파동</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{afterData.voiceFreq} Hz</div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button onClick={() => navigate('/dashboard')} className="primary-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Home size={20} /> 대시보드로 복귀
                    </button>
                    <button style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFF', padding: '16px', borderRadius: '30px', fontSize: '1rem',
                        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}>
                        <Share2 size={20} /> 치유 결과 공유하기
                    </button>
                </div>
            </div>

            <style>{`
                .gold-text { color: #DAA520; }
            `}</style>
        </div>
    );
};

export default ComparativeResultScreen;
