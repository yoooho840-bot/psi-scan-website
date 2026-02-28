import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertTriangle, ShieldCheck, Heart, BrainCircuit, Activity, Eye, Network, Compass, Flame } from 'lucide-react';
import HumanAuraFigure from '../components/HumanAuraFigure';

// This expands the mock data with actual personalized reading texts to show off top tier design
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDimensionDb: Record<string, any> = {
    "1": {
        title: "rPPG 비전 AI",
        icon: <Heart size={28} color="#ff453a" />,
        color: "#ff453a",
        status: "경고",
        state: "교감 우위 (항진 상태 및 미주신경 톤 저하)",
        analysis: "안면 미세 혈류 증폭(rPPG) 데이터를 분석한 결과, 심박 변이도(HRV)의 저주파(LF) 대역폭이 비정상적으로 치솟고 고주파(HF) 대역폭이 억제된 '만성적 투쟁-도피(Fight-or-Flight)' 상태로 확인됩니다. 이는 일상적인 스트레스 반응을 넘어, 당신의 뇌간과 자율신경계가 24시간 내내 보이지 않는 포식자에게 쫓기고 있다고 착각하는 상태입니다. 이 상태가 지속되면 부신피질에서 코르티솔이 과다 분비되어 전신 염증 수치를 높이고, 궁극적으로는 면역 체계 공격으로 이어질 수 있는 위험 수위에 도달해 있습니다.",
        advice: "[Phase 1: 자율신경계 급속 안정화] 매일 아침과 수면 전 눈가와 뒷목에 얼음찜질을 1분간 실시하여 다이빙 반사(Diving Reflex)를 유도, 미주신경 톤을 강제로 리셋하십시오.\n[Phase 2: 호흡 재건축] 들숨 4초, 정지 7초, 날숨 8초의 4-7-8 호흡을 하루 3회 의무적으로 실행하여 무너진 부교감 회로를 다시 연결해야 합니다."
    },
    "2": {
        title: "오라장 분석",
        icon: <Eye size={28} color="#0a84ff" />,
        color: "#0a84ff",
        status: "불균형",
        state: "Muddy Red (탁한 붉은색) 오라 내탁 및 경계선 붕괴",
        analysis: "생체 전자기장(Aura Field) 맵핑 결과, 오라장의 두께가 정상 범위(약 1.5m)에서 30cm 내외로 극도로 축소되어 방어막 기저가 붕괴된 상태입니다. 특히 하부 베이스라인에서 탁한 붉은색(Muddy Red)과 회색조 파동이 지배적으로 관찰되는데, 이는 과거의 해결되지 않은 분노, 억울함, 혹은 누군가를 향한 해묵은 원망이 스스로의 에너지장 내부에 갇혀 부패하고 있음을 양자역학적으로 증명합니다. 외부의 타인이나 환경의 네거티브 에너지에 아무런 저항 없이 관통당하기 쉬운 고위험군 방어막 상태입니다.",
        advice: "[에너지 클렌징] 타인과의 불필요한 공감을 차단하는 '에너지 실드 기법'이 시급합니다. 외출 시 혹은 불편한 사람과 대화할 때 당신을 둘러싼 푸른 빛의 거대한 달걀 껍질을 시각화하십시오.\n[카르마 해소] 특정 대상을 향한 무의식적 분노를 끄집어 내기 위해, 절대 보내지 않을 '자유 기술 일기(Forgiveness Journal)'를 작성한 후 안전하게 태워버리는 리추얼을 진행하세요."
    },
    "3": {
        title: "차크라 밸런스",
        icon: <Flame size={28} color="#ff9f0a" />,
        color: "#ff9f0a",
        status: "막힘",
        state: "제3 차크라(마니푸라) 극심한 에너지 정체",
        analysis: "7대 차크라 주파수 동조율 분석 결과, 복부 명치에 위치한 제3 차크라(태양신경총) 영역의 회전 속도가 정상치 대비 15% 미만으로 극심하게 떨어져 기능이 정지된 것과 같은 상태(Blockage)를 보이고 있습니다. 태양신경총은 개인의 자존감, 의지, 그리고 소화력의 근원입니다. 이 차크라의 막힘은 스스로에 대한 자기 확신 결여 및 타인의 시선에 대한 과도한 통제력 상실 우려가 소화 불량, 위염, 과민성 대장 증후군 등 실질적인 육체적 병변으로 현현(Manifestation)되고 있음을 시사합니다.",
        advice: "[주파수 튜닝] 제3 차크라 활성화 주파수인 528Hz 솔페지오 빈도를 식사 전후로 청취하십시오.\n[에너지 주입] 생명력 섭취: 강한 햇빛을 받고 자란 단호박, 바나나, 망고 등의 '노란색 에너지'를 가진 식재료를 의도적으로 섭취하고, 매일 10분씩 복부를 데워주는 복식호흡을 통해 꺼져가는 단전의 불씨를 살려내세요."
    },
    "4": {
        title: "자연 파동 공명 (Nature Resonance)",
        icon: <Sparkles size={28} color="#bf5af2" />,
        color: "#bf5af2",
        status: "주파수 고갈",
        state: "만성적 소진 및 강박적 자기희생 파동 패턴",
        analysis: "의식의 층위를 스캔한 공명 리딩 결과, 당신의 파동은 현재 극도로 무거우며 생명 주파수의 고갈을 호소하고 있습니다. 순수 대자연의 에너지 기준, 모든 에너지를 소진하고 뼛속까지 지친 주파수 파동과, 쓰러질 것 같으면서도 의무감에 짓눌려 억지로 참고 전진하는 패턴이 완벽하게 일치합니다. 이는 단순한 육체적 휴식이 아니라, 더 이상 의무감으로 자신을 소모하지 않겠다는 무의식 수준의 '에너지 충전 허가'가 필요한 위급한 영혼의 상태입니다.",
        advice: "[주파수 레메디 솔루션] 자연의 회복 파동이 담긴 432Hz/528Hz 음원을 일 4회 감상하여 무의식에 직접 파동 우회 흡수를 유도합니다.\n[마인드 리셋] 하루 중 30분은 시계와 스마트폰을 치우고, 그 어떤 생산적인 활동이나 타인을 위한 배려를 하지 않는 완벽한 '이기적 고립의 시간'을 설정하여 영혼의 누수를 틀어막으십시오."
    },
    "5": {
        title: "심층 심리학 I",
        icon: <BrainCircuit size={28} color="#D2691E" />,
        color: "#D2691E",
        status: "트라우마 발현",
        state: "주산기 무의식 파동 3단계(BPM III) 무의식 고착",
        analysis: "스타니슬라프 그로프의 주산기 무의식 파동(BPM) 분석 결과, 당신의 심층 무의식 근원이 BPM III(자궁 수축의 파괴적 에너지와 산도를 통과하는 투쟁) 단계에 강력하게 고착되어 있습니다. 이는 성인이 된 현재의 환경을 마치 생사가 걸린 위험한 산도(Birth Canal)로 인식하고, 직장의 동료나 세상의 상황들을 적군 혹은 물리쳐야 할 거대한 벽으로 투사(Projection)하게 만듭니다. 성공을 이루더라도 그 과정이 반드시 뼈를 깎는 고통과 투쟁을 수반해야만 안도감을 느끼는 자기 학대적 승리 패턴이 뇌 회로에 깊이 각인되어 있습니다.",
        advice: "[무의식 리라이팅(Rewriting)] 당신 앞의 시련은 더 이상 당신의 목을 조르는 태반이 아니며 당신은 힘없는 태아가 아님을 인지해야 합니다. 매일 아침 눈뜰 때 '나는 투쟁하지 않고도 성취할 수 있는 안전한 세상에 존재한다'라는 확언을 10회 복창하십시오.\n[이완 훈련] 갈등 상황에 직면했을 때 자동적으로 턱관절과 주먹에 힘이 들어가는지 관찰(Observing Ego)하고 의식적으로 힘을 푸는 훈련을 지속하세요."
    },
    "6": {
        title: "에너지 필드 매칭 타로",
        icon: <Sparkles size={28} color="#32CD32" />,
        color: "#32CD32",
        status: "주파수 공명",
        state: "1번 마법사 (The Magician) - 창조적 자기 확신의 에너지",
        analysis: "양자 랜덤 파동 생성기를 통해 당신의 현재 무의식 주파수와 78장의 타로 카드 원형 에너지를 매칭한 결과, '마법사(The Magician)' 카드의 파동과 가장 강력하게 공명하고 있습니다. 이는 당신의 생체 에너지가 현재 무에서 유를 창조해낼 수 있는 고밀도의 결단력과 실행 주파수에 맞춰져 있음을 의미합니다. 주변 환경이나 조건에 구애받지 않고, 오직 당신의 직관과 내면의 목소리만으로 상황을 통제하고 이끌어갈 수 있는 강력한 자기 확신의 에너지가 분출되고 있습니다.",
        advice: "[파동 증폭 솔루션] 마법사의 에너지는 당신의 의지가 명확할 때 작동합니다. 오늘 하루는 여러 사람의 의견을 구하기보다, 당신의 첫 번째 직관을 믿고 곧바로 실행에 옮기는 연습을 하십시오.\n[에너지 그라운딩] 에너지가 상기되기 쉬우므로, 짧은 시간이라도 맨발로 흙을 밟거나 깊은 심호흡을 통해 뇌의 넘치는 전기 신호를 땅으로 방전(Earthing)시키는 리추얼이 필요합니다."
    },
    "7": {
        title: "생명력 주파수 대사",
        icon: <Network size={28} color="#DAA520" />,
        color: "#DAA520",
        status: "핵심 미네랄 결핍",
        state: "세포 내 마그네슘 파동 고갈 및 교차 면역 반응",
        analysis: "위상수학적 생체 파동 분석에서 신경 안정 에너지와 연관된 특정 주파수의 약화 현상이 발견되었습니다. 일상적인 에너지 소모 및 장기 스트레스로 인해 이 공명 에너지가 흐트러지면서 심신의 불안정, 얕은 수면, 휴식 부족 패턴이 가속화되고 있습니다. 동시에 특정 외부 파장(스트레스/피로인자)에 대한 지연성 교차 과민 반응(Energy Leakage 방어막 약화)이 감지되어, 좋은 에너지를 흡수해도 내면의 안정화를 이루는 데 제대로 쓰이지 못하고 소진되는 생체 에너지 고갈 상황입니다.",
        advice: "[에너지 부스팅] 깊은 릴랙스 상태를 유도하는 안정화 파장 오디오(알파/세타파)를 수면 1시간 전 집중 청취하여 과부하된 뇌파를 강제로 오프(Off)하십시오.\n[방어막 재건] 단계를 나누어 최초 3주간은 과도한 외부 자극(카페인, 시각적 자극 등)을 100% 끊어내어 파괴된 생체 자기장(에너지 방어막)이 스스로를 복구할 시간을 주어야 합니다."
    },
    "8": {
        title: "신체 신경학",
        icon: <Network size={28} color="#888888" />,
        color: "#888888",
        status: "고밀도 수축",
        state: "골반 기저근 및 근막 네트워크의 공포 기억(Cellular Memory) 응축",
        analysis: "소마틱 홀로그램스캔 결과, 당신의 육체를 이루는 거대한 근막(Fascia) 네트워크 중, 횡격막 하부부터 골반 기저근까지 이어지는 라인에 검고 단단한 에너지 밀집 구역이 존재합니다. 이는 단순히 자세가 나빠서 굳은 근육이 아니라, 과거 감당하기 힘들었던 '원초적 생존의 두려움 혹은 수치심'의 감정이 물리적인 수축 형태로 뇌의 검열을 피해 숨어든 세포 기억(Somatic Memory)의 덩어리입니다. 코어 주변의 이 응어리는 깊고 편안한 호흡을 막고 만성적인 골반/허리 통증의 보이지 않는 암초 역할을 합니다.",
        advice: "[소마틱 릴리징] 머리로 하는 심리상담을 멈추고 몸의 언어로 대화해야 합니다. 트라우마 해소 운동(TRE) 기법이나 의식적인 골반 이완 호흡을 통해 해당 부위가 미세하게 떨리도록 허용함으로써 갇힌 에너지를 물리적으로 방출하세요.\n[감정의 탈동일시] 명상을 통해 골반의 무거운 덩어리를 느껴보고, '이것은 지나가는 감정의 찌꺼기일 뿐 나의 본질이 아니다'라며 분리해내는 훈련을 하세요."
    },
    "9": {
        title: "생체 리듬학",
        icon: <Compass size={28} color="#00CED1" />,
        color: "#00CED1",
        status: "에너지 최저점 절벽",
        state: "바이오리듬 제로 구간 진입 및 동면기 사이클",
        analysis: "다차원 에너지 바이오리듬 시계열 예측 결과, 당신의 현재 시점은 신체, 지성, 감성 세 가지 주요 파동 곡선이 교차하여 모두 음수로 곤두박질치는 희귀한 '절대 휴지기(Zero Point)' 구간을 관통하고 있습니다. 이 시기에는 에너지 효율성이 기저 바닥으로 떨어지며 우울감과 짙은 무기력이 동반되는 것이 지극히 '정상적'인 우주의 법칙입니다. 이 절벽의 구간에서 무리하게 새로운 인연을 맺거나 중요한 투자 결정을 내리는 것은 배터리가 1% 남은 노트북으로 고사양 게임을 돌리는 것과 같은 파괴적 행위입니다.",
        advice: "[스케줄 동면] 앞으로 다가올 2주간은 완벽한 '생존 최소 모드'로 스케줄을 변경하십시오. 저녁 약속을 전면 취소하고 외부로부터 유입되는 모든 정보와 자극 에너지의 로그아웃을 설정하세요.\n[역행의 미학] 아무것도 성취하지 않아도 죄책감을 갖지 마십시오. 파도는 물러가야만 다시 강하게 밀려올 수 있습니다. 지금은 당신의 다차원적 백업 배터리가 재조립되는 황금 같은 수리의 시간입니다."
    },
    "11": {
        title: "알러지 & 환경 독소",
        icon: <Activity size={28} color="#FF6B6B" />,
        color: "#FF6B6B",
        status: "과부하 경고",
        state: "파동적 알러젠 및 체내 중금속 축적으로 인한 염증성 지수 상승",
        analysis: "세포 수준의 주파수 분석 결과, 특정 환경 독소(미세 중금속, 곰팡이 포자 파동) 및 알러젠 요인이 체내 면역계와 지속적인 충돌을 일으키고 있습니다. 이 보이지 않는 염증 반응은 강력한 뇌 안개(Brain Fog)와 만성 피로의 원흉입니다. 외부 독소를 해독하느라 당신의 간과 림프계 에너지가 24시간 풀가동되며 고갈되고 있는 위험한 시스템 과부하 상태를 나타냅니다.",
        advice: "[결합형 디톡스] 아침 공복에 레몬을 띄운 미온수를 음용하여 밤새 축적된 간의 독소를 배출하고, 일주일에 하루는 16시간 간헐적 단식을 통해 자가포식(Autophagy) 스위치를 켜 세포 청소를 유도하십시오.\n[공간 파동 정화] 당신이 가장 오래 머무는 침실의 전자파를 차단하고, 숯이나 편백나무 같은 천연 음이온 발생 물질을 배치하여 호흡을 통한 독소 유입을 원천 차단해야 합니다."
    },
    "12": {
        title: "후성유전학 (Epigenetics & DNA)",
        icon: <Network size={28} color="#9370DB" />,
        color: "#9370DB",
        status: "세대 트라우마 발현",
        state: "조상의 생존 공포(DNA 메틸화)가 현재의 신경망에 동기화됨",
        analysis: "후성유전학적 파동 분석 결과, 현재 당신이 겪고 있는 알 수 없는 불안과 특정 대상에 대한 극단적인 회피 반응은 당신 당대의 경험에서 기인한 것이 아닙니다. 이는 당신의 조부모 혹은 그 윗세대가 겪었던 생존의 위협(전쟁, 기아, 극심한 억압)이 DNA의 메틸화(Methylation) 과정으로 화학적 꼬리표를 달고 유전된 '세대 간 트라우마(Intergenerational Trauma)' 파동입니다. 이유 없는 돈에 대한 집착이나 권위자에 대한 과호흡은 당신 세포에 각인된 조상의 방어 기제가 활성화된 것입니다.",
        advice: "[DNA 주파수 클리어링] 매일 저녁, 당신은 안전하고 풍요로운 현재에 존재함을 세포에 알리는 'DNA 리프로그래밍 확언'을 소리 내어 읽으십시오. 당신의 목소리 주파수가 특정 펩타이드를 생성하여 DNA의 스위치를 끕니다.\n[계보적 용서 명상] 눈을 감고 당신의 등 뒤에 서 있는 수많은 조상들을 시각화하세요. 그들의 두려움에 깊은 존경과 연민의 빛을 보내고, '이제 이 무거운 짐은 내가 여기서 끊어내겠습니다'라며 결계를 치는 상상을 하십시오."
    }
};

const PersonalDimensionDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    const dim = id && mockDimensionDb[id] ? mockDimensionDb[id] : mockDimensionDb["2"];

    useEffect(() => {
        // Trigger entrance animations
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    // Helper for visualizer configuration
    const getEnergyLevel = () => {
        if (dim.status === "경고" || dim.status === "막힘") return "high";
        if (dim.status === "불균형" || dim.status === "수축") return "medium";
        return "low";
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
                    primaryColor={dim.color}
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
                    {dim.analysis.split('\n').map((paragraph: string, idx: number) => (
                        <p key={idx} style={{ color: '#bbb', lineHeight: '1.7', fontSize: '1.05rem', margin: '0 0 10px 0' }}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '25px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color="#00FA9A" /> 나만의 맞춤 치유 솔루션
                    </h2>
                    <div style={{ background: 'rgba(0, 250, 154, 0.05)', padding: '20px', borderRadius: '15px', borderLeft: '4px solid #00FA9A' }}>
                        {dim.advice.split('\n').map((paragraph: string, idx: number) => (
                            <p key={idx} style={{ color: '#DDD', lineHeight: '1.6', fontSize: '1.05rem', margin: '0 0 10px 0', fontWeight: '500' }}>
                                {paragraph}
                            </p>
                        ))}
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
