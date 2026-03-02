import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Activity, Cpu, Hexagon, Sparkles } from 'lucide-react';
import useAutoFullscreen from '../hooks/useAutoFullscreen';
import { AnalysisEngine } from '../services/AnalysisEngine';

const AccurateAnalysisScreen: React.FC = () => {
    const navigate = useNavigate();
    const [analysisPhase, setAnalysisPhase] = useState<0 | 1 | 2>(0);
    const [filteredData, setFilteredData] = useState<number>(0);
    const [logs, setLogs] = useState<string[]>([]);

    // Dynamic result selection
    const [scanResult, setScanResult] = useState({ title: "", desc: "" });

    useAutoFullscreen();

    useEffect(() => {
        const potentialResults = [
            { title: "제 2차크라 파동 붕괴", desc: '"과거의 억압된 상처가 하복부 에너지를 정체시켜, 상위 뇌신경으로 가는 기(Prana)의 흐름을 막고 있습니다."' },
            { title: "전두엽 하이퍼-베타파", desc: '"만성적인 교감신경 항진으로 인해 뇌파가 과부하 상태이며, 심층 수면 회복이 차단되어 있습니다."' },
            { title: "미주신경 톤 저하", desc: '"스트레스와 방어 기제가 지속되어 부교감 신경의 브레이크 능력이 상실, 에너지 누수가 큽니다."' },
            { title: "심장-뇌 공명성 불일치", desc: '"감정 뉴런과 뇌파의 박동 리듬이 어긋나, 신체가 무의식적 불안 상태를 유지하고 있습니다."' },
            { title: "송과체 생체리듬 왜곡", desc: '"불규칙한 파동 흡수로 인해 멜라토닌 분비 축이 무너져 만성적 탈진 파장이 관측됩니다."' }
        ];

        const runDynamicAnalysis = async () => {
            const rawSurvey = localStorage.getItem('pre_scan_survey');
            const surveyData = rawSurvey ? JSON.parse(rawSurvey) : null;
            const rawBirth = localStorage.getItem('user_birth_data');
            const birthData = rawBirth ? JSON.parse(rawBirth) : null;
            const bioSeedsRaw = localStorage.getItem('psi_bio_seeds');
            const bioSeeds = bioSeedsRaw ? JSON.parse(bioSeedsRaw) : { energyLevel: 0.5, heartRateVariance: 0.5, vocalTension: 0.5 };

            const runFallback = () => {
                let selectedResult = potentialResults[0];
                if (surveyData && birthData) {
                    const vsaScore = parseFloat(localStorage.getItem('last_vsa_score') || '50');
                    const calculated = AnalysisEngine.calculateResults({
                        birthDate: birthData.birthDate || '1990-01-01',
                        birthTime: birthData.birthTime || '12:00',
                        survey: surveyData,
                        vsaScore,
                        factCount: 2048
                    });
                    const chakrasRecord = calculated.chakras as Record<string, number>;
                    const lowestChakraName = Object.entries(chakrasRecord).sort((a, b) => a[1] - b[1])[0][0];

                    if (calculated.stressIndex > 80) selectedResult = { title: "전두엽 하이퍼-베타파", desc: '"만성적인 교감신경 항진으로 인해 뇌파가 과부하 상태이며, 심층 수면 회복이 차단되어 있습니다."' };
                    else if (lowestChakraName === 'root' || lowestChakraName === 'sacral') selectedResult = { title: "하위 파동(Root/Sacral) 연쇄 붕괴", desc: '"과거의 억압된 상처나 만성 피로가 척추 신경계를 타고 왜곡된 파장을 올리고 있습니다."' };
                    else if (lowestChakraName === 'heart' || surveyData.mentalState === '우울') selectedResult = { title: "심장-뇌 공명성 불일치", desc: '"감정 뉴런과 뇌파의 박동 리듬이 어긋나, 신체가 무의식적 불안 상태를 유지 중입니다."' };
                    else selectedResult = { title: "미주신경 톤 저하", desc: '"장기간의 스트레스 노출로 자율신경계 브레이크 능력이 약화되어 보이지 않는 감정 에너지 누수가 지속 중입니다."' };

                    localStorage.setItem('final_scan_results', JSON.stringify(calculated));
                } else {
                    selectedResult = potentialResults[Date.now() % potentialResults.length];
                }
                setScanResult(selectedResult);
            };

            try {
                // SEC-005 & SEC-006: Call actual secure backend API instead of mock
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

                const res = await fetch(`${apiUrl}/api/scan/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bioSeeds,
                        contextInfo: "웹 환경 데스크탑 파동 분석"
                    })
                });

                if (res.ok) {
                    const jsonRes = await res.json();
                    if (jsonRes.success && jsonRes.data) {
                        // Store the REAL data from AI
                        localStorage.setItem('final_scan_results', JSON.stringify(jsonRes.data));
                        setScanResult({
                            title: `에너지 응집도: ${jsonRes.data.coherenceScore || 80}%`,
                            desc: `"${jsonRes.data.oracleInsight || '오라클과 파동이 동기화 되었습니다.'}"`
                        });
                    } else {
                        throw new Error("Invalid response format");
                    }
                } else {
                    console.error("AI API Error, falling back to local engine:", await res.text());
                    runFallback();
                }
            } catch (err) {
                console.error("Network Error, falling back to local engine", err);
                runFallback();
            }
        };

        runDynamicAnalysis();

        // Phase 0: Triage & Noise Filtering (Cross Validation)
        const logSequence = [
            "[STEP 1] 물리 데이터 변환: rPPG 안면 미세혈류를 광자(Photon)로 렌더링 중...",
            "         -> 혈류 RGB 변화율(%) = 심장 파동(Aura Heart)으로 동기화",
            "[STEP 2] 신경 긴장도 병합: FACS 안면 근육 떨림 값을 파동(Hz) 치환 중...",
            "         -> 근육 떨림 거리(px) = 교감 신경(에테르 체) 긴장도로 변환",
            "[STEP 3] 오디오 파장 추출: 성대 저주파(VSA)를 제5차크라 진동으로 맵핑...",
            "         -> 목소리의 파열음(Volume) = 카르마 블록 지수로 치환",
            "[양자 융합] 수집된 3대 생체 물리 데이터를 다차원 오라(Aura) 맵으로 컴파일...",
            "✅ 물리 데이터(Physical) -> 에너지 파동(Psi) 구조로 100% 번역 및 퀀텀 점프 완료."
        ];

        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < logSequence.length) {
                setLogs(prev => [...prev, logSequence[logIndex]]);
                setFilteredData(prev => prev + Math.floor(Math.random() * 1500) + 500);
                logIndex++;
            }
        }, 600);

        setTimeout(() => {
            clearInterval(logInterval);
            setAnalysisPhase(1); // Shift to Kingpin formulation

            setTimeout(() => {
                setAnalysisPhase(2); // Reveal Kingpin & Prescription button
            }, 3000);
        }, logSequence.length * 600 + 500);

        return () => clearInterval(logInterval);
    }, []);

    return (
        <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', position: 'relative', background: 'var(--color-bg-deep)' }}>

            {/* Header */}
            <div style={{ position: 'absolute', top: '30px', width: '100%', textAlign: 'center', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '10px' }}>
                    뒤로가기
                </button>
                <h2 style={{ fontSize: '1rem', letterSpacing: '3px', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0, flex: 1, textAlign: 'center' }}>PHASE 2: ACCURATE ANALYSIS</h2>
                <div style={{ width: '60px' }}></div> {/* Spacer for centering */}
            </div>

            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Visual Logic Core */}
                <div style={{
                    height: '240px',
                    background: 'var(--color-bg-panel)',
                    borderRadius: '20px',
                    border: analysisPhase === 2 ? '1px solid var(--color-border-gold)' : '1px solid var(--color-border-subtle)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: analysisPhase === 2 ? '0 0 50px rgba(218, 165, 32, 0.15)' : 'none',
                    transition: 'all 1s ease'
                }}>

                    {/* Background Grid */}
                    <div style={{ position: 'absolute', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(218,165,32,0.05) 0%, transparent 60%)', opacity: analysisPhase >= 1 ? 1 : 0.2, transition: 'opacity 1s' }}></div>

                    {analysisPhase === 0 && (
                        <>
                            <Filter size={48} color="#EF4444" style={{ marginBottom: '20px', animation: 'pulse 1s infinite' }} />
                            <h3 style={{ color: '#EF4444', fontSize: '1.2rem', letterSpacing: '1px' }}>노이즈 필터링 중</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>단순 신체 피로 데이터 {filteredData.toLocaleString()}건 삭제</p>
                        </>
                    )}

                    {analysisPhase === 1 && (
                        <>
                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '20px' }}>
                                <Cpu size={32} color="#EF4444" style={{ animation: 'pulse 1s infinite' }} />
                                <div style={{ height: '2px', width: '50px', background: 'linear-gradient(90deg, #EF4444, #9370DB)', border: 'none', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '-4px', left: '0', animation: 'slideRight 1s infinite', color: '#FFF' }}>&gt;</div>
                                </div>
                                <Sparkles size={32} color="#9370DB" style={{ animation: 'spin 4s linear infinite' }} />
                            </div>
                            <h3 style={{ color: '#9370DB', fontSize: '1.2rem', letterSpacing: '1px' }}>퀀텀 트랜스레이터 가동 (Quantum Translation)</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>"차가운 생체 신호를 살아있는 오라(Aura)로 번역하고 있습니다."</p>
                        </>
                    )}

                    {analysisPhase === 2 && (
                        <div style={{ textAlign: 'center', padding: '0 20px', zIndex: 2, animation: 'fadeIn 1s ease-out' }}>
                            <Hexagon size={40} color="var(--color-gold-main)" style={{ margin: '0 auto 15px auto', filter: 'drop-shadow(0 0 10px rgba(184, 139, 74, 0.4))' }} />
                            <p style={{ color: 'var(--color-gold-dark)', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '5px' }}>ROOT CAUSE IDENTIFIED</p>
                            <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '10px' }}>{scanResult.title}</h2>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, background: 'var(--color-bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }}>
                                {scanResult.desc}
                            </p>
                        </div>
                    )}
                </div>

                {/* Log Terminal */}
                <div style={{
                    background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', padding: '15px',
                    height: '160px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    opacity: analysisPhase === 2 ? 0.4 : 1, transition: 'opacity 1s', boxShadow: 'var(--shadow-deep)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                        <Activity size={14} color="var(--color-text-muted)" />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '1px' }}>AI 교차 검증 로그</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {logs.slice(-4).map((log, i) => (
                            <div key={i} style={{ color: i === 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                &gt; {log}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Area (Phase 3 & 4 Transition) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    {analysisPhase === 2 && (
                        <>
                            <button
                                onClick={() => navigate('/12d-report')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, var(--color-gold-main), #B8860B)',
                                    color: '#000',
                                    padding: '18px 20px',
                                    border: 'none',
                                    borderRadius: '15px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(218, 165, 32, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    animation: 'fadeInUp 0.6s ease-out'
                                }}
                            >
                                <Hexagon size={20} />
                                심층 에너지 필드 정보 리포트 확인
                            </button>
                            <button
                                onClick={() => navigate('/chat')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, var(--color-blue-mystic), #3A72B8)',
                                    color: '#FFF',
                                    padding: '18px 20px',
                                    border: 'none',
                                    borderRadius: '15px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(74, 144, 226, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    animation: 'fadeInUp 0.6s ease-out 0.2s backwards'
                                }}
                            >
                                <Cpu size={20} />
                                AI 수석 분석가와 1:1 심층 상담 (해석)
                            </button>
                            <button
                                onClick={() => navigate('/aura-profile')}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #2D1A4A, #4B2780)', // Deep mystic purple
                                    color: '#E0B0FF', // Lavender text
                                    padding: '18px 20px',
                                    border: '1px solid #9370DB',
                                    borderRadius: '15px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(138, 43, 226, 0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    animation: 'fadeInUp 0.6s ease-out 0.4s backwards'
                                }}
                            >
                                <Sparkles size={20} />
                                실시간 동적 오라(Aura) 프로필 확인
                            </button>
                            <button
                                onClick={() => navigate('/elemental-therapy')}
                                style={{
                                    background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.85rem',
                                    textDecoration: 'underline', cursor: 'pointer', animation: 'fadeIn 1s ease 1s backwards',
                                    marginTop: '10px'
                                }}
                            >
                                상담 생략하고 즉시 호흡 동기화 시작하기
                            </button>
                        </>
                    )}
                </div>

            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0.6; transform: scale(0.95); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideRight { 0% { left: 0; opacity: 1; } 100% { left: 100%; opacity: 0; } }
            `}</style>
        </div>
    );
};

export default AccurateAnalysisScreen;
