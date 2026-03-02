import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertTriangle, ShieldCheck, Heart, BrainCircuit, Activity, Eye, Network, Compass, Shield } from 'lucide-react';
import HumanAuraFigure from '../components/HumanAuraFigure';

// This expands the mock data with actual personalized reading texts to show off top tier design
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDimensionDb: Record<string, any> = {
    "1": {
        title: "나의 쉴드 (보호막)",
        icon: <Sparkles size={28} color="#0a84ff" />,
        color: "#0a84ff",
        status: "에너지 보호막 얇아짐",
        state: "외부의 감정과 기운이 쉽게 스며드는 상태",
        analysis: "나를 지켜주는 투명한 보호막이 지금 얇아져 있습니다. 쉴드가 약해져서 주위의 나쁜 기운이 쉽게 들어오게 됩니다. 평소보다 쉽게 피곤해지고 감정이 자주 왔다 갔다 할 수 있습니다. 내 안의 에너지가 자꾸만 밖으로 빠져나가고 있습니다.",
        advice: "[나만의 보호 공간 만들기] 마음이 불편한 곳에서는 팔을 가볍게 모으세요. 내 주변에 파란 보호막이 생겼다고 상상하며 나를 지켜주세요.\\n[생각 비우기] 잠들기 전 스마트폰 사용을 멈추세요. 외부의 복잡한 소문을 끊어내야 에너지가 다시 차오릅니다."
    },
    "2": {
        title: "기본 활력 에너지",
        icon: <Activity size={28} color="#ff453a" />,
        color: "#ff453a",
        status: "위아래 불균형 (위로 쏠림)",
        state: "생각은 많지만 몸이 쉽게 무거워짐",
        analysis: "위아래 몸의 흐름을 보니 아래쪽 기운이 텅 비어 있습니다. 반면 생각과 고민이 많은 머리 쪽으로만 뜨거운 열기가 꽉 차 있습니다. 머릿속 생각은 많지만 막상 몸을 움직이기는 무겁습니다. 마음만 답답하고 당장 실천할 용기가 안 나는 상태입니다.",
        advice: "[바닥과 친해지기] 마음이 붕 뜰 때는 발바닥에 집중하세요. 흙길을 천천히 걷거나 묵직한 명상 음악으로 열기를 아래로 내려주세요.\\n[생각 끊어내기] 잡생각이 나면 숨을 크게 내쉬며 발로 바닥을 꾹 눌러보세요. 의식을 아랫배로 내리는 연습이 필요합니다."
    },
    "3": {
        title: "마음 깊은 곳의 파동",
        icon: <BrainCircuit size={28} color="#DAA520" />,
        color: "#DAA520",
        status: "숨겨진 감정의 충돌",
        state: "모른 척 덮어둔 과거의 무거운 감정들이 불쑥 올라옴",
        analysis: "내 마음 깊은 곳에서 거친 파동이 흘러나오고 있습니다. 다 잊었다고 생각하며 참아왔던 감정들이 날카롭게 찌르고 있습니다. 갑자기 욱해서 화가 나거나 이유 없이 한없이 우울해지기도 합니다. 내 안의 감정들이 서로 싸우면서 갈등하고 있습니다.",
        advice: "[밀어내지 말고 바라보기] 갑자기 화가 치밀어 오를 때 무작정 참지 마세요. '내 안에 아직 서운함이 남아있구나' 하고 있는 그대로 인정해 주세요.\\n[종이에 적고 비우기] 속상한 마음을 아무도 못 볼 종이에 다 적어보세요. 그리고 그 종이를 찢거나 태우며 나쁜 기운을 날려 보내세요."
    },
    "4": {
        title: "몸과 마음의 연결고리",
        icon: <Heart size={28} color="#D2691E" />,
        color: "#D2691E",
        status: "긴장이 뭉쳐있는 굳은 구간 발견",
        state: "아직 풀리지 않은 마음의 상처가 몸의 뻣뻣함으로 나타남",
        analysis: "예전에 다쳤던 마음이 내 몸 부석구석에 아직 단단하게 뭉쳐 있습니다. 특정 부위에 만성적인 뻐근함이나 굳은 느낌이 발견됩니다. 몸이 스스로를 지키려고 억지로 잔뜩 힘을 주고 계속 버티고 있는 상황입니다.",
        advice: "[온몸의 힘 빼기] 누워서 머리부터 발끝까지 힘을 꽉 줬다가, '하~' 숨을 내쉬며 온몸을 축 늘어뜨리는 연습을 매일 해보세요.\\n[따뜻한 숨 불어넣기] 자주 뻐근한 곳에 손을 얹으세요. 따뜻한 빛이 스며든다고 상상하며 부드럽게 숨을 쉬어 긴장을 풀어주세요."
    },
    "5": {
        title: "주변 환경과의 어울림",
        icon: <Network size={28} color="#00CED1" />,
        color: "#00CED1",
        status: "주변과 엇박자가 나는 중",
        state: "현재 있는 곳의 기운이 나를 지치게 만듦",
        analysis: "나만의 파동이 지금 내가 있는 장소나 사람들과 전혀 맞지 않습니다. 라디오 채널이 안 맞는 것처럼 계속 삐걱거리고 있습니다. 나는 더 나아지고 싶은데 주변 상황이 나를 자꾸만 끌어내립니다. 현재 생활 환경에서 심한 피곤함과 답답함을 느끼고 있습니다.",
        advice: "[잠시 거리두기] 기가 빨리고 답답해지는 사람이나 장소가 있다면 당분간 피하세요. 나만의 방어선이 필요합니다.\\n[좋은 기운 채우기] 마음이 트이는 산, 눈이 즐거운 전시회, 좋은 음악 등 기분을 올려주는 밝은 환경의 기운을 듬뿍 흡수하세요."
    },
    "6": {
        title: "나쁜 환경 피로도",
        icon: <Shield size={28} color="#FF6B6B" />,
        color: "#FF6B6B",
        status: "탁한 에너지 초과 경보",
        state: "너무 많은 폰과 모니터 사용으로 기운이 탁해짐",
        analysis: "하루 종일 쳐다본 스마트폰과 모니터 탓에 머리가 많이 지쳐있습니다. 사람들과의 관계에서 오는 스트레스도 뇌를 피곤하게 만듭니다. 가끔 멍해지거나 눈앞이 뿌옇게 흐려지는 느낌을 받을 수 있습니다. 머릿속에 쓸데없는 정보가 너무 가득 차서 방 청소가 필요한 상태입니다.",
        advice: "[스마트폰 끄기] 머리를 비우려면 폰을 내려놓아야 합니다. 잠들기 1시간 전에는 기기를 거실에 두고 침실로 가세요.\\n[맑은 공기 마시기] 방 창문을 활짝 열어 묵은 공기를 밀어내세요. 맑은 종소리나 싱잉볼 소리로 방 안의 공기를 씻어내는 것도 좋습니다."
    },
    "7": {
        title: "맑은 자연의 흙기운",
        icon: <Eye size={28} color="#bf5af2" />,
        color: "#bf5af2",
        status: "자연과의 연결고리 약화",
        state: "흙과 숲의 땅기운을 너무 오랫동안 받지 못함",
        analysis: "맑고 깨끗한 자연의 기운을 너무 오랫동안 받지 못했습니다. 매일 답답한 회색빛 건물 안에서만 지내다 보니 생기가 빠져나갔습니다. 흙과 나무의 기운과 멀어지면서 왠지 모르게 허전하고 무기력해집니다. 가슴 속에 구멍이 뚫린 것 같은 묘한 우울감이 있습니다.",
        advice: "[맨발로 땅 느끼기] 주말에는 숲이나 흙길을 찾아가세요. 맨발로 흙을 밟으며 몸속 나쁜 에너지를 땅으로 모두 빼내세요.\\n[자연의 음식 먹기] 가공식품 대신 햇빛을 듬뿍 받고 자란 신선하고 색이 진한 채소와 과일을 먹으며 생기를 채우세요."
    },
    "8": {
        title: "새로운 시작의 운",
        icon: <Sparkles size={28} color="#32CD32" />,
        color: "#32CD32",
        status: "좋은 운이 바짝 다가온 상태",
        state: "내가 마음먹은 대로 현실이 풀릴 수 있는 긍정의 구간",
        analysis: "가슴을 답답하게 짓눌렀던 골치 아픈 일들이 이제 서서히 끝나갑니다. 무언가를 새로 시작하면 시원하게 확 풀릴 수 있는 좋은 기운이 들어왔습니다. 어깨를 펴고 기분 좋게 작은 용기 하나만 먼저 내보세요. 생각만 하던 일이 진짜 현실로 이루어질 수 있는 아주 좋은 타이밍입니다.",
        advice: "[하나에만 집중하기] 이것저것 신경 쓰지 마세요. 지금 가장 이루고 싶은 '딱 한 가지' 목표에만 모든 에너지를 집중하세요.\\n[행동이 먼저다] 머릿속에 좋은 생각이 떠올랐다면 미루지 마세요. 아주 작더라도 오늘 당장 움직여서 시작을 만들어내세요."
    },
    "9": {
        title: "온몸의 기운 흐름",
        icon: <Compass size={28} color="#DAA520" />,
        color: "#DAA520",
        status: "곳곳에 기(氣)가 체해 있음",
        state: "잘 돌던 기운이 어깨나 가슴 주변에서 명확히 막혀있음",
        analysis: "온몸을 따뜻하게 돌아야 할 기운이 중간중간 꽉 막혀 있습니다. 물이 고이면 썩듯이, 뭉친 기운 때문에 몸 이곳저곳이 쑤시고 불편해집니다. 몸은 피곤한데 쉽게 잠들지 못하고, 푹 쉬어도 영 개운하지가 않습니다. 몸의 순환이 꽉 체해 있는 조금은 답답한 상태입니다.",
        advice: "[온도 차이로 자극주기] 샤워할 때 시원한 물과 따뜻한 물을 번갈아 틀어 피부에 자극을 주세요. 멈춰 있던 기운이 다시 힘차게 돕니다.\\n[손바닥 열기 활용하기] 두 손을 뜨겁게 비벼주세요. 열기가 차오르면 뻐근한 목이나 어깨에 올려 막힌 기운을 부드럽게 녹여내세요."
    },
    "10": {
        title: "마음 깊은 곳 배터리",
        icon: <Activity size={28} color="#0a84ff" />,
        color: "#0a84ff",
        status: "바닥을 보이는 방전 상태",
        state: "절대적인 휴식이 간절히 필요한 순간",
        analysis: "내 삶의 가장 깊은 곳의 배터리가 지금 완전 방전되기 직전입니다. 너무 심하게 신경을 쓰고 스트레스를 받아 소중한 진을 다 뺐습니다. 나를 보호해야 할 아주 작고 기본적인 기운마저 바닥을 보이고 있습니다. 여기서 억지로 무리해서 움직이면 앓아누울 수 있으니 꼭 쉬어야 합니다.",
        advice: "[철저히 외부와 끊기] 당분간 억지로 좋은 사람인 척하지 마세요. '오늘은 아무것도 안 할 거야'라며 멍때리는 휴식 시간이 꼭 필요합니다.\\n[단순한 리듬 듣기] 복잡한 영상 대신 모닥불 타는 소리나 빗소리 같은 단순한 소리만 들으며 복잡한 머리를 식혀주세요."
    },
    "11": {
        title: "머리와 마음의 뜻",
        icon: <Network size={28} color="#D2691E" />,
        color: "#32CD32",
        status: "마음속의 심한 갈등 상태",
        state: "머리로는 '해야지' 하는데 가슴은 '죽어도 하기 싫다'며 싸우는 중",
        analysis: "차가운 생각과 뜨거운 마음이 서로 정반대로 싸우고 있습니다. 머리로는 버텨야 한다고 생각하지만 마음은 다 포기하고 도망치고 싶어 합니다. 내 안에서 서로 반대로 가려고 팽팽하게 줄다리기를 하고 있습니다. 내가 지금 제대로 가고 있는지 자꾸 헷갈리고 어지러운 상태입니다.",
        advice: "[호흡으로 하나 되기] 눈을 감고 5초간 들이마시고 5초간 내쉬어보세요. 시끄러운 머리와 답답한 마음의 속도를 맞춰주는 연습입니다.\\n[명쾌하게 선택하기] 사소한 일이라도 남 눈치 보지 말고, 내 마음과 머리가 동시에 '이거다!'라고 외치는 기분 좋은 선택만 해보세요."
    },
    "12": {
        title: "직감과 아이디어",
        icon: <Sparkles size={28} color="#111111" />,
        color: "#111111",
        status: "직관과 영감이 열리는 시기",
        state: "작은 우연들이 거대한 힌트로 쏟아지고 있는 상태",
        analysis: "최근 들어 직감이나 촉이 신기할 정도로 소름 돋게 잘 맞아떨어지고 있습니다. 굳이 억지로 내 고집을 부리지 않아도 일이 더 부드럽게 잘 풀립니다. 말도 안 되는 우연한 행운이나 재미있는 힌트들이 쏟아지는 시기입니다. 억지로 애쓰지 않아도 정답이 다가오는 아주 좋은 파동입니다.",
        advice: "[작은 신호 모아두기] 길에서 본 예쁜 간판, 반복되는 숫자, 우연히 들은 한마디 등 일상의 작은 힌트들을 그냥 넘기지 말고 메모해 두세요.\\n[마음 거울 닦기] 5분이라도 눈을 감고 가만히 숨을 쉬며 마음을 가라앉혀 보세요. 그래야 진짜 중요한 정답이 마음속에 또렷하게 떠오릅니다."
    }
};

const PersonalDimensionDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    // Fallback data mapping from mock DB
    const baseDim = (id && mockDimensionDb[id]) ? mockDimensionDb[id] : mockDimensionDb["2"];

    // Try to extract AI-generated data from localStorage
    let aiDim: any = null;
    try {
        const raw = localStorage.getItem('final_scan_results');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.dimensions && Array.isArray(parsed.dimensions)) {
                aiDim = parsed.dimensions.find((d: any) => d.id.toString() === id);
            }
        }
    } catch (e) {
        console.error("Failed to parse localized AI dimension data", e);
    }

    // Merge AI Data with Fallback Data
    const dim = {
        title: aiDim?.title || baseDim.title,
        icon: baseDim.icon || <Sparkles size={28} color="#FFF" />,
        color: aiDim?.color || baseDim.color,
        status: aiDim?.status || baseDim.status,
        state: aiDim?.desc || baseDim.state, // Short summary from AI goes here
        analysis: baseDim.analysis, // Keep the beautiful, deeply philosophical long text intact
        advice: baseDim.advice
    };

    useEffect(() => {
        // Trigger entrance animations
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    // Helper for visualizer configuration
    const getEnergyLevel = () => {
        const raw = localStorage.getItem('final_scan_results');
        if (raw) {
            const eg = JSON.parse(raw).overallEnergy;
            return eg > 70 ? "high" : eg > 40 ? "medium" : "low";
        }
        if (dim.status === "경고" || dim.status === "막힘") return "high";
        if (dim.status === "불균형" || dim.status === "수축") return "medium";
        return "low";
    }

    const getAuraColor = () => {
        const raw = localStorage.getItem('final_scan_results');
        if (raw) {
            return JSON.parse(raw).auraColor;
        }
        return dim.color;
    }

    return (
        <div className="screen" style={{
            overflowY: 'auto',
            paddingBottom: '40px',
            background: '#050508',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
        }}>

            <div style={{ padding: '20px', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(10px)' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '0' }}>
                    <ArrowLeft size={20} />
                    <span style={{ fontSize: '1rem' }}>돌아가기</span>
                </button>
            </div>

            <div style={{ textAlign: 'center', padding: '0 20px 30px' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${dim.color}15`,
                    padding: '15px',
                    borderRadius: '20px',
                    marginBottom: '15px',
                    boxShadow: `0 0 30px ${dim.color}30`
                }}>
                    {dim.icon}
                </div>
                <h1 style={{ fontSize: '2rem', color: '#FFF', marginBottom: '10px', fontWeight: '800' }}>
                    {dim.title}
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${dim.color}20`, border: `1px solid ${dim.color}`, padding: '5px 15px', borderRadius: '30px' }}>
                    <AlertTriangle size={14} color={dim.color} />
                    <span style={{ color: dim.color, fontWeight: 'bold', fontSize: '0.9rem' }}>현재 상태: {dim.status}</span>
                </div>
            </div>

            {/* Dynamic Visualizer based on this specific dimension */}
            <div style={{ margin: '0 0 40px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: `radial-gradient(ellipse at center, ${dim.color}10 0%, transparent 60%)` }}>
                <HumanAuraFigure
                    primaryColor={getAuraColor()}
                    secondaryColor="#ffffff"
                    energyLevel={getEnergyLevel()}
                    isScanning={false}
                />
            </div>

            {/* Personalized Reading Content */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '25px', borderRadius: '20px', borderTop: `2px solid ${dim.color}` }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BrainCircuit size={20} color={dim.color} /> 검사 결과 해석
                    </h2>
                    {dim.analysis.replace(/([.:])\s+/g, '$1\n\n').replace(/(\다\.)(?!\s|\n)/g, '$1\n\n').split('\n').filter(Boolean).map((paragraph: string, idx: number) => (
                        <p key={idx} style={{ color: '#bbb', lineHeight: '1.8', fontSize: '1.05rem', margin: '0 0 15px 0', wordBreak: 'keep-all' }}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '25px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color="#00FA9A" /> 나만의 맞춤 솔루션
                    </h2>
                    <div style={{ background: 'rgba(0, 250, 154, 0.05)', padding: '20px', borderRadius: '15px', borderLeft: '4px solid #00FA9A' }}>
                        {dim.advice.split('\\n').filter(Boolean).map((paragraph: string, idx: number) => {
                            const match = paragraph.match(/^(\[.*?\])\s*(.*)$/);
                            if (match) {
                                return (
                                    <div key={idx} style={{ marginBottom: '20px' }}>
                                        <div style={{ color: '#00FA9A', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>{match[1]}</div>
                                        <p style={{ color: '#DDD', lineHeight: '1.7', fontSize: '1.05rem', margin: 0, fontWeight: '500', wordBreak: 'keep-all' }}>
                                            {match[2].replace(/([.:])\s+/g, '$1\n').split('\n').filter(Boolean).map((sentence: string, sIdx: number) => (
                                                <span key={sIdx} style={{ display: 'block', marginBottom: '6px' }}>
                                                    {sentence}
                                                </span>
                                            ))}
                                        </p>
                                    </div>
                                );
                            }
                            return (
                                <p key={idx} style={{ color: '#DDD', lineHeight: '1.7', fontSize: '1.05rem', margin: '0 0 20px 0', fontWeight: '500', wordBreak: 'keep-all' }}>
                                    {paragraph.replace(/([.:])\s+/g, '$1\n').split('\n').filter(Boolean).map((sentence: string, sIdx: number) => (
                                        <span key={sIdx} style={{ display: 'block', marginBottom: '6px' }}>
                                            {sentence}
                                        </span>
                                    ))}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <button onClick={() => navigate(-1)} className="secondary-btn" style={{ padding: '15px 30px', borderRadius: '30px' }}>
                    보고서 메인 화면으로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default PersonalDimensionDetailScreen;
