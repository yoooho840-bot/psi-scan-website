import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BrainCircuit, Heart, Eye, Sparkles, Network, Compass, Home, Activity, Shield } from 'lucide-react';
import HumanAuraFigure from '../components/HumanAuraFigure';
import useAutoFullscreen from '../hooks/useAutoFullscreen';
import { supabase } from '../lib/supabase';

const TwelveDimensionReportScreen: React.FC = () => {
    const navigate = useNavigate();

    useAutoFullscreen();

    const [dimensions, setDimensions] = useState<any[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            await supabase.auth.getSession();
            // Auth check logic
        };
        checkAuth();

        // Retrieve real biometric seeds
        const seedsStr = localStorage.getItem('psi_bio_seeds');
        const seeds = seedsStr ? JSON.parse(seedsStr) : { heartRateVariance: 0.5, vocalTension: 0.5, energyLevel: 0.5 };

        // Generate dynamic dimension data based on real physical seeds
        const generatedDimensions = [
            { id: 1, title: '1. 오라 필드 에너지층', icon: <Sparkles size={24} color="var(--color-gold-main)" />, status: seeds.energyLevel > 0.6 ? '확장' : '불균형', desc: seeds.energyLevel > 0.6 ? '오라장이 강력하고 뚜렷하게 발산되며 긍정적 공명을 일으킵니다.' : '신체 외곽을 감싸는 전자기장(Aura) 축소. 외부 에너지 간섭에 취약한 상태.', color: seeds.energyLevel > 0.6 ? '#32CD32' : '#0a84ff' },
            { id: 2, title: '2. 7개 핵심 차크라 진동', icon: <Activity size={24} color="var(--color-gold-main)" />, status: seeds.vocalTension > 0.7 ? '긴장/과활성' : (seeds.energyLevel < 0.4 ? '막힘' : '안정'), desc: seeds.vocalTension > 0.7 ? '성대 파동 분석 결과 에너지 센터에 과도한 긴장과 억압이 관찰됨.' : (seeds.energyLevel < 0.4 ? '제3 차크라(태양신경총) 에너지 정체. 자기 긍정감 상실 및 만성 소화불량의 원인.' : '전반적인 차크라 진동수가 안정적이며 자연 치유력이 확보된 상태.'), color: seeds.vocalTension > 0.7 ? '#ff453a' : (seeds.energyLevel < 0.4 ? '#ff9f0a' : '#32CD32') },
            { id: 3, title: '3. 칼 융 무의식 원형 (Archetypes)', icon: <BrainCircuit size={24} color="var(--color-gold-main)" />, status: seeds.heartRateVariance > 0.7 ? '그림자 패턴 활성' : '통합 진행 중', desc: seeds.heartRateVariance > 0.7 ? '불안정한 심박 변이에서 무의식에 억압된 그림자(Shadow) 에너지가 감지됨.' : '자아와 무의식의 그림자가 비교적 안정적으로 통합되는 파동 구간입니다.', color: seeds.heartRateVariance > 0.7 ? '#ff453a' : '#DAA520' },
            { id: 4, title: '4. 소마틱스 (신체 억압 감정)', icon: <Heart size={24} color="var(--color-gold-main)" />, status: seeds.vocalTension > 0.6 ? '수축(트라우마)' : '순환(릴랙스)', desc: seeds.vocalTension > 0.6 ? '강력한 음성 떨림 주파수에서 골반 기저근과 목 신경에 특정 감정이 억압됨이 확인됨.' : '근육에 갇힌 세포 기억(Cellular Memory)이 해방되며 생체 에너지가 순환 중.', color: seeds.vocalTension > 0.6 ? '#D2691E' : '#bf5af2' },
            { id: 5, title: '5. 양자 파동 동조율', icon: <Network size={24} color="var(--color-gold-main)" />, status: seeds.energyLevel < 0.3 ? '간섭 심화' : '공명 상태', desc: seeds.energyLevel < 0.3 ? '양자 얽힘이 약화되어 불규칙한 환경 독소 파동에 영향을 심하게 받고 있음.' : '내면의 가장 깊은 본래의 주파수와 동조하여 힐링 임계점에 도달함.', color: seeds.energyLevel < 0.3 ? '#888888' : '#00CED1' },
            { id: 6, title: '6. 환경 독소 및 파동 알러지', icon: <Shield size={24} color="var(--color-gold-main)" />, status: '과부하', desc: '체내 중금속 및 만성 염증 유발 파동적 알러젠이 에너지 흐름을 심각하게 교란함.', color: '#FF6B6B' },
            { id: 7, title: '7. 자연 파동 공명 (Nature Resonance)', icon: <Eye size={24} color="var(--color-gold-main)" />, status: '동조 필요', desc: '내재된 강박적 불안 파동 상쇄를 위해 순수 자연 주파수 동조 요망.', color: '#bf5af2' },
            { id: 8, title: '8. 에너지 필드 매칭 타로카드', icon: <Sparkles size={24} color="var(--color-gold-main)" />, status: '공명', desc: '더 매지션(The Magician) 카드. 내재된 파동 에너지를 현실로 구현해내는 강력한 창조적 주파수.', color: '#32CD32' },
            { id: 9, title: '9. 경락 및 장부 주파수 불균형', icon: <Compass size={24} color="var(--color-gold-main)" />, status: '저하', desc: '수소양삼초경 에너지 순환 저하. 만성 피로와 면역력 약화의 주 원인.', color: '#DAA520' },
            { id: 10, title: '10. 생명력 에너지 공명', icon: <Activity size={24} color="var(--color-gold-main)" />, status: seeds.energyLevel < 0.4 ? '결핍' : '정상', desc: seeds.energyLevel < 0.4 ? '생명력 주파수 대사 활력 저하. 생체 에너지 생성 및 순환 장애 유발.' : '세포 내 미토콘드리아의 에너지 파동 방출이 안정된 궤도에 있음.', color: seeds.energyLevel < 0.4 ? '#FF6B6B' : '#0a84ff' },
            { id: 11, title: '11. 자율신경계 코히런스', icon: <Network size={24} color="var(--color-gold-main)" />, status: seeds.heartRateVariance > 0.8 ? '극세동' : '황금비', desc: seeds.heartRateVariance > 0.8 ? '교감신경 항진으로 인한 극심한 심박 패턴. 강제 휴식 요구.' : '교감/부교감 신경의 완벽한 밸런스가 달성된 상태.', color: seeds.heartRateVariance > 0.8 ? '#ff453a' : '#32CD32' },
            { id: 12, title: '12. 상위 자아 동조율 (Higher Self)', icon: <Sparkles size={24} color="var(--color-text-primary)" />, status: '각성 임박', desc: '다차원적 의식 확장 임박. 직관력 상승 및 영적 가이드 수신율 증가 상태.', color: '#111111' }
        ];

        setDimensions(generatedDimensions);
    }, []);

    return (
        <div className="screen" style={{ overflowY: 'auto', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px', gap: '10px', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '0' }}>
                    <ArrowLeft size={20} />
                    <span style={{ fontSize: '1rem' }}>돌아가기</span>
                </button>
                <div style={{ flex: 1 }}></div>
                <button onClick={() => window.location.href = window.location.origin.replace('5174', '5173') + '/'} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '5px 10px', borderRadius: '10px' }}>
                    <Home size={20} />
                    <span style={{ fontSize: '1rem' }}>처음으로</span>
                </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px', padding: '0 20px' }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-gold-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <BrainCircuit size={28} /> 12D 하이브리드 세부 분석
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    당신의 생체 파동을 9개의 다차원적 렌즈로 투영한 딥다이브 결과입니다. 프리미엄 멤버십 해제 완료.
                </p>
            </div>

            {/* Top Interactive Aura Visualizer */}
            <div style={{ marginBottom: '40px' }}>
                <HumanAuraFigure
                    primaryColor={localStorage.getItem('final_scan_results') ? JSON.parse(localStorage.getItem('final_scan_results')!).auraColor : "#ff453a"}
                    secondaryColor="#ff9f0a"
                    energyLevel={(() => {
                        const raw = localStorage.getItem('final_scan_results');
                        if (!raw) return 'low';
                        const eg = JSON.parse(raw).overallEnergy;
                        return eg > 70 ? 'high' : eg > 40 ? 'medium' : 'low';
                    })()}
                    isScanning={false}
                />
            </div>

            {/* High-End Grid Container */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px', padding: '0 20px' }}>
                {dimensions.map((dim) => (
                    <div
                        key={dim.id}
                        className="glass-card dim-card-hover"
                        onClick={() => navigate(`/ report / detail / ${dim.id} `)}
                        style={{
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.05), inset 0 0 20px ${dim.color} 0A`
                        }}
                    >
                        {/* Glowing Edge Indicator */}
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: dim.color, boxShadow: `0 0 15px ${dim.color} ` }}></div>

                        {/* Background subtle glow */}
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '100px', height: '100px', background: dim.color, filter: 'blur(50px)', opacity: 0.15 }}></div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: `1px solid ${dim.color} 30` }}>
                                    {dim.icon}
                                </div>
                                <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--color-text-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>{dim.title}</h3>
                            </div>
                            <span style={{
                                padding: '4px 12px',
                                background: `linear - gradient(135deg, ${dim.color}20, transparent)`,
                                color: dim.color,
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                border: `1px solid ${dim.color} 40`,
                                textShadow: `0 0 10px ${dim.color} 80`
                            }}>
                                {dim.status}
                            </span>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, position: 'relative', zIndex: 1, paddingLeft: '4px' }}>
                            {dim.desc}
                        </p>

                        {/* Detail Link Indicator */}
                        <div style={{
                            marginTop: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: dim.color,
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            alignSelf: 'flex-end',
                            opacity: 0.8,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            심층 리포트 열람 <ArrowRight size={14} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '0 20px', marginTop: '30px' }}>
                <button onClick={() => navigate('/chat')} className="primary-btn" style={{ background: 'linear-gradient(135deg, #4b0082, #191970)', color: '#FFF', borderColor: '#8A2BE2', width: '100%', height: 'auto', padding: '15px' }}>
                    <span style={{ fontSize: '1rem' }}>분석 바탕으로 AI 상담 시작하기</span>
                </button>
            </div>
        </div>
    );
};

export default TwelveDimensionReportScreen;
