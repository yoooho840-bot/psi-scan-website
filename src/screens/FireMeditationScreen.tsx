import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Maximize, Minimize, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

const FireMeditationScreen: React.FC = () => {
    const navigate = useNavigate();

    const containerRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscLRef = useRef<OscillatorNode | null>(null);
    const oscRRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);

    const [showIntro, setShowIntro] = useState(true);
    const [isStarted, setIsStarted] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isUnmounting, setIsUnmounting] = useState(false);
    const [showUI, setShowUI] = useState(true);
    const uiTimeoutRef = useRef<any>(null);

    const meditationThemes = [
        {
            vid: "L_LUpnjgPso",
            freqL: 256.0, freqR: 266.0, name: "알파파 (10Hz) - 신체적 안정 (벽난로)"
        },
        {
            vid: "AWKza6q8uO8",
            freqL: 320.0, freqR: 328.0, name: "알파파 (8Hz) - 내면의 온기 (장작불)"
        }
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    // 10-minute video & frequency rotation
    useEffect(() => {
        if (!isStarted) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % meditationThemes.length);
        }, 10 * 60 * 1000); // 10 minutes in ms
        return () => clearInterval(interval);
    }, [isStarted]);

    const handleUserActivity = useCallback(() => {
        setShowUI(true);
        if (uiTimeoutRef.current) {
            clearTimeout(uiTimeoutRef.current);
        }
        if (isStarted && !showIntro) {
            uiTimeoutRef.current = setTimeout(() => {
                setShowUI(false);
            }, 2000);
        }
    }, [isStarted, showIntro]);

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

    // Track fullscreen status
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
            setIsFullscreen(isFull);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Initial fade in for intro
    useEffect(() => {
        if (showIntro) return;
        const timer = setTimeout(() => setOpacity(1), 500);
        return () => clearTimeout(timer);
    }, [showIntro]);

    // Handle Mute and Volume dynamically without recreating nodes
    useEffect(() => {
        if (gainRef.current && audioCtxRef.current) {
            gainRef.current.gain.setTargetAtTime(isMuted ? 0 : volume, audioCtxRef.current.currentTime, 0.1);
        }
    }, [isMuted, volume]);

    // --- Audio System (Only Binaural Beats 10Hz, Fire sound comes from YouTube) ---
    useEffect(() => {
        if (!isStarted || isUnmounting) return;

        // Cleanup any existing audio context before creating a new one (strict mode safety)
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch (e) { }
        }

        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const merger = ctx.createChannelMerger(2);

        // Calculate initial frequencies based on the current theme
        const initialTheme = meditationThemes[currentIndex];

        // Left channel
        const oscL = ctx.createOscillator();
        const gainL = ctx.createGain();
        oscL.frequency.value = initialTheme.freqL;
        oscL.type = 'sine';
        gainL.gain.value = 0.05;
        oscL.connect(gainL).connect(merger, 0, 0);

        // Right channel (Binaural Beat offset)
        const oscR = ctx.createOscillator();
        const gainR = ctx.createGain();
        oscR.frequency.value = initialTheme.freqR;
        oscR.type = 'sine';
        gainR.gain.value = 0.05;
        oscR.connect(gainR).connect(merger, 0, 1);

        // Main gain for muting control
        const mainGain = ctx.createGain();
        mainGain.gain.value = isMuted ? 0 : 1;
        merger.connect(mainGain).connect(ctx.destination);

        oscL.start();
        oscR.start();

        oscLRef.current = oscL;
        oscRRef.current = oscR;
        gainRef.current = mainGain;

        return () => {
            try {
                if (oscLRef.current) {
                    oscLRef.current.stop();
                    oscLRef.current.disconnect();
                    oscLRef.current = null;
                }
                if (oscRRef.current) {
                    oscRRef.current.stop();
                    oscRRef.current.disconnect();
                    oscRRef.current = null;
                }
                if (audioCtxRef.current) {
                    try { audioCtxRef.current.suspend(); } catch (e) { }
                    audioCtxRef.current.close().catch(e => console.log("Audio Close Error:", e));
                    audioCtxRef.current = null;
                }
            } catch (e) {
                console.log("Audio Cleanup Error:", e);
            }
        };
    }, [isStarted, isUnmounting]);

    // Smooth Frequency Transition upon Theme Change
    useEffect(() => {
        if (isStarted && oscLRef.current && oscRRef.current && audioCtxRef.current) {
            const { freqL, freqR } = meditationThemes[currentIndex];
            const now = audioCtxRef.current.currentTime;

            // Glide the frequency over 2 seconds to make the transition very subtle and relaxing
            oscLRef.current.frequency.setTargetAtTime(freqL, now, 2);
            oscRRef.current.frequency.setTargetAtTime(freqR, now, 2);
        }
    }, [currentIndex, isStarted]);

    const toggleFullscreen = useCallback(() => {
        const docElm = document.documentElement as any;
        if (!docElm) return;

        const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);

        if (!isFull) {
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen().catch((err: any) => console.log(err));
            } else if (docElm.webkitRequestFullscreen) { // Safari/iOS fallback
                docElm.webkitRequestFullscreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
        } else {
            const doc = document as any;
            if (doc.exitFullscreen) {
                doc.exitFullscreen().catch((err: any) => console.log(err));
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    }, []);

    const handleStart = () => {
        setShowIntro(false);
        setIsStarted(true);
        handleUserActivity();

        const docElm = document.documentElement as any;
        if (docElm) {
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen().catch((err: any) => console.log(err));
            } else if (docElm.webkitRequestFullscreen) {
                docElm.webkitRequestFullscreen();
            }
        }
    };

    const handleExit = () => {
        // First Force synchronous cleanup of any audio!
        if (oscLRef.current) { try { oscLRef.current.stop(); oscLRef.current.disconnect(); } catch (e) { } }
        if (oscRRef.current) { try { oscRRef.current.stop(); oscRRef.current.disconnect(); } catch (e) { } }
        if (audioCtxRef.current) { try { audioCtxRef.current.suspend(); audioCtxRef.current.close(); } catch (e) { } audioCtxRef.current = null; }

        setIsUnmounting(true); // Triggers re-render to wipe out iframe immediately

        setTimeout(() => {
            // Wait a split second to ensure React unmounts DOM then route
            if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
            } else {
                navigate('/dashboard');
            }
        }, 50);
    };

    if (showIntro && !isUnmounting) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#050300', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', color: '#FFFFFF',
                zIndex: 99999, overflow: 'hidden', padding: '20px'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at center, rgba(255, 102, 0, 0.15) 0%, #050300 70%)`, zIndex: -1 }}></div>

                <div style={{ textAlign: 'center', maxWidth: '600px', zIndex: 10 }}>
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', letterSpacing: '2px', color: '#ff6600', marginBottom: '15px' }}>
                        불멍 명상
                    </h1>
                    <p style={{ color: '#ccc', fontSize: '1rem', lineHeight: 1.5, marginBottom: '40px' }}>
                        안정적인 뇌파(Alpha 10Hz) 유도를 위한 파동이 함께 재생됩니다.
                    </p>

                    <button
                        onClick={handleStart}
                        style={{
                            background: 'rgba(255, 102, 0, 0.1)', border: '1px solid rgba(255, 102, 0, 0.3)',
                            color: '#ff8c00', padding: '12px 30px', fontSize: '1rem',
                            borderRadius: '30px', cursor: 'pointer', fontFamily: 'var(--font-brand)',
                            letterSpacing: '1px', transition: 'all 0.3s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 102, 0, 0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 102, 0, 0.1)'}
                    >
                        명상 시작하기
                    </button>

                    <button
                        onClick={handleExit}
                        style={{
                            display: 'block', margin: '30px auto 0',
                            background: 'transparent', border: 'none',
                            color: '#666', fontSize: '0.85rem',
                            cursor: 'pointer', fontFamily: 'var(--font-brand)',
                            textDecoration: 'underline'
                        }}
                    >
                        뒤로가기
                    </button>
                </div>
            </div>
        );
    }

    // Wrap the active meditation UI in a React Portal so it breaks out of all parent CSS contexts
    const portalContent = isUnmounting ? null : (
        <div ref={containerRef} style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#000', zIndex: 2147483647, overflow: 'hidden', // Max possible z-index
            opacity: opacity, transition: 'opacity 2s ease-in-out',
            margin: 0, padding: 0, pointerEvents: 'auto'
        }}>
            {/* Seamless 4K YouTube Fireplace Embed Background */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '120vw',
                height: '120vh',
                transform: 'translate(-50%, -50%)',
                zIndex: 0,
                pointerEvents: 'none', // Prevent clicking the video to pause
            }}>
                <iframe
                    key={meditationThemes[currentIndex].vid}  /* Ensure iframe completely replaces on change */
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${meditationThemes[currentIndex].vid}?autoplay=1&loop=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&iv_load_policy=3&playlist=${meditationThemes[currentIndex].vid}`}
                    title="4K Fire Background"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ filter: 'contrast(1.1) brightness(0.9) saturate(1.2)' }}
                />
            </div>

            {/* Unified UI Overlay (Bottom Right Auto-Hide) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: isFullscreen ? '40px' : '30px',
                    right: isFullscreen ? '40px' : '30px',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    alignItems: 'flex-end',
                    transition: 'all 0.5s ease-in-out',
                    opacity: showUI ? 1 : 0,
                    transform: showUI ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: showUI ? 'auto' : 'none'
                }}
            >
                {/* 1. Status Text */}
                <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: '#ff8c00', letterSpacing: '2px', opacity: 0.8, fontWeight: 500 }}>
                        불멍 명상 | {meditationThemes[currentIndex].name}
                    </span>
                </div>

                {/* 2. Controls Panel */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,0.5)', padding: '10px 15px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,102,0,0.15)', pointerEvents: 'auto' }}>
                    <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }} title={isFullscreen ? "전체화면 종료" : "전체화면 열기"}>
                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                    <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <input
                        type="range" min="0" max="1" step="0.01" value={volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            if (parseFloat(e.target.value) > 0 && isMuted) setIsMuted(false);
                        }}
                        style={{ width: '80px', accentColor: '#ff6600', opacity: isMuted ? 0.3 : 0.8, cursor: 'pointer' }}
                    />
                    <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>{isMuted ? '음소거' : '소리'}</span>
                    </button>
                </div>

                {/* 3. Exit Button */}
                <div style={{ pointerEvents: 'auto' }}>
                    <button onClick={handleExit} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,102,0,0.2)', color: '#aaa', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(5px)', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,102,0,0.6)'; }} onMouseOut={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(255,102,0,0.2)'; }}>
                        뒤로가기 <ArrowLeft size={16} />
                    </button>
                </div>
            </div>

            {/* Hidden State Indicator (PSI Logo) */}
            <div
                style={{
                    position: 'absolute',
                    bottom: isFullscreen ? '40px' : '30px',
                    right: isFullscreen ? '40px' : '30px',
                    zIndex: 9,
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
                    border: '1px solid rgba(255,102,0,0.2)',
                    backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={handleUserActivity}
                onClick={handleUserActivity}
            >
                <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at center, #ff6600, transparent)'
                }}></div>
            </div>
        </div>
    );

    return createPortal(portalContent, document.body);
};

export default FireMeditationScreen;
