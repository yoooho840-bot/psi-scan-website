import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Waves, Volume2, CloudRain } from 'lucide-react';
import RitualPortal from '../components/RitualPortal';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const SOLFEGGIO_FREQS = [
    { hz: 174, name: '174Hz 통증 완화', desc: '육체적/정신적 고통을 부드럽게 감싸줍니다.' },
    { hz: 285, name: '285Hz 세포 재생', desc: '손상된 에너지 필드와 조직을 재구성합니다.' },
    { hz: 396, name: '396Hz 두려움 해방', desc: '슬픔과 죄책감을 긍정의 파동으로 바꿉니다.' },
    { hz: 417, name: '417Hz 트라우마 정화', desc: '과거의 상처를 지우고 새로운 변화를 유도합니다.' },
    { hz: 432, name: '432Hz 미주신경 안정', desc: '자연의 기본 주파수로 교감신경을 이완시킵니다.' },
    { hz: 528, name: '528Hz 기적의 DNA 복구', desc: '세포 단위의 긍정적 변형과 기적을 부릅니다.' },
    { hz: 639, name: '639Hz 관계의 조화', desc: '주변 사람들과의 주파수를 공명시켜 줍니다.' },
    { hz: 741, name: '741Hz 직관력 각성', desc: '독소를 배출하고 직관적 해결책을 제시합니다.' },
    { hz: 852, name: '852Hz 영적 질서', desc: '사물을 바라보는 명확한 통찰력을 줍니다.' },
    { hz: 963, name: '963Hz 송과체 활성화', desc: '가장 높은 차원의 영적 파동과 연결됩니다.' }
];

const FrequencyLabScreen: React.FC = () => {
    const navigate = useNavigate();
    const [showIntro, setShowIntro] = useState(true);
    const [opacity, setOpacity] = useState(0);
    const [activeHz, setActiveHz] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [noiseVolume, setNoiseVolume] = useState(0.2);
    const [isNoisePlaying, setIsNoisePlaying] = useState(false);
    const [masterVolume, setMasterVolume] = useState(0.5);
    const [showUI, setShowUI] = useState(true);

    useAutoFullscreen();
    const uiTimeoutRef = useRef<any>(null);

    const handleUserActivity = useCallback(() => {
        setShowUI(true);
        if (uiTimeoutRef.current) {
            clearTimeout(uiTimeoutRef.current);
        }
        if (isPlaying) {
            uiTimeoutRef.current = setTimeout(() => {
                setShowUI(false);
            }, 2000);
        }
    }, [isPlaying]);

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
    const masterGainRef = useRef<GainNode | null>(null);
    const osc1Ref = useRef<OscillatorNode | null>(null);
    const osc2Ref = useRef<OscillatorNode | null>(null);

    const noiseSrcRef = useRef<AudioBufferSourceNode | null>(null);
    const noiseGainRef = useRef<GainNode | null>(null);

    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    // Main Frequency Generator
    const playFrequency = (hz: number) => {
        initAudio();
        const ctx = audioCtxRef.current!;
        if (ctx.state === 'suspended') ctx.resume();

        // Stop current if any
        stopFrequency(true);

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(masterVolume, ctx.currentTime + 3); // 3 sec fade in
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(hz, ctx.currentTime);
        osc1.connect(masterGain);
        osc1.start();
        osc1Ref.current = osc1;

        // Binaural Beat Element (4Hz Theta wave offset)
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(hz + 4, ctx.currentTime);
        osc2.connect(masterGain);
        osc2.start();
        osc2Ref.current = osc2;

        setActiveHz(hz);
        setIsPlaying(true);
        handleUserActivity();
    };

    const stopFrequency = (immediate = false) => {
        if (!audioCtxRef.current || !masterGainRef.current) return;
        const ctx = audioCtxRef.current;
        const gainNode = masterGainRef.current;

        if (immediate) {
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            stopOscillators();
        } else {
            // Smooth fade out
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
            setTimeout(() => {
                stopOscillators();
            }, 2100);
        }
    };

    const stopOscillators = () => {
        if (osc1Ref.current) { osc1Ref.current.stop(); osc1Ref.current.disconnect(); osc1Ref.current = null; }
        if (osc2Ref.current) { osc2Ref.current.stop(); osc2Ref.current.disconnect(); osc2Ref.current = null; }
        setIsPlaying(false);
    };

    // Ambient Noise Generator (Brown Noise / Rain)
    const toggleNoise = () => {
        initAudio();
        const ctx = audioCtxRef.current!;
        if (ctx.state === 'suspended') ctx.resume();

        let buffer: AudioBuffer | null = null;
        if (isNoisePlaying) {
            if (noiseGainRef.current) {
                noiseGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
                setTimeout(() => {
                    if (noiseSrcRef.current) { noiseSrcRef.current.stop(); noiseSrcRef.current.disconnect(); }
                    setIsNoisePlaying(false);
                }, 1100);
            }
            return;
        } else {
            // Create Brown Noise manually via Web Audio API Buffer
            const bufferSize = ctx.sampleRate * 2; // 2 seconds
            buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                // Brown noise approximation (integration)
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for volume drop
            }
        }

        if (!buffer) return;
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        // Filter to make it sound like rain
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(noiseVolume, ctx.currentTime + 2);

        noiseSrc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noiseSrc.start();

        noiseSrcRef.current = noiseSrc;
        noiseGainRef.current = gain;
        setIsNoisePlaying(true);
    };

    // Update noise volume dynamically
    useEffect(() => {
        if (noiseGainRef.current && audioCtxRef.current) {
            noiseGainRef.current.gain.linearRampToValueAtTime(noiseVolume, audioCtxRef.current.currentTime + 0.1);
        }
    }, [noiseVolume]);

    // Update master frequency volume dynamically
    useEffect(() => {
        if (masterGainRef.current && audioCtxRef.current && isPlaying) {
            masterGainRef.current.gain.linearRampToValueAtTime(masterVolume, audioCtxRef.current.currentTime + 0.1);
        }
    }, [masterVolume, isPlaying]);

    // Cleanup
    useEffect(() => {
        return () => {
            stopFrequency(true);
            if (noiseSrcRef.current) {
                try { noiseSrcRef.current.stop(); noiseSrcRef.current.disconnect(); } catch (e) { }
                noiseSrcRef.current = null;
            }
            if (noiseGainRef.current) {
                try { noiseGainRef.current.disconnect(); } catch (e) { }
            }
            if (masterGainRef.current) {
                try { masterGainRef.current.disconnect(); } catch (e) { }
            }
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                try { audioCtxRef.current.suspend(); } catch (e) { }
                audioCtxRef.current?.close().catch(() => { });
                audioCtxRef.current = null;
            }
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => { });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStart = () => {
        setShowIntro(false);
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

    useEffect(() => {
        if (showIntro) return;
        const timer = setTimeout(() => setOpacity(1), 500);
        return () => clearTimeout(timer);
    }, [showIntro]);

    const activeItem = SOLFEGGIO_FREQS.find(f => f.hz === activeHz);

    if (showIntro) {
        return createPortal(
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column', backgroundColor: '#020205',
                justifyContent: 'center', alignItems: 'center', color: '#FFFFFF',
                zIndex: 999999, overflow: 'hidden', padding: '20px'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(218,165,32,0.1) 0%, transparent 70%)',
                    zIndex: -1
                }}></div>

                <div style={{
                    maxWidth: '800px', width: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '50px 40px', borderRadius: '30px',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    animation: 'fadeIn 1s ease-out',
                }}>
                    <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '2.5rem', margin: '0 0 15px 0', letterSpacing: '4px', color: '#DAA520' }}>
                        사운드 힐링 (공명)
                    </h1>
                    <p style={{ color: '#eee', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px', wordBreak: 'keep-all', wordWrap: 'break-word', fontWeight: 300 }}>
                        나를 치유하는 10가지 솔페지오 주파수와 마스터 주파수를 통해 에너지 필드의 <b>불균형을 조율</b>합니다.<br /><br />
                        조용한 환경에서 이어폰을 착용하고, 자신에게 가장 필요한 주파수를 찾아 깊은 이완 상태를 경험해 보세요.
                    </p>

                    <button onClick={handleStart} style={{
                        background: 'linear-gradient(135deg, #DAA520, #FBBF24)',
                        color: '#000', border: 'none', padding: '18px 40px', borderRadius: '40px',
                        fontSize: '1.2rem', fontWeight: 600, letterSpacing: '2px', cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(218,165,32,0.2)', transition: 'all 0.3s'
                    }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; }}>
                        주파수 공명 시작하기
                    </button>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#888', marginTop: '20px', cursor: 'pointer', display: 'block', margin: '20px auto 0 auto', letterSpacing: '2px', fontSize: '1rem', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#888'}>
                        뒤로가기
                    </button>
                </div>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>,
            document.body
        );
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: '#020205', color: '#FFF', zIndex: 99999, overflowY: 'auto',
            opacity: opacity, transition: 'opacity 1s ease', display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ padding: '20px 24px', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => { stopFrequency(true); navigate(-1); }} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }} className="gold-text">사운드 힐링 (공명)</h2>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>나를 치유하는 10가지 파동</p>
                </div>
                <Waves size={24} color="#DAA520" />
            </div>

            {/* Visualizer Area */}
            <div style={{
                height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden'
            }}>
                {/* Mandala / Ripple Effect */}
                <div style={{
                    position: 'absolute', width: '150px', height: '150px', borderRadius: '50%',
                    background: isPlaying ? 'radial-gradient(circle, rgba(218,165,32,0.15), transparent 70%)' : 'transparent',
                    boxShadow: isPlaying ? '0 0 60px rgba(218,165,32,0.3)' : 'none',
                    animation: isPlaying ? 'pulse 4s infinite alternate ease-in-out' : 'none',
                    border: isPlaying ? '1px solid rgba(218,165,32,0.2)' : '1px dashed rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '2.5rem', margin: 0, color: isPlaying ? '#FFF' : '#444', fontWeight: 300, textShadow: isPlaying ? '0 0 10px rgba(218,165,32,0.8)' : 'none' }}>
                        {activeHz ? `${activeHz}Hz` : 'OFF'}
                    </h2>
                </div>
                <p style={{ position: 'absolute', bottom: '20px', color: '#AAA', fontSize: '0.9rem', margin: 0 }}>
                    {isPlaying ? activeItem?.name : '주파수를 선택하세요'}
                </p>
            </div>

            {/* Main Frequency Volume Control */}
            <div style={{ padding: '15px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Volume2 size={16} color="#DAA520" />
                <span style={{ fontSize: '0.85rem', color: '#FFF' }}>공명 볼륨</span>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={masterVolume} onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: '#DAA520', cursor: 'pointer' }}
                />
            </div>

            {/* Ambient Noise Mixer */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CloudRain size={18} color="#4A90E2" />
                        <span style={{ fontSize: '0.95rem', color: '#FFF' }}>백그라운드 빗소리 (Brown Noise)</span>
                    </div>
                    <button onClick={toggleNoise} style={{
                        background: isNoisePlaying ? '#4A90E2' : 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF',
                        padding: '6px 15px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer'
                    }}>
                        {isNoisePlaying ? '끄기' : '켜기'}
                    </button>
                </div>
                {isNoisePlaying && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Volume2 size={16} color="#888" />
                        <input
                            type="range" min="0" max="1" step="0.01"
                            value={noiseVolume} onChange={(e) => setNoiseVolume(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: '#4A90E2' }}
                        />
                    </div>
                )}
            </div>

            {/* Frequencies List */}
            <div style={{ padding: '20px 24px' }}>
                <h3 style={{ color: '#888', fontSize: '0.85rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>솔페지오 & 마스터 주파수</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {SOLFEGGIO_FREQS.map(freq => {
                        const isActive = activeHz === freq.hz && isPlaying;
                        return (
                            <div key={freq.hz} className="glass-card" style={{
                                padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                border: isActive ? '1px solid rgba(218,165,32,0.5)' : '1px solid rgba(255,255,255,0.05)',
                                background: isActive ? 'rgba(218,165,32,0.1)' : 'rgba(255,255,255,0.03)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '1.05rem', color: isActive ? '#DAA520' : '#FFF', fontWeight: 600, marginBottom: '5px' }}>
                                        {freq.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.3 }}>{freq.desc}</div>
                                </div>

                                <button
                                    onClick={() => isActive ? stopFrequency() : playFrequency(freq.hz)}
                                    style={{
                                        width: '45px', height: '45px', borderRadius: '50%', background: isActive ? 'var(--color-gold-main)' : 'rgba(255,255,255,0.1)',
                                        border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', color: isActive ? '#111' : '#FFF', cursor: 'pointer'
                                    }}
                                >
                                    {isActive ? <Pause size={20} /> : <Play size={20} fill="currentColor" style={{ marginLeft: '3px' }} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <RitualPortal currentPath="/frequency-lab" />

            {/* Unified UI Overlay (Bottom Right Auto-Hide) - Only show when playing and full screen */}
            {isPlaying && (
                <>
                    <div
                        style={{
                            position: 'fixed',
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
                        {/* 1. Status Text */}
                        <div style={{ pointerEvents: 'none', textAlign: 'right', background: 'rgba(0,0,0,0.5)', padding: '10px 15px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(218,165,32,0.15)' }}>
                            <span style={{ fontSize: '0.8rem', color: '#DAA520', letterSpacing: '2px', opacity: 0.8, fontWeight: 500, display: 'block', marginBottom: '5px' }}>
                                사운드 힐링 (공명)
                            </span>
                            <span style={{ fontSize: '1.2rem', color: '#FFF', fontWeight: 600 }}>
                                {activeItem?.name}
                            </span>
                        </div>

                        {/* 3. Exit Button */}
                        <div style={{ pointerEvents: 'auto' }}>
                            <button onClick={() => stopFrequency()} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(218,165,32,0.2)', color: '#aaa', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(5px)', transition: 'all 0.3s' }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(218,165,32,0.6)'; }} onMouseOut={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(218,165,32,0.2)'; }}>
                                뒤로가기 <ArrowLeft size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Hidden State Indicator (PSI Logo) */}
                    <div
                        style={{
                            position: 'fixed',
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
                            border: `1px solid rgba(218,165,32,0.2)`,
                            backdropFilter: 'blur(5px)'
                        }}
                        onMouseEnter={handleUserActivity}
                        onClick={handleUserActivity}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: `radial-gradient(circle at center, #DAA520, transparent)`
                        }}></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FrequencyLabScreen;
