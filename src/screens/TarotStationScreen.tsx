import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Eye, Hexagon, Zap } from 'lucide-react';
import { tarotDeck, type TarotCard } from '../data/tarotData';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const TarotStationScreen: React.FC = () => {
    const navigate = useNavigate();
    const [isDrawing, setIsDrawing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
    const [revealedCount, setRevealedCount] = useState<number>(0);
    const [scanProgress, setScanProgress] = useState(0);

    useAutoFullscreen();

    // Get user name if available
    const userName = localStorage.getItem('userName') || '게스트';

    const handleDrawCard = () => {
        if (drawnCards.length > 0 || isDrawing || isSyncing) return; // Prevent multiple draws

        setIsSyncing(true);

        // Retrieve simulated biometric data
        const savedBpm = sessionStorage.getItem('scan_bpm') || Math.floor(Math.random() * (85 - 65) + 65).toString();
        const savedFreq = sessionStorage.getItem('scan_voice_freq') || Math.floor(Math.random() * (220 - 150) + 150).toString();

        const syncSequence = [
            `[SYSTEM] 심층 생체 데이터 접근 승인...`,
            `▶ 심장 변이도(HRV): ${savedBpm} BPM 추출 완료`,
            `▶ 음성 진동수: ${savedFreq} Hz 매핑 중`,
            `▶ 내담자의 양자장과 78장 타로 덱 동기화 중...`,
            `[SYNC COMPLETE] 에너지 동기화(Energy Synchronization) 완료.`
        ];

        let step = 0;
        setSyncMessage(syncSequence[0]);

        const syncInterval = setInterval(() => {
            step++;
            if (step < syncSequence.length) {
                setSyncMessage(syncSequence[step]);
            } else {
                clearInterval(syncInterval);
                setIsSyncing(false);
                startDrawingProcess();
            }
        }, 900);
    };

    const startDrawingProcess = () => {
        setIsDrawing(true);
        setScanProgress(0);

        // Simulate Quantum Resonance Scan
        const interval = setInterval(() => {
            setScanProgress(prev => {
                const next = prev + (Math.random() * 15);
                if (next >= 100) {
                    clearInterval(interval);

                    // Quantum RNG Selection (3 unique cards)
                    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 3);

                    setDrawnCards(selected);
                    setIsDrawing(false);
                    setRevealedCount(0); // Reset reveal count
                    return 100;
                }
                return next;
            });
        }, 300);
    };

    // Sequential Reveal Effect
    useEffect(() => {
        if (drawnCards.length === 3 && revealedCount < 3) {
            const timer = setTimeout(() => {
                setRevealedCount(prev => prev + 1);
            }, 1200); // 1.2s delay between each card reveal
            return () => clearTimeout(timer);
        }
    }, [drawnCards, revealedCount]);

    const handleReset = () => {
        setDrawnCards([]);
        setRevealedCount(0);
        setScanProgress(0);
    };

    return (
        <div className="screen" style={{
            minHeight: '100vh',
            background: '#050508',
            color: '#fff',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingBottom: '60px',
            position: 'relative'
        }}>
            {/* Premium Cosmic CSS Injections */}
            <style>{`
                .cosmic-bg {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0; zIndex: 0;
                    background: radial-gradient(ellipse at bottom, #1b2735 0%, #050508 100%);
                    pointer-events: none; overflow: hidden;
                }
                .stars {
                    background: transparent url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTUwIiByPSIxLjUiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIyNTAiIGN5PSI1MCIgcj0iMC41IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iMzAwIiByPSIyIiBmaWxsPSIjZmZmIi8+jwvc3ZnPg==') repeat top center;
                    z-index: 0;
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    width: 100%; height: 100%;
                    animation: move-twink-back 200s linear infinite;
                    opacity: 0.3;
                }
                @keyframes move-twink-back {
                    from {background-position: 0 0;}
                    to {background-position: -10000px 5000px;}
                }
                .glass-card {
                    background: rgba(20, 20, 30, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(218, 165, 32, 0.2);
                    border-radius: 20px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
            `}</style>

            <div className="cosmic-bg"><div className="stars"></div></div>

            <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '0', zIndex: 20 }}>
                    <ArrowLeft size={20} />
                    <span style={{ fontSize: '1rem' }}>돌아가기</span>
                </button>
            </div>

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(218, 165, 32, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '20px', boxShadow: '0 0 30px rgba(218, 165, 32, 0.2)' }}>
                        <Hexagon size={40} color="var(--color-gold-main)" />
                    </div>
                    <h1 style={{ fontSize: '2.2rem', color: 'var(--color-gold-main)', marginBottom: '10px', fontWeight: '800', letterSpacing: '2px', textShadow: '0 0 20px rgba(218, 165, 32, 0.3)' }}>
                        ENERGY TAROT STATION
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        {userName}님의 현재 생체 에너지장과<br />가장 강력하게 공명하는 타로 원형을 추출합니다.
                    </p>
                </div>

                {/* Pre-Draw State */}
                {drawnCards.length === 0 && (
                    <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid var(--color-border-gold)' }}>

                        <div style={{
                            width: '100%', height: '280px',
                            border: '2px dashed rgba(218, 165, 32, 0.4)',
                            borderRadius: '15px',
                            marginBottom: '30px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDrawing || isSyncing ? 'rgba(218, 165, 32, 0.05)' : 'transparent',
                            transition: 'all 0.3s ease',
                            boxShadow: isDrawing || isSyncing ? '0 0 40px rgba(218, 165, 32, 0.2) inset' : 'none',
                            padding: '20px'
                        }}>
                            {isSyncing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                                    <Hexagon size={50} color="var(--color-gold-main)" className="spin-slow" />
                                    <div style={{
                                        color: '#00FA9A', fontFamily: 'monospace', fontSize: '1rem',
                                        textAlign: 'center', width: '100%', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px',
                                        minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {syncMessage}
                                    </div>
                                </div>
                            ) : isDrawing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <Activity size={50} color="var(--color-gold-main)" className="pulse-anim" />
                                    <span style={{ color: 'var(--color-gold-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>타로 덱 셔플링... {Math.round(scanProgress)}%</span>
                                </div>
                            ) : (
                                <Eye size={50} color="rgba(218, 165, 32, 0.3)" />
                            )}
                        </div>

                        <button
                            className="primary-btn"
                            onClick={handleDrawCard}
                            disabled={isDrawing || isSyncing}
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.1rem',
                                opacity: (isDrawing || isSyncing) ? 0.5 : 1, cursor: (isDrawing || isSyncing) ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                            }}
                        >
                            {(isDrawing || isSyncing) ? '파동 융합 중...' : <><Zap size={20} /> 3-Card 양자 추출 스핀</>}
                        </button>
                        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            * 과거의 원인, 현재의 공명, 미래의 수렴을 뜻하는 3장의 카드가 추출됩니다.
                        </p>
                    </div>
                )}

                {/* Post-Draw State (3 Cards) */}
                {drawnCards.length === 3 && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 1s ease-out' }}>

                        {/* 3 Cards Layout */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: '20px',
                            marginBottom: '40px',
                            width: '100%',
                            flexWrap: 'wrap' // Allows wrapping on small screens
                        }}>
                            {[
                                { title: '과거 (근원 파동)', card: drawnCards[0] },
                                { title: '현재 (공명 파동)', card: drawnCards[1] },
                                { title: '미래 (수렴 파동)', card: drawnCards[2] }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    flex: '1 1 200px',
                                    maxWidth: '280px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    opacity: revealedCount > idx ? 1 : 0.3,
                                    transform: revealedCount > idx ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}>

                                    <h4 style={{ color: 'var(--color-gold-main)', marginBottom: '15px', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                                        {item.title}
                                    </h4>

                                    {/* The Card with 3D Flip */}
                                    <div style={{
                                        width: '100%', height: '360px',
                                        perspective: '1000px',
                                    }}>
                                        <div style={{
                                            width: '100%', height: '100%',
                                            position: 'relative',
                                            transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            transformStyle: 'preserve-3d',
                                            transform: revealedCount > idx ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        }}>

                                            {/* Unrevealed Front (Card Back) */}
                                            <div style={{
                                                position: 'absolute', width: '100%', height: '100%',
                                                backfaceVisibility: 'hidden',
                                                borderRadius: '15px',
                                                border: '2px solid rgba(218, 165, 32, 0.3)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                background: 'repeating-linear-gradient(45deg, rgba(218, 165, 32, 0.05) 0, rgba(218, 165, 32, 0.05) 10px, rgba(10,10,15,0.95) 10px, rgba(10,10,15,0.95) 20px)',
                                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                                            }}>
                                                <Hexagon size={50} color="rgba(218, 165, 32, 0.3)" />
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', letterSpacing: '4px', color: 'rgba(218, 165, 32, 0.5)' }}>
                                                    {idx === 0 ? 'PAST' : idx === 1 ? 'PRESENT' : 'FUTURE'}
                                                </div>
                                            </div>

                                            {/* Revealed Back (Tarot Image) */}
                                            <div style={{
                                                position: 'absolute', width: '100%', height: '100%',
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                                borderRadius: '15px',
                                                border: '2px solid var(--color-gold-main)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px',
                                                background: 'linear-gradient(145deg, rgba(20,20,30,0.95), rgba(5,5,10,0.98))',
                                                boxShadow: '0 0 30px rgba(218, 165, 32, 0.4), inset 0 0 15px rgba(218, 165, 32, 0.2)'
                                            }}>
                                                <div style={{ flex: 1, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(218,165,32,0.5)', marginBottom: '15px' }}>
                                                    <img
                                                        src={`/assets/tarot/${item.card.imgFileName}`}
                                                        alt={item.card.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.15) brightness(0.9) sepia(0.3)' }}
                                                    />
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', color: '#FFF', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>
                                                    {item.card.romanNumeral}. {item.card.name}
                                                </h3>
                                                <p style={{ color: 'var(--color-gold-main)', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>
                                                    {item.card.quantumState}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {revealedCount === 3 && (
                            <>
                                {/* Combined Analysis Content */}
                                <div className="glass-card" style={{ width: '100%', padding: '30px', marginBottom: '20px', animation: 'fadeIn 1s ease-out' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                        <Activity color="var(--color-gold-main)" size={24} />
                                        <h3 style={{ color: '#FFF', fontSize: '1.3rem' }}>종합 파동 에너지 해설</h3>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <strong style={{ color: '#E0E0E0', fontSize: '1rem' }}>1. 과거의 잔상 (무의식의 뿌리)</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '5px' }}>
                                            {drawnCards[0].description}
                                        </p>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <strong style={{ color: '#E0E0E0', fontSize: '1rem' }}>2. 현재의 공명 (지금 이 순간의 강력한 에너지)</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '5px' }}>
                                            {drawnCards[1].description}
                                        </p>
                                    </div>
                                    <div>
                                        <strong style={{ color: '#E0E0E0', fontSize: '1rem' }}>3. 미래의 궤적 (이대로 흐를 경우 수렴할 양자적 결론)</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '5px' }}>
                                            {drawnCards[2].description}
                                        </p>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ width: '100%', padding: '30px', marginBottom: '40px', borderLeft: '3px solid var(--color-gold-main)', animation: 'fadeIn 1.5s ease-out' }}>
                                    <h3 style={{ color: 'var(--color-gold-main)', fontSize: '1.2rem', marginBottom: '15px' }}>최종 에너지 동조 가이드 (Action Plan)</h3>
                                    <p style={{ color: '#E0E0E0', lineHeight: 1.8, fontSize: '1.05rem', wordBreak: 'keep-all', fontWeight: '500' }}>
                                        과거의 [{drawnCards[0].name}] 파동을 자연스럽게 흘려보내고, 현재의 [{drawnCards[1].name}] 에너지에 온전히 집중하십시오. 주변의 낡은 패턴을 정화한다면 당신의 미래는 완벽한 [{drawnCards[2].name}] 파동로 수렴하게 될 것입니다.
                                        <br /><br />
                                        <strong>핵심 조언:</strong> {drawnCards[1].advice}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', animation: 'fadeIn 2s ease-out' }}>
                                    <button
                                        onClick={() => navigate('/chat', { state: { tarotCards: drawnCards } })}
                                        className="primary-btn"
                                        style={{ padding: '15px 40px', borderRadius: '30px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 0 20px rgba(218, 165, 32, 0.4)' }}
                                    >
                                        <Zap size={20} />
                                        AI 오라클에게 심층 상담받기
                                    </button>
                                    <button onClick={handleReset} className="secondary-btn" style={{ padding: '15px 40px', borderRadius: '30px', flex: 1 }}>
                                        다른 시점의 에너지 파동 재스캔
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TarotStationScreen;
