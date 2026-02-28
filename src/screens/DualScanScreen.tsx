import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, HeartPulse, Zap, Users, Share2, ScanFace, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const DualScanScreen = () => {
    const navigate = useNavigate();
    // 0: Form, 1: Ready to Scan, 2: Scanning, 3: Processing, 4: Result
    const [step, setStep] = useState(0);

    // Partner Form Data
    const [partnerName, setPartnerName] = useState('');
    const [partnerBirthDate, setPartnerBirthDate] = useState('');

    // Scan Data
    const [scanMode, setScanMode] = useState<'camera' | 'photo'>('camera');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [compatibility, setCompatibility] = useState<number | null>(null);
    const [elements, setElements] = useState({ element1: '', element2: '' });
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(1);
    };

    const startScan = async () => {
        setStep(2);
        if (scanMode === 'photo') {
            return; // No camera needed for photo mode
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {
            console.log("Camera access denied/failed");
        }
    };

    useEffect(() => {
        if (step === 2) {
            const interval = setInterval(() => {
                setScanProgress(p => {
                    const next = p + 1.2;
                    if (next >= 100) {
                        clearInterval(interval);
                        setStep(3); // Go to processing
                        setTimeout(showResult, 2500); // Process for 2.5s
                        return 100;
                    }
                    return next;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [step]);

    useEffect(() => {
        // cleanup video stream when component unmounts or step changes
        if (step !== 2 && videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }, [step]);

    const showResult = () => {
        // Generate a more realistic range including lower scores (40 to 99)
        const score = Math.floor(Math.random() * (99 - 40 + 1)) + 40;
        setCompatibility(score);
        const elementTypes = ['불 (열정)', '물 (포용)', '나무 (성장)', '금 (결단)', '흙 (안정)'];
        setElements({
            element1: elementTypes[Math.floor(Math.random() * elementTypes.length)],
            element2: elementTypes[Math.floor(Math.random() * elementTypes.length)]
        });
        setStep(4);
    };

    return (
        <div style={{
            width: '100vw', minHeight: '100vh',
            backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
            fontFamily: '"Noto Sans KR", sans-serif', paddingBottom: '40px', overflowX: 'hidden'
        }}>
            {/* Styles injected */}
            <style>{`
                .quantum-input {
                    width: 100%; padding: 18px 25px; background: rgba(20, 20, 30, 0.6);
                    border: 1px solid var(--color-border-subtle); border-radius: 16px;
                    color: #FFF; font-size: 1.05rem; outline: none; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); backdrop-filter: blur(10px);
                }
                .quantum-input:focus {
                    border-color: #38bdf8; background: rgba(30, 30, 45, 0.8);
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.2), 0 0 15px rgba(56, 189, 248, 0.2);
                }
                .quantum-input::placeholder { color: var(--color-text-muted); font-weight: 400; }
                ::-webkit-calendar-picker-indicator { filter: invert(0.8) sepia(1) hue-rotate(200deg) saturate(3); cursor: pointer; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes pulseGlow { 0% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.3); } 50% { box-shadow: 0 0 30px rgba(56, 189, 248, 0.8), inset 0 0 20px rgba(56, 189, 248, 0.5); } 100% { box-shadow: 0 0 10px rgba(56, 189, 248, 0.3); } }
                
                .camera-container {
                    position: relative; width: 100%; max-width: 1000px;
                    background: #000; border-radius: 24px; overflow: hidden;
                    border: 2px solid rgba(56, 189, 248, 0.4); animation: pulseGlow 2s infinite;
                    display: flex; justify-content: center; align-items: center;
                    aspect-ratio: 16/9;
                }
                .dual-reticle { position: absolute; width: 25vw; max-width: 250px; height: 40vw; max-height: 350px; border: 2px dashed rgba(56, 189, 248, 0.6); border-radius: 20px; top: 50%; transform: translateY(-50%); transition: all 0.3s; }
                .reticle-left { left: 15%; }
                .reticle-right { right: 15%; }

                @media (max-width: 768px) {
                     .camera-container { aspect-ratio: 4/5; }
                     .dual-reticle { width: 130px; height: 180px; }
                     .reticle-left { left: 8%; }
                     .reticle-right { right: 8%; }
                }
            `}</style>

            <div style={{
                padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#38bdf8', letterSpacing: '4px', fontWeight: 'bold' }}>ENERGY SYNCHRONIZATION</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '2px' }}>파동 듀얼 스캔</p>
                </div>
                <div style={{ width: '44px' }}></div> {/* Spacer */}
            </div>

            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

                {/* STEP 0: Input Form */}
                {step === 0 && (
                    <div style={{ animation: 'fadeInUp 0.5s ease', maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)' }}>
                            <Users size={40} color="#38bdf8" />
                        </div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '10px', fontWeight: 'bold' }}>타겟 파동 좌표 설정</h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '40px', wordBreak: 'keep-all' }}>
                            에너지 동기화(Energy Synchronization) 분석을 위해<br />동기화할 대상의 주파수 좌표를 정확히 입력해주세요.
                        </p>

                        <form onSubmit={handleFormSubmit} style={{ background: 'rgba(20,20,30,0.5)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                                <input
                                    type="text"
                                    placeholder="상대방 이름 (영문 또는 한글)"
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    required
                                    className="quantum-input"
                                />
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        placeholder="상대방 생년월일 (양력)"
                                        value={partnerBirthDate}
                                        onChange={(e) => setPartnerBirthDate(e.target.value)}
                                        required
                                        className="quantum-input"
                                        style={{ paddingRight: '80px' }}
                                    />
                                    <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#FFF', pointerEvents: 'none', background: 'rgba(56,189,248,0.3)', padding: '4px 8px', borderRadius: '6px' }}>필수 좌표</span>
                                </div>
                            </div>

                            <button type="submit" style={{
                                width: '100%', padding: '20px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: '#fff',
                                border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)', transition: 'transform 0.3s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <CheckCircle2 size={22} /> 좌표 입력 및 동기화 준비
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 1: Ready to Scan */}
                {step === 1 && (
                    <div style={{ animation: 'zoomIn 0.5s ease', maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)' }}>
                            <ScanFace size={40} color="#38bdf8" />
                        </div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#fff' }}>파동 간섭 패턴 분석 대기</h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '40px' }}>
                            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{partnerName}</span>님과의 데이터 좌표가 확보되었습니다.<br />원활한 듀얼 스캔을 위해 화면을 넓게 써주세요.
                        </p>

                        <div style={{ background: 'var(--color-bg-panel)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 0 40px rgba(56,189,248,0.1)' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#38bdf8', fontSize: '1.2rem' }}>
                                {scanMode === 'camera' ? '⚠️ 듀얼 스캔 행동 지침' : '🌌 비국소성 홀로그램 스캔 지침'}
                            </h3>

                            {scanMode === 'camera' ? (
                                <ul style={{ textAlign: 'left', color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '30px', fontSize: '0.95rem', paddingLeft: '20px' }}>
                                    <li>두 분의 얼굴이 카메라 프레임 안에 나란히 들어오도록 위치해주세요.</li>
                                    <li>중간에 성대 파동 오디오 수집이 시작되면, <b>동시에 혹은 번갈아가며 "아~" 소리</b>를 내어주세요.</li>
                                    <li>나의 데이터와 상대방의 데이터가 양자 단위로 교차 분석됩니다.</li>
                                </ul>
                            ) : (
                                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '30px', fontSize: '0.95rem', textAlign: 'left', wordBreak: 'keep-all' }}>
                                    "단순한 사진 한 장에도 두 사람만의 고유한 <b>에너지 주파수(Psi)</b>가 홀로그램처럼 새겨져 있습니다.<br /><br />
                                    사진을 스캔하는 순간, 시공간을 초월하여 두 사람의 파동이 얽혀있는(Entangled) 깊은 시너지가 분석됩니다."<br /><br />
                                    두 사람이 함께 있는 사진이나, 서로의 사진이 모두 포함된 이미지를 업로드하세요.
                                </p>
                            )}

                            {/* Mode Toggle */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
                                <button onClick={() => setScanMode('camera')} style={{ background: scanMode === 'camera' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', border: `1px solid ${scanMode === 'camera' ? '#38bdf8' : 'var(--color-border-subtle)'}`, color: scanMode === 'camera' ? '#38bdf8' : 'var(--color-text-muted)', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold' }}>
                                    라이브 듀얼 카메라
                                </button>
                                <button onClick={() => setScanMode('photo')} style={{ background: scanMode === 'photo' ? 'rgba(129, 140, 248, 0.2)' : 'transparent', border: `1px solid ${scanMode === 'photo' ? '#818cf8' : 'var(--color-border-subtle)'}`, color: scanMode === 'photo' ? '#818cf8' : 'var(--color-text-muted)', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold' }}>
                                    사진 홀로그램 스캔
                                </button>
                            </div>

                            {scanMode === 'photo' && !photoUrl && (
                                <div style={{ marginBottom: '30px', width: '100%' }}>
                                    <input type="file" id="dual-photo-upload" accept="image/*" onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setPhotoUrl(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }} style={{ display: 'none' }} />
                                    <label htmlFor="dual-photo-upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '2px dashed #818cf8', borderRadius: '15px', color: '#818cf8', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold' }}>
                                        <ImageIcon size={20} /> 대상 파동 사진 업로드
                                    </label>
                                </div>
                            )}
                            {scanMode === 'photo' && photoUrl && (
                                <div style={{ marginBottom: '30px', color: '#22c55e', fontSize: '0.9rem', fontWeight: 'bold' }}>✅ 듀얼 양자 추출용 데이터가 장전되었습니다</div>
                            )}

                            <button onClick={startScan} disabled={scanMode === 'photo' && !photoUrl} style={{
                                width: '100%', padding: '20px', borderRadius: '16px',
                                background: scanMode === 'photo' && !photoUrl ? 'rgba(100,100,100,0.5)' : 'transparent',
                                color: scanMode === 'photo' && !photoUrl ? '#888' : '#38bdf8',
                                border: scanMode === 'photo' && !photoUrl ? 'none' : '2px solid #38bdf8',
                                fontSize: '1.2rem', fontWeight: 'bold', cursor: scanMode === 'photo' && !photoUrl ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                                onMouseEnter={(e) => { if (scanMode === 'camera' || photoUrl) { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(56, 189, 248, 0.2)'; } }}
                                onMouseLeave={(e) => { if (scanMode === 'camera' || photoUrl) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; } }}
                            >
                                <Zap size={22} /> 파동 융합 렌즈 가동
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Scanning Sequence (Wide View) */}
                {step === 2 && (
                    <div style={{ animation: 'fadeInUp 0.5s ease', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: '0 0 20px 0', color: '#38bdf8', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles className="spin-slow" /> 파동 간섭 패턴 분석 모드 가동 중
                        </h2>

                        <div className="camera-container">
                            {scanMode === 'photo' && photoUrl ? (
                                <img ref={imageRef} src={photoUrl} alt="Dual Hologram" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: 0.6, mixBlendMode: 'screen' }} crossOrigin="anonymous" />
                            ) : (
                                <video ref={videoRef} playsInline autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: 0.6, mixBlendMode: 'screen' }} />
                            )}

                            {/* Dual Targeted Reticles */}
                            <div className="dual-reticle reticle-left" style={{ borderColor: scanProgress > 30 ? '#22C55E' : 'rgba(56, 189, 248, 0.6)' }}>
                                <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', color: '#FFF', fontSize: '0.9rem', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.2)' }}>본인(Host)</div>
                            </div>
                            <div className="dual-reticle reticle-right" style={{ borderColor: scanProgress > 30 ? '#22C55E' : 'rgba(56, 189, 248, 0.6)' }}>
                                <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', color: '#FFF', fontSize: '0.9rem', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap', border: '1px solid #38bdf8' }}>{partnerName}(Target)</div>
                            </div>

                            {/* Vocal Prompt Overlay - Appears at ~50% */}
                            {scanProgress > 50 && scanProgress < 90 && (
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    background: 'rgba(20,20,30,0.85)', backdropFilter: 'blur(10px)',
                                    padding: '30px 40px', borderRadius: '20px', border: '1px solid #38bdf8',
                                    textAlign: 'center', zIndex: 10, animation: 'zoomIn 0.3s ease'
                                }}>
                                    <h3 style={{ color: '#38bdf8', fontSize: '1.8rem', margin: '0 0 10px 0', fontWeight: 'bold' }}>성대 파동 동기화</h3>
                                    <p style={{ color: '#FFF', fontSize: '1.1rem', margin: '0 0 20px 0' }}>두 분이 동시에 혹은 차례로 <strong>"아~"</strong> 소리를 내주세요.</p>
                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', height: '40px', alignItems: 'flex-end' }}>
                                        {new Array(10).fill(0).map((_, i) => (
                                            <div key={i} style={{ width: '8px', background: '#38bdf8', borderRadius: '4px', height: `${Math.random() * 40 + 10}px`, transition: 'height 0.1s ease', boxShadow: '0 0 10px #38bdf8' }}></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Footer inside Video */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFF', fontSize: '0.9rem', marginBottom: '10px' }}>
                                    <span>양자 얽힘 동기화 프로세스</span>
                                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Math.floor(scanProgress)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${scanProgress}%`, background: scanProgress > 90 ? '#22c55e' : '#38bdf8', transition: 'width 0.1s linear, background 0.5s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Processing */}
                {step === 3 && (
                    <div style={{ animation: 'zoomIn 0.5s ease', marginTop: '100px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyItems: 'center', opacity: 0.5, animation: 'pulse 1s infinite' }}><ScanFace size={40} color="#fff" style={{ margin: '0 auto' }} /></div>
                            <Zap size={40} color="#38bdf8" style={{ animation: 'pulseGlow 1.5s infinite' }} />
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #38bdf8', display: 'flex', alignItems: 'center', justifyItems: 'center', opacity: 0.5, animation: 'pulse 1s infinite reverse' }}><ScanFace size={40} color="#38bdf8" style={{ margin: '0 auto' }} /></div>
                        </div>
                        <h2 style={{ color: '#FFF', fontSize: '1.5rem', letterSpacing: '4px' }}>[Host] ⇄ [Target] 데이터 융합 중</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>수백만 개의 파동 벡터가 상호 간섭 패턴을 형성합니다...</p>
                    </div>
                )}

                {/* STEP 4: Result */}
                {step === 4 && compatibility && (
                    <div style={{ animation: 'zoomIn 0.8s ease' }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: '5px', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            에너지 호환성 테스트 결과
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>두 사람의 에너지 파동이 만났을 때...</p>

                        <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 40px' }}>
                            <div style={{ position: 'absolute', inset: 10, background: 'var(--color-bg-panel)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, border: '2px solid rgba(255,255,255,0.1)' }}>
                                <HeartPulse size={30} color="#38bdf8" style={{ marginBottom: '10px' }} />
                                <span style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{compatibility}%</span>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '2px', marginTop: '8px' }}>RESONANCE</span>
                            </div>
                            <div style={{ position: 'absolute', inset: 0, border: '2px dashed #38bdf8', borderRadius: '50%', opacity: 0.5, animation: 'spin 10s linear infinite' }} />
                            <div style={{ position: 'absolute', inset: -15, border: '2px dashed #818cf8', borderRadius: '50%', opacity: 0.3, animation: 'spin 15s linear infinite reverse' }} />
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '30px' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#FFF' }}>에너지 시너지 요약</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#FFF', fontSize: '0.8rem', marginBottom: '8px', opacity: 0.7 }}>본인(Host)</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#38bdf8' }}>{elements.element1}</div>
                                </div>
                                <Zap size={24} color="#fbbf24" style={{ animation: 'pulse 2s infinite' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#FFF', fontSize: '0.8rem', marginBottom: '8px', opacity: 0.7 }}>{partnerName}(Target)</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#818cf8' }}>{elements.element2}</div>
                                </div>
                            </div>
                            <p style={{ marginTop: '25px', fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                                {compatibility >= 90 ? '영혼의 단짝 수준입니다. 서로의 부족한 파동을 완전히 채워주는 환상적인 공명 상태입니다.' :
                                    compatibility >= 75 ? '매우 좋은 궁합입니다. 서로에게 긍정적인 스파크를 일으키는 조화로운 주파수입니다.' :
                                        compatibility >= 60 ? '잔잔하고 무난한 관계입니다. 서로의 다름을 이해하기 위한 약간의 양자 조율이 필요합니다.' :
                                            '상호 간섭 패턴이 강하게 충돌하고 있습니다. 관계 개선을 위해 서로의 주파수 파악과 깊은 이해가 절실히 요구되는 상태입니다.'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                            <button onClick={() => navigate('/dual-tarot', { state: { partnerName, compatibility } })} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #f472b6, #818cf8)', color: '#FFF', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 5px 20px rgba(244,114,182,0.4)', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <Sparkles size={22} /> [ {partnerName} ]님과의 듀얼 타로 매칭하기
                            </button>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', width: '100%' }}>
                                <button onClick={() => { setStep(0); setCompatibility(null); }} style={{ padding: '16px', borderRadius: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.1rem', cursor: 'pointer', flex: 1, transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    새로운 파동 스캔
                                </button>
                                <button style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: '#FFF', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 5px 15px rgba(56,189,248,0.3)', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <Share2 size={20} /> 결과 공유
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
            .spin-slow { animation: spin 3s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px #fff); } 50% { opacity: 0.5; filter: none;} }
            `}</style>
        </div>
    );
};

export default DualScanScreen;
