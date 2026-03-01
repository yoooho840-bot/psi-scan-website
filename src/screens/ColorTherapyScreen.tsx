import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Target, Volume2, VolumeX, Info, ArrowLeft, Cpu } from 'lucide-react';

interface ColorState {
    hexCode: string;
    colorName: string;
}

interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    opacity: number;
}

const createParticle = (canvasWidth: number, canvasHeight: number): Particle => {
    return {
        x: Math.random() * canvasWidth,
        y: canvasHeight + 50,
        size: Math.random() * 1.5 + 0.2,
        speedY: -(Math.random() * 1.5 + 0.5),
        opacity: Math.random() * 0.5 + 0.3
    };
};

const updateParticle = (p: Particle, canvasWidth: number, canvasHeight: number): Particle => {
    p.y += p.speedY;
    if (p.y < -20) {
        return createParticle(canvasWidth, canvasHeight);
    }
    return p;
};

const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
};

const ColorTherapyScreen: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as ColorState;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Default fallback color if none provided
    const targetHex = state?.hexCode || '#007FFF';
    const colorName = state?.colorName || 'Azure Resonance';
    const [opacity, setOpacity] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [currentScanHex, setCurrentScanHex] = useState('#FFFFFF');
    const [displayHz, setDisplayHz] = useState(0);
    const [resonance, setResonance] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [showUI, setShowUI] = useState(true);
    const uiTimeoutRef = useRef<any>(null);

    const [isPrepping, setIsPrepping] = useState(false);
    const [prepLogs, setPrepLogs] = useState<string[]>([]);

    const handleUserActivity = useCallback(() => {
        setShowUI(true);
        if (uiTimeoutRef.current) {
            clearTimeout(uiTimeoutRef.current);
        }
        if (!isScanning && !showIntro) {
            uiTimeoutRef.current = setTimeout(() => {
                setShowUI(false);
            }, 2000);
        }
    }, [isScanning, showIntro]);

    useEffect(() => {
        document.addEventListener('mousemove', handleUserActivity);
        document.addEventListener('click', handleUserActivity);
        document.addEventListener('touchstart', handleUserActivity);

        return () => {
            document.removeEventListener('mousemove', handleUserActivity);
            document.removeEventListener('click', handleUserActivity);
            document.removeEventListener('touchstart', handleUserActivity);
            if (uiTimeoutRef.current) {
                clearTimeout(uiTimeoutRef.current);
            }
        };
    }, [handleUserActivity]);

    // Audio Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const mainGainRef = useRef<GainNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);

    // Initialize Audio
    const initAudio = useCallback(() => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') return;

        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
            return;
        }

        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Soft Low-pass filter to remove harshness
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1, ctx.currentTime);
        filter.connect(ctx.destination);
        filterRef.current = filter;

        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0, ctx.currentTime);
        mainGain.connect(filter);
        mainGainRef.current = mainGain;

        // Create harmonic series for singing bowl texture
        // Create harmonic series for "Subtle" singing bowl texture
        const createOsc = (freqMult: number, gainMult: number) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();

            // Session-specific unique subtle drift for high uniqueness
            const sessionOffset = (Math.random() - 0.5) * 0.02;
            const finalMult = freqMult + sessionOffset;

            osc.type = 'sine'; // Only sine for maximum "subtle" purity
            osc.frequency.setValueAtTime(displayHz * finalMult, ctx.currentTime);
            g.gain.setValueAtTime(0, ctx.currentTime); // Start from silence

            // Very slow, deep LFO for "breathing" effect
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.setValueAtTime(0.2 + Math.random() * 0.3, ctx.currentTime);
            lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(g.gain);
            lfo.start();

            osc.connect(g);
            g.connect(mainGain);
            osc.start();

            // Fade-in individual harmonic for soft attack
            g.gain.setTargetAtTime(gainMult * 0.08, ctx.currentTime, 2.0);

            return { osc, mult: finalMult };
        };

        // Rich but "Soft" harmonic series
        const harmConfigs = [
            { m: 1, g: 1 },
            { m: 1.5, g: 0.3 },
            { m: 2.0, g: 0.15 },
            { m: 0.5, g: 0.2 }  // Grounding sub-harmonic for depth
        ];

        const instances = harmConfigs.map(cfg => createOsc(cfg.m, cfg.g));
        oscillatorsRef.current = instances.map(i => i.osc);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (audioCtxRef.current as any).harmonicMults = instances.map(i => i.mult);
    }, [displayHz]);

    // Update Frequency and Volume
    useEffect(() => {
        if (!audioCtxRef.current) return;

        const ctx = audioCtxRef.current;
        // Even lower, more subtle gain targets with slow fade
        const baseGain = isScanning ? 0.05 : 0.12;
        const targetGain = isMuted ? 0 : baseGain * (volume * 2);
        mainGainRef.current?.gain.setTargetAtTime(targetGain, ctx.currentTime, 1.5);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mults = (ctx as any).harmonicMults || [1, 1.5, 2, 0.5];
        oscillatorsRef.current.forEach((osc, idx) => {
            const mult = mults[idx];
            osc.frequency.setTargetAtTime(displayHz * mult, ctx.currentTime, 0.5);
        });

        // Dynamic filter adjustment based on resonance for "breathing" sound
        if (filterRef.current) {
            const filterFreq = 600 + (resonance * 5);
            filterRef.current.frequency.setTargetAtTime(filterFreq, ctx.currentTime, 1.2);
        }
    }, [displayHz, isMuted, isScanning, resonance]);

    const handleStart = () => {
        setIsPrepping(true);

        // Retrieve real biometric data
        const voiceFreqRaw = sessionStorage.getItem('scan_voice_freq') || '210.5';
        const surveyRaw = localStorage.getItem('pre_scan_survey');
        const voiceFreq = parseFloat(voiceFreqRaw);
        let stressExtracted = 3;
        try { if (surveyRaw) stressExtracted = JSON.parse(surveyRaw).stressLevel || 3; } catch (e) { }

        const extractionLogs = [
            `[1] 생체 마커 로드 완료 (성대 진동수: ${voiceFreq.toFixed(1)}Hz)`,
            `[2] 심장 변이도(HRV) 스트레스 지수 반영: Level ${stressExtracted}`,
            `[3] 양자장 결어긋남(Decoherence) 보정 파동 계산 중...`,
            `[4] 타겟 차크라(${colorName}) 결핍 에너지 대역 스캔 완료`,
            stressExtracted >= 4 ? `[5] 극도의 텐션 감지: 보정 주파수(Binaural Beat) 심도 조정됨` : `[5] 안정 텐션 감지: 기본 힐링 코드로 주파수 고정됨`,
            `[6] 맞춤형 색채-사운드 솔루션 락인(Lock-in) 완료.`
        ];

        let logIdx = 0;
        setPrepLogs([extractionLogs[0]]);
        const logInterval = setInterval(() => {
            logIdx++;
            if (logIdx < extractionLogs.length) {
                setPrepLogs(prev => [...prev, extractionLogs[logIdx]]);
            } else {
                clearInterval(logInterval);
                setTimeout(() => {
                    setIsPrepping(false);
                    setShowIntro(false);
                    setIsScanning(true);
                    handleUserActivity();
                    initAudio(); // Explicitly unlock audio context on user interaction

                    // Fullscreen request for immersive visual
                    const docElm = document.documentElement as any;
                    if (docElm) {
                        if (docElm.requestFullscreen) {
                            docElm.requestFullscreen().catch((err: any) => console.log(err));
                        } else if (docElm.webkitRequestFullscreen) {
                            docElm.webkitRequestFullscreen();
                        }
                    }
                }, 1000);
            }
        }, 600);
    };

    const handleExit = () => {
        if (oscillatorsRef.current) {
            oscillatorsRef.current.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (e) { } });
            oscillatorsRef.current = [];
        }
        if (mainGainRef.current) { try { mainGainRef.current.disconnect(); } catch (e) { } }
        if (audioCtxRef.current) { try { audioCtxRef.current.suspend(); audioCtxRef.current.close(); } catch (e) { } audioCtxRef.current = null; }
        const doc = document as any;
        if (doc.fullscreenElement || doc.webkitFullscreenElement) {
            if (doc.exitFullscreen) doc.exitFullscreen().catch(() => { });
            else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        }
        navigate(-1);
    };

    // Exit Fullscreen on Cleanup or Exit
    useEffect(() => {
        return () => {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.log(err));
            }
        };
    }, []);

    // Cleanup Audio
    useEffect(() => {
        return () => {
            if (oscillatorsRef.current) {
                oscillatorsRef.current.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (e) { } });
            }
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                try { audioCtxRef.current.suspend(); } catch (e) { }
                audioCtxRef.current?.close().catch(() => { });
                audioCtxRef.current = null;
            }
        };
    }, []);

    // Scan Sequence (Mimicking SCIO 256 color sweep)
    useEffect(() => {
        if (!isScanning) return;

        let count = 0;
        // 256 frames at 40ms = ~10.2 seconds of scanning (longer intro)
        const scanInterval = setInterval(() => {
            const h = Math.floor(Math.random() * 360);
            const s = Math.floor(Math.random() * 20 + 80); // 80-100% saturation (vibrant)
            const l = Math.floor(Math.random() * 15 + 75); // 75-90% lightness (bright pastel, never dark)

            setCurrentScanHex(`hsl(${h}, ${s}%, ${l}%)`);
            // Dynamic shift during scan
            setDisplayHz(+(400 + Math.random() * 600).toFixed(1));
            setResonance(Math.floor(Math.random() * 50 + 20));
            count++;

            // 256 colors swept
            if (count >= 256) {
                clearInterval(scanInterval);
                setIsScanning(false);
                // Personalized Final State (Simulating individualized prescription)
                const personalizedHz = +(432 + Math.random() * 400).toFixed(1);
                const personalizedRes = +(98 + Math.random() * 1.8).toFixed(1);
                setResonance(personalizedRes);
                setDisplayHz(personalizedHz);
            }
        }, 40); // 40ms per frame to make the 256 colors last ~10 seconds total

        return () => clearInterval(scanInterval);
    }, [isScanning]);

    // Initial fade in
    useEffect(() => {
        if (showIntro) return;
        const timer = setTimeout(() => setOpacity(1), 500);
        return () => clearTimeout(timer);
    }, [showIntro]);

    // Canvas Particle System
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < 80; i++) particles.push(createParticle(canvas.width, canvas.height));
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles = particles.map(p => {
                const updated = updateParticle(p, canvas.width, canvas.height);
                drawParticle(updated, ctx);
                return updated;
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize(); animate();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, []);

    if (showIntro) {
        return createPortal(
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', color: '#FFFFFF',
                zIndex: 999999, overflow: 'hidden', padding: '20px'
            }}>
                {/* Bright Pastel Rainbow Background */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(120deg, #ffb3ba, #ffdfba, #ffffba, #baffc9, #bae1ff, #dcbaff, #ffb3ba)',
                    backgroundSize: '400% 400%',
                    animation: 'rainbowBG 4s ease infinite',
                    zIndex: -3
                }}></div>

                {/* Soft glowing overlays for a dreamy effect */}
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: -2, animation: 'float-blob 6s infinite alternate'
                }}></div>
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: -2, animation: 'float-blob 8s infinite alternate-reverse'
                }}></div>

                <div style={{
                    maxWidth: '1200px', width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '50px 40px', borderRadius: '30px',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    animation: 'fadeIn 1s ease-out',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                }}>
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '3rem', margin: '0 0 15px 0', letterSpacing: '4px', color: '#FFF' }}>
                        색채 테라피
                    </h1>
                    <p style={{ color: '#eee', fontSize: '1.4rem', lineHeight: 1.6, marginBottom: '40px', wordBreak: 'keep-all', wordWrap: 'break-word', fontWeight: 300 }}>
                        스캔 결과를 바탕으로 도출된 <b>나만의 결핍 파동</b>을 보완하는 맞춤형 색채와 파동가 매칭되었습니다.<br /><br />
                        어두운 곳에서 이어폰을 착용하고, 편안한 자세로 화면 중심을 응시하며 깊은 호흡에 집중하십시오.
                    </p>

                    <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '40px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '20px', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px' }}>[ 세션 시간에 따른 에너지 정화 효과 ]</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#fff', fontSize: '1.2rem', lineHeight: 1.8, fontWeight: 300 }}>
                            <li style={{ marginBottom: '15px' }}><b style={{ color: '#baffc9' }}>[Level 1] 3분:</b> 뇌파의 알파파 전환 유도 및 일상적인 스트레스 텐션 이완</li>
                            <li style={{ marginBottom: '15px' }}><b style={{ color: '#bae1ff' }}>[Level 2] 5분:</b> 내면 에너지 밸런스 회복 및 생체 에너지장(Biofield) 파동 안정화</li>
                            <li><b style={{ color: '#dcbaff' }}>[Level 3] 10분 이상:</b> 깊은 차원의 오라(Aura) 이완 및 무의식 수준의 억압된 텐션 해방</li>
                        </ul>
                    </div>

                    {isPrepping ? (
                        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', padding: '20px', borderRadius: '12px', textAlign: 'left', minHeight: '160px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#baffc9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#FFF' }}>
                                <Cpu size={20} className="pulse-anim" /> <b>생체 파동 솔루션 조율 중...</b>
                            </div>
                            {prepLogs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '8px', animation: 'fadeIn 0.3s ease-out' }}>&gt; {log}</div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <button onClick={handleStart} style={{
                                background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                                color: '#FFF', border: 'none', padding: '20px 50px', borderRadius: '40px',
                                fontSize: '1.6rem', fontWeight: 600, letterSpacing: '2px', cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'all 0.3s'
                            }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'; }}>
                                나의 맞춤형 세션 시작하기
                            </button>
                            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#ccc', marginTop: '20px', cursor: 'pointer', display: 'block', margin: '25px auto 0 auto', letterSpacing: '2px', fontSize: '1.2rem', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#ccc'}>
                                뒤로가기
                            </button>
                        </>
                    )}
                </div>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes rainbowBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                `}</style>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', color: '#FFFFFF',
            zIndex: 999999, opacity: opacity, transition: 'opacity 2s ease-in-out', overflow: 'hidden'
        }}>
            {/* The main dynamic color layer
                - During scanning: rapidly changes to show all 256 colors vividly
                - After scanning: smoothly transitions to pure solid target color filling the screen
            */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: isScanning ? currentScanHex : targetHex,
                opacity: 1,
                transition: isScanning ? 'none' : 'background-color 2s ease',
                zIndex: -5
            }}></div>

            {/* The beautiful pastel rainbow background (only fully visible during INTRO, completely hidden during and after scan) */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(120deg, #ffb3ba, #ffdfba, #ffffba, #baffc9, #bae1ff, #dcbaff, #ffb3ba)',
                backgroundSize: '400% 400%',
                animation: 'rainbowBG 4s ease infinite',
                opacity: 0, // Hidden in main screen to allow pure target color
                transition: 'opacity 2s ease',
                zIndex: -4
            }}></div>

            {/* Sparkling / Glowing Overlays - fades out after scan so only pure color remains */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -2, opacity: isScanning ? 1 : 0, transition: 'opacity 3s ease' }}>
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)', animation: 'float-blob 6s infinite alternate' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)', animation: 'float-blob 8s infinite alternate-reverse' }}></div>
            </div>

            {/* Sacred Geometry */}
            <div style={{
                position: 'absolute', width: '800px', height: '800px',
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/sacred-geometry.png")',
                opacity: 0.1, zIndex: 0, animation: 'rotate-slow 180s infinite linear'
            }}></div>

            {/* Particle Canvas */}
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }} />

            {/* Unified UI Overlay (Bottom Right Auto-Hide) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    alignItems: 'flex-end',
                    maxWidth: '300px',
                    transition: 'all 0.5s ease-in-out',
                    opacity: showUI ? 1 : 0,
                    transform: showUI ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: showUI ? 'auto' : 'none'
                }}
            >
                {/* 1. Main Content (Color Info) */}
                <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', opacity: 0.6, color: '#111', marginBottom: '5px' }}>
                        <Target size={14} />
                        <span style={{ fontSize: '0.65rem', letterSpacing: '2px', fontWeight: 500 }}>색채 테라피</span>
                    </div>
                    <h1 style={{
                        fontFamily: "var(--font-brand)", fontSize: '1.4rem', letterSpacing: '2px',
                        margin: '0 0 5px 0', fontWeight: 600, color: '#111',
                        opacity: isScanning ? 0.8 : 0.9,
                        animation: isScanning ? 'pulse-text 0.5s infinite' : 'none',
                    }}>
                        {isScanning ? '동기화 중...' : (
                            colorName.includes('Red') ? '레드 (기저 차크라)' :
                                colorName.includes('Orange') ? '오렌지 (천골 차크라)' :
                                    colorName.includes('Yellow') ? '옐로우 (태양신경총)' :
                                        colorName.includes('Green') ? '그린 (심장 차크라)' :
                                            colorName.includes('Azure') ? '블루 (목 차크라)' :
                                                colorName.includes('Indigo') ? '인디고 (제3의 눈)' :
                                                    colorName.includes('Violet') ? '바이올렛 (왕관 차크라)' : colorName
                        )}
                    </h1>
                    <p style={{ fontSize: '0.75rem', letterSpacing: '1px', color: '#333', opacity: isScanning ? 0.7 : 0.6, margin: 0 }}>
                        {isScanning ? '맞춤 파동 탐색' : '에너지장 최적화 완료'}
                    </p>
                </div>

                {/* 2. System Status & Resonance (Minimal) */}
                <div style={{ display: 'flex', gap: '20px', fontFamily: 'monospace', fontSize: '0.7rem', color: '#111', opacity: isScanning ? 0.6 : 0.4, pointerEvents: 'none', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Activity size={12} color={isScanning ? "#ff6600" : "#333"} />
                        <span>{displayHz} Hz</span>
                    </div>
                    <div>동기화: {resonance}%</div>
                </div>

                {/* 3. Audio Controls & Guide Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', pointerEvents: 'auto' }}>
                    <input
                        type="range" min="0" max="1" step="0.01" value={volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            if (parseFloat(e.target.value) > 0 && isMuted) setIsMuted(false);
                        }}
                        style={{ width: '60px', accentColor: '#333', opacity: isMuted ? 0.3 : 0.6, cursor: 'pointer' }}
                    />
                    <button
                        onClick={() => { initAudio(); setIsMuted(!isMuted); }}
                        style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', opacity: isMuted ? 0.5 : 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{isMuted ? '음소거' : '소리'}</span>
                    </button>
                    <div style={{ width: '1px', height: '14px', background: 'rgba(0,0,0,0.1)' }}></div>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Info size={14} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>가이드</span>
                    </button>
                </div>

                {/* 4. Info Panel (Expandable) */}
                {showInfo && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.25)', border: '1px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '15px', padding: '15px',
                        backdropFilter: 'blur(20px)', color: '#222', fontSize: '0.7rem', pointerEvents: 'auto',
                        animation: 'fade-in 0.3s'
                    }}>
                        <p style={{ marginBottom: '10px' }}>
                            <strong>[ 작용 원리 ]</strong> 빛과 파동을 통해 생체 에너지장 불균형을 해소합니다. (PSI 싱잉볼 융합)
                        </p>
                        <ul style={{ paddingLeft: '15px', marginTop: '5px', listStyleType: 'circle', color: '#333' }}>
                            <li style={{ marginBottom: '4px' }}><strong style={{ color: '#d32f2f' }}>Red</strong> (기저): 생명력, 순환</li>
                            <li style={{ marginBottom: '4px' }}><strong style={{ color: '#e65100' }}>Orange</strong> (천골): 창의성, 감정</li>
                            <li style={{ marginBottom: '4px' }}><strong style={{ color: '#fbc02d' }}>Yellow</strong> (태양): 자신감, 소화</li>
                            <li style={{ marginBottom: '4px' }}><strong style={{ color: '#2e7d32' }}>Green</strong> (심장): 조화, 긴장완화</li>
                            <li style={{ marginBottom: '4px' }}><strong style={{ color: '#1565c0' }}>Blue</strong> (목): 평온함, 소통</li>
                            <li style={{ marginBottom: '4px' }}><strong style={{ color: '#4527a0' }}>Indigo</strong> (제3의눈): 직관, 통찰력</li>
                            <li><strong style={{ color: '#6a1b9a' }}>Violet</strong> (왕관): 정신 고양, 영적 연결</li>
                        </ul>
                    </div>
                )}

                {/* 5. Exit Button */}
                <div style={{ pointerEvents: 'auto', marginTop: '10px' }}>
                    <button onClick={handleExit} style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: '#111', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
                        뒤로가기 <ArrowLeft size={16} />
                    </button>
                </div>
            </div>

            {/* Hidden State Indicator (PSI Logo) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 99,
                    transition: 'all 0.5s ease-in-out',
                    opacity: showUI ? 0 : 0.5,
                    pointerEvents: showUI ? 'none' : 'auto',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    border: `1px solid rgba(0,0,0,0.1)`,
                    backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={handleUserActivity}
                onClick={handleUserActivity}
            >
                <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle at center, ${targetHex}, transparent)`
                }}></div>
            </div>

            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
                @keyframes float-blob {
                    0% { transform: translate(0,0) scale(1); }
                    100% { transform: translate(20%, 20%) scale(1.3); }
                }
                @keyframes rotate-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-text {
                    0% { opacity: 0.5; transform: scale(0.98); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>,
        document.body
    );
};

export default ColorTherapyScreen;
