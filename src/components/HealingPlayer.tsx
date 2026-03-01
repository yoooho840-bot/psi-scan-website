import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, X } from 'lucide-react';

interface HealingPlayerProps {
    baseHz: number;
    therapyName: string;
    onClose: () => void;
}

const HealingPlayer: React.FC<HealingPlayerProps> = ({ baseHz, therapyName, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const osc1Ref = useRef<OscillatorNode | null>(null);
    const osc2Ref = useRef<OscillatorNode | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);

    // Initialize audio context lazily
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    const startTherapy = () => {
        if (!audioCtxRef.current) initAudio();
        const ctx = audioCtxRef.current!;

        // Resume if constrained by browser policy
        if (ctx.state === 'suspended') ctx.resume();

        // 1. Master Gain Node (Envelope Control)
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        // Smooth 2-second fade-in to emulate a singing bowl gradually resonating
        masterGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // 2. Base Oscillator (Carrier wave)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseHz, ctx.currentTime);
        osc1.connect(masterGain);
        osc1.start();
        osc1Ref.current = osc1;

        // 3. Detuned Oscillator for Binaural/Monaural Beat (Singing bowl throbbing effect)
        // A difference of 4-7Hz stimulates Theta waves in the brain
        const beatFrequency = 4; // 4Hz = Deep meditation
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseHz + beatFrequency, ctx.currentTime);
        osc2.connect(masterGain);
        osc2.start();
        osc2Ref.current = osc2;

        setIsPlaying(true);
    };

    const stopTherapy = () => {
        if (!audioCtxRef.current || !masterGainRef.current) return;
        const ctx = audioCtxRef.current;
        const gainNode = masterGainRef.current;

        // Smooth 1.5-second fade-out
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

        // Disconnect after fade-out completes
        setTimeout(() => {
            if (osc1Ref.current) { osc1Ref.current.stop(); osc1Ref.current.disconnect(); }
            if (osc2Ref.current) { osc2Ref.current.stop(); osc2Ref.current.disconnect(); }
            setIsPlaying(false);
        }, 1600);
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopTherapy();
        } else {
            startTherapy();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isPlaying) stopTherapy();
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                setTimeout(() => audioCtxRef.current?.close(), 2000);
            }
        };
    }, [isPlaying]);

    return (
        <div style={{
            position: 'fixed', bottom: '80px', left: '20px', right: '20px',
            background: 'rgba(10, 15, 25, 0.95)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(218, 165, 32, 0.4)',
            borderRadius: '20px',
            padding: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '400px',
            margin: '0 auto' // center on large screens
        }}>
            <style>
                {`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulseRing {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    50% { transform: scale(1.15); opacity: 0.3; }
                    100% { transform: scale(0.9); opacity: 0.8; }
                }
                `}
            </style>

            <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={20} />
            </button>

            <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: isPlaying ? 'radial-gradient(circle, rgba(218,165,32,0.8), rgba(0,0,0,0))' : 'rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                marginBottom: '15px',
                animation: isPlaying ? 'pulseRing 4s infinite ease-in-out' : 'none',
                border: '1px solid rgba(218,165,32,0.3)',
                transition: 'background 0.5s'
            }}>
                <Volume2 size={30} color={isPlaying ? '#FFF' : '#555'} />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#DAA520', margin: '0 0 5px 0', textAlign: 'center' }}>
                {therapyName}
            </h3>
            <p style={{ color: '#AAA', fontSize: '0.85rem', margin: '0 0 20px 0', textAlign: 'center' }}>
                {baseHz}Hz 베이스 + 4Hz 세타파 바이노럴 비트
            </p>

            <button onClick={togglePlay} className="primary-btn" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: isPlaying ? 'rgba(255,255,255,0.1)' : 'var(--color-gold-main)',
                color: isPlaying ? '#FFF' : '#111',
                padding: '12px 30px', fontSize: '1rem',
                border: isPlaying ? '1px solid rgba(255,255,255,0.2)' : 'none',
                boxShadow: isPlaying ? 'none' : '0 0 15px rgba(218,165,32,0.4)',
                minWidth: '200px', justifyContent: 'center'
            }}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                {isPlaying ? '파동 재생 중지' : '힐링 파동 재생 시작'}
            </button>
        </div>
    );
};

export default HealingPlayer;
