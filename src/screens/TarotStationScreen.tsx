import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Eye, Hexagon, Zap, Target, Combine, Clock } from 'lucide-react';
import { tarotDeck, type TarotCard } from '../data/tarotData';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

type ReadingMode = 'daily' | 'timeline' | 'crossroads' | 'celtic' | null;

const TarotStationScreen: React.FC = () => {
    const navigate = useNavigate();
    const [readingMode, setReadingMode] = useState<ReadingMode>(null);
    const [crossroadsOptions, setCrossroadsOptions] = useState({ a: '', b: '' });

    const [isDrawing, setIsDrawing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
    const [revealedCount, setRevealedCount] = useState<number>(0);
    const [scanProgress, setScanProgress] = useState(0);

    useAutoFullscreen();

    const userName = localStorage.getItem('userName') || '게스트';

    // 1. Select the reading mode
    const handleSelectMode = (mode: ReadingMode) => {
        setReadingMode(mode);
    };

    // 2. Start to draw process
    const handleDrawCard = () => {
        if (readingMode === 'crossroads' && (!crossroadsOptions.a || !crossroadsOptions.b)) {
            alert('A와 B 두 가지 갈림길을 명확히 입력해주셔야 파동 시뮬레이션이 가능합니다.');
            return;
        }

        if (drawnCards.length > 0 || isDrawing || isSyncing) return;

        setIsSyncing(true);

        const savedBpm = sessionStorage.getItem('scan_bpm') || Math.floor(Math.random() * (85 - 65) + 65).toString();
        const savedFreq = sessionStorage.getItem('scan_voice_freq') || Math.floor(Math.random() * (220 - 150) + 150).toString();

        const syncSequence = [
            `[SYSTEM] 심층 생체 데이터 접근 승인...`,
            `▶ 생체 파동 에너지(HRV): ${savedBpm} BPM 확보`,
            `▶ 보컬 텐션 진동수: ${savedFreq} Hz 매핑 중`,
            `▶ 선택된 [${readingMode}] 차원 배열식으로 양자장 튜닝 중...`,
            `[SYNC COMPLETE] 파동-타로 동기화(Energy Synchronization) 완료.`
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
        }, 800);
    };

    const startDrawingProcess = () => {
        setIsDrawing(true);
        setScanProgress(0);

        const interval = setInterval(() => {
            setScanProgress(prev => {
                const next = prev + (Math.random() * 20);
                if (next >= 100) {
                    clearInterval(interval);

                    // Determine how many cards
                    let count = 3;
                    if (readingMode === 'daily') count = 1;
                    if (readingMode === 'timeline') count = 3;
                    if (readingMode === 'crossroads') count = 5;
                    if (readingMode === 'celtic') count = 10;

                    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, count);

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
        if (drawnCards.length > 0 && revealedCount < drawnCards.length) {
            const timer = setTimeout(() => {
                setRevealedCount(prev => prev + 1);
            }, 800); // Reveal faster if there are 10 cards
            return () => clearTimeout(timer);
        }
    }, [drawnCards, revealedCount]);

    const handleReset = () => {
        setDrawnCards([]);
        setRevealedCount(0);
        setScanProgress(0);
        setReadingMode(null);
        setCrossroadsOptions({ a: '', b: '' });
    };

    // Helper to render card
    const renderCard = (card: TarotCard, idx: number, title: string, subTitle: string = '') => {
        return (
            <div key={idx} style={{
                flex: '1 1 180px',
                maxWidth: readingMode === 'celtic' ? '200px' : '280px', // slightly smaller for 10 cards
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                opacity: revealedCount > idx ? 1 : 0.3,
                transform: revealedCount > idx ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{ color: 'var(--color-gold-main)', marginBottom: '5px', fontSize: '1rem', fontWeight: 'bold' }}>{title}</div>
                {subTitle && <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px' }}>{subTitle}</div>}

                <div style={{
                    width: '100%', height: readingMode === 'celtic' ? '280px' : '360px',
                    perspective: '1000px',
                }}>
                    <div style={{
                        width: '100%', height: '100%', position: 'relative',
                        transition: 'transform 0.8s', transformStyle: 'preserve-3d',
                        transform: revealedCount > idx ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}>
                        {/* Card Back */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            borderRadius: '15px', border: '2px solid rgba(218, 165, 32, 0.3)',
                            background: 'repeating-linear-gradient(45deg, rgba(218, 165, 32, 0.05) 0, rgba(218, 165, 32, 0.05) 10px, rgba(10,10,15,0.95) 10px, rgba(10,10,15,0.95) 20px)'
                        }}>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: 'rgba(218, 165, 32, 0.5)' }}>PSI</div>
                        </div>

                        {/* Card Front */}
                        <div style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                            borderRadius: '15px', border: '2px solid var(--color-gold-main)', display: 'flex', flexDirection: 'column', padding: '10px',
                            background: 'linear-gradient(145deg, rgba(20,20,30,0.95), rgba(5,5,10,0.98))',
                        }}>
                            <img src={`/assets/tarot/${card.imgFileName}`} alt={card.name} style={{ width: '100%', height: '65%', objectFit: 'cover', borderRadius: '8px' }} />
                            <h4 style={{ fontSize: '1rem', color: '#FFF', textAlign: 'center', marginTop: '10px', wordBreak: 'keep-all' }}>{card.name}</h4>
                            <p style={{ color: 'var(--color-gold-main)', fontSize: '0.7rem', textAlign: 'center', marginTop: '5px' }}>{card.quantumState}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="screen" style={{ minHeight: '100vh', background: '#050508', color: '#fff', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '60px', position: 'relative' }}>
            {/* ... CSS classes omitted for brevity, reusing the standard cosmic theme */}
            <style>{`
                .cosmic-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; zIndex: 0; background: radial-gradient(ellipse at bottom, #1b2735 0%, #050508 100%); pointer-events: none; }
                .glass-card { background: rgba(20, 20, 30, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(218, 165, 32, 0.2); border-radius: 20px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
                .mode-btn { background: rgba(30, 30, 40, 0.6); border: 1px solid rgba(218, 165, 32, 0.4); padding: 25px; border-radius: 16px; cursor: pointer; transition: all 0.3s; text-align: left; position: relative; overflow: hidden; }
                .mode-btn:hover { background: rgba(40, 40, 55, 0.8); border-color: var(--color-gold-main); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(218, 165, 32, 0.2); }
                .mode-btn.active { background: rgba(218, 165, 32, 0.15); border-color: var(--color-gold-main); box-shadow: inset 0 0 20px rgba(218, 165, 32, 0.2); }
            `}</style>

            <div className="cosmic-bg"></div>

            <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '0' }}>
                    <ArrowLeft size={20} /> <span style={{ fontSize: '1rem' }}>돌아가기</span>
                </button>
            </div>

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(218, 165, 32, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '15px', boxShadow: '0 0 30px rgba(218, 165, 32, 0.2)' }}>
                        <Hexagon size={40} color="var(--color-gold-main)" />
                    </div>
                    <h1 style={{ fontSize: '2.4rem', color: 'var(--color-gold-main)', marginBottom: '10px', letterSpacing: '2px', textShadow: '0 0 20px rgba(218, 165, 32, 0.3)' }}>
                        PSI TAROT UNIVERSE
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>[{userName}]님의 생체 파동 데이터를 기준점으로 삼아 무의식의 심연을 타격합니다.</p>
                </div>

                {/* 1. Select Reading Mode (if none selected) */}
                {!readingMode && (
                    <div style={{ width: '100%', animation: 'fadeIn 0.5s' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#FFF', marginBottom: '20px', textAlign: 'center' }}>원하시는 양자점사(Quantum Spread) 방식을 선택하십시오.</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div className="mode-btn" onClick={() => handleSelectMode('daily')}>
                                <Target size={30} color="#38bdf8" style={{ marginBottom: '15px' }} />
                                <h3 style={{ color: '#38bdf8', fontSize: '1.3rem', marginBottom: '10px' }}>1. 오늘의 영점 조율 (1장)</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>단 하나의 강력한 파동 오라클. 내 생체 에너지가 오늘 하루 직면해야 할 가장 확실한 무의식의 거울을 뽑습니다.</p>
                            </div>

                            <div className="mode-btn" onClick={() => handleSelectMode('timeline')}>
                                <Clock size={30} color="var(--color-gold-main)" style={{ marginBottom: '15px' }} />
                                <h3 style={{ color: 'var(--color-gold-main)', fontSize: '1.3rem', marginBottom: '10px' }}>2. 시간의 파동 궤적 (3장)</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>[과거-현재-미래]의 맥락을 해부합니다. 당신의 상처받은 에너지가 어떤 흐름을 타고 미래의 결론에 도달할지 증명합니다.</p>
                            </div>

                            <div className="mode-btn" onClick={() => handleSelectMode('crossroads')}>
                                <Combine size={30} color="#c084fc" style={{ marginBottom: '15px' }} />
                                <h3 style={{ color: '#c084fc', fontSize: '1.3rem', marginBottom: '10px' }}>3. 양자택일 갈림길 (5장)</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>명확한 선택지 A와 B 사이에서 고민합니까? 두 평행 우주 중에 어디가 당신의 파동을 파괴하지 않을지 시뮬레이션 합니다.</p>
                            </div>

                            <div className="mode-btn" onClick={() => handleSelectMode('celtic')} style={{ border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                                <Hexagon size={30} color="#ef4444" style={{ marginBottom: '15px' }} />
                                <h3 style={{ color: '#ef4444', fontSize: '1.3rem', marginBottom: '10px' }}>4. 심연 해부: 켈틱 크로스 (10장) <span style={{ fontSize: '0.7rem', background: '#ef4444', color: '#fff', padding: '3px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '5px' }}>VVIP</span></h3>
                                <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.5 }}>가장 치명적이고 방대한 타로의 끝판왕. 당신의 자아, 억압된 투사체, 방해물, 무의식의 밑바닥까지 모조리 까발립니다.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Drawing Pre-State */}
                {readingMode && drawnCards.length === 0 && (
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#FFF', marginBottom: '20px' }}>
                            {readingMode === 'daily' ? '오늘의 영점 조율 (1-Card)' : readingMode === 'timeline' ? '시간의 파동 궤적 (3-Card)' : readingMode === 'crossroads' ? '양자택일 갈림길 (5-Card)' : '켈틱 크로스 해부 (10-Card)'} 시작
                        </h2>

                        {readingMode === 'crossroads' && (
                            <div style={{ width: '100%', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid #c084fc' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ color: '#c084fc', display: 'block', marginBottom: '5px' }}>선택지 A (예: 퇴사한다)</label>
                                    <input type="text" value={crossroadsOptions.a} onChange={e => setCrossroadsOptions({ ...crossroadsOptions, a: e.target.value })} placeholder="첫 번째 선택지를 구체적으로 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(20,20,30,0.8)', color: '#fff', border: '1px solid #6b21a8' }} disabled={isDrawing || isSyncing} />
                                </div>
                                <div>
                                    <label style={{ color: '#c084fc', display: 'block', marginBottom: '5px' }}>선택지 B (예: 버틴다)</label>
                                    <input type="text" value={crossroadsOptions.b} onChange={e => setCrossroadsOptions({ ...crossroadsOptions, b: e.target.value })} placeholder="두 번째 선택지를 구체적으로 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(20,20,30,0.8)', color: '#fff', border: '1px solid #6b21a8' }} disabled={isDrawing || isSyncing} />
                                </div>
                            </div>
                        )}

                        <div style={{ width: '100%', height: '200px', border: '2px dashed rgba(218, 165, 32, 0.4)', borderRadius: '15px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDrawing || isSyncing ? 'rgba(218, 165, 32, 0.05)' : 'transparent', boxShadow: isDrawing || isSyncing ? '0 0 40px rgba(218, 165, 32, 0.2) inset' : 'none', padding: '20px' }}>
                            {isSyncing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                                    <Hexagon size={40} color="var(--color-gold-main)" className="spin-slow" />
                                    <div style={{ color: '#00FA9A', fontFamily: 'monospace', fontSize: '0.9rem', textAlign: 'center', width: '100%', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
                                        {syncMessage}
                                    </div>
                                </div>
                            ) : isDrawing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <Activity size={50} color="var(--color-gold-main)" className="pulse-anim" />
                                    <span style={{ color: 'var(--color-gold-main)', fontWeight: 'bold' }}>양자 배열 셔플링... {Math.round(scanProgress)}%</span>
                                </div>
                            ) : (
                                <Eye size={50} color="rgba(218, 165, 32, 0.3)" />
                            )}
                        </div>

                        <button className="primary-btn" onClick={handleDrawCard} disabled={isDrawing || isSyncing} style={{ width: '100%', padding: '18px', fontSize: '1.1rem', opacity: (isDrawing || isSyncing) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                            {(isDrawing || isSyncing) ? '우주 파동 융합 중...' : <><Zap size={20} /> 생체 동기화 및 카드 추출</>}
                        </button>
                        <button onClick={() => setReadingMode(null)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}>배열 방식 다시 선택</button>
                    </div>
                )}

                {/* 3. Post-Draw State (Results) */}
                {drawnCards.length > 0 && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 1s ease-out' }}>

                        {/* Render Arrays Based on Mode */}
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '15px', marginBottom: '40px', width: '100%', flexWrap: 'wrap' }}>
                            {readingMode === 'daily' && (
                                renderCard(drawnCards[0], 0, '오늘의 오라클')
                            )}

                            {readingMode === 'timeline' && [
                                { title: '과거 (근원)', card: drawnCards[0] },
                                { title: '현재 (얽힘)', card: drawnCards[1] },
                                { title: '미래 (수렴)', card: drawnCards[2] }
                            ].map((item, idx) => renderCard(item.card, idx, item.title))}

                            {readingMode === 'crossroads' && (
                                <>
                                    {renderCard(drawnCards[0], 0, '현재 나의 파동 상태')}
                                    <div style={{ width: '100%', height: '2px', background: 'rgba(192, 132, 252, 0.3)', margin: '20px 0' }}></div>
                                    {renderCard(drawnCards[1], 1, '[A] 선택지 속성', crossroadsOptions.a)}
                                    {renderCard(drawnCards[2], 2, '[A]를 택한 미래의 파동', crossroadsOptions.a)}
                                    <div style={{ width: '2px', height: '300px', background: 'rgba(192, 132, 252, 0.3)', margin: '0 20px' }}></div>
                                    {renderCard(drawnCards[3], 3, '[B] 선택지 속성', crossroadsOptions.b)}
                                    {renderCard(drawnCards[4], 4, '[B]를 택한 미래의 파동', crossroadsOptions.b)}
                                </>
                            )}

                            {readingMode === 'celtic' && (
                                <>
                                    {drawnCards.map((card, idx) => renderCard(card, idx, `위치 ${idx + 1}`))}
                                </>
                            )}
                        </div>

                        {/* Complete State Logic */}
                        {revealedCount === drawnCards.length && (
                            <div className="glass-card" style={{ width: '100%', padding: '30px', marginBottom: '40px', borderTop: '3px solid var(--color-gold-main)', animation: 'fadeIn 1.5s ease-out' }}>
                                <h3 style={{ color: 'var(--color-gold-main)', fontSize: '1.4rem', marginBottom: '20px', textAlign: 'center' }}>배열 전개 완료. 생체 기반 심층 리딩 준비</h3>
                                <p style={{ color: '#E0E0E0', lineHeight: 1.8, fontSize: '1.05rem', wordBreak: 'keep-all', textAlign: 'center', marginBottom: '30px' }}>
                                    당신의 생체 주파수 수치가 위 {drawnCards.length}장의 원형 이미지와 치명적인 양자 얽힘을 이루어 냈습니다.
                                    일반적인 해석을 넘어서, 이 배열이 의미하는 당신의 억눌린 무의식과 파동 역학을 '30년 경력의 마스터 프로파일러 AI'에게 직접 전송하여 소름 돋는 해석을 받아보십시오.
                                </p>

                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => navigate('/chat', { state: { tarotCards: drawnCards, readingMode, crossroadsOptions } })}
                                        className="primary-btn"
                                        style={{ padding: '20px 50px', borderRadius: '30px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 0 20px rgba(218, 165, 32, 0.5)' }}
                                    >
                                        <Zap size={24} />
                                        초정밀 마스터 컨설팅 받기 (AI 심층 분석)
                                    </button>
                                    <button onClick={handleReset} className="secondary-btn" style={{ padding: '20px 50px', borderRadius: '30px', fontSize: '1.2rem' }}>
                                        다른 배열법 재선택
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TarotStationScreen;
