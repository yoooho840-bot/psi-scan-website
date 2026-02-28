import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Activity, Eye, Hexagon, Zap, HeartHandshake, Users } from 'lucide-react';
import { tarotDeck, type TarotCard } from '../data/tarotData';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const DualTarotScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get partner info from navigation state
    const { partnerName, compatibility } = location.state || { partnerName: '상대방', compatibility: 90 };
    const userName = localStorage.getItem('userName') || '게스트';

    const [isDrawing, setIsDrawing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
    const [revealedCount, setRevealedCount] = useState<number>(0);
    const [scanProgress, setScanProgress] = useState(0);

    useAutoFullscreen();

    const handleDrawCard = () => {
        if (drawnCards.length > 0 || isDrawing || isSyncing) return;

        setIsSyncing(true);

        const syncSequence = [
            `[SYSTEM] 심층 생체 듀얼 연결 승인...`,
            `User A 에너지 파동 구조 스캔 및 아카이빙 중...`,
            `User B 에너지 파동 구조 스캔 및 아카이빙 중...`,
            `두 에너지 공명 주파수 매칭 연산 중...`,
            `[SYNC COMPLETE] 듀얼 타로 에너지 공명 맵 완성.`
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
        }, 1000);
    };

    const startDrawingProcess = () => {
        setIsDrawing(true);
        setScanProgress(0);

        const interval = setInterval(() => {
            setScanProgress(prev => {
                const next = prev + (Math.random() * 12);
                if (next >= 100) {
                    clearInterval(interval);

                    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 4);

                    setDrawnCards(selected);
                    setIsDrawing(false);
                    setRevealedCount(0);
                    return 100;
                }
                return next;
            });
        }, 300);
    };

    useEffect(() => {
        if (drawnCards.length === 4 && revealedCount < 4) {
            const timer = setTimeout(() => {
                setRevealedCount(prev => prev + 1);
            }, 1200);
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
            minHeight: '100vh', background: '#050508', color: '#fff',
            overflowY: 'auto', overflowX: 'hidden', paddingBottom: '60px', position: 'relative'
        }}>
            <style>{`
                .cosmic-bg {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0; zIndex: 0;
                    background: radial-gradient(ellipse at bottom, #1b2735 0%, #050508 100%);
                    pointer-events: none; overflow: hidden;
                }
                .stars {
                    background: transparent url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTUwIiByPSIxLjUiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIyNTAiIGN5PSI1MCIgcj0iMC41IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMzUwIiBjeT0iMzAwIiByPSIyIiBmaWxsPSIjZmZmIi8+jwvc3ZnPg==') repeat top center;
                    z-index: 0; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    width: 100%; height: 100%; animation: move-twink-back 200s linear infinite; opacity: 0.3;
                }
                @keyframes move-twink-back { from {background-position: 0 0;} to {background-position: -10000px 5000px;} }
                .glass-card { background: rgba(20, 20, 30, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); transition: all 0.3s ease; }
            `}</style>

            <div className="cosmic-bg"><div className="stars"></div></div>

            <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '0', zIndex: 20 }}>
                    <ArrowLeft size={20} />
                    <span style={{ fontSize: '1rem' }}>돌아가기</span>
                </button>
            </div>

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '10px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '20px', boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)' }}>
                        <Users size={40} color="#38bdf8" />
                    </div>
                    <h1 style={{ fontSize: '2.2rem', color: '#38bdf8', marginBottom: '10px', fontWeight: '800', letterSpacing: '2px', textShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}>
                        ENERGY DUAL TAROT
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        [{userName}]님과 [{partnerName}]님의 결합된 파동으로<br />두 사람의 관계 패턴과 미래의 궤적을 투영합니다.
                    </p>
                </div>

                {drawnCards.length === 0 && (
                    <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        <div style={{
                            width: '100%', height: '280px', border: '2px dashed rgba(56, 189, 248, 0.4)', borderRadius: '15px',
                            marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDrawing || isSyncing ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                            transition: 'all 0.3s ease', boxShadow: isDrawing || isSyncing ? '0 0 40px rgba(56, 189, 248, 0.2) inset' : 'none',
                            padding: '20px'
                        }}>
                            {isSyncing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                                    <HeartHandshake size={50} color="#38bdf8" className="spin-slow" />
                                    <div style={{
                                        color: '#38bdf8', fontFamily: 'monospace', fontSize: '1rem',
                                        textAlign: 'center', width: '100%', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px',
                                        minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {syncMessage}
                                    </div>
                                </div>
                            ) : isDrawing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <Activity size={50} color="#38bdf8" className="pulse-anim" />
                                    <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.2rem' }}>듀얼 파동 혼합 셔플링... {Math.round(scanProgress)}%</span>
                                </div>
                            ) : (
                                <Eye size={50} color="rgba(56, 189, 248, 0.3)" />
                            )}
                        </div>

                        <button
                            onClick={handleDrawCard}
                            disabled={isDrawing || isSyncing}
                            style={{
                                width: '100%', padding: '18px', fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: '#fff',
                                border: 'none', borderRadius: '12px', fontWeight: 'bold',
                                opacity: (isDrawing || isSyncing) ? 0.5 : 1, cursor: (isDrawing || isSyncing) ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                                boxShadow: '0 5px 20px rgba(56,189,248,0.3)'
                            }}
                        >
                            {(isDrawing || isSyncing) ? '관계 파동 매칭 중...' : <><Zap size={20} /> 듀얼 타로 매칭 시작</>}
                        </button>
                        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            * 본인의 파동, 상대의 파동, <b>현재 얽힘 상태</b>, 그리고 미래 시너지 카드가 추출됩니다.
                        </p>
                    </div>
                )}

                {drawnCards.length === 4 && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 1s ease-out' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px', marginBottom: '40px', width: '100%', flexWrap: 'wrap' }}>
                            {[
                                { title: `[Host] ${userName}`, card: drawnCards[0], color: '#38bdf8' },
                                { title: `[Target] ${partnerName}`, card: drawnCards[1], color: '#818cf8' },
                                { title: '현재의 얽힘', card: drawnCards[2], color: '#fbbf24' },
                                { title: '미래의 시너지', card: drawnCards[3], color: '#f472b6' }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    flex: '1 1 200px', maxWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    opacity: revealedCount > idx ? 1 : 0.3, transform: revealedCount > idx ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}>
                                    <h4 style={{ color: item.color, marginBottom: '15px', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                                        {item.title}
                                    </h4>
                                    <div style={{
                                        width: '100%', height: '360px',
                                        perspective: '1000px',
                                    }}>
                                        <div style={{
                                            width: '100%', height: '100%', position: 'relative',
                                            transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            transformStyle: 'preserve-3d',
                                            transform: revealedCount > idx ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        }}>
                                            {/* Unrevealed Front (Card Back) */}
                                            <div style={{
                                                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                                borderRadius: '15px', border: `2px solid ${item.color}40`,
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                background: `repeating-linear-gradient(45deg, ${item.color}10 0, ${item.color}10 10px, rgba(10,10,15,0.95) 10px, rgba(10,10,15,0.95) 20px)`,
                                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                                            }}>
                                                <Hexagon size={50} color={`${item.color}50`} />
                                            </div>

                                            {/* Revealed Back (Tarot Image) */}
                                            <div style={{
                                                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                                                borderRadius: '15px', border: `2px solid ${item.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px',
                                                background: 'linear-gradient(145deg, rgba(20,20,30,0.95), rgba(5,5,10,0.98))',
                                                boxShadow: `0 0 30px ${item.color}40, inset 0 0 15px ${item.color}20`
                                            }}>
                                                <div style={{ flex: 1, width: '100%', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${item.color}80`, marginBottom: '15px' }}>
                                                    <img src={`/assets/tarot/${item.card.imgFileName}`} alt={item.card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.15) brightness(0.9) sepia(0.15) hue-rotate(5deg)' }} />
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', color: '#FFF', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>
                                                    {item.card.romanNumeral}. {item.card.name}
                                                </h3>
                                                <p style={{ color: item.color, fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>{item.card.quantumState}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {revealedCount === 4 && (
                            <>
                                <div className="glass-card" style={{ width: '100%', padding: '30px', marginBottom: '20px', animation: 'fadeIn 1s ease-out', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                        <HeartHandshake color="#38bdf8" size={28} />
                                        <h3 style={{ color: '#FFF', fontSize: '1.3rem' }}>듀얼 파동 시너지 해설</h3>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>1. {userName}님의 현재 관계적 파동</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '5px' }}>{drawnCards[0].description}</p>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <strong style={{ color: '#818cf8', fontSize: '1.05rem' }}>2. {partnerName}님의 내면적 파동</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '5px' }}>{drawnCards[1].description}</p>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <strong style={{ color: '#fbbf24', fontSize: '1.05rem' }}>3. 두 사람의 현재 에너지장 얽힘</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '5px' }}>두 에너지가 만나 형성하고 있는 현재 상황입니다. {drawnCards[2].description}</p>
                                    </div>
                                    <div>
                                        <strong style={{ color: '#f472b6', fontSize: '1.05rem' }}>4. 상호 얽힘의 미래 역학 (호환성 {compatibility}%)</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '5px' }}>이 관계가 궁극적으로 수렴하게 될 방향입니다. {drawnCards[3].description}</p>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ width: '100%', padding: '30px', marginBottom: '40px', borderLeft: compatibility < 60 ? '4px solid #ef4444' : '4px solid #f472b6', animation: 'fadeIn 1.5s ease-out', background: compatibility < 60 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(244,114,182,0.05)' }}>
                                    <h3 style={{ color: compatibility < 60 ? '#ef4444' : '#f472b6', fontSize: '1.2rem', marginBottom: '15px' }}>
                                        {compatibility < 60 ? '⚠️ 주의: 양자 간섭 해결 어드바이스' : '듀얼 에너지 어드바이스'}
                                    </h3>
                                    <p style={{ color: '#E0E0E0', lineHeight: 1.8, fontSize: '1.05rem', wordBreak: 'keep-all', fontWeight: '500' }}>
                                        {compatibility < 60
                                            ? <>서로 다른 두 파동 <strong>[{drawnCards[0].name}]</strong>과 <strong>[{drawnCards[1].name}]</strong>이 강하게 충돌하며 현재 <strong>[{drawnCards[2].name}]</strong> 형태의 불안정한 간섭을 일으키고 있습니다. 이 위기를 극복하고 관계를 수복하기 위해서는 <strong>[{drawnCards[3].name}]</strong>의 지혜가 절실히 필요합니다.</>
                                            : <>서로 다른 두 파동 <strong>[{drawnCards[0].name}]</strong>과 <strong>[{drawnCards[1].name}]</strong>이 만나 현재 <strong>[{drawnCards[2].name}]</strong>의 공명을 일으키고 있습니다. 이 관계를 가장 아름답게 꽃피우기 위해서는 <strong>[{drawnCards[3].name}]</strong>의 지혜를 기억하십시오.</>
                                        }
                                        <br /><br />
                                        <span style={{ color: compatibility < 60 ? '#ef4444' : '#f472b6', fontWeight: 'bold' }}>관계의 열쇠:</span> {drawnCards[3].advice}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', animation: 'fadeIn 2s ease-out', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                                    <button
                                        onClick={() => navigate('/chat', { state: { tarotCards: drawnCards, partnerName, compatibility, context: 'dual_tarot' } })}
                                        style={{
                                            width: '100%', padding: '18px', borderRadius: '16px',
                                            background: compatibility < 60 ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'linear-gradient(135deg, #38bdf8, #818cf8)',
                                            color: '#FFF', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                            boxShadow: compatibility < 60 ? '0 5px 20px rgba(239, 68, 68, 0.4)' : '0 5px 20px rgba(56, 189, 248, 0.4)',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <Zap size={22} /> AI 오라클에게 1:1 관계 솔루션 상담받기
                                    </button>
                                    <button onClick={handleReset} style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFF', fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                        관계 파동 재스캔
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
            <style>{`
            .spin-slow { animation: spin 4s linear infinite; }
            .pulse-anim { animation: pulseGlow 2s infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes pulseGlow { 0% { filter: drop-shadow(0 0 5px #38bdf8); transform: scale(0.95); } 50% { filter: drop-shadow(0 0 20px #38bdf8); transform: scale(1.05); } 100% { filter: drop-shadow(0 0 5px #38bdf8); transform: scale(0.95); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default DualTarotScreen;
