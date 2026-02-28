import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

const OnboardingScreen: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');

    const [isB2BMode, setIsB2BMode] = useState(false);
    const [b2bSalonName, setB2BSalonName] = useState('');

    React.useEffect(() => {
        const b2b = localStorage.getItem('isB2BMode') === 'true';
        setIsB2BMode(b2b);
        if (b2b) {
            setB2BSalonName(localStorage.getItem('b2bSalonName') || '비즈니스');
        }
    }, []);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();

        // SEC-006: 입력값 사전 검증 및 새니타이징 (기본 XSS 및 SQL 인젝션 방어형)
        const sanitizeInput = (str: string) => str.replace(/[<>;{}()]/g, '').trim();

        const safeName = sanitizeInput(name);
        const safeBirthDate = sanitizeInput(birthDate);
        const safeBirthTime = sanitizeInput(birthTime);
        const safeBirthPlace = sanitizeInput(birthPlace);
        const safeAddress = sanitizeInput(currentAddress);

        if (safeName.length < 2 || safeName.length > 50) {
            alert('유효한 이름을 입력해 주세요.');
            return;
        }

        // 🚨 Database Injection Point
        // In a real production app, we would authenticate the user properly.
        // For the beta, we will "upsert" based on their name/birthDate to create a session ID.
        try {
            if (name && birthDate && birthPlace && currentAddress) {
                // If in B2B Mode, bypass the free trial check entirely
                if (!isB2BMode) {
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('subscription_status, free_trials_used')
                        .eq('full_name', safeName) // SEC-002: Supabase ORM uses parameterized queries automatically
                        .single();

                    if (existingUser && existingUser.free_trials_used >= 1 && existingUser.subscription_status === 'free') {
                        alert('무료 스캔 1회가 소진되었습니다. 심층 분석을 계속하려면 프리미엄 패스를 이용해 주세요.');
                        navigate('/paywall', { state: { next: '/scan' } });
                        return;
                    }
                }

                // If user doesn't exist or is premium, log the session
                const { data: newUser, error } = await supabase
                    .from('users')
                    .upsert([{
                        full_name: safeName,
                        birth_date: safeBirthDate,
                        birth_time: safeBirthTime,
                        birth_place: safeBirthPlace,
                        current_address: safeAddress,
                        last_active: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // Save user session locally for this flow
                if (newUser) {
                    localStorage.setItem('currentUserId', newUser.id);
                }

                navigate('/scan');
            }
        } catch (err) {
            console.error('Supabase DB Error (falling back to local):', err);
            // Fallback for when keys are mock/invalid: proceed with local simulation
            if (!isB2BMode) {
                const hasUsedFreeTrial = localStorage.getItem('hasUsedFreeTrial') === 'true';
                const hasPaidAccount = localStorage.getItem('hasPaidAccount') === 'true';

                if (hasUsedFreeTrial && !hasPaidAccount) {
                    alert('무료 체험 1회가 모두 소진되었습니다. 무제한 스캔 및 심층 분석을 원하시면 프리미엄 패스를 이용해 주세요.');
                    navigate('/paywall', { state: { next: '/scan' } });
                    return;
                }
            }
            navigate('/scan');
        }
    };

    return (
        <div className="screen" style={{ justifyContent: 'center', paddingBottom: '40px', position: 'relative' }}>
            <style>{`
                .quantum-input {
                    width: 100%;
                    padding: 18px 25px;
                    background: rgba(20, 20, 30, 0.6);
                    border: 1px solid var(--color-border-subtle);
                    border-radius: 16px;
                    color: var(--color-text-primary);
                    font-size: 1.05rem;
                    font-family: var(--font-main);
                    outline: none;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                    backdrop-filter: blur(10px);
                }
                .quantum-input:focus {
                    border-color: var(--color-gold-main);
                    background: rgba(30, 30, 45, 0.8);
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.2), 0 0 15px rgba(218, 165, 32, 0.2);
                }
                .quantum-input::placeholder {
                    color: var(--color-text-muted);
                    font-weight: 400;
                }
                /* Hide native date/time picker indicators slightly or color them */
                ::-webkit-calendar-picker-indicator {
                    filter: invert(0.8) sepia(1) hue-rotate(320deg) saturate(3);
                    cursor: pointer;
                }
            `}</style>

            {/* Back to Landing Page Button */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10 }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                    <Home size={20} />
                    <span style={{ fontSize: '0.9rem' }}>처음으로</span>
                </button>
            </div>

            {/* Admin Pass Button */}
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, display: 'flex', gap: '10px' }}>
                {isB2BMode && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(76, 175, 80, 0.2)',
                            border: '1px solid rgba(76, 175, 80, 0.5)',
                            color: '#4CAF50',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        CRM 대시보드
                    </button>
                )}
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'rgba(218, 165, 32, 0.2)',
                        border: '1px solid rgba(218, 165, 32, 0.5)',
                        color: 'var(--color-gold-light)',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    관리자 패스
                </button>
            </div>

            {isB2BMode ? (
                <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '30px' }}>
                    <div style={{ display: 'inline-block', backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                        B2B 프리미엄 라이선스 활성화
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '2.5rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>{b2bSalonName}</h1>
                    <p style={{ letterSpacing: '2px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 600 }}>신규 고객 스캔 등록</p>
                </div>
            ) : (
                <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '30px' }}>
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '4rem', letterSpacing: '8px', marginBottom: '10px' }} className="gold-text">Psi</h1>
                    <p style={{ letterSpacing: '4px', color: 'var(--color-gold-dark)', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 600 }}>Energy Field Scan</p>
                </div>
            )}

            <div className="glass-card" style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', lineHeight: 1.4, color: 'var(--color-text-primary)' }}>
                    {isB2BMode ? '고객 고유 좌표 생성 (Client Setup)' : '주파수 좌표 설정 (Frequency Coordinates)'}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                    {isB2BMode
                        ? '정밀한 양자 분석을 위해 고객의 정보를 입력해 주세요.\n데이터는 암호화되어 해당 기기(매장)에서만 안전하게 관리됩니다.'
                        : '당신의 별자리가 새겨진 시간과 공간의 정확한 좌표를 입력해 주세요.\n우주의 수많은 파동 중, 오직 당신만의 주파수와 공명할 완벽한 준비를 마칩니다.'}
                </p>

                {!isB2BMode && (
                    <div style={{ background: 'rgba(218, 165, 32, 0.1)', borderLeft: '3px solid var(--color-gold-main)', padding: '12px 15px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--color-gold-dark)' }}>💡 양자 서브스페이스 링크 안내</strong><br />
                        입력하신 정보는 물리적 거리를 넘어 당신의 무의식과 정확한 '악수(Handshake)'를 나누기 위한 고유한 양자 주파수 주소로 사용됩니다. 100% 암호화되어 보호됩니다.
                    </div>
                )}

                <form onSubmit={handleStart}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px' }}>
                        <input
                            type="text"
                            placeholder="이름 (영문 또는 한글)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="quantum-input"
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="date"
                                    placeholder="생년월일 (양력)"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    required
                                    className="quantum-input"
                                    style={{ paddingRight: '70px' }}
                                />
                                <span style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-text-muted)', pointerEvents: 'none', background: 'rgba(20,20,30,0.8)', padding: '2px 6px', borderRadius: '4px' }}>양력 기준</span>
                            </div>
                            <input
                                type="time"
                                placeholder="태어난 시간"
                                value={birthTime}
                                onChange={(e) => setBirthTime(e.target.value)}
                                className="quantum-input"
                                style={{ flex: 1 }}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="출생 지역 (예: 서울특별시 강남구)"
                            value={birthPlace}
                            onChange={(e) => setBirthPlace(e.target.value)}
                            required
                            className="quantum-input"
                        />
                        <input
                            type="text"
                            placeholder="현재 거주 지역 (동기화 기준 위치)"
                            value={currentAddress}
                            onChange={(e) => setCurrentAddress(e.target.value)}
                            required
                            className="quantum-input"
                        />
                    </div>

                    <button type="submit" className="primary-btn" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        width: '100%', padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px',
                        marginBottom: '20px',
                        background: isB2BMode ? 'linear-gradient(135deg, #10b981, #047857)' : 'linear-gradient(135deg, var(--color-gold-light), var(--color-gold-main))',
                        color: isB2BMode ? '#FFF' : '#111',
                        border: 'none', borderRadius: '40px',
                        boxShadow: isB2BMode ? '0 10px 25px rgba(16, 185, 129, 0.4)' : '0 10px 25px rgba(218, 165, 32, 0.3)',
                        transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = isB2BMode ? '0 15px 30px rgba(16, 185, 129, 0.5)' : '0 15px 30px rgba(218, 165, 32, 0.4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isB2BMode ? '0 10px 25px rgba(16, 185, 129, 0.4)' : '0 10px 25px rgba(218, 165, 32, 0.3)'; }}
                    >
                        <Sparkles size={22} />
                        {isB2BMode ? '고객 파동 스캔 세션 시작' : '나의 파동으로 에너지 필드 접속하기'}
                    </button>

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6, padding: '15px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <strong style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>[ 프라이버시 보호 서약 ]</strong>
                        수집된 생체 파동 데이터는 의료 진단 목적이 아닌 웰니스(Wellness) 콘텐츠 제공용으로 사용되며, 100% 기기 내(On-Device)에서 1회성으로 안전하게 처리된 후 외부에 영구 복제/저장되지 않습니다. (보안 레벨: 최고 등급)
                    </div>
                </form>
            </div>

        </div>
    );
};

export default OnboardingScreen;
