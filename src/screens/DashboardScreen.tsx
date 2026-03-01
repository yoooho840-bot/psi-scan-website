import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, User, ScanFace, Headphones, Database, ChevronRight, Lock, Flame, Droplets } from 'lucide-react';

interface ScanLog {
    id: string;
    created_at: string;
    voice_freq: number;
    stress_level: number;
    ai_summary: string;
    client_name?: string;
}

const DashboardScreen: React.FC = () => {
    const navigate = useNavigate();
    const [recentLogs, setRecentLogs] = useState<ScanLog[]>([]);
    const [isB2BMode] = useState(() => localStorage.getItem('isB2BMode') === 'true');
    const [b2bSalonName] = useState(() => localStorage.getItem('b2bSalonName') || '비즈니스');
    const [showCooldownModal, setShowCooldownModal] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState('');

    useEffect(() => {
        // Load recent 2 logs to show as a preview
        const loadLogs = () => {
            const savedLogs = localStorage.getItem('mock_supabase_scan_logs');
            if (savedLogs) {
                try {
                    return JSON.parse(savedLogs).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2);
                } catch {
                    return [];
                }
            }
            return [];
        };
        setTimeout(() => setRecentLogs(loadLogs()), 0);
    }, []);

    const handleScanClick = () => {
        // Anti-Abuse Scan Limiter
        if (recentLogs.length > 0 && !isB2BMode) { // B2B(원장님)는 연속 스캔 허용
            const COOLDOWN_MS = 60 * 60 * 1000; // 1 시간 (60분)
            const lastLogTime = new Date(recentLogs[0].created_at).getTime();
            const now = Date.now();

            if (now - lastLogTime < COOLDOWN_MS) {
                const remaining = COOLDOWN_MS - (now - lastLogTime);
                const h = Math.floor(remaining / 3600000);
                const m = Math.floor((remaining % 3600000) / 60000);
                const s = Math.floor((remaining % 60000) / 1000);
                setCooldownRemaining(h > 0 ? `${h}시간 ${m} 분` : `${m}분 ${s} 초`);
                setShowCooldownModal(true);
                return;
            }
        }
        navigate('/scan');
    };

    return (
        <div style={{
            width: '100vw', minHeight: '100vh',
            backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-main)', paddingBottom: '40px', overflowX: 'hidden'
        }}>

            {/* Header / Top Navigation */}
            <div style={{
                padding: '20px 24px', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(20px)'
            }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1rem', margin: 0, fontFamily: 'var(--font-brand)', color: isB2BMode ? 'var(--color-success-green)' : 'var(--color-gold-main)' }}>
                        {isB2BMode ? `${b2bSalonName} CRM` : 'PSI ENERGY'}
                    </h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '1px' }}>
                        {isB2BMode ? 'Master License Active' : 'Personal Resonance Hub'}
                    </p>
                </div>
                {isB2BMode ? <User size={24} color="var(--color-success-green)" /> : <Activity size={24} color="var(--color-gold-main)" />}
            </div>

            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>

                {/* Hero Summary Card */}
                <div style={{
                    background: 'var(--color-bg-panel)',
                    borderRadius: 'var(--radius-lg)', padding: '30px 24px',
                    border: '1px solid var(--color-border-subtle)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    marginBottom: '40px', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: isB2BMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(218, 165, 32, 0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        {isB2BMode ? 'Today\'s Operation' : 'Current State'}
                    </h3>
                    <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 300, color: 'var(--color-text-primary)' }}>
                        {isB2BMode ? '시스템 정상 가동 중' : '최적의 내면 파동 동기화'}
                    </h1>
                    <p style={{ marginTop: '15px', color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {isB2BMode
                            ? 'B2B 보안 볼트가 활성화되었습니다. 모든 고객의 스캔 데이터는 AES-256 규격으로 암호화되어 안전하게 보관됩니다.'
                            : '생체 파동이 안정적입니다. 지금 호흡 동기화 세션에 입장하여 편안한 이완 상태를 경험하십시오.'}
                    </p>
                </div>

                {/* ==========================================
                   THE ENERGY JOURNEY (4-Step UX Loop)
                ========================================== */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', marginBottom: '40px' }}>

                    {/* Step 1: CONSULTATION (상담) */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-gold-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>1</div>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', letterSpacing: '2px', margin: 0 }}>파동 상담</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>나의 현재 에너지 상태를 분석하고 편안한 AI 멘탈 가이드와 대화하며 객관적으로 마주합니다.</p>

                        <div
                            onClick={() => navigate('/tarot-station')}
                            style={{
                                background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(20,20,30,0.8))',
                                border: '1px solid var(--color-gold-main)',
                                borderRadius: '24px', padding: '30px',
                                display: 'flex', alignItems: 'center', gap: '20px',
                                cursor: 'pointer', transition: 'all 0.3s ease',
                                boxShadow: '0 0 30px rgba(218,165,32,0.15)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                        >
                            <div style={{ background: 'var(--color-gold-main)', padding: '20px', borderRadius: '50%', color: '#FFF', boxShadow: '0 0 20px rgba(218,165,32,0.5)' }}>
                                <Database size={40} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>AI 멘탈 가이드 상담</h4>
                                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    내 생체 에너지를 분석하고, 편안한 AI 가이드와 음성으로 대화하며 마음의 안정을 찾습니다.
                                </p>
                            </div>
                        </div>
                    </section>


                    {/* Step 2: REPORT (결과지 보기) */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-blue-mystic)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>2</div>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', letterSpacing: '2px', margin: 0 }}>결과지 보기</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>나의 파동 상태가 수치화된 정밀 리포트를 확인하여, 객관적인 에너지 지표를 파악합니다.</p>

                        <div
                            onClick={() => navigate('/twelve-dimension-report')}
                            style={{
                                background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(20,20,30,0.8))',
                                border: '1px solid var(--color-blue-mystic)',
                                borderRadius: '24px', padding: '24px',
                                display: 'flex', alignItems: 'center', gap: '20px',
                                cursor: 'pointer', transition: 'all 0.3s ease',
                                boxShadow: '0 0 20px rgba(37,99,235,0.1)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(37,99,235,0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 20px rgba(37,99,235,0.1)'; }}
                        >
                            <div style={{ background: 'var(--color-blue-mystic)', padding: '15px', borderRadius: '15px', color: '#FFF' }}>
                                <Activity size={30} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>나의 분석 리포트</h4>
                                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    오라, 체질, 생체 밸런스 등 당신의 상태에 담긴 상세한 정보를 분석합니다.
                                </p>
                            </div>
                        </div>
                    </section>


                    {/* Step 3: PLAYGROUND (힐링 & 재미) */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#9D4EDD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>3</div>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', letterSpacing: '2px', margin: 0 }}>PLAYGROUND</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>지친 영혼을 보듬어 주고, 즐겁게 파동 에너지를 튜닝하는 공간입니다.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                            {/* Healing Collection */}
                            <TherapyCard
                                icon={<Headphones size={24} color="var(--color-blue-mystic)" />}
                                title="사운드 힐링 (싱잉볼)"
                                desc="신경 안정 휴식"
                                onClick={() => navigate('/elemental-therapy')}
                            />
                            <TherapyCard
                                icon={<Flame size={24} color="#ff6600" />}
                                title="명상 (불멍)"
                                desc="시각적 멍때리기"
                                onClick={() => navigate('/fire-meditation')}
                            />
                            <TherapyCard
                                icon={<Droplets size={24} color="#00d2ff" />}
                                title="명상 (수면)"
                                desc="깊은 숙면 유도"
                                onClick={() => navigate('/water-meditation')}
                            />
                            {/* Fun Collection */}
                            <div
                                onClick={() => navigate('/wave-diary')}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(20,20,30,0.8))',
                                    border: '1px solid #ec4899', borderRadius: '20px', padding: '20px',
                                    display: 'flex', flexDirection: 'column',
                                    cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(236,72,153,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <span style={{ fontSize: '24px', marginBottom: '10px' }}>🎨</span>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>마음 일기</h4>
                                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>퍼스널 컬러 기록</p>
                            </div>
                            <div
                                onClick={() => navigate('/dual-scan')}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(20,20,30,0.8))',
                                    border: '1px solid #ec4899', borderRadius: '20px', padding: '20px',
                                    display: 'flex', flexDirection: 'column',
                                    cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(236,72,153,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <span style={{ fontSize: '24px', marginBottom: '10px' }}>💞</span>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>파동 궁합 보기</h4>
                                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>에너지 시너지 체크</p>
                            </div>
                        </div>
                    </section>


                    {/* Step 4: RE-SCAN (파동 재스캔) */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-success-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>4</div>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', letterSpacing: '2px', margin: 0 }}>파동 재스캔</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>테라피와 휴식 이후, 얼마나 맑아진 에너지를 회복했는지 다시 확인해 볼까요?</p>

                        <div
                            onClick={handleScanClick}
                            style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20,20,30,0.8))',
                                border: '1px solid var(--color-success-green)',
                                borderRadius: '24px', padding: '24px',
                                display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.3s ease',
                                boxShadow: '0 0 20px rgba(16,185,129,0.1)',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(16,185,129,0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.1)'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <ScanFace size={30} color="var(--color-success-green)" />
                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>에너지 변화 재측정하기</h4>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Recent Logs Preview (Minimalist) */}
                {
                    recentLogs.length > 0 && (
                        <div style={{ animation: 'fadeInUp 1s ease 0.4s backwards' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 10px' }}>
                                <h3 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', letterSpacing: '2px', margin: 0 }}>RECENT LOGS</h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-main)', cursor: 'pointer' }} onClick={() => navigate('/history')}>View All</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {recentLogs.map((log) => {
                                    const d = new Date(log.created_at);
                                    return (
                                        <div key={log.id} style={{
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border-subtle)',
                                            padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                        }}>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                                    {isB2BMode ? `[고객] ${log.client_name} ` : 'Digital Sadhguru Log'}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {d.getMonth() + 1}/{d.getDate()} • 강성 {log.stress_level}% • {log.voice_freq}Hz
                                                </p>
                                            </div>
                                            <ChevronRight size={18} color="var(--color-text-muted)" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Anti-Abuse Cooldown Modal */}
            {
                showCooldownModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                        zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div style={{
                            background: 'var(--color-bg-panel)', border: '1px solid var(--color-border-subtle)',
                            padding: '40px', borderRadius: '25px', maxWidth: '400px', width: '90%',
                            textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            animation: 'fadeInUp 0.3s ease-out'
                        }}>
                            <Lock size={48} color="var(--color-gold-main)" style={{ margin: '0 auto 20px' }} />
                            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)', marginBottom: '15px' }}>에너지 필드 안정화 대기 중</h2>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                                연속적인 생체 파동 스캔은 데이터의 정확도를 떨어뜨리며 뇌신경계에 불필요한 공명 충돌을 일으킬 수 있습니다.<br /><br />
                                <span style={{ color: 'var(--color-gold-main)' }}>정밀한 측정을 위해 파동장 안정화까지<br /><b>{cooldownRemaining}</b> 남았습니다.</span>
                            </p>

                            <button onClick={() => setShowCooldownModal(false)} style={{
                                background: 'transparent', width: '100%',
                                color: '#888', padding: '16px', borderRadius: '15px', border: '1px solid #333',
                                fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s'
                            }} onMouseOver={e => e.currentTarget.style.borderColor = '#555'} onMouseOut={e => e.currentTarget.style.borderColor = '#333'}>
                                이해했습니다
                            </button>
                        </div>
                    </div>
                )
            }


            <style>{`
@keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
}
`}</style>
        </div >
    );
};

// Sub-component for smaller Tuning/Healing cards
const TherapyCard = ({ icon, title, desc, onClick }: any) => {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'var(--color-bg-panel)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '16px', padding: '20px',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-panel)'; e.currentTarget.style.borderColor = 'var(--color-border-subtle)' }}
        >
            <div style={{ background: 'var(--color-bg-deep)', padding: '12px', borderRadius: '12px', marginBottom: '15px' }}>
                {icon}
            </div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{title}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{desc}</p>
        </div>
    );
};

export default DashboardScreen;
