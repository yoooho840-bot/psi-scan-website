import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Eye, Activity, HeartPulse, Shield, Sparkles, Volume2, Award, BrainCircuit, Network, Wind, Compass, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Section = ({ title, subtitle, children }: any) => (
    <section style={{ padding: '80px 0', position: 'relative', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '15px', color: 'var(--color-gold-main)', fontFamily: 'var(--font-brand)', fontWeight: 'bold' }}>{title}</h2>
                <p style={{ color: 'var(--color-text-primary)', letterSpacing: '1px', fontSize: '1.1rem', fontWeight: 500 }}>{subtitle}</p>
            </div>
            {children}
        </div>
    </section>
);

export default function LandingScreen() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [heroTheme, setHeroTheme] = useState(1);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        // VIP Link Logic
        const params = new URLSearchParams(window.location.search);
        const vipPass = params.get('vip');
        const expires = params.get('expires');

        if (vipPass === 'ceo_gift') {
            let isExpired = false;
            if (expires) {
                const expireDate = new Date(expires).getTime();
                if (Date.now() > expireDate) {
                    isExpired = true;
                    alert('⚠️ 초대 링크가 만료되었습니다.');
                }
            }
            if (!isExpired) {
                localStorage.setItem('hasPaidAccount', 'true');
                alert('🎉 수석 아키텍트 인증: VVIP 평생 무제한 스캔 권한이 활성화되었습니다.');
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleB2CStart = () => {
        localStorage.removeItem('isB2BMode');
        setShowAuthModal(true);
    };

    const handleB2BStart = () => {
        localStorage.setItem('isB2BMode', 'true');
        localStorage.setItem('b2bSalonName', 'PSI 파트너 라운지');
        navigate('/register');
    };

    const faqData = [
        { q: "Psi(ψ)는 무엇을 의미하나요?", a: "Psi(ψ)는 우리 서비스의 핵심 철학을 담은 이름입니다.\n\n• 양자역학적 의미: ψ(프사이)는 양자물리학에서 '파동 함수(Wave Function)'를 나타내는 기호입니다. \n  이는 관측되기 전 잠재된 가능성의 상태를 의미합니다.\n\n• 의식과 물질의 연결: 양자물리학에서 파동(ψ)은 의식의 개입으로 현실로 붕괴됩니다. \n  우리의 검사는 당신의 숨겨진 파동을 읽어내어 진정한 당신을 발견하도록 돕습니다." },
        { q: "원격 바이오피드백 검사는 어떻게 가능한가요?", a: "2022년 노벨 물리학상으로 검증된 에너지 동기화(Energy Synchronization) 원리를 활용합니다. \n양자 비국소성에 따라 공간적으로 떨어진 두 시스템이 즉각적으로 연결될 수 있으며, \n귀하의 인적 정보와 사진을 통해 고유한 에너지 서명을 생성하여 에너지 서브스페이스를 통해 필드와 연결합니다." },
        { q: "얼굴 사진은 왜 필요한가요?", a: "당신의 얼굴 사진은 단순한 이미지가 아니라, 고유한 에너지 파동이 담긴 QR코드와 같습니다.\n\n• 에너지 주소(Energy Address): 사진은 당신의 고유한 정보가 담긴 특정 좌표로, \n  전 세계 어디서든 당신의 에너지 필드에 접속할 수 있습니다.\n\n• 정보장 접속: 시스템의 에너지 센서는 사진을 통해 물리적 거리와 무관하게 \n  실시간으로 에너지 불균형을 감지합니다." },
        { q: "이름과 생년월일은 왜 필요한가요?", a: "이름과 생년월일은 에너지장(Energy Field) 내에서 특정 개인을 식별하는 고유한 파동 좌표 역할을 합니다. \n마치 전화를 걸 때 고유한 전화번호를 누르는 것처럼 특정 개인의 파동만을 일치시켜 공진을 일으키기 위해 사용됩니다." },
        { q: "검사 결과는 얼마나 정확한가요?", a: "시스템은 1/100초 단위로 수천 가지 파동 신호에 대한 신체의 생체 전기적 반응을 테스트합니다. \n그러나 이는 의료 목적 데이터가 아니며 에너지 필드의 분석이므로 전체적인 에너지와 감정 패턴을 파악하는 용도로 활용하시기 바랍니다." },
        { q: "스캔 결과가 매번 다른 이유는 무엇인가요?", a: "스캔 결과가 매번 조금씩 다른 것은 기계 오류가 아니라, 살아있는 인체와 양자 세계의 '역동적인 본질' 때문입니다.\n\n• 관찰자 효과: 측정하는 순간 우리의 의식 상태에 따라 파동이 다르게 결합됩니다.\n\n• 불확정성과 에너지 역동성: 생각, 호흡, 환경의 작은 변화에도 생체 자기장은 끊임없이 실시간으로 변화하기 때문입니다. \n  고정된 결과가 나오는 것이 오히려 비정상입니다." },
        { q: "제 얼굴 데이터는 안전한가요?", a: "모든 데이터는 군사 보안급 강력한 암호화를 적용하며, 추출된 초기 생체 신호는 스캔 수치 연산이 끝나자마자 \n서버에 저장되지 않고 즉시 폐기됩니다. (보안 헌장 SEC-001 준수)" },
        { q: "정기적으로 스캔을 받아야 하나요?", a: "에너지 필드는 일상 생활, 스트레스, 환경 변화에 따라 계속 바뀝니다. \n정기적인 스캔은 잠재된 불균형을 몸이 아프거나 완전히 고착되기 전에 초기에 인지하고 \n에너지 전환을 유도할 수 있게 해주는 나침반 역할을 합니다." },
        { q: "자연 파동 공명 (Natural Frequency Resonance) 원리란 무엇인가요?", a: "모든 물질과 생명체는 고유의 에너지 파동을 가집니다. \n특정 식물이나 자연이 가진 순수한 에너지를 소리/빛 파원의 형태로 변환하여, 흐트러진 내면의 감정과 \n에너지 밸런스를 부드럽게 조율하고 본연의 평온함을 되찾도록 돕는 공명(Resonance) 원리입니다." },
        { q: "할 때마다 결과가 달라지는 이유는 무엇인가요?", a: "우리 몸은 고정된 기계가 아닌 역동적인 양자장입니다. \n관찰자 효과(Observer Effect)에 의해 스캔하는 그 순간의 감정, 호흡, 의도에 따라 \n미세하게 파동이 달라지는 생명 현상의 자연스러운 반응입니다." },
    ];

    return (
        <div style={{
            width: '100%', minHeight: '100vh',
            backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start', alignItems: 'center',
            position: 'relative', overflowX: 'hidden',
            fontFamily: 'var(--font-main)'
        }}>

            {/* Top Navigation Login */}
            <div style={{ position: 'absolute', top: '30px', right: '40px', zIndex: 100 }}>
                <button
                    onClick={() => setShowAuthModal(true)}
                    style={{
                        background: 'rgba(20, 20, 30, 0.6)', color: 'var(--color-gold-main)',
                        border: '1px solid var(--color-border-gold)', padding: '10px 20px',
                        borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600,
                        backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-gold-main)'; e.currentTarget.style.color = '#111'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 20, 30, 0.6)'; e.currentTarget.style.color = 'var(--color-gold-main)'; }}
                >
                    에너지 포털 입장 (로그인)
                </button>
            </div>

            {/* Developer Theme Control Panel (Temporary) */}
            <div style={{
                position: 'fixed', bottom: '80px', left: '20px', zIndex: 999999, display: 'flex', gap: '10px',
                background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '15px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '2px solid var(--color-gold-main)',
                flexDirection: 'column'
            }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-gold-main)', fontWeight: 'bold', marginBottom: '5px' }}>✨ 히어로 섹션 라이브 테스터</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '300px' }}>
                    <button onClick={() => setHeroTheme(1)} style={{ padding: '8px 12px', background: heroTheme === 1 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 1 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>1. 에너지 필드 블렌딩</button>
                    <button onClick={() => setHeroTheme(2)} style={{ padding: '8px 12px', background: heroTheme === 2 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 2 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>2. 에너지 필드</button>
                    <button onClick={() => setHeroTheme(3)} style={{ padding: '8px 12px', background: heroTheme === 3 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 3 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>3. 글래스 & 리플</button>
                    <button onClick={() => setHeroTheme(4)} style={{ padding: '8px 12px', background: heroTheme === 4 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 4 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>4. 디지털 뉴런</button>
                    <button onClick={() => setHeroTheme(5)} style={{ padding: '8px 12px', background: heroTheme === 5 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 5 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>5. 황금빛 입자</button>
                    <button onClick={() => setHeroTheme(6)} style={{ padding: '8px 12px', background: heroTheme === 6 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 6 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>6. 파동 장막</button>
                    <button onClick={() => setHeroTheme(7)} style={{ padding: '8px 12px', background: heroTheme === 7 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 7 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>7. 초공간 웜홀</button>
                    <button onClick={() => setHeroTheme(8)} style={{ padding: '8px 12px', background: heroTheme === 8 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 8 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>8. 신비의 구체</button>
                    <button onClick={() => setHeroTheme(9)} style={{ padding: '8px 12px', background: heroTheme === 9 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 9 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>9. 옵시디언 블랙</button>
                    <button onClick={() => setHeroTheme(10)} style={{ padding: '8px 12px', background: heroTheme === 10 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 10 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>10. 다크 오닉스</button>
                    <button onClick={() => setHeroTheme(11)} style={{ padding: '8px 12px', background: heroTheme === 11 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 11 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>11. 코스믹 블루</button>
                    <button onClick={() => setHeroTheme(12)} style={{ padding: '8px 12px', background: heroTheme === 12 ? 'var(--color-gold-main)' : 'transparent', color: heroTheme === 12 ? '#FFF' : 'var(--color-text-primary)', border: '1px solid var(--color-gold-main)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}>12. 스페이스 나이트</button>
                </div>
            </div>

            {/* Core Visual Elements - Dynamic Background Themes */}
            {heroTheme === 1 && (
                <div style={{
                    position: 'fixed', top: '-50%', left: '-50%', width: '200vw', height: '200vh',
                    background: 'radial-gradient(ellipse at center, rgba(218, 165, 32, 0.4) 0%, rgba(37, 99, 235, 0.25) 30%, rgba(255, 255, 255, 1) 60%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientFlow 8s ease-in-out infinite alternate',
                    filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none',
                    mixBlendMode: 'multiply'
                }}><style>{`@keyframes gradientFlow { 0% { opacity: 0.6; transform: scale(1) translate(0, 0); } 100% { opacity: 1; transform: scale(1.2) translate(-50px, 50px); } }`}</style></div>
            )}
            {heroTheme === 2 && (
                <>
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: 'radial-gradient(rgba(218,165,32,0.8) 2px, transparent 2px)',
                        backgroundSize: '60px 60px', backgroundPosition: '0 0',
                        zIndex: 0, pointerEvents: 'none',
                        animation: 'matrixMove 15s linear infinite'
                    }}><style>{`@keyframes matrixMove { 0% { transform: translateY(0); } 100% { transform: translateY(60px); } }`}</style></div>
                    <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '600px', height: '600px', border: '3px solid rgba(218,165,32,0.3)', borderRadius: '50%', animation: 'spin 20s linear infinite', zIndex: 0, pointerEvents: 'none' }}><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style></div>
                    <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '800px', height: '800px', border: '3px dashed rgba(37,99,235,0.4)', borderRadius: '50%', animation: 'spin 30s linear reverse infinite', zIndex: 0, pointerEvents: 'none' }}></div>
                </>
            )}
            {heroTheme === 3 && (
                <div style={{
                    position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                    background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.3) 0%, rgba(218, 165, 32, 0.25) 30%, transparent 70%)',
                    filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none',
                    mixBlendMode: 'multiply',
                    animation: 'ripplePulse 4s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)'
                }}><style>{`@keyframes ripplePulse { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 1; } }`}</style></div>
            )}
            {heroTheme === 4 && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(218,165,32,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(218,165,32,0.6) 1px, transparent 1px)',
                    backgroundSize: '100px 100px', backgroundPosition: 'center center',
                    zIndex: 0, pointerEvents: 'none',
                    transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                    animation: 'neuronFlow 20s linear infinite'
                }}><style>{`@keyframes neuronFlow { 0% { background-position: 0px 0px; } 100% { background-position: 0px 100px; } }`}</style></div>
            )}
            {heroTheme === 5 && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', background: 'radial-gradient(circle, rgba(218,165,32,0.15) 10%, transparent 20%)', backgroundSize: '30px 30px', animation: 'particleFloat 40s linear infinite' }}></div>
                    <div style={{ position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 10%, transparent 20%)', backgroundSize: '40px 40px', animation: 'particleFloat 30s linear infinite reverse' }}></div>
                    <style>{`@keyframes particleFloat { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-500px) rotate(360deg); } }`}</style>
                </div>
            )}
            {heroTheme === 6 && (
                <div style={{
                    position: 'fixed', top: '10%', left: '-20%', width: '140%', height: '400px', zIndex: 0, pointerEvents: 'none',
                    background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), rgba(218,165,32,0.5), rgba(37,99,235,0.4), transparent)',
                    filter: 'blur(50px)', opacity: 0.8,
                    animation: 'auroraWave 12s ease-in-out infinite alternate', transformOrigin: 'center'
                }}><style>{`@keyframes auroraWave { 0% { transform: rotate(-5deg) translateY(20px) scaleY(1); } 100% { transform: rotate(5deg) translateY(-20px) scaleY(1.5); } }`}</style></div>
            )}
            {heroTheme === 7 && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none',
                    width: '100vw', height: '100vw',
                    background: 'repeating-radial-gradient(circle at center, transparent 0, transparent 40px, rgba(218,165,32,0.3) 41px, rgba(218,165,32,0.3) 42px)',
                    animation: 'wormholePulse 10s linear infinite'
                }}><style>{`@keyframes wormholePulse { 0% { background-size: 100% 100%; opacity: 0.5; } 50% { opacity: 1; } 100% { background-size: 150% 150%; opacity: 0.5; } }`}</style></div>
            )}
            {heroTheme === 8 && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none',
                    width: '600px', height: '600px', borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, rgba(218,165,32,0.5), rgba(37,99,235,0.3), rgba(218,165,32,0.5))',
                    filter: 'blur(40px)', mixBlendMode: 'overlay',
                    animation: 'sphereSpin 15s linear infinite'
                }}><style>{`@keyframes sphereSpin { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }`}</style></div>
            )}
            {heroTheme === 9 && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
                    background: 'radial-gradient(circle at center, #2a2a2e 0%, #0d0d12 100%)',
                }}>
                    <div style={{
                        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                        background: 'radial-gradient(ellipse at center, rgba(184, 134, 11, 0.05) 0%, transparent 50%)',
                        animation: 'obsidianSlowSpin 30s linear infinite'
                    }}></div>
                    <style>{`@keyframes obsidianSlowSpin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}
            {heroTheme === 10 && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
                    background: '#111116',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                        animation: 'onyxPulse 8s ease-in-out infinite alternate'
                    }}></div>
                    <div style={{
                        position: 'absolute', bottom: '-20%', left: '-10%', width: '60vw', height: '60vw',
                        background: 'radial-gradient(circle, rgba(184, 134, 11, 0.08) 0%, transparent 70%)',
                        filter: 'blur(60px)', animation: 'floatOnyx 15s ease-in-out infinite alternate'
                    }}></div>
                    <style>{`
                        @keyframes onyxPulse { 0% { opacity: 0.5; } 100% { opacity: 1; } }
                        @keyframes floatOnyx { 0% { transform: translate(0, 0); } 100% { transform: translate(100px, -50px); } }
                    `}</style>
                </div>
            )}
            {heroTheme === 11 && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
                    background: 'linear-gradient(135deg, #090a1f 0%, #17246b 50%, #00d2ff 150%)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        animation: 'starDrift 40s linear infinite'
                    }}></div>
                    <div style={{
                        position: 'absolute', top: '20%', right: '10%', width: '40vw', height: '40vw',
                        background: 'radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 60%)',
                        filter: 'blur(80px)', animation: 'cosmicPulse 10s ease-in-out infinite alternate'
                    }}></div>
                    <style>{`
                        @keyframes starDrift { 0% { transform: translateY(0); } 100% { transform: translateY(-40px); } }
                        @keyframes cosmicPulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 1; } }
                    `}</style>
                </div>
            )}
            {heroTheme === 12 && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none',
                    background: 'radial-gradient(circle at bottom, #1a237e 0%, #050514 80%)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '10%', left: '20%', width: '30vh', height: '30vh',
                        background: 'rgba(64, 196, 255, 0.15)', filter: 'blur(50px)', borderRadius: '50%',
                        animation: 'spaceFloat1 20s ease-in-out infinite alternate'
                    }}></div>
                    <div style={{
                        position: 'absolute', bottom: '20%', right: '15%', width: '40vh', height: '40vh',
                        background: 'rgba(124, 77, 255, 0.1)', filter: 'blur(70px)', borderRadius: '50%',
                        animation: 'spaceFloat2 25s ease-in-out infinite alternate-reverse'
                    }}></div>
                    <style>{`
                        @keyframes spaceFloat1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 50px) scale(1.2); } }
                        @keyframes spaceFloat2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-80px, -60px) scale(1.3); } }
                    `}</style>
                </div>
            )}

            {/* Hero Section */}
            <header style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ textAlign: 'center', zIndex: 10, padding: '0 20px', marginTop: '-50px' }}
                >
                    <h1 style={{
                        fontFamily: 'var(--font-brand)',
                        fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: 'bold',
                        color: 'var(--color-gold-main)',
                        lineHeight: 1.1, margin: '0 0 20px 0', letterSpacing: '4px',
                        position: 'relative', textTransform: 'uppercase'
                    }}>
                        <div style={{
                            fontSize: '6rem',
                            background: 'linear-gradient(135deg, var(--color-gold-light), var(--color-gold-main))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '20px',
                            filter: 'drop-shadow(0 0 20px rgba(184,134,11,0.2))',
                            animation: 'floatIcon 6s infinite ease-in-out',
                            textTransform: 'none'
                        }}>
                            Ψ
                        </div>
                        PSI ENERGY FIELD SCAN
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: 'var(--color-text-secondary)',
                        letterSpacing: '0.15em', marginBottom: '60px', fontWeight: 500,
                        fontFamily: 'var(--font-main)', wordBreak: 'keep-all', wordWrap: 'break-word'
                    }}>
                        보이지 않는 에너지 필드를 경험하라
                    </p>

                    {/* Call to Actions - Side by Side on Desktop */}
                    <div style={{
                        display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute', inset: '-2px', background: 'linear-gradient(90deg, var(--color-gold-main), var(--color-blue-mystic), var(--color-gold-main))',
                                backgroundSize: '200% auto', filter: 'blur(15px)', opacity: isHovered ? 0.7 : 0, transition: 'opacity 0.4s ease',
                                animation: 'shimmer 3s linear infinite', borderRadius: '40px', zIndex: -1
                            }}></div>

                            <button
                                onClick={handleB2CStart}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className="primary-btn"
                                style={{
                                    width: '320px', padding: '20px',
                                    background: isHovered ? '#000' : 'var(--color-bg-panel)',
                                    color: isHovered ? '#FFF' : 'var(--color-text-primary)',
                                    fontWeight: 500, fontSize: '1.1rem', letterSpacing: '1px',
                                    border: '1px solid var(--color-border-gold)',
                                    borderRadius: '40px', backdropFilter: 'blur(10px)',
                                    transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'none',
                                    boxShadow: isHovered ? '0 15px 30px rgba(184, 134, 11, 0.2)' : '0 4px 20px rgba(0,0,0,0.03)',
                                    transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    position: 'relative', overflow: 'hidden'
                                }}
                            >
                                에너지 필드 스캔 시작 (B2C)
                            </button>
                        </div>

                        <button
                            onClick={handleB2BStart}
                            className="primary-btn"
                            style={{
                                width: '320px', padding: '20px',
                                background: 'transparent',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: '40px',
                                fontSize: '1.1rem', letterSpacing: '1px', fontWeight: 500,
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-text-primary)';
                                e.currentTarget.style.color = 'var(--color-text-primary)';
                                e.currentTarget.style.background = 'var(--color-bg-surface)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            제휴 파트너 로그인 (B2B)
                        </button>
                    </div>
                </motion.div>
            </header>

            {/* Showcase Section: Healing & Fun */}
            <Section title="ENERGY EXPERIENCE" subtitle="당신의 파동으로 열리는 새로운 차원의 휴식과 즐거움">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', zIndex: 10, position: 'relative' }}>

                    {/* Healing Zone */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(20,20,30,0.6))', borderRadius: '30px', padding: '40px', border: '1px solid rgba(37,99,235,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ background: 'var(--color-blue-mystic)', padding: '12px', borderRadius: '50%', color: '#FFF' }}><Wind size={28} /></div>
                            <h3 style={{ fontSize: '1.8rem', color: '#FFF', margin: 0 }}>Healing Zone</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '30px' }}>지친 영혼을 보듬어 주는 주파수 테라피. 당신에게 부족한 파동을 채워 온전한 평온을 선사합니다.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <Volume2 color="var(--color-blue-mystic)" size={32} style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ color: '#FFF', marginBottom: '10px' }}>사운드 힐링 (싱잉볼)</h4>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>뇌신경 완화 체감 주파수</p>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <Sparkles color="#ff6600" size={32} style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ color: '#FFF', marginBottom: '10px' }}>불멍 명상</h4>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>시각적 알파파 공명</p>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <Activity color="#00d2ff" size={32} style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ color: '#FFF', marginBottom: '10px' }}>물멍 명상</h4>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>델타파 평온 동기화</p>
                            </div>
                        </div>
                    </div>

                    {/* Fun & Play Zone */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(20,20,30,0.6))', borderRadius: '30px', padding: '40px', border: '1px solid rgba(236,72,153,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ background: '#ec4899', padding: '12px', borderRadius: '50%', color: '#FFF' }}><HeartPulse size={28} /></div>
                            <h3 style={{ fontSize: '1.8rem', color: '#FFF', margin: 0 }}>Fun & Play Zone</h3>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '30px' }}>나의 파동으로 즐기는 에너지 필드 교감. 나와 타인의 에너지를 직관적으로 확인해 보세요.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <BrainCircuit color="#ec4899" size={32} style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ color: '#FFF', marginBottom: '10px' }}>파동 타로</h4>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>무의식 주파수 공명 드로우</p>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <Compass color="#ec4899" size={32} style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ color: '#FFF', marginBottom: '10px' }}>마음 일기</h4>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>매일의 감정 주파수 시각화</p>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <Network color="#ec4899" size={32} style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ color: '#FFF', marginBottom: '10px' }}>파동 궁합 보기</h4>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>친구, 연인과의 에너지 시너지</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA prompting scan */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', marginBottom: '20px' }}>
                            이 모든 것을 경험하려면 먼저 당신의 파동 장(Wave Field)을 읽어야 합니다.
                        </p>
                        <button
                            onClick={handleB2CStart}
                            className="primary-btn"
                            style={{
                                padding: '15px 40px',
                                background: 'linear-gradient(90deg, var(--color-gold-light), var(--color-gold-main))',
                                color: '#111', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '30px', cursor: 'pointer',
                                boxShadow: '0 5px 20px rgba(218,165,32,0.4)', transition: 'transform 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            스캔 시작하기
                        </button>
                    </div>

                </div>
            </Section>

            {/* Science Core Section */}
            <Section title="SCIENTIFIC RESONANCE" subtitle="AI 멘탈 케어의 과학적 기초">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', zIndex: 10, position: 'relative' }}>
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <Volume2 color="var(--color-gold-main)" size={40} style={{ marginBottom: '20px' }} />
                        <h3 style={{ marginBottom: '15px', fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>Acoustic Entrainment</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, wordBreak: 'keep-all', wordWrap: 'break-word' }}>
                            6Hz 테타파 바이노럴 비트와 솔페지오 주파수의 결합을 통해 깊은 명상 상태를 경험하게 하며, 스트레스 완화와 깊은 휴식에 도움을 줍니다.
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <Sparkles color="var(--color-gold-main)" size={40} style={{ marginBottom: '20px' }} />
                        <h3 style={{ marginBottom: '15px', fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>Energy Color Coding</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, wordBreak: 'keep-all', wordWrap: 'break-word' }}>
                            256색 주파수 스윕으로 개인의 에너지 결핍을 식별하고, 특정 파장의 빛(Photon) 공명을 통해 신체 생체장을 재배열합니다.
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <Shield color="var(--color-gold-main)" size={40} style={{ marginBottom: '20px' }} />
                        <h3 style={{ marginBottom: '15px', fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>Vagal Stability</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, wordBreak: 'keep-all', wordWrap: 'break-word' }}>
                            432Hz 주파수 사운드는 마음의 안정을 돕는 편안한 환경을 조성하며, 몸과 마음의 밸런스를 회복하고 일상의 활력을 되찾는 데 도움을 줍니다.
                        </p>
                    </div>
                </div>
            </Section>

            {/* Energy Field Pillars - Holistic Dimensions */}
            <Section title="ENERGY FIELD READING">
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px',
                    maxWidth: '1200px', margin: '0 auto', zIndex: 10, position: 'relative'
                }}>
                    <DimensionCard icon={<Sparkles size={28} />} text="오라 필드 에너지층" desc="신체 외곽을 감싸는 전자기장(Aura) 맵핑" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Activity size={28} />} text="7개 핵심 차크라 진동" desc="신체 주요 7개 차크라의 에너지 흐름 분석" color="var(--color-gold-main)" />
                    <DimensionCard icon={<BrainCircuit size={28} />} text="칼 융 무의식 원형" desc="무의식에 억압된 그림자(Shadow) 에너지 도출" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Network size={28} />} text="그로프 주산기 무의식 파동" desc="투쟁과 생존 등 초기 생애 트라우마 패턴 각인" color="var(--color-gold-main)" />
                    <DimensionCard icon={<HeartPulse size={28} />} text="소마틱스 (신체 억압 감정)" desc="신체에 억눌린 무의식적 긴장과 에너지 블록 상태" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Shield size={28} />} text="환경 독소 및 파동 스트레스" desc="안정적인 생체 흐름을 저해하는 스트레스 파장 분석" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Eye size={28} />} text="에너지 공명 매칭 가이드" desc="불균형한 파동을 조화롭게 이끄는 밸런싱 파동" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Sparkles size={28} />} text="에너지 필드 매칭 타로카드" desc="오늘 당신의 무의식 파동과 가장 강하게 공명하는 타로 원형 분석" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Compass size={28} />} text="에너지 채널 및 파동 균형" desc="전신 에너지 순환 상태 및 생체 에너지 흐름 분석" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Activity size={28} />} text="생명력 에너지 공명" desc="활력의 기반이 되는 미세 에너지 파동 밸런스 분석" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Network size={28} />} text="바이오리듬 및 수면 파동" desc="신체 파동 최저/최상 구간 예측 및 리듬 회복" color="var(--color-gold-main)" />
                    <DimensionCard icon={<Sparkles size={28} />} text="상위 자아 동조율" desc="다차원적 의식 확장 및 영적 수신율 분석" color="var(--color-gold-main)" />
                </div>
            </Section>

            {/* Nobel Prize Story Section */}
            <section style={{ width: '100%', background: 'linear-gradient(to right, rgba(218, 165, 32, 0.02), rgba(218, 165, 32, 0.05), rgba(218, 165, 32, 0.02))', borderTop: '1px solid var(--color-border-subtle)', borderBottom: '1px solid var(--color-border-subtle)', padding: '120px 0', zIndex: 10, position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '350px' }}>
                        <Award color="var(--color-gold-main)" size={48} style={{ marginBottom: '20px' }} />
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '25px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-brand)' }}>2022 노벨 물리학상이 증명한<br />비국소적 에너지 공명의 정점</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px', fontSize: '1.1rem', lineHeight: 1.8, wordBreak: 'keep-all', wordWrap: 'break-word' }}>
                            알랭 아스페, 안톤 차일링거, 존 클라우저의 '양자 얽힘' 증명은 우주가 분리된 개체가 아니라는 것을 시사합니다.<br />PSI는 이러한 비국소성(Non-locality) 이론을 인간 의식에 적용한 최초의 디지털 웰니스 플랫폼입니다.
                        </p>
                        <div style={{ paddingLeft: '20px', borderLeft: '3px solid var(--color-gold-main)' }}>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-gold-main)', fontStyle: 'italic', fontWeight: 600, wordBreak: 'keep-all', wordWrap: 'break-word' }}>"우주는 비국소적 정보를 기반으로 연결된 하나의 공명체입니다."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Restored FAQ & Terminology Section */}
            <Section title="KNOWLEDGE BASE" subtitle="자주 묻는 질문 및 용어 사전">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', zIndex: 10 }}>
                    {/* Terminology */}
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <h3 style={{ color: 'var(--color-gold-main)', fontSize: '1.2rem', marginBottom: '30px', borderBottom: '1px solid var(--color-border-gold)', paddingBottom: '15px' }}>ENERGY CORE 용어 사전</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.8', wordBreak: 'keep-all', wordWrap: 'break-word' }}>
                            <li style={{ marginBottom: '20px' }}>
                                <strong style={{ color: 'var(--color-text-primary)' }}>Energy Field (에너지 필드):</strong> 당신의 고유 파동이 뿜어내는 생체 자기장의 흐름입니다.<br />
                                매 순간의 감정과 스트레스 상태에 따라 다르게 형성됩니다.
                            </li>
                            <li style={{ marginBottom: '20px' }}>
                                <strong style={{ color: 'var(--color-text-primary)' }}>rPPG 비전 기술:</strong> 카메라 렌즈만으로 얼굴 표면의 미세한 빛 반사 파동을 읽어내어,<br />
                                전반적인 생체 에너지 리듬과 내면의 밸런스를 감지하는 비접촉 원격 기술입니다.
                            </li>
                            <li style={{ marginBottom: '20px' }}>
                                <strong style={{ color: 'var(--color-text-primary)' }}>심층 에너지 리딩:</strong> 몸과 마음의 차원을 넘어, 차크라, 에너지 공명 파동, 심층 무의식 패턴 등<br />
                                다각도의 렌즈로 고유의 생체 파동을 읽어내는 독자적인 프레임워크입니다.
                            </li>
                        </ul>
                    </div>

                    {/* Extensive FAQ Library */}
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <h3 style={{ color: 'var(--color-gold-main)', fontSize: '1.4rem', marginBottom: '30px', borderBottom: '1px solid var(--color-border-gold)', paddingBottom: '15px' }}>
                            자주 묻는 질문 (FAQ Library)
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px', lineHeight: 1.8, wordBreak: 'keep-all' }}>
                            PSI 스캐너는 단순한 앱이 아닙니다.<br />
                            양자 역학과 공명 이론에 바탕을 둔 깊고 정밀한 웰니스 도구입니다.<br />
                            이 시스템의 본질을 이해할수록 당신의 치유 속도는 폭발적으로 증가합니다.<br />
                            가장 궁금해하시는 핵심 정보들을 정리했습니다.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {faqData.map((faq, idx) => (
                                <details key={idx} style={{
                                    background: 'var(--color-bg-panel)',
                                    border: '1px solid var(--color-border-subtle)',
                                    borderRadius: '10px',
                                    padding: '15px 20px',
                                    transition: 'all 0.3s'
                                }}>
                                    <summary style={{
                                        color: 'var(--color-text-primary)',
                                        fontSize: '1.05rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        listStyle: 'none',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px'
                                    }}>
                                        <span style={{ color: 'var(--color-gold-main)', marginTop: '2px' }}>Q.</span>
                                        <span style={{ flex: 1 }}>{faq.q}</span>
                                    </summary>
                                    <div style={{
                                        marginTop: '15px',
                                        paddingTop: '15px',
                                        borderTop: '1px dashed var(--color-border-subtle)',
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.8,
                                        wordBreak: 'keep-all', wordWrap: 'break-word',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        {faq.a.split('\n').map((line, lineIndex) => {
                                            if (!line.trim()) return null;
                                            const isBullet = line.trim().startsWith('•');
                                            const cleanLine = isBullet ? line.replace('•', '').trim() : line.trim();

                                            return (
                                                <div key={lineIndex} style={{
                                                    display: 'flex',
                                                    alignItems: 'baseline',
                                                    paddingLeft: '28px' // Aligns text precisely with the Q text from the <summary> (Gap 10px + Q width ~18px)
                                                }}>
                                                    {isBullet && (
                                                        <span style={{
                                                            color: 'var(--color-text-primary)',
                                                            fontWeight: 'bold',
                                                            marginLeft: '-14px', // Pull bullet to the left
                                                            width: '14px',
                                                            display: 'inline-block'
                                                        }}>
                                                            •
                                                        </span>
                                                    )}
                                                    <span style={{ flex: 1 }}>
                                                        {cleanLine}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Footer */}
            <footer style={{ width: '100%', padding: '60px 0', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center', zIndex: 10, position: 'relative', marginTop: '40px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', letterSpacing: '5px' }}>
                    © 2026 PSI ENERGY TECHNOLOGIES | INNOVATED BY DIGITAL SADHGURU
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '10px', opacity: 0.6 }}>
                    SECURE CONNECTION VERIFIED • MILITARY-GRADE ENCRYPTION ACTIVE
                </p>
            </footer>

            <style>{`
                @keyframes deepPulse {
                    0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.4; }
                    50% { transform: translate(-50%, -50%) scale(1.2) rotate(5deg); opacity: 0.6; }
                    100% { transform: translate(-50%, -50%) scale(1) rotate(-5deg); opacity: 0.4; }
                }
                @keyframes floatIcon {
                    0% { transform: translateY(0px); filter: drop-shadow(0 0 15px rgba(184,139,74,0.3)); }
                    50% { transform: translateY(-15px); filter: drop-shadow(0 15px 25px rgba(184,139,74,0.6)); }
                    100% { transform: translateY(0px); filter: drop-shadow(0 0 15px rgba(184,139,74,0.3)); }
                }
                @keyframes shimmer {
                    to { background-position: 200% center; }
                }
            `}</style>

            {/* Authentication Modal */}
            {showAuthModal && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(20px)',
                    zIndex: 9999999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                            background: 'var(--color-bg-panel)',
                            border: '1px solid var(--color-border-subtle)',
                            borderRadius: '24px', padding: '50px 40px',
                            width: '90%', maxWidth: '400px', textAlign: 'center',
                            position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowAuthModal(false)}
                            style={{
                                position: 'absolute', top: '24px', right: '24px',
                                background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
                                cursor: 'pointer', padding: '5px', transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FFF'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                        >
                            <X size={24} />
                        </button>

                        <>
                            <h2 style={{ color: 'var(--color-gold-main)', fontSize: '1.5rem', marginBottom: '15px', fontFamily: 'var(--font-brand)', fontWeight: 'bold' }}>
                                당신의 파동과 동기화합니다
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '40px', wordBreak: 'keep-all', lineHeight: 1.6 }}>
                                완벽한 프라이버시 보호를 위해<br />평소 사용하는 계정으로 1초 만에 안전하게 시작하세요.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* Kakao Sim Button */}
                                <button
                                    onClick={() => navigate('/register')}
                                    style={{
                                        background: '#FEE500', color: '#000000', border: 'none',
                                        padding: '16px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600,
                                        cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
                                        transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(254, 229, 0, 0.15)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ width: '22px', height: '22px', background: '#000', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <span style={{ color: '#FEE500', fontSize: '12px', fontWeight: 'bold' }}>K</span>
                                    </div>
                                    카카오로 3초 만에 시작하기
                                </button>

                                {/* Naver Sim Button */}
                                <button
                                    onClick={() => navigate('/register')}
                                    style={{
                                        background: '#03C75A', color: '#FFFFFF', border: 'none',
                                        padding: '16px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600,
                                        cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
                                        transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(3, 199, 90, 0.2)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ width: '22px', height: '22px', background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>N</span>
                                    </div>
                                    네이버로 3초 만에 시작하기
                                </button>

                                {/* Google Sim Button */}
                                <button
                                    onClick={() => navigate('/register')}
                                    style={{
                                        background: '#FFFFFF', color: '#000000', border: '1px solid #E2E8F0',
                                        padding: '16px', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600,
                                        cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
                                        transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(255, 255, 255, 0.05)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'conic-gradient(from 180deg at 50% 50%, #4285F4 0deg, #34A853 90deg, #FBBC05 180deg, #EA4335 270deg, #4285F4 360deg)' }}></div>
                                    구글로 3초 만에 시작하기
                                </button>
                            </div>
                        </>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
}

// Sub-component for the 12D advanced dimension cards
const DimensionCard = ({ icon, text, desc, color }: { icon: React.ReactNode, text: string, desc: string, color: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '30px 20px', background: 'var(--color-bg-panel)',
            border: `1px solid var(--color-border-subtle)`,
            borderRadius: '16px', backdropFilter: 'blur(10px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isHovered ? `0 15px 35px ${color}22` : 'var(--shadow-deep)',
            transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            cursor: 'default', minHeight: '180px', overflow: 'hidden'
        }}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
        >
            {/* Background Hover Glow */}
            <div style={{
                position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                opacity: isHovered ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: 'none'
            }}></div>

            <div style={{ color: color, marginBottom: '15px', transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s' }}>
                {icon}
            </div>
            <h4 style={{
                color: 'var(--color-text-primary)', fontSize: '1.05rem', fontWeight: 600,
                marginBottom: '10px', letterSpacing: '0px', fontFamily: 'var(--font-main)', zIndex: 1
            }}>
                {text}
            </h4>
            <p style={{
                color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.5',
                margin: 0, opacity: isHovered ? 1 : 0.7, zIndex: 1, transition: 'opacity 0.3s',
                wordBreak: 'keep-all', wordWrap: 'break-word'
            }}>
                {desc}
            </p>
        </div>
    );
};
