import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookHeart, Palette, ChevronLeft, ChevronRight } from 'lucide-react';

const WaveDiaryScreen = () => {
    const navigate = useNavigate();

    // Mock data for the current month
    const [month] = useState('2024년 10월');

    // Generate a grid of 30 days. Some have mock colors based on 'emotion/frequency'
    const mockDays = Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        let color = 'rgba(255,255,255,0.05)'; // default unpainted
        let hasData = false;

        if (day === 5) { color = '#ec4899'; hasData = true; } // Pink (Love/Passion)
        if (day === 12) { color = '#3b82f6'; hasData = true; } // Blue (Calm/Sad)
        if (day === 18) { color = '#10b981'; hasData = true; } // Green (Healing/Peace)
        if (day === 24) { color = '#f59e0b'; hasData = true; } // Orange (Joy/Energy)
        if (day === 25) { color = '#a855f7'; hasData = true; } // Purple (Spiritual/Focus)

        return { day, color, hasData };
    });

    return (
        <div style={{
            width: '100vw', minHeight: '100vh',
            backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-main)', paddingBottom: '40px', overflowX: 'hidden'
        }}>
            <div style={{
                padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(20px)'
            }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1rem', margin: 0, color: '#a855f7', letterSpacing: '2px' }}>WAVE DIARY</h2>
                </div>
                <BookHeart size={24} color="#a855f7" />
            </div>

            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>파동 색칠 다이어리</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        매일의 스캔 결과가 고유한 파동 색상으로 기록됩니다.<br />
                        하루하루의 감정을 캔버스에 채워보세요. 🎨
                    </p>
                </div>

                <div style={{ background: 'var(--color-bg-panel)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>

                    {/* Calendar Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '0 10px' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronLeft /></button>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#e2e8f0' }}>{month}</h2>
                        <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronRight /></button>
                    </div>

                    {/* Weekday Labels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '15px' }}>
                        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                            <div key={day} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{day}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                        {/* Empty padding for start of month (assuming starts on Wednesday) */}
                        <div /><div /><div />

                        {mockDays.map((md) => (
                            <div key={md.day} style={{
                                aspectRatio: '1/1',
                                borderRadius: '12px',
                                background: md.color,
                                border: md.hasData ? `2px solid ${md.color}` : '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: md.hasData ? '#fff' : 'rgba(255,255,255,0.3)',
                                fontSize: '0.9rem', fontWeight: md.hasData ? 'bold' : 'normal',
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: md.hasData ? `0 0 15px ${md.color}40` : 'none'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {md.day}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#e2e8f0' }}>파동 컬러 팔레트 (Legend)</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {[
                            { color: '#ec4899', label: '열정/사랑 (432Hz)' },
                            { color: '#f59e0b', label: '활력/기쁨 (528Hz)' },
                            { color: '#10b981', label: '평온/치유 (639Hz)' },
                            { color: '#3b82f6', label: '우울/차분 (396Hz)' },
                            { color: '#a855f7', label: '영성/집중 (852Hz)' }
                        ].map(c => (
                            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '20px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.color }} />
                                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{c.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => navigate('/scan')} style={{
                    width: '100%', marginTop: '40px', padding: '16px', borderRadius: '12px',
                    background: 'linear-gradient(45deg, #a855f7, #ec4899)', color: '#fff',
                    border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                }}>
                    <Palette size={20} /> 오늘의 감정 색칠하기 (스캔)
                </button>
            </div>
        </div>
    );
};

export default WaveDiaryScreen;
