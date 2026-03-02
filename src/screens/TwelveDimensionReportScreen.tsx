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

    // Helper to map icon components safely outside of DB
    const getIconForDimension = (id: number, color: string) => {
        const props = { size: 24, color: color || "var(--color-gold-main)" };
        switch (id) {
            case 1: return <Sparkles {...props} />;
            case 2: return <Activity {...props} />;
            case 3: return <BrainCircuit {...props} />;
            case 4: return <Heart {...props} />;
            case 5: return <Network {...props} />;
            case 6: return <Shield {...props} />;
            case 7: return <Eye {...props} />;
            case 8: return <Sparkles {...props} />;
            case 9: return <Compass {...props} />;
            case 10: return <Activity {...props} />;
            case 11: return <Network {...props} />;
            case 12: return <Sparkles {...props} />;
            default: return <Sparkles {...props} />;
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            await supabase.auth.getSession();
            // Auth check logic
        };
        checkAuth();

        const rawResults = localStorage.getItem('final_scan_results');

        let dimsToSet = [];

        if (rawResults) {
            try {
                const results = JSON.parse(rawResults);
                if (results.dimensions && Array.isArray(results.dimensions)) {
                    // Inject icons since JSON from AI doesn't have React components
                    dimsToSet = results.dimensions.map((dim: any) => ({
                        ...dim,
                        icon: getIconForDimension(dim.id, dim.color)
                    }));
                }
            } catch (e) {
                console.error("Failed to parse AI results", e);
            }
        }

        // Deterministic Fallback if AI data is missing
        if (dimsToSet.length === 0) {
            const seedsStr = localStorage.getItem('psi_bio_seeds');
            const seeds = seedsStr ? JSON.parse(seedsStr) : { heartRateVariance: 0.5, vocalTension: 0.5, energyLevel: 0.5 };
            dimsToSet = [
                { id: 1, title: '1. 나의 쉴드 (보호막)', icon: <Sparkles size={24} color="#0a84ff" />, status: seeds.energyLevel > 0.6 ? '단단함' : '방어막 약화', desc: seeds.energyLevel > 0.6 ? '외부 로부터의 튼튼한 보호막 형성.' : '외부 감정/기운이 스며들기 쉬운 상태.', color: seeds.energyLevel > 0.6 ? '#32CD32' : '#0a84ff' },
                { id: 2, title: '2. 기본 활력 에너지', icon: <Activity size={24} color="#ff453a" />, status: seeds.vocalTension > 0.7 ? '위로 쏠림' : '안정', desc: seeds.vocalTension > 0.7 ? '생각이 많고 몸이 무거움.' : '활력의 균형.', color: seeds.vocalTension > 0.7 ? '#ff453a' : '#32CD32' },
                { id: 3, title: '3. 마음 깊은 곳의 파동', icon: <BrainCircuit size={24} color="#DAA520" />, status: seeds.heartRateVariance > 0.7 ? '감정 충돌' : '고요함', desc: seeds.heartRateVariance > 0.7 ? '덮어둔 과거 감정의 욱함.' : '내면의 일치.', color: seeds.heartRateVariance > 0.7 ? '#ff453a' : '#DAA520' },
                { id: 4, title: '4. 몸과 마음의 연결고리', icon: <Heart size={24} color="#D2691E" />, status: seeds.vocalTension > 0.6 ? '긴장 뭉침' : '유연함', desc: seeds.vocalTension > 0.6 ? '마음의 상처가 몸의 굳음으로.' : '자유로운 신체 흐름.', color: seeds.vocalTension > 0.6 ? '#D2691E' : '#bf5af2' },
                { id: 5, title: '5. 주변 환경과의 어울림', icon: <Network size={24} color="#00CED1" />, status: seeds.energyLevel < 0.3 ? '엇박자' : '조화', desc: seeds.energyLevel < 0.3 ? '주변 환경과 마찰, 기가 빨림.' : '환경과 편안한 공명.', color: seeds.energyLevel < 0.3 ? '#888888' : '#00CED1' },
                { id: 6, title: '6. 나쁜 환경 피로도', icon: <Shield size={24} color="#FF6B6B" />, status: '디지털 피로', desc: '전자기기/미디어를 통한 뇌파 탁해짐.', color: '#FF6B6B' },
                { id: 7, title: '7. 맑은 자연의 흙기운', icon: <Eye size={24} color="#bf5af2" />, status: '연결 끊김', desc: '흙/자연 기운 결핍으로 인한 헛헛함.', color: '#bf5af2' },
                { id: 8, title: '8. 새로운 시작의 운', icon: <Sparkles size={24} color="#32CD32" />, status: '시작의 적기', desc: '막힌 곳이 뚫리고 좋은 운이 임박함.', color: '#32CD32' },
                { id: 9, title: '9. 온몸의 기운 흐름', icon: <Compass size={24} color="#DAA520" />, status: '체증 (막힘)', desc: '피로감/수면 불량 등 에너지 톨게이트 막힘.', color: '#DAA520' },
                { id: 10, title: '10. 마음 깊은 곳 배터리', icon: <Activity size={24} color="#0a84ff" />, status: seeds.energyLevel < 0.4 ? '단절 필요' : '보통', desc: seeds.energyLevel < 0.4 ? '완전한 멍때리기 휴식이 필요함.' : '일상 유지가능.', color: seeds.energyLevel < 0.4 ? '#FF6B6B' : '#0a84ff' },
                { id: 11, title: '11. 머리와 마음의 뜻', icon: <Network size={24} color="#32CD32" />, status: seeds.heartRateVariance > 0.8 ? '심한 갈등' : '일치', desc: seeds.heartRateVariance > 0.8 ? '이성과 감정의 팽팽한 대립.' : '명쾌한 하나의 선택.', color: seeds.heartRateVariance > 0.8 ? '#ff453a' : '#32CD32' },
                { id: 12, title: '12. 직감과 아이디어', icon: <Sparkles size={24} color="#111111" />, status: '안테나 열림', desc: '우연한 힌트와 행운이 쏟아지는 시기.', color: '#111111' }
            ];
        }

        setDimensions(dimsToSet);
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
                    <BrainCircuit size={28} /> 12가지 요소 상세 분석
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    당신의 에너지를 12가지 방향에서 깊이 있게 들여다본 결과입니다.
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
                        onClick={() => navigate(`/report/detail/${dim.id}`)}
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
                            자세히 보기 <ArrowRight size={14} />
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
