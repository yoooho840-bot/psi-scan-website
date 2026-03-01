import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Lock, Search, Smartphone, MessageCircle, Mail } from 'lucide-react';

interface ScanLog {
    id: string;
    created_at: string;
    voice_freq: number;
    stress_level: number;
    ai_summary: string;
    client_name?: string;
}

const HistoryScreen: React.FC = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<ScanLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isB2BMode] = useState(() => localStorage.getItem('isB2BMode') === 'true');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        const savedLogs = localStorage.getItem('mock_supabase_scan_logs');
        if (savedLogs) {
            try {
                const parsed = JSON.parse(savedLogs);
                // Sort descending (newest first)
                parsed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setLogs(parsed);
            } catch (e) {
                console.error("Failed to parse logs");
            }
        }
    }, []);

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (log.client_name && log.client_name.toLowerCase().includes(term)) ||
            (log.ai_summary && log.ai_summary.toLowerCase().includes(term)) ||
            (new Date(log.created_at).toLocaleDateString().includes(term))
        );
    });

    const handleMockLogin = () => {
        setIsLoggingIn(true);
        setTimeout(() => {
            setIsLoggedIn(true);
            setIsLoggingIn(false);
        }, 1500);
    };

    if (!isLoggedIn) {
        return (
            <div style={{
                width: '100vw', minHeight: '100vh',
                backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-main)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
                <button onClick={() => navigate('/')} style={{ position: 'absolute', top: '30px', left: '30px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '10px' }}>
                    <ArrowLeft size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fade-in 1s' }}>
                    <Lock size={48} color="var(--color-gold-main)" style={{ marginBottom: '20px', opacity: 0.8 }} />
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', margin: '0 0 10px 0', letterSpacing: '4px', color: 'var(--color-text-primary)' }}>
                        개인 기록 보관소 연동
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        안전한 데이터 동기화를 위해<br />소셜 계정을 선택하여 본인 인증을 진행해 주십시오.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', animation: 'fade-up 1s' }}>
                    {isLoggingIn ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(218,165,32,0.3)', borderTop: '3px solid var(--color-gold-main)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }}></div>
                            <p style={{ color: 'var(--color-gold-main)', fontSize: '0.8rem', letterSpacing: '2px' }}>생체 암호화 키 동기화 중...</p>
                        </div>
                    ) : (
                        <>
                            <button onClick={handleMockLogin} style={{
                                background: '#FEE500', color: '#000000', border: 'none', padding: '15px', borderRadius: '12px',
                                fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: 'pointer', boxShadow: '0 4px 15px rgba(254,229,0,0.2)', transition: 'transform 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <MessageCircle size={20} /> 카카오 로그인
                            </button>
                            <button onClick={handleMockLogin} style={{
                                background: '#03C75A', color: '#FFFFFF', border: 'none', padding: '15px', borderRadius: '12px',
                                fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: 'pointer', boxShadow: '0 4px 15px rgba(3,199,90,0.2)', transition: 'transform 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '-2px' }}>N</span> 네이버 로그인
                            </button>
                            <button onClick={handleMockLogin} style={{
                                background: '#FFFFFF', color: '#000000', border: 'none', padding: '15px', borderRadius: '12px',
                                fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,255,255,0.1)', transition: 'transform 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <Mail size={20} /> Google 로그인
                            </button>
                        </>
                    )}
                </div>

                {/* Simulated QR Code for App Login */}
                {!isLoggingIn && (
                    <div style={{ marginTop: '50px', textAlign: 'center', animation: 'fade-up 1.5s' }}>
                        <div style={{ background: '#FFF', padding: '10px', borderRadius: '10px', display: 'inline-block', marginBottom: '15px' }}>
                            <div style={{ width: '120px', height: '120px', backgroundImage: 'url("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=psi-scan-auth-demo")', backgroundSize: 'contain' }}></div>
                        </div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <Smartphone size={14} /> 스마트폰 카메라로 QR 스캔 시 자동 연동
                        </p>
                    </div>
                )}

                <style>{`
                    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            width: '100vw', minHeight: '100vh',
            backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-main)', paddingBottom: '40px', overflowX: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(20px)'
            }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-brand)', color: 'var(--color-gold-main)' }}>
                        SECURE DATA VAULT
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '1px' }}>
                        Encrypted Biometric Records
                    </p>
                </div>
                <Database size={24} color="var(--color-gold-main)" />
            </div>

            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', animation: 'fade-in 0.5s' }}>

                {/* Security Banner */}
                <div style={{
                    background: 'rgba(218, 165, 32, 0.05)', border: '1px solid rgba(218, 165, 32, 0.2)',
                    borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px',
                    marginBottom: '30px'
                }}>
                    <Lock size={20} color="var(--color-gold-main)" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        소셜 계정과 동기화되었습니다. 이 볼트에 보관된 모든 파동 데이터와 분석 기록은 고성능 암호화(AES-256 규격) 처리되어 본인만 열람할 수 있습니다.
                    </p>
                </div>

                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <div style={{
                        flex: 1, background: 'var(--color-bg-panel)', border: '1px solid var(--color-border-subtle)',
                        borderRadius: '30px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <Search size={18} color="var(--color-text-muted)" />
                        <input
                            type="text"
                            placeholder={isB2BMode ? "고객명 또는 분석 키워드 검색..." : "세션 날짜 또는 키워드 검색..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                {/* Logs List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {filteredLogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                            <p>기록된 스캔 데이터가 없습니다.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const d = new Date(log.created_at);
                            const formattedDate = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                            const formattedTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

                            return (
                                <div key={log.id} style={{
                                    background: 'var(--color-bg-panel)', border: '1px solid var(--color-border-subtle)',
                                    borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer'
                                }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-gold-muted)'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}>

                                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', color: 'var(--color-text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {isB2BMode && log.client_name ? `[고객] ${log.client_name}` : '심층 에너지 스캔 세션'}
                                            </h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formattedDate} • {formattedTime}</span>
                                        </div>
                                        <div style={{ background: 'rgba(218,165,32,0.1)', color: 'var(--color-gold-main)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                                            ENCRYPTED
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'flex', gap: '30px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>신경계 스트레스</div>
                                                <div style={{ fontSize: '1.2rem', color: log.stress_level > 60 ? '#ff4e00' : '#4ADE80', fontWeight: '300' }}>
                                                    {log.stress_level}%
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>기준 파동</div>
                                                <div style={{ fontSize: '1.2rem', color: 'var(--color-blue-mystic)', fontWeight: '300' }}>
                                                    {log.voice_freq}Hz
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                            "{log.ai_summary}"
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryScreen;
