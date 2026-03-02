import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Info, ArrowLeft, Cpu } from 'lucide-react';
import RitualPortal from '../components/RitualPortal';

const SoundBathScreen: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);

    const [isMuted, setIsMuted] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [resonance, setResonance] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [preset, setPreset] = useState<'grounding' | 'healing' | 'clarity'>('grounding');
    const [isStarted, setIsStarted] = useState(false);
    const [showUI, setShowUI] = useState(true);
    const uiTimeoutRef = useRef<any>(null);

    const [showIntro, setShowIntro] = useState(true);
    const [isPrepping, setIsPrepping] = useState(false);
    const [prepLogs, setPrepLogs] = useState<string[]>([]);

    const handleUserActivity = useCallback(() => {
        setShowUI(true);
        if (uiTimeoutRef.current) {
            clearTimeout(uiTimeoutRef.current);
        }
        if (isStarted) {
            uiTimeoutRef.current = setTimeout(() => {
                setShowUI(false);
            }, 2000);
        }
    }, [isStarted]);

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

    // Auto-fullscreen when playing starts
    useEffect(() => {
        if (isStarted) {
            const docElm = document.documentElement as any;
            if (docElm) {
                if (docElm.requestFullscreen) {
                    docElm.requestFullscreen().catch(() => { });
                } else if (docElm.webkitRequestFullscreen) {
                    docElm.webkitRequestFullscreen();
                }
            }
        }
    }, [isStarted]);

    const PRESETS = useMemo(() => ({
        grounding: {
            hz: 174,
            color: '218, 165, 32', // Bronze/Gold
            bg: 'rgba(218, 165, 32, 0.05)',
            label: 'GROUNDING (EARTH)',
            desc: '174Hz | 안정과 신체적 위로'
        },
        healing: {
            hz: 341,
            color: '43, 192, 104', // Emerald/Healing Green
            bg: 'rgba(43, 192, 104, 0.05)',
            label: 'HEALING (HEART)',
            desc: '341Hz | 감정의 정화와 회복'
        },
        clarity: {
            hz: 528,
            color: '138, 43, 226', // Violet/Crown
            bg: 'rgba(138, 43, 226, 0.05)',
            label: 'CLARITY (CROWN)',
            desc: '528Hz | 명료함과 기적의 공명'
        }
    }), []);

    // 1. Audio Engine: Simplified & Robust Harmonic Synthesis
    const initAudio = useCallback(() => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0; // Start muted, will be faded in by useEffect
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        const baseFreq = PRESETS[preset].hz;

        // Simple Harmonic Series
        const harmonics = [
            { mult: 1.0, gain: 0.5 },
            { mult: 1.5, gain: 0.2 },
            { mult: 2.0, gain: 0.1 }
        ];

        harmonics.forEach(h => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = baseFreq * h.mult;

            // Simple slow pulsing effect
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 0.2;
            lfoGain.gain.value = 0.1;
            lfo.connect(lfoGain);
            lfoGain.connect(g.gain);
            lfo.start();

            osc.connect(g);
            g.connect(masterGain);
            osc.start();

            g.gain.value = h.gain;
            oscillatorsRef.current.push(osc);
            oscillatorsRef.current.push(lfo); // store LFO to stop it later
        });

        // Simple Binaural Beat
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();
        const leftPanner = ctx.createStereoPanner();
        const rightPanner = ctx.createStereoPanner();

        leftOsc.frequency.value = baseFreq;
        rightOsc.frequency.value = baseFreq + 6;

        leftPanner.pan.value = -1;
        rightPanner.pan.value = 1;

        const binGain = ctx.createGain();
        binGain.gain.value = 0.1;

        leftOsc.connect(leftPanner).connect(binGain).connect(masterGain);
        rightOsc.connect(rightPanner).connect(binGain).connect(masterGain);

        leftOsc.start();
        rightOsc.start();

        oscillatorsRef.current.push(leftOsc);
        oscillatorsRef.current.push(rightOsc);

        // Explicitly resume context if suspended (Browser policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    }, [PRESETS, preset]);

    useEffect(() => {
        if (!masterGainRef.current || !audioCtxRef.current) return;
        const targetGain = isMuted ? 0 : volume;
        masterGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 2.0);
    }, [isMuted, volume]);

    // 2. Visual Engine: Procedural Harmonic Ripples
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawRipple = (x: number, y: number, r: number, o: number) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${PRESETS[preset].color}, ${o})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(2, 2, 5, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            time += 0.01;
            const res = Math.sin(time * 0.5) * 0.5 + 0.5;
            setResonance(Math.floor(res * 100));

            // Outer floating circles
            for (let i = 0; i < 5; i++) {
                const radius = 100 + i * 50 + Math.sin(time + i) * 20;
                const opacity = (0.2 - i * 0.03) * (res + 0.5);
                drawRipple(centerX, centerY, radius, opacity);
            }

            // Central pulsing core
            const coreRadius = 60 + Math.sin(time * 3) * 10;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);

            // Subtle color shifting within the preset tone
            const colorShift = Math.sin(time * 0.3) * 50;
            gradient.addColorStop(0, `rgba(${PRESETS[preset].color}, ${0.4 * res})`);
            gradient.addColorStop(0.5, `rgba(${PRESETS[preset].color}, ${0.2 * res})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.shadowBlur = 20 + colorShift;
            ctx.shadowColor = `rgba(${PRESETS[preset].color}, 0.5)`;

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [PRESETS, preset]);

    useEffect(() => {
        const unlock = () => {
            initAudio();
            document.removeEventListener('click', unlock);
        };
        document.addEventListener('click', unlock);
        const timer = setTimeout(() => setOpacity(1), 0);
        return () => {
            document.removeEventListener('click', unlock);
            clearTimeout(timer);
        };
    }, [initAudio]);

    // Cleanup Context only on full unmount
    useEffect(() => {
        return () => {
            if (oscillatorsRef.current) {
                oscillatorsRef.current.forEach(osc => {
                    try { osc.stop(); osc.disconnect(); } catch (e) { }
                });
                oscillatorsRef.current = [];
            }
            if (masterGainRef.current) {
                try { masterGainRef.current.disconnect(); } catch (e) { }
            }
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                try { audioCtxRef.current.suspend(); } catch (e) { }
                audioCtxRef.current.close().catch(console.error);
                audioCtxRef.current = null;
            }
        };
    }, []);

    const handleStart = () => {
        setIsPrepping(true);

        // Retrieve real biometric data
        const voiceFreqRaw = sessionStorage.getItem('scan_voice_freq') || '210.5';
        const surveyRaw = localStorage.getItem('pre_scan_survey');
        const voiceFreq = parseFloat(voiceFreqRaw);
        let stressExtracted = 3;
        try { if (surveyRaw) stressExtracted = JSON.parse(surveyRaw).stressLevel || 3; } catch (e) { }

        // Auto-select preset based on biometrics
        if (stressExtracted >= 4) setPreset('grounding');
        else if (voiceFreq > 220) setPreset('clarity');
        else setPreset('healing');

        const extractionLogs = [
            `[1] 성대 진동수 스캔 프로파일 로드 (${voiceFreq.toFixed(1)}Hz)`,
            `[2] 교감/부교감 신경계(HRV) 스트레스 마커: Level ${stressExtracted}`,
            `[3] 신경계 텐션 억제 싱잉볼(Singing Bowl) 배음 구조 추출 중...`,
            stressExtracted >= 4 ? `[4] 극강의 스트레스 감지 -> 강제 그라운딩(Grounding 174Hz) 파동 강제 할당` : `[4] 뇌파 안정화 확인 -> 치유 및 확장(Healing/Clarity) 파동 할당`,
            `[5] 바이노럴 비트(Binaural Beat) 위상차(Phase-shift) 동기화 중`,
            `[6] 맞춤형 퀀텀 사운드 배스 설계 완료.`
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
                    setIsStarted(true);

                    const unlock = () => {
                        initAudio();
                        document.removeEventListener('click', unlock);
                    };
                    document.addEventListener('click', unlock);
                    setTimeout(() => setOpacity(1), 100);
                }, 1000);
            }
        }, 600);
    };

    if (showIntro) {
        return createPortal(
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', color: '#FFFFFF',
                zIndex: 999999, overflow: 'hidden', padding: '20px',
                background: 'linear-gradient(to bottom, #020205, #0a0a1a)'
            }}>
                {/* Cosmic background particles or sacred geometry could go here */}
                <div style={{
                    position: 'absolute', width: '800px', height: '800px',
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/sacred-geometry.png")',
                    opacity: 0.1, zIndex: -1, animation: 'spin 180s infinite linear'
                }}></div>

                <div style={{
                    maxWidth: '800px', width: '100%',
                    background: 'rgba(5, 5, 10, 0.8)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    padding: '50px 40px', borderRadius: '30px',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    animation: 'fadeIn 1s ease-out',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '2.5rem', margin: '0 0 15px 0', letterSpacing: '4px', color: 'var(--color-gold-main)' }}>
                        사운드 배스 (싱잉볼)
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '40px', wordBreak: 'keep-all', fontWeight: 300 }}>
                        측정된 생체 파동 데이터를 기반으로, 당신의 신경계를 가장 빠르고 강력하게 이완시키는 특수 싱잉볼 파동가 매칭됩니다.<br /><br />
                        <b>* 이어폰 착용을 강력히 권장합니다. 양쪽 귀의 진동수 차이(Binaural Beats)를 통해 뇌파를 강제로 테타파(명상 상태)로 전환합니다.</b>
                    </p>

                    {isPrepping ? (
                        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(218, 165, 32, 0.3)', padding: '20px', borderRadius: '12px', textAlign: 'left', minHeight: '160px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#ffecb3' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--color-gold-main)' }}>
                                <Cpu size={20} className="pulse-anim" /> <b>사운드 테라피 동기화 중...</b>
                            </div>
                            {prepLogs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '8px', animation: 'fadeIn 0.3s ease-out' }}>&gt; {log}</div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <button onClick={handleStart} style={{
                                background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.8), rgba(184, 134, 11, 0.8))',
                                color: '#FFF', border: '1px solid var(--color-gold-main)', padding: '18px 45px', borderRadius: '40px',
                                fontSize: '1.4rem', fontWeight: 600, letterSpacing: '2px', cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(218, 165, 32, 0.3)', transition: 'all 0.3s'
                            }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(218, 165, 32, 0.5)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 20px rgba(218, 165, 32, 0.3)'; }}>
                                데이터 기반 진동 시작
                            </button>
                            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#888', marginTop: '20px', cursor: 'pointer', display: 'block', margin: '25px auto 0 auto', letterSpacing: '2px', fontSize: '1rem', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#888'}>
                                뒤로가기
                            </button>
                        </>
                    )}
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#020205', color: '#FFF', display: 'flex', flexDirection: 'column',
            opacity: opacity, transition: 'opacity 2s ease-in-out', zIndex: 9999
        }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />

            {/* Sacred Geometry Background */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `radial-gradient(circle at center, ${PRESETS[preset].bg} 0%, transparent 70%)`,
                zIndex: 0,
                transition: 'all 2s ease-in-out'
            }} />

            {/* Unified UI Overlay (Bottom Right Auto-Hide) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    alignItems: 'flex-end',
                    maxWidth: '350px',
                    transition: 'all 0.5s ease-in-out',
                    opacity: showUI ? 1 : 0,
                    transform: showUI ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: showUI ? 'auto' : 'none'
                }}
            >

                {/* 1. Header & Status */}
                <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', opacity: 0.6, color: '#FFF', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.65rem', letterSpacing: '2px', fontWeight: 500 }}>사운드 테라피 | 싱잉볼</span>
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-brand)', fontSize: '1.6rem', letterSpacing: '4px', fontWeight: 300,
                        color: `rgba(${PRESETS[preset].color}, 0.9)`, transition: 'color 2s', margin: '0 0 5px 0'
                    }}>
                        사운드 배스
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', opacity: 0.7 }}>
                        <p style={{ fontSize: '0.75rem', letterSpacing: '1px', margin: 0 }}>
                            {PRESETS[preset].desc}
                        </p>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', marginLeft: '15px' }}>동기화: {resonance}%</span>
                    </div>
                </div>

                {/* 2. Preset Switcher */}
                <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
                    {Object.entries(PRESETS).map(([key, data]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setPreset(key as 'grounding' | 'healing' | 'clarity');
                                setIsStarted(true);
                                handleUserActivity();
                                if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                                    audioCtxRef.current.resume();
                                }
                                if (!isMuted) {
                                    oscillatorsRef.current.forEach(o => { try { o.stop(); } catch (e) { } });
                                    oscillatorsRef.current = [];
                                    initAudio();
                                }
                            }}
                            style={{
                                background: preset === key ? `rgba(${data.color}, 0.2)` : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${preset === key ? `rgba(${data.color}, 0.5)` : 'rgba(255,255,255,0.1)'}`,
                                color: '#FFF', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
                                fontSize: '0.6rem', letterSpacing: '1px', transition: 'all 0.4s',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{key.toUpperCase()}</div>
                            <div style={{ fontSize: '0.5rem', opacity: 0.6 }}>{data.hz}Hz</div>
                        </button>
                    ))}
                </div>

                {/* 3. Audio Controls & Guide */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', pointerEvents: 'auto' }}>
                    <input
                        type="range" min="0" max="1" step="0.01" value={volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            if (parseFloat(e.target.value) > 0 && isMuted) setIsMuted(false);
                        }}
                        style={{ width: '60px', accentColor: `rgba(${PRESETS[preset].color}, 1)`, cursor: 'pointer', opacity: isMuted ? 0.3 : 0.8 }}
                    />
                    <button
                        onClick={() => {
                            if (isMuted) {
                                initAudio();
                                if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                                    audioCtxRef.current.resume();
                                }
                                setIsMuted(false);
                            } else {
                                setIsMuted(true);
                            }
                        }}
                        style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', opacity: isMuted ? 0.5 : 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>{isMuted ? '음소거' : '소리'}</span>
                    </button>
                    <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}
                    >
                        <Info size={14} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>가이드</span>
                    </button>
                </div>

                {/* 4. Info Panel */}
                {showInfo && (
                    <div style={{
                        background: 'rgba(10,10,12,0.8)', border: `1px solid rgba(${PRESETS[preset].color}, 0.3)`,
                        padding: '15px', borderRadius: '15px', animation: 'fade-up 0.3s', pointerEvents: 'auto',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: `rgba(${PRESETS[preset].color}, 1)`, letterSpacing: '1px' }}>PSI SOUND BATH</h3>
                        <p style={{ fontSize: '0.7rem', lineHeight: '1.5', color: '#CCC', margin: 0 }}>
                            싱잉볼의 배음 구조를 디지털로 완벽하게 재현했습니다. 기저 파동와 테타파 바이노럴 비트가 결합되어 깊은 명상 상태(Theta State)를 유도합니다. (이어폰 착용 권장)
                        </p>
                    </div>
                )}

                {/* 5. Exit Button */}
                <div style={{ pointerEvents: 'auto' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(5px)', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}>
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
                    background: 'rgba(0,0,0,0.5)',
                    border: `1px solid rgba(255,255,255,0.2)`,
                    backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={handleUserActivity}
                onClick={handleUserActivity}
            >
                <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle at center, rgba(${PRESETS[preset].color}, 1), transparent)`
                }}></div>
            </div>

            <RitualPortal currentPath="/sound-bath" />

            <style>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
        </div>
    );
};

export default SoundBathScreen;
