import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookHeart, Palette, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const WaveDiaryScreen = () => {
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [scanDataMap, setScanDataMap] = useState<Record<number, { color: string, tooltip: string }>>({});
    const [latestInsight, setLatestInsight] = useState("아직 기록된 파동이 없습니다. 오늘 하루의 감정을 영점화 해보세요.");

    // Parse real data on mount
    useEffect(() => {
        try {
            const savedLogs = localStorage.getItem('mock_supabase_scan_logs');
            if (savedLogs) {
                const parsed = JSON.parse(savedLogs);
                const map: Record<number, { color: string, tooltip: string }> = {};
                let lastValidLog = null;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                parsed.forEach((log: any) => {
                    const d = new Date(log.created_at);
                    if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                        const day = d.getDate();
                        const s = log.stress_level || 50;
                        const vRef = log.voice_freq || 150;

                        // Intelligent coloring based on stress/freq
                        let c = '#10b981'; // Default calm
                        let tip = '평안 (Green/Calm)';
                        if (s >= 70) { c = '#ec4899'; tip = '긴장/과열 (Pink/Stress)'; } // High stress
                        else if (s <= 30 && vRef < 180) { c = '#3b82f6'; tip = '우울/침체 (Blue/Lethargy)'; }
                        else if (s > 40 && s < 70 && vRef > 220) { c = '#a855f7'; tip = '영성/각성 (Purple/Focus)'; }
                        else if (s > 30 && s < 70 && vRef < 220 && vRef > 180) { c = '#f59e0b'; tip = '활력/기쁨 (Orange/Joy)'; }

                        map[day] = { color: c, tooltip: tip };
                        lastValidLog = log;
                    }
                });

                // eslint-disable-next-line react-hooks/rules-of-hooks
                setScanDataMap(map);

                if (lastValidLog) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const s = (lastValidLog as any).stress_level || 50;
                    if (s >= 70) setLatestInsight("최근 파동에서 높은 긴장감이 감지되었습니다. 오늘은 무리하지 말고 자기 자신을 안아주세요.");
                    else if (s <= 30) setLatestInsight("에너지가 안정적이지만 다소 가라앉아 있습니다. 당신은 조용한 파도 속에서도 빛나는 존엄한 사람입니다.");
                    else setLatestInsight("파동 밸런스가 조화롭습니다. 당신의 오늘 하루는 잔잔한 기쁨으로 가득 찰 것입니다.");
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) { /* ignore parse error */ }
    }, [currentDate]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const firstDay = getFirstDayOfMonth(year, monthIndex);
    const monthTitle = `${year}년 ${monthIndex + 1}월`;

    const handlePrevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1));

    const renderEmptyCells = () => {
        const cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} />);
        }
        return cells;
    };

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

            <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '10px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#fff' }}>파동 라이프 다이어리</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    매일의 진동을 스캔하여 당신만의 색을 채색하세요.<br />
                    시간이 흐를수록 당신의 파동이 거대한 우주를 이룹니다.
                </p>
            </div>

            {/* Companion Insight Block */}
            <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))', padding: '20px', borderRadius: '15px', border: '1px solid rgba(168, 85, 247, 0.4)', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'flex-start', boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                    <Sparkles size={24} color="#fbcfe8" />
                </div>
                <div>
                    <h4 style={{ color: '#fbcfe8', fontSize: '1rem', margin: '0 0 8px 0', letterSpacing: '1px' }}>오늘의 동반자 메시지</h4>
                    <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, fontWeight: 300, wordBreak: 'keep-all' }}>
                        {latestInsight}
                    </p>
                </div>
            </div>

            <div style={{ background: 'var(--color-bg-panel)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>

                {/* Calendar Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '0 10px' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronLeft /></button>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#e2e8f0', letterSpacing: '2px' }}>{monthTitle}</h2>
                    <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronRight /></button>
                </div>

                {/* Weekday Labels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '15px' }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{day}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                    {renderEmptyCells()}

                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const data = scanDataMap[day];
                        const hasData = !!data;
                        const bgColor = hasData ? data.color : 'rgba(255,255,255,0.05)';

                        return (
                            <div key={day} title={hasData ? data.tooltip : '기록 없음'} style={{
                                aspectRatio: '1/1',
                                borderRadius: '12px',
                                background: bgColor,
                                border: hasData ? `2px solid ${bgColor}` : '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: hasData ? '#fff' : 'rgba(255,255,255,0.3)',
                                fontSize: '0.9rem', fontWeight: hasData ? 'bold' : 'normal',
                                cursor: 'help', transition: 'all 0.2s',
                                boxShadow: hasData ? `0 0 15px ${bgColor}40` : 'none'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#e2e8f0' }}>퀀텀 감정 파동 맵 (Legend)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {[
                        { color: '#ec4899', label: '긴장/과열 (스트레스↑)' },
                        { color: '#f59e0b', label: '활력/기쁨 (균형적)' },
                        { color: '#10b981', label: '평안/안정 (이상적)' },
                        { color: '#3b82f6', label: '우울/침체 (에너지 감소)' },
                        { color: '#a855f7', label: '영성/각성 (고파동)' }
                    ].map(c => (
                        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '20px', border: `1px solid ${c.color}30` }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.color, boxShadow: `0 0 10px ${c.color}` }} />
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
    );
};

export default WaveDiaryScreen;
