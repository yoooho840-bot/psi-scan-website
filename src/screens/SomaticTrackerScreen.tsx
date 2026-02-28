import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Activity } from 'lucide-react';

const BODY_ZONES = [
    { id: 'head', name: '머리 / 미간', chakra: '제6 차크라 (아즈나)', color: '#4A90E2', desc: '생각과 고민이 과도하게 집중되어 있습니다. 깊은 심호흡으로 뇌압을 낮추고 직관을 믿으세요. (963Hz 명상 권장)' },
    { id: 'throat', name: '목 / 어깨', chakra: '제5 차크라 (비슈다)', color: '#50E3C2', desc: '타인에게 하지 못한 말이나 억눌린 감정이 어깨 승모근과 목에 쌓여 있습니다. 소리 내어 호흡을 뱉어보세요. (741Hz 명상 권장)' },
    { id: 'chest', name: '가슴 / 심장', chakra: '제4 차크라 (아나하타)', color: '#7ED321', desc: '상처받지 않으려 방어기제가 작동 중입니다. 오늘은 나 자신에게 무조건적인 사랑을 보내는 연습이 필요합니다. (639Hz 명상 권장)' },
    { id: 'stomach', name: '명치 / 위장', chakra: '제3 차크라 (마니푸라)', color: '#F5A623', desc: '통제하려는 욕구나 불안이 소화불량으로 타나납니다. 상황을 억지로 통제하려 하지 말고 흐름에 맡기세요. (528Hz 명상 권장)' },
    { id: 'pelvis', name: '골반 / 허리', chakra: '제2 차크라 (스바디스타나)', color: '#D0021B', desc: '안전과 생존에 대한 무의식적 위협을 느끼고 있습니다. 따뜻한 차를 마시고 하복부를 데워주세요. (417Hz 명상 권장)' }
];

const SomaticTrackerScreen: React.FC = () => {
    const navigate = useNavigate();
    const [selectedZone, setSelectedZone] = useState<typeof BODY_ZONES[0] | null>(null);
    const [savedLogs, setSavedLogs] = useState<{ date: string, zone: string }[]>([]);

    const handleSave = () => {
        if (!selectedZone) return;
        const newLog = { date: new Date().toLocaleDateString(), zone: selectedZone.name };
        setSavedLogs([newLog, ...savedLogs]);
        alert('오늘의 신체 텐션 부위가 기록되었습니다. 이 기록은 향후 AI 분석에 반영됩니다.');
        setSelectedZone(null);
    };

    return (
        <div className="screen" style={{ padding: 0, overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }} className="gold-text">소마틱 텐션 맵</h2>
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>나의 신체 에너지 흐름 관찰</p>
                </div>
                <UserIcon size={24} color="#DAA520" />
            </div>

            <div style={{ padding: '20px 24px' }}>
                <p style={{ color: '#CCC', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '25px', textAlign: 'center' }}>
                    우리 몸은 마음이 억누른 감정을 물리적 통증으로 표현합니다.<br />
                    오늘 가장 무겁거나 뻐근하게 느껴지는 부위를 선택하세요.
                </p>

                {/* Body Zones Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                    {BODY_ZONES.map(zone => (
                        <button
                            key={zone.id}
                            onClick={() => setSelectedZone(zone)}
                            style={{
                                padding: '15px', borderRadius: '15px',
                                background: selectedZone?.id === zone.id ? 'rgba(218, 165, 32, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: selectedZone?.id === zone.id ? '1px solid var(--color-gold-main)' : '1px solid rgba(255,255,255,0.1)',
                                color: selectedZone?.id === zone.id ? 'var(--color-gold-main)' : '#FFF',
                                fontSize: '1rem', fontWeight: selectedZone?.id === zone.id ? 600 : 400,
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                            }}
                        >
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: zone.color, display: 'inline-block', boxShadow: `0 0 10px ${zone.color}` }}></span>
                            {zone.name}
                        </button>
                    ))}
                </div>

                {/* Analysis Box */}
                <div style={{ minHeight: '180px' }}>
                    {selectedZone ? (
                        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', borderLeft: `4px solid ${selectedZone.color}`, animation: 'fadeIn 0.5s' }}>
                            <div style={{ fontSize: '0.8rem', color: selectedZone.color, fontWeight: 600, marginBottom: '5px' }}>
                                연결된 활성 부위: {selectedZone.chakra}
                            </div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#FFF' }}>{selectedZone.name}의 에너지 텐션</h3>
                            <p style={{ color: '#E0E0E0', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                                {selectedZone.desc}
                            </p>
                            <button onClick={handleSave} className="primary-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}>
                                <Activity size={18} /> 오늘 일지에 텐션 기록하기
                            </button>
                        </div>
                    ) : (
                        <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', color: '#555' }}>
                            부위를 선택하면 차크라 인과관계가 분석됩니다.
                        </div>
                    )}
                </div>

                {/* History list (Mocked) */}
                {savedLogs.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ color: '#888', marginBottom: '15px' }}>최근 기록</h4>
                        {savedLogs.map((log, i) => (
                            <div key={i} style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#AAA' }}>{log.date}</span>
                                <span style={{ color: 'var(--color-gold-main)' }}>{log.zone}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SomaticTrackerScreen;
