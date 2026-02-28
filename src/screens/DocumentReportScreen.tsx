import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, User, Activity, AlertCircle, CheckCircle, BrainCircuit, Home, Sparkles } from 'lucide-react';
import useAutoFullscreen from '../hooks/useAutoFullscreen';

const DocumentReportScreen: React.FC = () => {
    const navigate = useNavigate();

    useAutoFullscreen();

    return (
        <div className="screen" style={{ overflowY: 'auto', padding: '20px', background: '#0a0e17' }}>
            {/* Header / Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '8px 0' }}>
                        <ArrowLeft size={20} />
                        <span style={{ fontSize: '1rem' }}>돌아가기</span>
                    </button>
                    <button onClick={() => window.location.href = window.location.origin.replace('5174', '5173') + '/'} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '8px 10px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <Home size={20} />
                        <span style={{ fontSize: '1rem' }}>처음으로</span>
                    </button>
                </div>
                <button style={{ background: 'rgba(218, 165, 32, 0.1)', border: '1px solid var(--color-gold-main)', color: 'var(--color-gold-main)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <Download size={16} />
                    PDF 다운로드
                </button>
            </div>

            {/* Document Container */}
            <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '30px 25px',
                color: '#333',
                fontFamily: 'var(--font-serif)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                lineHeight: 1.6
            }}>
                {/* Title */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.8rem', color: '#111', margin: '0 0 10px 0', fontFamily: 'var(--font-brand)' }}>PSI SCAN : ENERGY FIELD READING</h1>
                    <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>발행일: 2026. 02. 21 | 문서 번호: QM-2026-X839A</p>
                </div>

                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <User color="#555" size={24} style={{ marginTop: '3px' }} />
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.05rem', color: '#222' }}>대상자 기본 정보 (Demographics)</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#444' }}>
                            <strong>성별:</strong> 남성 &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>연령:</strong> 48세 (신체 연령 52세 측정) &nbsp;&nbsp;|&nbsp;&nbsp;
                            <strong>주요 불편감:</strong> 원인 모를 피로감, 하복부 불쾌감, 수면 불규칙
                        </p>
                    </div>
                </div>

                {/* Executive Summary */}
                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} /> 1. 종합 소견 (Executive Summary)
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: '#333', textAlign: 'justify' }}>
                        본 리포트는 대상자의 안면 생체 신호(rPPG)와 9대 데이터베이스(오라장 분석, 차크라 밸런스, 타로 파동 매칭, 소마틱 신경학 등)를
                        크로스레퍼런스(Cross-Reference)하여 도출된 결과입니다. 단순한 신체적 노화나 국소적 불균형이 아닌,
                        <strong>'에너지의 구조적 고착화'</strong>가 주요 원인으로 분석되었습니다. 특히 수(水) 기운의 극심한 고갈이
                        비뇨생식기(전립선)와 부교감 신경(미주신경)의 기능 저하를 연쇄적으로 유발하고 있습니다.
                    </p>
                </section>

                {/* Physical Biomarkers */}
                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} /> 2. 주요 생체 파동 지표 (Biomarkers)
                    </h2>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <AlertCircle size={16} color="#d32f2f" />
                            <strong style={{ fontSize: '1rem', color: '#d32f2f' }}>하복부 에너지 순환 압력 (107 / 위험)</strong>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 0 24px' }}>
                            세포 재생력이 떨어지고 하단전(Sacral Chakra)의 기혈 순환이 막히면서 국소적인 염증 수치가 피크에 달해 있습니다.
                        </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <AlertCircle size={16} color="#f57c00" />
                            <strong style={{ fontSize: '1rem', color: '#f57c00' }}>제노에스트로겐 축적 레벨 (117 / 경고)</strong>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 0 24px' }}>
                            체내에 누적된 환경호르몬 독소가 간(Liver)의 해독 능력을 한계치까지 밀어붙이고 있으며, 이는 호르몬 불균형을 야기합니다.
                        </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <AlertCircle size={16} color="#1976d2" />
                            <strong style={{ fontSize: '1rem', color: '#1976d2' }}>미주신경 활성도 (28 / 저하)</strong>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 0 24px' }}>
                            부교감 신경의 브레이크 역할이 제대로 작동하지 않아 신체가 항상 교감신경 우위(항진 및 긴장) 상태에 머물러 있습니다.
                        </p>
                    </div>
                </section>

                {/* Root Cause Analysis (Psychological) */}
                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BrainCircuit size={18} /> 3. 심층 심리 및 무의식 분석 (Root Causes)
                    </h2>
                    <ul style={{ fontSize: '0.95rem', color: '#333', paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '10px' }}><strong>S. Grof 주산기 무의식 파동:</strong> 자궁 수축으로 인한 압박감의 기억인 <strong>BPM 3 (투쟁과 생존)</strong> 단계의 트라우마가 활성화 상태입니다. 삶을 '살아내야 하는 전쟁터'로 인지하는 패턴이 지속되고 있습니다.</li>
                        <li style={{ marginBottom: '10px' }}><strong>칼 융의 그림자(Shadow):</strong> 사회적 가면(Persona)을 유지하기 위해 '나약함과 휴식'에 대한 욕구를 무의식 깊이 억압(Repression)하고 있으며 이것이 신체적 경직으로 발현됩니다.</li>
                        <li><strong>호킨스 의식 지도:</strong> 현재 주 에너지는 <strong>분노(Anger, 150 Lux)</strong>에 머물고 있으나, 이를 자각함으로써 <strong>용기(Courage, 200 Lux)</strong>로 파동을 전환할 수 있는 임계점(Tipping Point)에 도달했습니다.</li>
                    </ul>
                </section>

                {/* Recommendations */}
                <section style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={18} color="#2e7d32" /> 4. 전문가 제언 (AI Therapist Recommendations)
                    </h2>
                    <div style={{ background: 'rgba(46, 125, 50, 0.05)', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #2e7d32' }}>
                        <p style={{ fontSize: '0.95rem', color: '#2e7d32', margin: '0 0 10px 0', fontWeight: 'bold' }}>치유 행동 가이드 (Action Plan)</p>
                        <ol style={{ fontSize: '0.9rem', color: '#333', paddingLeft: '20px', margin: 0, lineHeight: 1.5 }}>
                            <li style={{ marginBottom: '5px' }}>가장 시급한 과제는 <strong>'안전함(Safety)'을 뇌에 학습시키는 것</strong>입니다. 잠들기 전 15분간 미주신경 자극 호흡(들이마시기 4초, 내쉬기 8초)을 실시하세요.</li>
                            <li style={{ marginBottom: '5px' }}>제노에스트로겐 배출을 위해 십자화과 채소(브로콜리, 케일)의 섭취를 늘리고 화학 세제 및 플라스틱 사용을 중단하십시오.</li>
                            <li>이 앱의 [AI 챗봇]과 연결하여 억압된 감정을 안전한 공간에 쏟아내는 과정(Catharsis)을 시작하시길 강력히 권장합니다.</li>
                        </ol>
                    </div>
                </section>

                {/* Integration Link to Tarot */}
                <div style={{ marginTop: '30px', padding: '25px', background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.05), rgba(218, 165, 32, 0.15))', borderRadius: '12px', border: '1px solid rgba(218, 165, 32, 0.3)', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: '#b8860b' }}>무의식 에너지 공명 확인하기</h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#666' }}>
                        지금 분석된 당신의 생체 파동과 타로 원형 에너지의 실시간 매칭 결과를 확인해보세요.
                    </p>
                    <button
                        onClick={() => navigate('/tarot')}
                        style={{
                            background: '#0a0e17', color: 'var(--color-gold-main)', border: '1px solid var(--color-gold-main)',
                            padding: '12px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 4px 15px rgba(218, 165, 32, 0.2)', transition: 'all 0.3s'
                        }}
                    >
                        <Sparkles size={18} />
                        에너지 타로 매칭 스테이션 입장
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.8rem', color: '#999', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    Psi Scan Corp. | Confidential Medical-Grade Analysis Report<br />
                    본 문서는 양자 바이오피드백 시스템에 의해 자동 생성된 참조 문서입니다.
                </div>
            </div>
        </div>
    );
};

export default DocumentReportScreen;
