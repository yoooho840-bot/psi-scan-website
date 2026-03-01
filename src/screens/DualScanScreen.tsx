import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, HeartPulse, Zap, Users, Share2, ScanFace, CheckCircle2, Image as ImageIcon, MessageCircle, BarChart as BarChartIcon, Target, BrainCircuit } from 'lucide-react';
import { tarotDeck, type TarotCard } from '../data/tarotData';

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
    const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
    const [dimensionScores, setDimensionScores] = useState({
        spiritual: 0,
        emotional: 0,
        intellectual: 0,
        physical: 0
    });
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

        // Generate multi-dimensional scores
        setDimensionScores({
            spiritual: Math.floor(Math.random() * 40) + 60,
            emotional: Math.floor(Math.random() * 40) + 60,
            intellectual: Math.floor(Math.random() * 40) + 60,
            physical: Math.floor(Math.random() * 40) + 60
        });

        // Draw 4 Tarot Cards automatically
        const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
        setDrawnCards(shuffled.slice(0, 4));

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
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    color: #111111;
                    padding: 15px 20px;
                    border-radius: 12px;
                    font-size: 1rem;
                    width: 100%;
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
                }
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
                    <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#38bdf8', letterSpacing: '4px', fontWeight: 'bold' }}>TAROT DUAL SCAN</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '2px' }}>타로 듀얼 스캔</p>
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
                            에너지 동기화(Energy Synchronization) 분석을 위해<br />동기화할 대상의 파동 좌표를 정확히 입력해주세요.
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
                                        type="tel"
                                        pattern="[0-9]{8}"
                                        maxLength={8}
                                        placeholder="상대방 생년월일 8자리 (예: 19900101)"
                                        value={partnerBirthDate}
                                        onChange={(e) => setPartnerBirthDate(e.target.value.replace(/[^0-9]/g, ''))}
                                        required
                                        className="quantum-input"
                                        style={{ paddingRight: '100px' }}
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
                                    "단순한 사진 한 장에도 두 사람만의 고유한 <b>에너지 파동(Psi)</b>가 홀로그램처럼 새겨져 있습니다.<br /><br />
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

                {/* STEP 4: Comprehensive Multi-dimensional Result */}
                {step === 4 && compatibility && (
                    <div style={{ animation: 'zoomIn 0.8s ease', maxWidth: '900px', margin: '0 auto' }}>

                        {/* Header Section */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', background: 'linear-gradient(90deg, #38bdf8, #818cf8, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                                듀얼 파동 역학 보고서
                            </h1>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                                [{partnerName}]님과의 심층 에너지 호환성 분석이 완료되었습니다.
                            </p>
                        </div>

                        {/* Top: Core Resonance */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                            {/* Resonance Score Circle */}
                            <div className="glass-card" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(20, 20, 30, 0.6)', backdropFilter: 'blur(20px)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <HeartPulse size={24} color="#38bdf8" />
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFF' }}>종합 공명 지수 (Resonance Core)</h3>
                                </div>
                                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 20px' }}>
                                    <div style={{ position: 'absolute', inset: 10, background: 'var(--color-bg-panel)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, border: '2px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                        <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: '#FFF', textShadow: '0 0 20px rgba(56,189,248,0.5)' }}>{compatibility}%</span>
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, border: '4px solid #38bdf8', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 3s linear infinite' }} />
                                    <div style={{ position: 'absolute', inset: -15, border: '2px dashed #818cf8', borderRadius: '50%', opacity: 0.5, animation: 'spin 15s linear infinite reverse' }} />
                                </div>
                            </div>

                            {/* Multi-Dimensional Analytics Line Bars */}
                            <div className="glass-card" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(129, 140, 248, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(20, 20, 30, 0.6)', backdropFilter: 'blur(20px)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                    <BarChartIcon size={24} color="#818cf8" />
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFF' }}>다각적 차원 분석 (Dimension Sync)</h3>
                                </div>

                                {[
                                    { label: '영적 연결 (Spiritual Sync)', val: dimensionScores.spiritual, color: '#c084fc' },
                                    { label: '감정 동기화 (Emotional Sync)', val: dimensionScores.emotional, color: '#f472b6' },
                                    { label: '지적 교감 (Intellectual Sync)', val: dimensionScores.intellectual, color: '#38bdf8' },
                                    { label: '물리적 에너지 (Physical Sync)', val: dimensionScores.physical, color: '#4ade80' }
                                ].map((dim, i) => (
                                    <div key={i} style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#E2E8F0', fontWeight: 'bold' }}>
                                            <span>{dim.label}</span>
                                            <span style={{ color: dim.color }}>{dim.val}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${dim.val}%`, height: '100%', background: dim.color, borderRadius: '4px', boxShadow: `0 0 10px ${dim.color}` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Middle: Synergy Interpretation */}
                        <div className="glass-card" style={{ background: 'rgba(25, 25, 35, 0.8)', padding: '35px', borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.3)', marginBottom: '40px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <BrainCircuit size={26} color="#fbbf24" />
                                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#FFF' }}>에너지 원소 및 간섭 패턴</h3>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginBottom: '25px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px' }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>나의 본질 주파수</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#38bdf8', textShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>{elements.element1}</div>
                                </div>
                                <div style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%' }}>
                                    <Zap size={28} color="#fbbf24" style={{ animation: 'pulse 2s infinite' }} />
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>[{partnerName}]님의 주파수</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#818cf8', textShadow: '0 0 10px rgba(129, 140, 248, 0.5)' }}>{elements.element2}</div>
                                </div>
                            </div>

                            <h4 style={{ color: '#FFF', marginBottom: '10px', fontSize: '1.1rem' }}>패턴 분석 결과:</h4>
                            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, wordBreak: 'keep-all', margin: 0 }}>
                                {compatibility >= 90 ? '영혼의 단짝 수준입니다. 두 원소가 기막힌 조화를 이루며 서로의 부족한 파동을 완전히 채워주는 환상적인 конструк(건설적) 간섭 상태입니다.' :
                                    compatibility >= 75 ? '매우 좋은 궁합입니다. 서로에게 긍정적인 스파크를 일으키며 성장을 돕는 조화로운 파동 얽힘을 보여줍니다.' :
                                        compatibility >= 60 ? '안정적이지만 섬세한 조율이 필요한 관계입니다. 양측이 주파수를 맞추기 위해 상호 배려와 커뮤니케이션 양자 튜닝이 요구됩니다.' :
                                            '상호 간섭 패턴이 주기적으로 충돌(Destructive Interference)하고 있습니다. 관계 개선을 위해 깊은 내면의 상처 치유와 서로의 파동 형질에 대한 극적인 이해가 절실히 요구되는 상태입니다.'}
                            </p>
                        </div>

                        {/* Cards: Dual Tarot Oracle reading integrated */}
                        {drawnCards.length === 4 && (
                            <div className="glass-card" style={{ padding: '40px 30px', borderRadius: '24px', border: '1px solid rgba(244, 114, 182, 0.3)', marginBottom: '40px', background: 'rgba(20, 20, 30, 0.6)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
                                    <Target size={28} color="#f472b6" />
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#FFF' }}>듀얼 타로 오라클 리딩</h3>
                                </div>
                                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px', fontSize: '1rem' }}>
                                    양자 난수(Quantum RNG) 추출을 통해 동기화된 두 사람의 에너지 궤적입니다.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    {[
                                        { title: '나의 현재 파동', card: drawnCards[0], color: '#38bdf8' },
                                        { title: '상대의 무의식', card: drawnCards[1], color: '#818cf8' },
                                        { title: '현재의 얽힘', card: drawnCards[2], color: '#fbbf24' },
                                        { title: '관계의 미래 역학', card: drawnCards[3], color: '#f472b6' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', border: `1px solid ${item.color}40`, transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <div style={{ color: item.color, fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '15px', padding: '5px 10px', background: `${item.color}15`, borderRadius: '20px' }}>
                                                {item.title}
                                            </div>
                                            <div style={{ width: '120px', height: '180px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${item.color}`, marginBottom: '15px' }}>
                                                <img src={`/assets/tarot/${item.card.imgFileName}`} alt={item.card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <h4 style={{ color: '#FFF', margin: '0 0 5px 0', fontSize: '1.1rem' }}>{item.card.name}</h4>
                                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {item.card.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prominent Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
                            <button
                                onClick={() => navigate('/chat', { state: { tarotCards: drawnCards, partnerName, compatibility, context: 'dual_tarot' } })}
                                style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#FFF', border: '1px solid #34d399', fontSize: '1.3rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)', transition: 'all 0.3s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.6)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.4)'; }}
                            >
                                <MessageCircle size={28} /> AI 가이드와 이 결과 심층 상담하기
                            </button>

                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', width: '100%' }}>
                                <button onClick={() => { setStep(0); setCompatibility(null); setDrawnCards([]); }} style={{ padding: '16px', borderRadius: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.1rem', cursor: 'pointer', flex: 1, transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    처음으로 돌아가기
                                </button>
                                <button style={{ padding: '16px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
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
