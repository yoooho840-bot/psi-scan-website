import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Activity, Maximize, Minimize, Cpu, ArrowLeft } from 'lucide-react';
import { SecureVault } from '../services/secureVault';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const ElementalTherapyScreen: React.FC = () => {
    const navigate = useNavigate();

    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [duration, setDuration] = useState(0);
    const [tuningStage, setTuningStage] = useState<0 | 1 | 2>(0);
    const [showIntro, setShowIntro] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const [showUI, setShowUI] = useState(true);
    const uiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isPrepping, setIsPrepping] = useState(false);
    const [prepLogs, setPrepLogs] = useState<string[]>([]);

    useAutoFullscreen();

    const handleUserActivity = useCallback(() => {
        setShowUI(true);
        if (uiTimeoutRef.current) {
            clearTimeout(uiTimeoutRef.current);
        }
        uiTimeoutRef.current = setTimeout(() => {
            setShowUI(false);
        }, 2000);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('touchstart', handleUserActivity);
        return () => {
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('touchstart', handleUserActivity);
            if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
        };
    }, [handleUserActivity]);

    const [showExitModal, setShowExitModal] = useState(false);
    const [breathPhase, setBreathPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE'>('INHALE');
    const [breathProgress, setBreathProgress] = useState(0);
    const [visitCount, setVisitCount] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);

    // Fetch visit count on mount to drive Anti-Habituation
    useEffect(() => {
        const count = SecureVault.incrementVisitCount();
        setVisitCount(count);
    }, []);

    // Dynamic Prescription: Anti-Habituation Rotation Engine
    const prescription = useMemo(() => {
        const base = {
            rootCause: "제 2차크라 파동 붕괴 및 신경계 피로",
            visualColor: '#00d2ff',
            visualSecondary: '#3a7bd5',
            noiseHz: 300
        };

        // Rotation based on visit count
        if (visitCount % 3 === 1) {
            // Mutation 1: Deep Reset (Box Breathing 5-5-5-5)
            return { ...base, targetFrequency1: 396, targetFrequency2: 528, breathType: 'BOX 5-5-5-5' };
        } else if (visitCount % 3 === 2) {
            // Mutation 2: Resonant Sync (6-0-6)
            return { ...base, targetFrequency1: 417, targetFrequency2: 639, breathType: 'RESONANT 6-0-6' };
        } else {
            // Standard: Vagal Tone Restore (4-7-8)
            return { ...base, targetFrequency1: 285, targetFrequency2: 432, breathType: 'VAGAL 4-7-8' };
        }
    }, [visitCount]);

    // Timers derived from breathType
    const breathCycles = useMemo(() => {
        if (prescription.breathType.includes('BOX')) return { in: 5000, hold: 5000, out: 5000, hold2: 5000 };
        if (prescription.breathType.includes('RESONANT')) return { in: 6000, hold: 0, out: 6000, hold2: 0 };
        return { in: 4000, hold: 7000, out: 8000, hold2: 0 }; // VAGAL
    }, [prescription.breathType]);

    const initAudio = () => {
        if (audioCtxRef.current) return;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
        const ctx = audioCtxRef.current;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // Freq 1 (Base Tuning)
        const osc1 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(prescription.targetFrequency1, ctx.currentTime);
        const oscGain1 = ctx.createGain();
        oscGain1.gain.setValueAtTime(0.02, ctx.currentTime); // Whisper quiet
        osc1.connect(oscGain1);
        oscGain1.connect(masterGain);
        osc1.start();

        // Freq 2 (Harmonic Overlay)
        const osc2 = ctx.createOscillator();
        osc2.frequency.setValueAtTime(prescription.targetFrequency2, ctx.currentTime);
        const oscGain2 = ctx.createGain();
        oscGain2.gain.setValueAtTime(0.015, ctx.currentTime);
        osc2.connect(oscGain2);
        oscGain2.connect(masterGain);
        osc2.start();

        // Submersive Pink Noise (Womb Simulation)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        noiseSrc.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(prescription.noiseHz, ctx.currentTime);
        noiseFilter.Q.setValueAtTime(1.5, ctx.currentTime);

        const noiseGainNode = ctx.createGain();
        noiseGainNode.gain.setValueAtTime(0.5, ctx.currentTime);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGainNode);
        noiseGainNode.connect(masterGain);
        noiseSrc.start();
    };

    useEffect(() => {
        if (masterGainRef.current && audioCtxRef.current) {
            masterGainRef.current.gain.setTargetAtTime(isMuted ? 0 : volume, audioCtxRef.current.currentTime, 0.5);
        }
    }, [isMuted, volume]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen().catch(() => { });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Global: Auto-pause audio if user switches tabs or minimizes browser
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
                    audioCtxRef.current.suspend().catch(() => { });
                }
            } else {
                if (audioCtxRef.current && audioCtxRef.current.state === 'suspended' && isStarted && !isMuted) {
                    audioCtxRef.current.resume().catch(() => { });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isStarted, isMuted]);

    useEffect(() => {
        if (!isStarted) return;
        const oTimer = setTimeout(() => setOpacity(1), 100);

        // Auto-start audio sequence
        const autoAudio = setTimeout(() => {
            initAudio();
        }, 1000); // 1 seconds after visual load to ensure user is ready

        // Staging the UI progression
        const s1 = setTimeout(() => setTuningStage(1), 2000);
        const s2 = setTimeout(() => setTuningStage(2), 5000);

        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);

        return () => {
            clearTimeout(oTimer);
            clearTimeout(autoAudio);
            clearTimeout(s1);
            clearTimeout(s2);
            clearInterval(timer);
        };
    }, [isStarted]);

    // Force strict audio cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(() => { });
                audioCtxRef.current = null;
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Speech Synthesis Helper
    const speakPhase = useCallback((phase: 'INHALE' | 'HOLD' | 'EXHALE' | 'HOLD2') => {
        if (!isMuted && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const text = phase === 'INHALE' ? '숨을 깊게 들이마시고'
                : phase === 'EXHALE' ? '숨을 천천히 내쉬고'
                    : '숨을 멈추고';

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.8; // Slow, calming voice
            utterance.pitch = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }, [isMuted]);

    // Dynamic Breathing Engine
    useEffect(() => {
        if (!isStarted || tuningStage < 2 || visitCount === 0) return;

        let timer1: ReturnType<typeof setTimeout>;
        let timer2: ReturnType<typeof setTimeout>;
        let timer3: ReturnType<typeof setTimeout>;
        let timer4: ReturnType<typeof setTimeout>;

        const runBreathingCycle = () => {
            setBreathPhase('INHALE');
            speakPhase('INHALE');
            setBreathProgress(0); // trigger scale up

            timer1 = setTimeout(() => {
                if (breathCycles.hold > 0) {
                    setBreathPhase('HOLD');
                    speakPhase('HOLD');
                } else {
                    setBreathPhase('EXHALE'); // Skip hold for resonant
                    speakPhase('EXHALE');
                }
                setBreathProgress(1); // max expansion

                timer2 = setTimeout(() => {
                    // Start EXHALE immediately if we didn't have a HOLD phase, or resume EXHALE if we did
                    setBreathPhase('EXHALE');
                    speakPhase('EXHALE');

                    timer3 = setTimeout(() => {
                        setBreathProgress(0); // max contraction

                        if (breathCycles.hold2 > 0) {
                            setBreathPhase('HOLD'); // Box breathing hold 2
                            speakPhase('HOLD2');
                        }
                        timer4 = setTimeout(runBreathingCycle, breathCycles.hold2 > 0 ? breathCycles.hold2 : 0);

                    }, breathCycles.out);
                }, breathCycles.hold);
            }, breathCycles.in);
        };

        runBreathingCycle();
        return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
    }, [tuningStage, breathCycles, visitCount]);

    const handleExitClick = () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => { });
            audioCtxRef.current = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setShowExitModal(true);
    };

    const handleConfirmExit = (doRescan: boolean) => {
        setShowExitModal(false);
        setOpacity(0);

        // Fetch baseline from the latest log in local storage
        let baseline = { stressLevel: 80, voiceFreq: 180 };
        try {
            const savedLogs = localStorage.getItem('mock_supabase_scan_logs');
            if (savedLogs) {
                const parsed = JSON.parse(savedLogs);
                if (parsed.length > 0) {
                    const latest = parsed[parsed.length - 1];
                    baseline = { stressLevel: latest.stress_level || 80, voiceFreq: latest.voice_freq || 180 };
                }
            }
        } catch (e) { }

        setTimeout(() => {
            if (doRescan) {
                navigate('/comparative-result', { state: { baseline, duration, mode: 'quantum' } });
            } else {
                navigate('/dashboard');
            }
        }, 1500);
    };

    if (showIntro) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#020205', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', color: '#FFFFFF',
                zIndex: 99999, overflow: 'hidden', padding: '20px'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at center, ${prescription.visualColor}22 0%, #020205 70%)`, zIndex: -1 }}></div>

                <div style={{ maxWidth: '600px', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '50px 40px', borderRadius: '24px', backdropFilter: 'blur(10px)', textAlign: 'center', animation: 'fadeIn 1s ease-out' }}>
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', margin: '0 0 15px 0', letterSpacing: '4px', background: `linear-gradient(135deg, ${prescription.visualColor}, ${prescription.visualSecondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        파동 호흡 동기화
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px', wordBreak: 'keep-all', wordWrap: 'break-word' }}>
                        깊고 규칙적인 파동 호흡을 통해 불안정한 에너지를 가라앉히고, <b>내면의 깊은 휴식 상태</b>를 유도하는 맞춤형 호흡 세션입니다.
                    </p>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '40px', wordBreak: 'keep-all', wordWrap: 'break-word' }}>
                        * 오디오를 켜고 화면 중앙의 신호에 맞춰 <b>{prescription.breathType}</b> 호흡을 천천히 따라가주세요.
                    </p>

                    <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '15px', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>[ 호흡 몰입 시간에 따른 심신 안정 효과 ]</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#ccc', fontSize: '0.9rem', lineHeight: 1.8 }}>
                            <li style={{ marginBottom: '10px' }}><b style={{ color: prescription.visualColor }}>[Level 1] 3분:</b> 누적된 긴장 완화 및 편안한 이완 상태 진입</li>
                            <li style={{ marginBottom: '10px' }}><b style={{ color: prescription.visualSecondary }}>[Level 2] 5분:</b> 잡념이 사라지고 호흡과 파동이 일치하는 회복 상태</li>
                            <li><b style={{ color: '#A78BFA' }}>[Level 3] 10분 이상:</b> 외부 스트레스 차단 및 완전한 내적 에너지 충전</li>
                        </ul>
                    </div>

                    {isPrepping ? (
                        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', background: 'rgba(0,0,0,0.6)', border: `1px solid ${prescription.visualColor}80`, padding: '20px', borderRadius: '12px', textAlign: 'left', minHeight: '160px', fontFamily: 'monospace', fontSize: '0.9rem', color: prescription.visualColor }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#FFF' }}>
                                <Cpu size={20} className="pulse-anim" /> <b>생체 기반 호흡 패턴 연산 중...</b>
                            </div>
                            {prepLogs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '8px', animation: 'fadeIn 0.3s ease-out' }}>&gt; {log}</div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <button onClick={() => {
                                setIsPrepping(true);
                                const vFreq = parseFloat(sessionStorage.getItem('scan_voice_freq') || '195.4');
                                const surveyRaw = localStorage.getItem('pre_scan_survey');
                                let strLvl = 3;
                                try { if (surveyRaw) strLvl = JSON.parse(surveyRaw).stressLevel || 3; } catch (e) { }

                                const logs = [
                                    `[1] 원소 테라피 엔진 가동: 생체 데이터 맵핑 시작`,
                                    `[2] 성대 파동(Voice Freq) ${vFreq.toFixed(1)}Hz 확인`,
                                    `[3] HRV 스트레스 지표 (Level ${strLvl}) 연동 완료`,
                                    `[4] 맞춤형 호흡 프로토콜 [${prescription.breathType}] 배정 중...`,
                                    `[5] ${prescription.targetFrequency1}Hz / ${prescription.targetFrequency2}Hz 공명 파동 합성`,
                                    `[6] 양자장 동기화 준비 완료.`
                                ];
                                let idx = 0;
                                setPrepLogs([logs[0]]);
                                const logInt = setInterval(() => {
                                    idx++;
                                    if (idx < logs.length) setPrepLogs(p => [...p, logs[idx]]);
                                    else {
                                        clearInterval(logInt);
                                        setTimeout(() => {
                                            setIsPrepping(false);
                                            setShowIntro(false);
                                            setIsStarted(true);
                                        }, 1000);
                                    }
                                }, 600);
                            }} style={{
                                background: `linear-gradient(135deg, ${prescription.visualColor}, ${prescription.visualSecondary})`,
                                color: '#000', border: 'none', padding: '18px 40px', borderRadius: '40px',
                                fontSize: '1.05rem', fontWeight: 600, letterSpacing: '2px', cursor: 'pointer',
                                boxShadow: `0 10px 30px ${prescription.visualColor}40`, transition: 'all 0.3s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                                맞춤 파동 호흡 시작하기
                            </button>
                            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#888', marginTop: '20px', cursor: 'pointer', display: 'block', margin: '20px auto 0 auto', letterSpacing: '2px', fontSize: '0.8rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#888'}>
                                뒤로가기
                            </button>
                        </>
                    )}
                </div>
                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            </div >
        );
    }

    return (
        <div ref={containerRef} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: '#000', color: '#FFF', zIndex: 99999,
            opacity: opacity, transition: 'opacity 1.5s ease-in-out', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* Visual Aura Core: Prescribed Color Space */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 0, overflow: 'hidden', backgroundColor: '#020202'
            }}>
                <div style={{
                    position: 'absolute', left: '25%', top: '25%', width: '50vw', height: '50vw',
                    background: `radial-gradient(circle, ${prescription.visualColor} 0%, transparent 70%)`,
                    filter: 'blur(120px)', opacity: tuningStage >= 1 ? 0.6 : 0.1,
                    transform: `scale(${1 + breathProgress * 0.4})`,
                    transition: breathPhase === 'INHALE' ? `transform ${breathCycles.in}ms linear` : breathPhase === 'EXHALE' ? `transform ${breathCycles.out}ms linear` : 'transform 1s ease'
                }} />
                <div style={{
                    position: 'absolute', right: '15%', bottom: '15%', width: '60vw', height: '60vw',
                    background: `radial-gradient(circle, ${prescription.visualSecondary} 0%, transparent 60%)`,
                    filter: 'blur(100px)', opacity: tuningStage >= 2 ? 0.4 : 0, mixBlendMode: 'screen',
                    transform: `scale(${1 + Math.cos(duration * 0.3) * 0.15})`,
                    transition: 'opacity 4s ease-in, transform 1s linear'
                }} />

                {/* Immersive Black Vignette */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.95) 90%)',
                    pointerEvents: 'none', zIndex: 1
                }} />
            </div>

            {/* Unified UI Overlay (Bottom Right) */}
            <div style={{
                position: 'fixed',
                bottom: showUI ? '30px' : '-200px', // Slide off screen
                right: '30px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                alignItems: 'flex-end', // Align elements to the right
                maxWidth: '400px',
                transition: 'all 0.5s cubic-bezier(0.1, 0.8, 0.2, 1)', // Smooth sliding
                opacity: showUI ? 1 : 0
            }}>

                {/* 1. Header & Diagnostics */}
                <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', marginBottom: '5px' }}>
                        <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', letterSpacing: '4px', margin: 0, color: '#FFF', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                            ENERGY FIELD TUNING
                        </h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderLeft: `2px solid ${prescription.visualColor}`, borderRadius: '4px', backdropFilter: 'blur(10px)' }}>
                            <p style={{ fontSize: '0.65rem', color: '#888', margin: '0 0 2px 0', fontFamily: 'monospace', letterSpacing: '1px' }}>TARGETING</p>
                            <p style={{ fontSize: '0.8rem', color: '#FFF', margin: 0, fontWeight: 600 }}>{prescription.rootCause}</p>
                        </div>
                        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <Activity size={10} color={tuningStage === 2 ? '#4ADE80' : '#888'} style={{ animation: tuningStage === 2 ? 'pulse 2s infinite' : 'none' }} />
                                <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: tuningStage === 2 ? '#4ADE80' : '#888', letterSpacing: '1px' }}>
                                    {tuningStage === 0 ? 'CALIBRATING...' : tuningStage === 1 ? 'ENTRAINMENT' : 'SYNC ACTIVE'}
                                </span>
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#FFF', fontWeight: 300, letterSpacing: '2px' }}>
                                {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Frequency & Breathing Data (Fades in) */}
                <div style={{ opacity: tuningStage >= 1 ? 1 : 0, transition: 'opacity 2s ease', width: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.3)', padding: '12px 15px', borderRadius: '12px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <p style={{ fontSize: '0.6rem', color: '#888', margin: '0 0 3px 0', letterSpacing: '1px' }}>기본 파동</p>
                            <p style={{ fontSize: '1.1rem', color: '#FFF', margin: 0, fontWeight: 500 }}>{prescription.targetFrequency1} Hz</p>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div>
                            <p style={{ fontSize: '0.6rem', color: '#888', margin: '0 0 3px 0', letterSpacing: '1px' }}>화음 파동</p>
                            <p style={{ fontSize: '1.1rem', color: '#FFF', margin: 0, fontWeight: 500 }}>{prescription.targetFrequency2} Hz</p>
                        </div>
                    </div>

                    {tuningStage === 2 && (
                        <div style={{ marginTop: '12px', animation: 'fadeIn 2s ease', textAlign: 'right' }}>
                            <p style={{ fontSize: '1rem', color: '#FFF', letterSpacing: '2px', fontWeight: 600, transition: 'color 1s', textShadow: `0 0 10px ${breathPhase === 'INHALE' ? prescription.visualColor : prescription.visualSecondary}`, margin: '0 0 5px 0' }}>
                                {breathPhase === 'INHALE' && `숨 들이마시기: ${breathCycles.in / 1000}초`}
                                {breathPhase === 'EXHALE' && `숨 천천히 내쉬기: ${breathCycles.out / 1000}초`}
                                {breathPhase === 'HOLD' && `숨 멈추기: ${breathProgress === 1 ? breathCycles.hold / 1000 : breathCycles.hold2 / 1000}초`}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: '#888', letterSpacing: '1px', margin: 0 }}>
                                <span style={{ color: '#4ADE80' }}>[SYNC]</span> {prescription.breathType} 패턴 가동
                            </p>
                        </div>
                    )}
                </div>

                {/* 3. Controls Panel */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', pointerEvents: 'auto', marginTop: '5px', justifyContent: 'flex-end', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: '20px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }} title={isFullscreen ? "전체화면 종료" : "전체화면 열기"}>
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <input
                            type="range" min="0" max="1" step="0.01" value={volume}
                            onChange={(e) => {
                                setVolume(parseFloat(e.target.value));
                                if (parseFloat(e.target.value) > 0 && isMuted) setIsMuted(false);
                            }}
                            style={{ width: '70px', accentColor: '#FFF', opacity: isMuted ? 0.3 : 0.8, cursor: 'pointer' }}
                        />
                        <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                    </div>

                    <button onClick={handleExitClick} style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
                        color: '#FFF', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer',
                        fontSize: '0.7rem', letterSpacing: '1px', transition: 'all 0.3s', backdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                        <ArrowLeft size={14} /> 뒤로가기
                    </button>
                </div>
            </div>

            {/* Hidden UI Indicator */}
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                opacity: showUI ? 0 : 0.6,
                transform: showUI ? 'scale(0.8)' : 'scale(1)',
                transition: 'all 0.5s ease',
                pointerEvents: 'none',
                zIndex: 5,
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
            }}>
                <div style={{ width: '4px', height: '14px', background: 'var(--color-gold-main)', borderRadius: '2px', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ width: '4px', height: '24px', background: 'var(--color-gold-main)', borderRadius: '2px', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                <div style={{ width: '4px', height: '18px', background: 'var(--color-gold-main)', borderRadius: '2px', animation: 'pulse 1.5s infinite 0.4s' }}></div>
            </div>

            {/* Exit Confirmation Modal for Rescan */}
            {showExitModal && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)',
                    zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        background: '#0a0a0c', border: `1px solid ${prescription.visualColor}`,
                        padding: '40px', borderRadius: '25px', maxWidth: '450px', width: '90%',
                        textAlign: 'center', boxShadow: `0 0 50px ${prescription.visualColor}30`,
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <Cpu size={48} color={prescription.visualColor} style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ fontSize: '1.4rem', color: '#FFF', marginBottom: '15px' }}>치유 전/후 비교 분석을 진행하시겠습니까?</h2>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '30px' }}>
                            방금 진행한 {Math.floor(duration / 60)}분 {(duration % 60).toString().padStart(2, '0')}초의 튜닝이 신경계와 파동에 미친 영향을 즉시 재검사하여, 객관적인 데이터(Before & After)로 도출합니다.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <button onClick={() => handleConfirmExit(true)} style={{
                                background: `linear-gradient(135deg, ${prescription.visualColor}, ${prescription.visualSecondary})`,
                                color: '#111', padding: '16px', borderRadius: '15px', border: 'none',
                                fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                boxShadow: `0 5px 20px ${prescription.visualColor}40`
                            }}>
                                네, 재검사로 측정 결과 확인하기
                            </button>
                            <button onClick={() => handleConfirmExit(false)} style={{
                                background: 'transparent',
                                color: '#888', padding: '16px', borderRadius: '15px', border: '1px solid #333',
                                fontSize: '0.9rem', cursor: 'pointer'
                            }}>
                                건너뛰고 대시보드로 복귀 (선택)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; text-shadow: 0 0 10px #4ADE80; } 100% { opacity: 0.5; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div >
    );
};

export default ElementalTherapyScreen;
