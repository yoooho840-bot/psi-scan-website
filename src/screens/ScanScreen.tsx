import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, Home, Fingerprint, ShieldAlert, Waves, Image as ImageIcon } from 'lucide-react';
import { BioScannerService } from '../services/BioScannerService';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
        FaceMesh: any;
        Camera: any;
        drawConnectors: any;
        FACEMESH_TESSELATION: any;
        FACEMESH_RIGHT_EYE: any;
        FACEMESH_LEFT_EYE: any;
        FACEMESH_LIPS: any;
    }
}

const TelemetryRow = ({ label, value, status }: { label: string, value: string | number, status: 'good' | 'warn' | 'error' | 'active' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"Noto Sans KR", sans-serif' }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', letterSpacing: '1px' }}>{label}</span>
        <span style={{
            color: status === 'good' ? 'var(--color-success-green)' :
                status === 'warn' ? '#F59E0B' :
                    status === 'error' ? '#EF4444' : '#FFF',
            fontWeight: 'bold', fontSize: '1rem',
            textShadow: status === 'active' ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
            fontFamily: 'var(--font-mono)'
        }}>
            {value}
        </span>
    </div>
);

const ScanScreen = () => {
    const navigate = useNavigate();
    const [scanStarted, setScanStarted] = useState(false);
    const [scanMode, setScanMode] = useState<'camera' | 'photo'>('camera');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);
    const [scanPhase, setScanPhase] = useState(0); // 0: Idle, 1: VSA/Thermal, 2: FACS/rPPG
    const [statusText, setStatusText] = useState("INITIALIZING SECURE LINK...");
    const [isCameraReady, setIsCameraReady] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

    // Bio Scanner Service Ref
    const scannerServiceRef = useRef<BioScannerService | null>(null);

    // VSA Data State
    const [vsaScore, setVsaScore] = useState(0);
    const [audioFrequencies, setAudioFrequencies] = useState<number[]>(new Array(16).fill(0));
    const animationFrameIdRef = useRef<number | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    const [factCount, setFactCount] = useState(2048);

    useEffect(() => {
        if (progress >= 100) {
            if (scannerServiceRef.current) {
                const seeds = scannerServiceRef.current.extractBioSeeds();
                localStorage.setItem('psi_bio_seeds', JSON.stringify(seeds));
            }
            // Save the VSA score to local storage so the ResultScreen or QuantumReport can use it
            localStorage.setItem('last_vsa_score', vsaScore.toFixed(1));
            setTimeout(() => navigate('/result'), 1500);
        }
    }, [progress, navigate, vsaScore]);

    useEffect(() => {
        if (!scanStarted || scanError) return;

        // Decouple progress from camera FPS. Make the total scan exactly ~12.5 seconds.
        // 12500 ms / 50ms per tick = 250 ticks. 100 / 250 = 0.4 progress per tick.
        const tickRate = 50;
        const progressIncrement = 0.4;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + progressIncrement;
                progressRef.current = next; // Update ref for faceMesh.onResults
                return next >= 100 ? 100 : next;
            });
            setFactCount(prev => Math.min(prev + Math.floor(Math.random() * 800), 1024000));
        }, tickRate);

        return () => clearInterval(interval);
    }, [scanStarted]);

    useEffect(() => {
        if (!scanStarted) return;

        if (progress > 0 && progress <= 30 && scanPhase !== 1) {
            setScanPhase(1);
            setStatusText('[PHASE 1] rPPG 동적 진피층 혈류 맵핑 진행 중...');
        } else if (progress > 30 && progress <= 70 && scanPhase !== 2) {
            setScanPhase(2);
            setStatusText('[PHASE 2] 미세 표정 신경 패턴 및 동공 반응 벡터화 완료.');
        } else if (progress > 70 && progress < 95 && scanPhase !== 3) {
            setScanPhase(3);
            setStatusText('[PHASE 3] 성대 바이오마커 수집... 3초간 "아~" 소리를 내주세요.');
        } else if (progress >= 95 && progress < 100) {
            setStatusText('[PHASE 3] 심층 에너지 필드 융합 연산 및 파동 동기화 중...');
            // The following lines were removed to maintain syntactic correctness and avoid infinite loops:
            // setProgress(68);
            // await wait(1800);
            // setStatusText('✅ 생체 파동 에너지 동기화 완료.');
        } else if (progress >= 100) {
            setStatusText('✅ 생체 파동 에너지 동기화 완료.');
        }
    }, [progress, scanPhase, scanStarted]);

    // Matrix Rain Background Effect
    useEffect(() => {
        const canvas = matrixCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const charString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~ΨΔΩ";
        const characters = charString.split("");
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) drops[x] = 1;

        const draw = () => {
            ctx.fillStyle = "rgba(5, 5, 7, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dynamically change matrix color based on phase
            let tc = "#DAA520";
            if (scanPhase === 1) tc = "#EF4444";
            else if (scanPhase === 2) tc = "#22C55E";
            else if (scanPhase === 3) tc = "#3B82F6";

            ctx.fillStyle = tc;
            ctx.font = fontSize + "px 'Space Mono'";

            for (let i = 0; i < drops.length; i++) {
                const text = characters[Math.floor(Math.random() * characters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);
        return () => clearInterval(interval);
    }, [scanPhase]);


    // FaceMesh & VSA Audio Logic
    useEffect(() => {
        if (!scanStarted) return;

        const sfx = new Audio('/scanner_sound.mp3');
        sfx.loop = true;
        sfx.volume = 0.2;
        sfx.play().catch(() => { });

        // @ts-ignore
        const faceMesh = new window.FaceMesh({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results: any) => {
            if (!canvasRef.current || !videoRef.current) return;
            const canvasCtx = canvasRef.current.getContext('2d');
            if (!canvasCtx) return;

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                if (!isCameraReady) setIsCameraReady(true);

                const p = progressRef.current; // Use ref for current progress
                for (const landmarks of results.multiFaceLandmarks) {
                    if (p <= 33) {
                        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, { color: 'rgba(239, 68, 68, 0.8)', lineWidth: 1.0 });
                        // Add glowing joints
                        canvasCtx.fillStyle = 'rgba(239, 68, 68, 1)';
                        for (let i = 0; i < landmarks.length; i += 10) {
                            canvasCtx.fillRect(landmarks[i].x * canvasRef.current.width, landmarks[i].y * canvasRef.current.height, 2, 2);
                        }
                    } else if (p <= 66) {
                        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, { color: 'rgba(34, 197, 94, 0.4)', lineWidth: 0.5 });
                        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_LIPS, { color: 'rgba(34, 197, 94, 1)', lineWidth: 2 });
                    } else {
                        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, { color: 'rgba(59, 130, 246, 0.4)', lineWidth: 0.5 });
                        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_RIGHT_EYE, { color: 'rgba(59, 130, 246, 1)', lineWidth: 2.5 });
                        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_LEFT_EYE, { color: 'rgba(59, 130, 246, 1)', lineWidth: 2.5 });
                    }
                }
            }
            canvasCtx.restore();
        });

        let camera: any = null;
        let localMediaStream: MediaStream | null = null;

        const analyzeAudio = () => {
            if (!scannerServiceRef.current) return;
            const data = scannerServiceRef.current.analyzeAudioFrame();

            if (data && data.uiBars) {
                setAudioFrequencies(data.uiBars);
                let rawScore = 0;
                for (let i = 3; i < 8; i++) {
                    rawScore += data.uiBars[i] || 0;
                }
                setVsaScore((prev) => prev + (Math.min((rawScore / (5 * 255)) * 100, 100) - prev) * 0.1);
            }

            if (videoRef.current && scanMode === 'camera') {
                scannerServiceRef.current.analyzeVideoFrame(videoRef.current);
            }

            animationFrameIdRef.current = requestAnimationFrame(analyzeAudio);
        };

        const initSensors = async () => {
            try {
                if (scanMode === 'photo' && imageRef.current) {
                    // Simulate audio for UI
                    const simulateAudio = () => {
                        let rawScore = 0;
                        const bars = [];
                        for (let i = 0; i < 16; i++) {
                            const val = Math.random() * 255;
                            bars.push(val);
                            if (i > 2 && i < 8) rawScore += val;
                        }
                        setAudioFrequencies(bars);
                        setVsaScore((prev) => prev + (Math.min((rawScore / (5 * 255)) * 100, 100) - prev) * 0.1);
                        animationFrameIdRef.current = requestAnimationFrame(simulateAudio);
                    };
                    simulateAudio();

                    // Send image repeatedly to FaceMesh to match progress animation
                    camera = { stop: () => clearInterval(simInterval) };
                    const simInterval = setInterval(async () => {
                        if (imageRef.current) await faceMesh.send({ image: imageRef.current });
                    }, 150);

                    setIsCameraReady(true);
                    return;
                }

                // Request BOTH Video and Audio using BioScannerService
                const service = new BioScannerService();
                scannerServiceRef.current = service;
                localMediaStream = await service.startSensors();

                analyzeAudio();

                // --- Video Setup ---
                if (videoRef.current) {
                    videoRef.current.srcObject = localMediaStream;
                    camera = new window.Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current) await faceMesh.send({ image: videoRef.current });
                        },
                        width: 800,
                        height: 800
                    });
                    camera.start();
                }
            } catch (err) {
                console.error("Sensor Init Error:", err);
                setStatusText("카메라 및 마이크 접근 권한이 거부되었습니다.");
                setScanError("카메라 또는 마이크 접근이 브라우저에 의해 차단되었습니다. 브라우저 주소창의 권한 아이콘을 클릭하여 허용으로 변경 후 새로고침 해주세요.");
                setScanStarted(false);
            }
        };

        // Delay slightly for effect before prompting permissions
        setTimeout(() => initSensors(), 1000);

        return () => {
            if (camera) camera.stop();
            faceMesh.close();
            if (scannerServiceRef.current) scannerServiceRef.current.stopAll();
            else if (localMediaStream) localMediaStream.getTracks().forEach((t: any) => t.stop());
            sfx.pause();

            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, [scanStarted]); // Only run when scan starts

    // Render Audio Bars Component
    const renderVSABars = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '50px', gap: '4px', marginTop: '12px' }}>
                {audioFrequencies.map((val, idx) => {
                    const h = Math.max(4, (val / 255) * 50); // 0 to 50px height based on amplitude
                    const isVocalRange = idx > 2 && idx < 8;
                    const color = isVocalRange ? 'var(--color-gold-main)' : 'var(--color-blue-mystic)';
                    return (
                        <div key={idx} style={{
                            flex: 1, height: `${h}px`, backgroundColor: color,
                            borderRadius: '3px', transition: 'height 0.1s ease',
                            opacity: val > 10 ? 1 : 0.4
                        }} />
                    );
                })}
            </div>
        );
    }

    return (
        <div className="custom-scrollbar" style={{
            width: '100%', minHeight: '100vh',
            backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
            position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
            {/* Matrix Background */}
            <canvas ref={matrixCanvasRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15, pointerEvents: 'none', zIndex: 0 }} />

            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(240,240,243,0.8) 80%)',
                zIndex: 1, pointerEvents: 'none'
            }}></div>

            {/* Header */}
            <div style={{
                position: 'relative', zIndex: 10, padding: '20px 40px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid var(--color-border-subtle)',
                background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)'
            }}>
                <button onClick={() => window.location.href = '/'} style={{
                    background: 'transparent', border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', padding: '12px 24px', borderRadius: '10px', transition: 'all 0.3s'
                }} className="primary-btn glass-panel">
                    <Home size={20} /> <span style={{ fontSize: '1rem', letterSpacing: '2px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold' }}>중단</span>
                </button>

                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2 className="glitch-text" data-text="PSI 에너지 필드 리더" style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '6px', fontWeight: 600, color: 'var(--color-gold-main)', fontFamily: '"Noto Sans KR", sans-serif' }}>
                        PSI 에너지 필드 리더
                    </h2>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-success-green)', fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '1px' }}>● 군사 등급 암호화 적용</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-blue-mystic)', fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '1px' }}>● 심층 에너지 링크 활성화</span>
                    </div>
                </div>

                <button onClick={() => navigate('/result')} style={{
                    background: 'rgba(218, 165, 32, 0.1)', border: '1px solid var(--color-gold-muted)',
                    color: 'var(--color-gold-light)', cursor: 'pointer', padding: '12px 24px', borderRadius: '10px',
                    fontSize: '0.9rem', letterSpacing: '2px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold'
                }} className="primary-btn">
                    수동 재설정 ❯
                </button>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch',
                padding: 'min(4vw, 30px) min(5vw, 40px)', position: 'relative', zIndex: 10, gap: 'min(4vw, 40px)'
            }}>

                {/* Left Telemetry Panel */}
                <div className="glass-panel" style={{
                    flex: '1 1 320px', maxWidth: '400px', borderRadius: '15px', padding: '30px',
                    display: 'flex', flexDirection: 'column', gap: '30px',
                    border: '1px solid rgba(58, 114, 184, 0.4)',
                    boxShadow: 'inset 0 0 40px rgba(58, 114, 184, 0.05), 0 5px 20px rgba(0,0,0,0.05)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(245,245,250,0.9) 100%)'
                }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-blue-mystic)', letterSpacing: '4px', margin: 0, borderBottom: '1px solid rgba(58, 114, 184, 0.4)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', textShadow: '0 0 10px rgba(58, 114, 184, 0.5)', fontWeight: 'bold', fontFamily: '"Noto Sans KR", sans-serif' }}>
                        <ShieldAlert size={20} /> 시스템 텔레메트리
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', background: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <TelemetryRow label="대상 인식" value={isCameraReady ? "고정 완료" : "스캔 중..."} status={isCameraReady ? 'good' : 'warn'} />
                        <TelemetryRow label="네트워크 지연" value="12ms" status="good" />
                        <TelemetryRow label="양자 얽힘 동기화" value={`${Math.min(100, Math.floor(progress * 1.5))}%`} status="active" />
                        <TelemetryRow label="암호화 규격" value="AES-256-GCM" status="good" />
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', letterSpacing: '2px', margin: 0, fontWeight: 'bold', fontFamily: '"Noto Sans KR", sans-serif' }}>활성 바이오 센서 (7)</h4>
                            <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', marginLeft: '15px' }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '5px' }}>
                            <TechGraphRow name="1. 생체 광자 공명" active={progress > 0} type="wave" color="var(--color-success-green)" />
                            <TechGraphRow name="2. 신경 언어 파동망" active={progress > 15} type="matrix" color="var(--color-blue-mystic)" />
                            <TechGraphRow name="3. 양자 맥박 부호" active={progress > 30} type="pulse" color="#EF4444" />
                            <TechGraphRow name="4. 피하 진동 주파수" active={progress > 45} type="bars" color="var(--color-gold-main)" />
                            <TechGraphRow name="5. 생체 열역학 오라" active={progress > 60} type="matrix" color="#F97316" />
                            <TechGraphRow name="6. 음성 주파수 공명" active={progress > 75} type="wave" color="var(--color-gold-main)" />
                            <TechGraphRow name="7. 망막-대뇌 동기화" active={progress > 85} type="bars" color="var(--color-blue-mystic)" />
                        </div>
                    </div>
                </div>

                {/* Center Camera Area */}
                <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '50vh' }}>
                    <div className={`scanner-lens-container active-scan-${scanPhase}`} style={{
                        width: 'min(90vw, 800px)', height: 'min(90vw, 800px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                    }}>
                        {scanStarted ? (
                            <>
                                <div className="reticle-ring r1"></div>
                                <div className="reticle-ring r2"></div>
                                <div className="reticle-ring r3"></div>
                                {scanPhase > 0 && <div className="scanning-line"></div>}

                                {scanMode === 'photo' && photoUrl ? (
                                    <img ref={imageRef} src={photoUrl} alt="Hologram" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: 0.6, mixBlendMode: 'screen' }} crossOrigin="anonymous" />
                                ) : (
                                    <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: 0.6, mixBlendMode: 'screen' }} playsInline muted autoPlay />
                                )}
                                <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, transform: 'scaleX(-1)' }} width={800} height={800} />

                                {!isCameraReady && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Fingerprint size={56} color="rgba(218, 165, 32, 0.5)" style={{ animation: 'pulse 2s infinite', margin: '0 auto 15px' }} />
                                            <p style={{ color: 'var(--color-gold-main)', letterSpacing: '4px', fontSize: '1rem', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold' }}>렌즈 영점 조절 중...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Phase 3 Vocal Prompt Overlay */}
                                {scanPhase === 3 && (
                                    <div style={{
                                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 30,
                                        background: 'rgba(20, 20, 30, 0.85)', backdropFilter: 'blur(10px)',
                                        animation: 'fadeIn 0.5s ease', borderRadius: '50%'
                                    }}>
                                        <h2 style={{ color: 'var(--color-success-green)', fontSize: '3rem', margin: '0 0 10px 0', textShadow: '0 0 20px var(--color-success-green)', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold' }}>
                                            "아~" 소리를 내주세요
                                        </h2>
                                        <p style={{ color: '#FFF', fontSize: '1.2rem', margin: 0, fontFamily: '"Noto Sans KR", sans-serif' }}>성대 파동을 추출하고 있습니다</p>

                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px', height: '60px', marginTop: '30px' }}>
                                            {audioFrequencies.slice(0, 10).map((freq, i) => (
                                                <div
                                                    key={`overlay-freq-${i}`}
                                                    style={{
                                                        width: '12px', background: 'var(--color-success-green)', borderRadius: '4px',
                                                        height: `${Math.max(10, (freq / 255) * 60)}px`,
                                                        transition: 'height 0.1s ease',
                                                        boxShadow: '0 0 10px var(--color-success-green)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', zIndex: 10, padding: '50px', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(218,165,32,0.4)', boxShadow: '0 0 50px rgba(0,0,0,0.1)' }}>
                                <div style={{
                                    fontSize: '80px', color: 'var(--color-gold-main)',
                                    marginBottom: '30px', opacity: 0.9,
                                    filter: 'drop-shadow(0 0 15px rgba(218, 165, 32, 0.7))',
                                    fontFamily: 'serif', lineHeight: 1
                                }}>
                                    Ψ
                                </div>
                                <h1 style={{ color: 'var(--color-text-primary)', fontSize: '1.8rem', letterSpacing: '4px', margin: '0 0 15px 0', fontFamily: '"Noto Sans KR", sans-serif', textShadow: '0 0 20px rgba(255,255,255,0.3)', fontWeight: 'bold' }}>Psi(프사이) 에너지 필드 스캔</h1>

                                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '30px', maxWidth: '400px', lineHeight: 1.8, fontFamily: '"Noto Sans KR", sans-serif', wordBreak: 'keep-all' }}>
                                    {scanMode === 'camera'
                                        ? "중앙 십자선 안에 얼굴을 위치시키면 다중 스펙트럼 분석이 시작됩니다."
                                        : "사진 속에는 당신 고유의 에너지장(Psi)이 홀로그램처럼 고스란히 담겨있습니다. 시공간을 넘어 깊은 내면 주파수를 스캔합니다."
                                    }
                                </p>

                                {/* Mode Toggle */}
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                                    <button onClick={() => setScanMode('camera')} style={{ background: scanMode === 'camera' ? 'rgba(218, 165, 32, 0.2)' : 'transparent', border: `1px solid ${scanMode === 'camera' ? 'var(--color-gold-main)' : 'var(--color-border-subtle)'}`, color: scanMode === 'camera' ? 'var(--color-gold-main)' : 'var(--color-text-muted)', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold' }}>
                                        라이브 망막 스캔
                                    </button>
                                    <button onClick={() => setScanMode('photo')} style={{ background: scanMode === 'photo' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', border: `1px solid ${scanMode === 'photo' ? 'var(--color-blue-mystic)' : 'var(--color-border-subtle)'}`, color: scanMode === 'photo' ? 'var(--color-blue-mystic)' : 'var(--color-text-muted)', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold' }}>
                                        사진 홀로그램 스캔
                                    </button>
                                </div>

                                {scanMode === 'photo' && !photoUrl && (
                                    <div style={{ marginBottom: '30px', width: '100%', maxWidth: '300px' }}>
                                        <input type="file" id="photo-upload" accept="image/*" onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPhotoUrl(URL.createObjectURL(e.target.files[0]));
                                                // Optional: Set a dummy photo File state if needed for backend upload later
                                            }
                                        }} style={{ display: 'none' }} />
                                        <label htmlFor="photo-upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--color-blue-mystic)', borderRadius: '15px', color: 'var(--color-blue-mystic)', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold' }}>
                                            <ImageIcon size={20} /> 대상 사진 파일 업로드
                                        </label>
                                    </div>
                                )}
                                {scanMode === 'photo' && photoUrl && (
                                    <div style={{ marginBottom: '30px', color: 'var(--color-success-green)', fontSize: '0.9rem', fontWeight: 'bold' }}>✅ 파동 추출용 데이터가 장전되었습니다</div>
                                )}

                                <button onClick={() => setScanStarted(true)} disabled={scanMode === 'photo' && !photoUrl} className="primary-btn" style={{
                                    background: scanMode === 'photo' && !photoUrl ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg,rgba(218, 165, 32, 0.2), rgba(184, 139, 74, 0.4))', color: '#FFF',
                                    padding: '24px 50px', border: scanMode === 'photo' && !photoUrl ? 'none' : '2px solid var(--color-gold-main)', borderRadius: '40px',
                                    fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '2px', fontFamily: '"Noto Sans KR", sans-serif',
                                    boxShadow: scanMode === 'photo' && !photoUrl ? 'none' : 'var(--glow-gold-intense)', display: 'flex', alignItems: 'center', gap: '12px',
                                    cursor: scanMode === 'photo' && !photoUrl ? 'not-allowed' : 'pointer'
                                }}>
                                    <ScanFace size={24} /> Psi 스캔 시작
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Data Panel */}
                <div className="glass-panel" style={{
                    flex: '1 1 320px', maxWidth: '400px', borderRadius: '15px', padding: '30px',
                    display: 'flex', flexDirection: 'column', gap: '25px',
                    border: '1px solid rgba(184, 134, 11, 0.3)',
                    boxShadow: 'inset 0 0 40px rgba(184, 134, 11, 0.05), border-color 0.3s ease',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(245,245,250,0.9) 100%)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: 'var(--color-gold-main)', fontSize: '0.95rem', fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '3px', fontWeight: 'bold' }}>스캔 진행률</span>
                        <span style={{ color: 'var(--color-text-primary)', fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', textShadow: 'var(--glow-gold-intense)' }}>{Math.floor(progress)}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`,
                            background: scanPhase === 1 ? '#EF4444' : scanPhase === 2 ? '#22C55E' : 'var(--color-gold-main)',
                            transition: 'width 0.3s ease, background 0.5s',
                            boxShadow: `0 0 15px ${scanPhase === 1 ? '#EF4444' : scanPhase === 2 ? '#22C55E' : 'var(--color-gold-main)'}`
                        }}></div>
                    </div>

                    <div style={{ flex: 1, border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', letterSpacing: '2px', margin: '0 0 15px 0', borderBottom: '1px dashed #DDD', paddingBottom: '12px', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 'bold' }}>상태 로그:</p>
                        <p style={{ color: 'var(--color-gold-light)', fontSize: '1.1rem', lineHeight: 1.8, fontFamily: '"Noto Sans KR", sans-serif', flex: 1, fontWeight: 'bold' }}>
                            {scanStarted || scanError ? `> ${statusText}` : '> 사용자 입력을 대기 중...'}
                        </p>
                    </div>

                    {scanError && (
                        <div style={{ marginTop: '5px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '10px', textAlign: 'center' }}>
                            <p style={{ color: '#EF4444', fontSize: '0.9rem', marginBottom: '15px', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                                {scanError}
                            </p>
                            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                페이지 새로고침
                            </button>
                        </div>
                    )}

                    {/* True VSA Processing Visualizer */}
                    <div style={{ background: 'rgba(58, 114, 184, 0.08)', border: '1px solid rgba(58, 114, 184, 0.3)', padding: '25px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Waves size={20} color="var(--color-blue-mystic)" />
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '1px', fontWeight: 'bold' }}>VSA 미세전류 분석</span>
                            </div>
                            <span style={{ color: 'var(--color-gold-main)', fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', textShadow: '0 0 10px rgba(218,165,32,0.4)' }}>Htz: {vsaScore.toFixed(1)}</span>
                        </div>
                        {scanStarted ? renderVSABars() : (
                            <div style={{ display: 'flex', alignItems: 'flex-end', height: '50px', gap: '4px', marginTop: '12px', opacity: 0.2 }}>
                                {new Array(16).fill(0).map((_, i) => <div key={i} style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-text-muted)' }} />)}
                            </div>
                        )}
                    </div>

                    <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '20px 25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0, fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: '2px', fontWeight: 'bold' }}>분석 벡터 수</p>
                        <p style={{ color: 'var(--color-text-primary)', fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', margin: 0, textShadow: '0 0 15px rgba(34, 197, 94, 0.3)' }}>
                            {factCount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); } 50% { opacity: 0.4; filter: none; } }
            `}</style>
        </div>
    );
};

// Subcomponents for the UI

const TechGraphRow = ({ name, active, type, color }: { name: string, active: boolean, type: 'wave' | 'matrix' | 'pulse' | 'bars', color: string }) => {

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 15px', borderRadius: '8px',
            background: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${active ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.03)'}`,
            transition: 'all 0.5s ease',
            opacity: active ? 1 : 0.6
        }}>
            <span style={{
                fontSize: '0.9rem',
                fontFamily: '"Noto Sans KR", sans-serif',
                fontWeight: active ? 'bold' : '500',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                textShadow: active ? 'none' : 'none',
                letterSpacing: '0.5px'
            }}>{name}</span>

            {/* The Dynamic Graph Area */}
            <div style={{ width: '80px', height: '24px', display: 'flex', alignItems: 'center', gap: '2px', opacity: active ? 1 : 0.2 }}>
                {type === 'bars' && new Array(12).fill(0).map((_, i) => (
                    <div key={i} style={{
                        flex: 1, backgroundColor: color, borderRadius: '1px',
                        height: active ? `${Math.max(20, Math.random() * 100)}%` : '20%',
                        transition: 'height 0.1s ease',
                        boxShadow: `0 0 5px ${color}`
                    }} />
                ))}

                {type === 'wave' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 24" preserveAspectRatio="none">
                            <path d={active ? `M0,12 Q10,${Math.random() * 24} 20,12 T40,12 T60,12 T80,12 T100,12` : "M0,12 L100,12"}
                                fill="none" stroke={color} strokeWidth="1.5"
                                style={{ transition: 'd 0.1s ease', filter: `drop-shadow(0 0 2px ${color})` }} />
                        </svg>
                    </div>
                )}

                {type === 'pulse' && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color,
                            boxShadow: active ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none',
                            animation: active ? 'pulse 1s infinite' : 'none'
                        }}></div>
                        <div style={{ width: '100%', height: '1px', backgroundColor: color, position: 'absolute', opacity: 0.3 }}></div>
                    </div>
                )}

                {type === 'matrix' && new Array(10).fill(0).map((_, i) => (
                    <div key={i} style={{
                        flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', height: '100%', justifyContent: 'flex-end'
                    }}>
                        {new Array(4).fill(0).map((_, j) => (
                            <div key={j} style={{
                                width: '100%', flex: 1, backgroundColor: color,
                                opacity: active ? (Math.random() > 0.5 ? 1 : 0.2) : 0.1,
                                transition: 'opacity 0.2s ease'
                            }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScanScreen;
