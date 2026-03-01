import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PreScanSurvey } from '../services/AnalysisEngine';

const OnboardingScreen: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1); // Step 1: Info, Step 2: Survey

    // Basic Info
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');

    // Pre-Scan Survey
    const [sleepQuality, setSleepQuality] = useState<number>(3);
    const [stressLevel, setStressLevel] = useState<number>(3);
    const [vitality, setVitality] = useState<number>(3);
    const [mentalState, setMentalState] = useState<PreScanSurvey['mentalState']>('평온함');

    const [isB2BMode, setIsB2BMode] = useState(false);
    const [b2bSalonName, setB2BSalonName] = useState('');

    React.useEffect(() => {
        const b2b = localStorage.getItem('isB2BMode') === 'true';
        setIsB2BMode(b2b);
        if (b2b) {
            setB2BSalonName(localStorage.getItem('b2bSalonName') || '비즈니스');
        }
    }, []);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && birthDate && birthPlace && currentAddress) {
            setStep(2);
        } else {
            alert("모든 필수 정보를 입력해주세요.");
        }
    };

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();

        // SEC-006: 입력값 사전 검증 및 새니타이징
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

        // Save Survey Data to LocalStorage for the AnalysisEngine later
        const surveyData: PreScanSurvey = {
            sleepQuality,
            stressLevel,
            vitality,
            mentalState
        };
        localStorage.setItem('psi_survey_data', JSON.stringify(surveyData));
        localStorage.setItem('psi_birth_data', JSON.stringify({ date: safeBirthDate, time: safeBirthTime, name: safeName }));

        try {
            if (!isB2BMode) {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('subscription_status, free_trials_used')
                    .eq('full_name', safeName)
                    .single();

                if (existingUser && existingUser.free_trials_used >= 1 && existingUser.subscription_status === 'free') {
                    alert('무료 스캔 1회가 소진되었습니다. 심층 분석을 계속하려면 프리미엄 패스를 이용해 주세요.');
                    navigate('/paywall', { state: { next: '/scan' } });
                    return;
                }
            }

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

            if (newUser) {
                localStorage.setItem('currentUserId', newUser.id);
            }

            navigate('/scan');
        } catch (err) {
            console.error('Supabase DB Error (falling back to local):', err);
            navigate('/scan');
        }
    };

    return (
        <div className="screen" style={{ justifyContent: 'center', paddingBottom: '40px', position: 'relative' }}>
            <style>{`
                .quantum-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    color: #111111;
                    padding: 15px 20px;
                    border-radius: 12px;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .quantum-input:focus {
                    background: #ffffff;
                    border-color: var(--color-gold-main);
                    box-shadow: 0 0 15px rgba(218, 165, 32, 0.2), inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .quantum-input::placeholder {
                    color: #888888;
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
                    {isB2BMode ? '고객 고유 좌표 생성 (Client Setup)' : '파동 좌표 설정 (Frequency Coordinates)'}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                    {isB2BMode
                        ? '정밀한 양자 분석을 위해 고객의 정보를 입력해 주세요.\n데이터는 암호화되어 해당 기기(매장)에서만 안전하게 관리됩니다.'
                        : '당신의 별자리가 새겨진 시간과 공간의 정확한 좌표를 입력해 주세요.\n우주의 수많은 파동 중, 오직 당신만의 파동와 공명할 완벽한 준비를 마칩니다.'}
                </p>

                {!isB2BMode && (
                    <div style={{ background: 'rgba(218, 165, 32, 0.1)', borderLeft: '3px solid var(--color-gold-main)', padding: '12px 15px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--color-gold-dark)' }}>💡 양자 서브스페이스 링크 안내</strong><br />
                        입력하신 정보는 물리적 거리를 넘어 당신의 무의식과 정확한 '악수(Handshake)'를 나누기 위한 고유한 양자 파동 주소로 사용됩니다. 100% 암호화되어 보호됩니다.
                    </div>
                )}

                <form onSubmit={handleStart}>
                    {step === 1 ? (
                        <>
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
                                            type="tel"
                                            pattern="[0-9]{8}"
                                            maxLength={8}
                                            placeholder="생년월일 8자리 (예: 19900101)"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ''))}
                                            required
                                            className="quantum-input"
                                            style={{ paddingRight: '70px' }}
                                        />
                                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-text-muted)', pointerEvents: 'none', background: 'rgba(20,20,30,0.8)', padding: '2px 6px', borderRadius: '4px' }}>양력 기준</span>
                                    </div>
                                    <input
                                        type="tel"
                                        pattern="[0-9]{4}"
                                        maxLength={4}
                                        placeholder="태어난 시간 (예: 1430)"
                                        value={birthTime}
                                        onChange={(e) => setBirthTime(e.target.value.replace(/[^0-9]/g, ''))}
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

                            <button type="button" onClick={handleNextStep} className="primary-btn" style={{
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
                                다음 단계 <Activity size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '35px', textAlign: 'left' }}>
                                <h3 style={{ color: 'var(--color-gold-light)', fontSize: '1.1rem', marginBottom: '5px' }}>자가 진단 (Pre-Scan Survey)</h3>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>최근 수면의 질은 어떠셨나요? (1: 최악 ~ 5: 꿀잠)</label>
                                    <input type="range" min="1" max="5" value={sleepQuality} onChange={(e) => setSleepQuality(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-gold-main)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}><span>매우 나쁨</span><span>보통</span><span>매우 좋음</span></div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>현재 스트레스/불안 정도 (1: 평온 ~ 5: 극심함)</label>
                                    <input type="range" min="1" max="5" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-gold-main)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}><span>낮음</span><span>보통</span><span>높음</span></div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>최근 육체적 피로도/활력 (1: 방전 ~ 5: 활기참)</label>
                                    <input type="range" min="1" max="5" value={vitality} onChange={(e) => setVitality(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-gold-main)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}><span>완전 방전</span><span>보통</span><span>에너지 넘침</span></div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>현재 가장 신경 쓰이는 멘탈 상태 (선택)</label>
                                    <select
                                        value={mentalState}
                                        onChange={(e) => setMentalState(e.target.value as any)}
                                        className="quantum-input"
                                        style={{ padding: '12px 15px' }}
                                    >
                                        <option value="평온함">평온함 (특별한 문제 없음)</option>
                                        <option value="우울">우울감 / 무기력</option>
                                        <option value="불안">불안 / 초초함</option>
                                        <option value="공황장애">공황장애 / 두근거림</option>
                                        <option value="강박증">강박증 / 복잡한 생각</option>
                                        <option value="중독증">중독증 / 습관적 갈망</option>
                                        <option value="기타">기타 스트레스</option>
                                    </select>
                                </div>
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
                                {isB2BMode ? '고객 파동 분석 시작' : '나의 파동으로 에너지 스캔 시작하기'}
                            </button>

                            <button type="button" onClick={() => setStep(1)} style={{
                                width: '100%', padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px'
                            }}>
                                이전 화면으로 돌아가기
                            </button>
                        </>
                    )}

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
