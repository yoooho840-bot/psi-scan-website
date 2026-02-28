import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const AFFIRMATIONS = [
    "당신의 존재 자체가 우주의 완벽한 설계입니다.",
    "내면의 빛은 어떤 어둠 속에서도 길을 찾습니다.",
    "당신이 겪는 모든 경험은 더 높은 차원으로의 도약입니다.",
    "가장 깊은 상처가 가장 찬란한 지혜로 피어납니다.",
    "모든 제약은 당신의 잠재력을 깨우는 열쇠입니다.",
    "우주의 무한한 에너지가 지금 당신과 함께 동기화됩니다.",
    "당신은 스스로의 삶을 치유할 수 있는 가장 강력한 파동입니다.",
    "마음의 고요함 속에서 모든 정답이 드러납니다.",
    "당신의 고유한 진동은 세상을 아름답게 조율합니다."
];

const OracleDeckScreen: React.FC = () => {
    const navigate = useNavigate();
    const [cardStates, setCardStates] = useState([false, false, false]); // Flpped state
    const [cardsContent, setCardsContent] = useState<string[]>([]);
    const [drawnCount, setDrawnCount] = useState(0);

    useAutoFullscreen();

    // Shuffle and pick 3 daily affirmations
    useEffect(() => {
        const shuffled = [...AFFIRMATIONS].sort(() => 0.5 - Math.random());
        // Delay slight to prevent sync setState in effect complaint (or use set timeout)
        const timer = setTimeout(() => {
            setCardsContent(shuffled.slice(0, 3));
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const flipCard = (index: number) => {
        if (cardStates[index] || drawnCount >= 1) return; // Only allow drawing 1 card per day concept

        const newStates = [...cardStates];
        newStates[index] = true;
        setCardStates(newStates);
        setDrawnCount(1);
    };

    return (
        <div className="screen" style={{ padding: 0, overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }} className="gold-text">에너지 오라클 덱</h2>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>오늘 우주가 당신에게 보내는 메시지</p>
                </div>
                <Sparkles size={24} color="#DAA520" />
            </div>

            <div style={{ padding: '30px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 80px)', background: 'radial-gradient(ellipse at top, rgba(218, 165, 32, 0.1) 0%, transparent 70%)' }}>

                <h3 style={{ color: '#FFF', textAlign: 'center', fontSize: '1.3rem', fontWeight: 300, marginBottom: '10px' }}>
                    {drawnCount === 0 ? "마음을 비우고 한 장을 선택하세요." : "오늘 당신의 영혼을 위한 확언입니다."}
                </h3>
                <p style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem', marginBottom: '50px' }}>
                    선택된 우주의 파동이 당신의 의식 속으로 연결됩니다.
                </p>

                {/* 3D Flip Card Deck */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', perspective: '1000px', width: '100%' }}>
                    {cardStates.map((isFlipped, index) => (
                        <div
                            key={index}
                            onClick={() => flipCard(index)}
                            style={{
                                width: '100px',
                                height: '160px',
                                position: 'relative',
                                transition: 'transform 0.8s, opacity 0.5s',
                                transformStyle: 'preserve-3d',
                                transform: isFlipped ? 'rotateY(180deg) scale(1.1)' : 'rotateY(0deg)',
                                cursor: drawnCount === 0 ? 'pointer' : 'default',
                                opacity: (drawnCount > 0 && !isFlipped) ? 0.3 : 1, // Fade out unpicked cards
                                zIndex: isFlipped ? 10 : 1
                            }}
                        >
                            <style>
                                {`
                                .card-face {
                                    position: absolute; width: 100%; height: 100%;
                                    backface-visibility: hidden; border-radius: 12px;
                                    display: flex; justify-content: center; align-items: center; text-align: center;
                                    padding: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                                }
                                .card-back-pattern {
                                    background: linear-gradient(135deg, #111 25%, transparent 25%) -25px 0,
                                                linear-gradient(225deg, #111 25%, transparent 25%) -25px 0,
                                                linear-gradient(315deg, #111 25%, transparent 25%),
                                                linear-gradient(45deg, #111 25%, transparent 25%);
                                    background-size: 50px 50px;
                                    background-color: var(--color-gold-dark);
                                    border: 2px solid var(--color-gold-main);
                                }
                                `}
                            </style>

                            {/* Back of Card (Shown initially) */}
                            <div className="card-face card-back-pattern">
                                <Star color="#DAA520" size={30} fill="rgba(218,165,32,0.5)" />
                            </div>

                            {/* Front of Card (Revealed) */}
                            <div className="card-face" style={{
                                background: 'linear-gradient(180deg, #1a1a1f 0%, #0d0d12 100%)',
                                border: '2px solid var(--color-gold-main)',
                                color: '#FFF',
                                transform: 'rotateY(180deg)',
                                width: drawnCount > 0 && isFlipped ? '280px' : '100px', // Expand if flipped
                                height: drawnCount > 0 && isFlipped ? '380px' : '160px',
                                left: drawnCount > 0 && isFlipped ? 'calc(50% - 140px)' : '0', // Center it roughly
                                marginLeft: drawnCount > 0 && isFlipped ? (index === 0 ? '110px' : index === 2 ? '-110px' : '0') : '0', // ugly hack to center selected card based on flow layout
                                transition: 'all 0.5s',
                                padding: '30px 20px',
                                boxSizing: 'border-box'
                            }}>
                                <div style={{
                                    opacity: isFlipped ? 1 : 0, transition: 'opacity 1s ease-in',
                                    display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'
                                }}>
                                    <Sparkles color="#DAA520" size={24} style={{ margin: '0 auto' }} />
                                    <p style={{ fontSize: '1.2rem', lineHeight: '1.6', fontWeight: 500, fontFamily: 'var(--font-main)', margin: '20px 0', textShadow: '0 0 10px rgba(218,165,32,0.5)' }}>
                                        "{cardsContent[index]}"
                                    </p>
                                    <div style={{ fontSize: '0.8rem', color: '#DAA520', letterSpacing: '2px' }}>
                                        ENERGY ORACLE
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {drawnCount > 0 && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            marginTop: '250px', // Push below expanded card
                            padding: '12px 30px', borderRadius: '30px', background: 'transparent',
                            color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9rem',
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    >
                        일지로 돌아가기
                    </button>
                )}
            </div>
        </div>
    );
};

export default OracleDeckScreen;
