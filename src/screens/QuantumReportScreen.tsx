import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, AlertTriangle, Activity, BrainCircuit, ArrowLeft, FileText, Lock, Home, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const QuantumReportScreen: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isVip, setIsVip] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [seeds, setSeeds] = useState({ heartRateVariance: 0.5, vocalTension: 0.5, energyLevel: 0.5 });

    useAutoFullscreen();

    useEffect(() => {
        // SEC-010 준수: JWT 기반 권한 확인
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsVip(!!session);
            setAuthChecking(false);
        };

        checkAuth();

        const seedsStr = localStorage.getItem('psi_bio_seeds');
        if (seedsStr) {
            try { setSeeds(JSON.parse(seedsStr)); } catch (e) { }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            setIsVip(!!session);
        });

        const timer = setTimeout(() => setLoading(false), 2500);

        return () => {
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 30 }}>
                    <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(184, 134, 11, 0.2)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: 'var(--color-gold-main)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)', letterSpacing: '2px', textAlign: 'center' }}>심층 에너지 필드 정보<br />전체 데이터 동기화 중...</h2>
                <p style={{ color: 'var(--color-text-muted)', marginTop: 15, fontSize: '0.9rem' }}>생체 파동과 내면의 무의식 장(Field)을 연결합니다.</p>
            </div>
        );
    }

    return (
        <div className="screen" style={{ overflowY: 'auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0 0 10px', gap: '10px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}>
                    <ArrowLeft size={20} />
                    <span style={{ fontSize: '1rem' }}>돌아가기</span>
                </button>
                <button onClick={() => window.location.href = window.location.origin.replace('5174', '5173') + '/'} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}>
                    <Home size={20} />
                    <span style={{ fontSize: '1rem' }}>처음으로</span>
                </button>
            </div>
            <div style={{ textAlign: 'center', margin: '10px 0 30px' }}>
                <div style={{ display: 'inline-block', background: 'rgba(255, 69, 58, 0.15)', padding: '6px 16px', borderRadius: '20px', color: '#ff453a', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '15px' }}>
                    <AlertTriangle size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                    위험 감지 (CRITICAL WARNING)
                </div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>종합 에너지 필드 리딩 리포트</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    안면 생체 신호와 9대 데이터베이스 교차 검증 결과,<br />
                    심각한 에너지 불균형이 발견되었습니다.
                </p>
            </div>

            <div className="glass-card" style={{ marginBottom: '25px', borderColor: 'rgba(255, 69, 58, 0.3)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} color="#ff453a" /> 신체 장부 스트레스 게이지
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <ProgressGauge title="하복부 에너지 순환 압력" current={Math.floor(seeds.energyLevel * 50) + 70} max={120} color="#ff453a" />
                    <ProgressGauge title="체내 환경 독소 (탁기) 누적도" current={Math.floor(seeds.vocalTension * 60) + 90} max={150} color="#ff9f0a" />
                    <ProgressGauge title="부교감 이완 활성도" current={Math.floor((1 - seeds.heartRateVariance) * 80) + 10} max={100} color="#0a84ff" isLowWarning={true} />
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--color-gold-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BrainCircuit size={20} /> 심층 에너지 필드 리딩 결과
                </h3>

                <div style={{ filter: 'blur(4px)', opacity: 0.6, userSelect: 'none', pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                        <span>1. rPPG 비전 AI (안면 심박 변이도)</span><span style={{ color: '#ff453a' }}>경고</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                        <span>2. 오라장 분석 (Aura Field 맵핑)</span><span style={{ color: '#0a84ff' }}>불균형</span>
                    </div>
                </div>

                {/* Lock Overlay or Direct Access */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)' }}>
                    <button
                        onClick={() => {
                            if (authChecking) return;
                            if (isVip) {
                                navigate('/doc-report');
                            } else {
                                navigate('/paywall', { state: { next: '/doc-report' } });
                            }
                        }}
                        className="secondary-btn"
                        style={{ padding: '12px 20px', background: 'rgba(218,165,32,0.15)', border: '1px solid #DAA520', borderRadius: '30px', color: '#DAA520', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(218,165,32,0.2)' }}
                    >
                        {isVip ? <FileText size={16} /> : <Lock size={16} />}
                        상세 문서 리포트 읽기 (PDF 형식)
                    </button>
                </div>
            </div>

            <button onClick={() => {
                if (authChecking) return;
                if (isVip) {
                    navigate('/12d-report');
                } else {
                    navigate('/paywall', { state: { next: '/12d-report' } });
                }
            }} style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#DDD', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '15px' }}>
                <Sparkles size={18} />
                <span style={{ fontSize: '0.95rem' }}>심층 에너지 필드 정보 열람하기</span>
            </button>

            <button onClick={() => navigate('/paywall', { state: { next: '/chat' } })} className="primary-btn" style={{ background: 'linear-gradient(135deg, #4b0082, #191970)', color: '#FFF', borderColor: '#8A2BE2', boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '16px', height: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <Bot size={22} />
                    Psi에게 원인과 해결책 묻기
                </div>
                <span style={{ fontSize: '0.8rem', color: '#EBEBEB', fontWeight: 400 }}>수석 테라피스트 페르소나와 심층 상담 시작</span>
            </button>
        </div >
    );
};

const ProgressGauge = ({ title, current, max, color, isLowWarning = false }: { title: string, current: number, max: number, color: string, isLowWarning?: boolean }) => {
    const percent = Math.min((current / max) * 100, 100);
    const showWarning = isLowWarning ? percent < 40 : percent > 80;

    return (
        <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {showWarning && <AlertTriangle size={14} color={color} />}
                    {title}
                </span>
                <span style={{ fontSize: '1.05rem', color: color, fontWeight: 800, textShadow: showWarning ? `0 0 10px ${color}33` : 'none' }}>
                    {current} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ {max}</span>
                </span>
            </div>
            {/* High-End Tech Bar */}
            <div style={{ position: 'relative', width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Background Grid Pattern */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.1) 50%)', backgroundSize: '10px 100%' }}></div>

                {/* Fill */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%', width: `${percent}%`,
                    background: `linear-gradient(90deg, ${color}40, ${color})`,
                    boxShadow: showWarning ? `0 0 15px ${color}` : 'none',
                    transition: 'width 1.5s cubic-bezier(0.1, 0.8, 0.2, 1)'
                }}>
                    {/* Glowing Leading Edge */}
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', background: '#FFF', boxShadow: `0 0 10px 2px ${color}` }}></div>
                </div>
            </div>
        </div>
    );
};

export default QuantumReportScreen;
