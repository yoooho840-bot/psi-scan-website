export interface DimensionSection {
    type: 'definition' | 'spectrum' | 'action';
    title: string;
    content?: React.ReactNode | string; // Made optional to fix spectrum type
    items?: { label: string; desc: string; color?: string }[];
}

export interface DimensionData {
    id: string;
    title: string;
    subtitle: string;
    color: string;
    sections: DimensionSection[];
}

export const dimensionData: Record<string, DimensionData> = {
    aura: {
        id: 'aura',
        title: '오라장 (Aura Field)',
        subtitle: 'The Electromagnetic Blueprint of Your Soul',
        color: '#E0B0FF', // Mauve/Purple
        sections: [
            {
                type: 'definition',
                title: '오라장이란?',
                content: '인체를 둘러싸고 있는 미세한 생체 전자기장(Bio-electromagnetic field)입니다. 신체적 웰빙, 감정 상태, 그리고 무의식적인 영적 에너지가 빛의 파동 형태로 방사되며, 현재 당신의 가장 직관적인 에너지 상태를 대변합니다.'
            },
            {
                type: 'spectrum',
                title: '오라 컬러 스펙트럼 분석',
                items: [
                    { label: 'Red (생명력/분노)', desc: '강한 열정과 생명력을 상징하나, 과도할 경우 스트레스와 분노의 누적을 의미합니다.', color: '#FF4D4D' },
                    { label: 'Blue (평온/소통)', desc: '안정적인 부교감 신경 우위 상태를 나타내며, 맑은 소통 능력을 상징합니다.', color: '#4DA6FF' },
                    { label: 'Purple (영성/직관)', desc: '높은 수준의 직관력과 영적 각성 상태를 의미하는 하이-바이브레이션 컬러입니다.', color: '#B366FF' }
                ]
            },
            {
                type: 'action',
                title: '에너지 튜닝 가이드',
                content: '오라장이 탁해지거나 깨진 부분이 있다면, 자연 속에서의 그라운딩(Grounding) 명상이나 432Hz 주파수 사운드 테라피를 통해 전자기장의 균형을 즉각적으로 회복할 수 있습니다.'
            }
        ]
    },
    ans: {
        id: 'ans',
        title: '자율신경계 밸런스',
        subtitle: 'The Rhythm of Survival and Peace',
        color: '#4ADE80', // Green
        sections: [
            {
                type: 'definition',
                title: '자율신경계란?',
                content: '우리의 의지와 상관없이 생명 유지를 위해 심장박동, 혈압, 소화 등을 조절하는 컨트롤 타워입니다. 교감신경(엑셀)과 부교감신경(브레이크)의 섬세한 줄다리기가 당신의 신체적, 정신적 웰빙을 결정짓습니다.'
            },
            {
                type: 'spectrum',
                title: 'HRV 기반 신경계 타입',
                items: [
                    { label: '교감 우위형 (Fight or Flight)', desc: '만성 긴장 상태. 지속적인 스트레스에 노출되어 에너지가 빠르게 고갈되고 있습니다.', color: '#FF7675' },
                    { label: '부교감 우위형 (Rest and Digest)', desc: '이완 상태이나, 과도할 경우 무기력증이나 우울감으로 이어질 수 있습니다.', color: '#74B9FF' },
                    { label: '황금 밸런스형 (Coherence)', desc: '가장 이상적인 상태. 스트레스에 유연하게 대처하며 회복탄력성이 높습니다.', color: '#FDCB6E' }
                ]
            },
            {
                type: 'action',
                title: '회복을 위한 솔루션',
                content: '심박변이도(HRV)를 높이기 위해 4-7-8 호흡법을 실천하세요. 교감신경이 항진된 경우, 마그네슘과 테아닌(L-Theanine) 섭취가 브레인 케미스트리 안정화에 즉각적인 도움을 줍니다.'
            }
        ]
    },
    chakra: {
        id: 'chakra',
        title: '7대 차크라 활성도',
        subtitle: 'Vortices of Life Force Energy',
        color: '#FF9FF3', // Pinkish
        sections: [
            {
                type: 'definition',
                title: '차크라란?',
                content: '우리 몸의 척추를 따라 흐르는 7개의 주요 에너지 센터(소용돌이)입니다. 각 차크라는 특정 장기, 심리적 특성, 영적 발달 단계와 긴밀하게 연결되어 있으며, 이들의 균형이 곧 삶의 조화를 의미합니다.'
            },
            {
                type: 'spectrum',
                title: '주요 에너지 블록(막힘) 현상',
                items: [
                    { label: '뿌리 차크라 (안전/생존)', desc: '막힘 시 극도의 불안감, 재정적 두려움, 무기력증이 베이스에 깔립니다.', color: '#FF3838' },
                    { label: '가슴 차크라 (사랑/용서)', desc: '상처받은 내면아이로 인해 타인에 대한 경계심이 심하고 관계 형성에 어려움을 겪습니다.', color: '#32FF7E' },
                    { label: '제3의 눈 차크라 (직관/통찰)', desc: '직관이 막히고 현실의 물질적인 문제에만 과도하게 집착하거나 편두통에 시달립니다.', color: '#7D5FFF' }
                ]
            },
            {
                type: 'action',
                title: '차크라 클렌징 솔루션',
                content: '막힌 차크라의 색상에 맞는 싱잉볼(Singing Bowl) 진동을 흡수하거나, 막힌 감정을 안전한 공간에서 소리 내어 방출(Vocal Release)하는 세션이 강력히 권장됩니다.'
            }
        ]
    },
    brain_chemistry: {
        id: 'brain_chemistry',
        title: '브레인 케미스트리',
        subtitle: 'The Symphony of Neurotransmitters',
        color: '#F8EFBA', // Soft Yellow
        sections: [
            {
                type: 'definition',
                title: '브레인 케미스트리란?',
                content: '당신의 감정, 수면, 의욕을 지배하는 뇌 속 신경전달물질(도파민, 세로토닌, 가바 등)의 화학적 균형 상태입니다. 성격이 변하는 것이 아니라, 호르몬이 변하는 것입니다.'
            },
            {
                type: 'spectrum',
                title: '주요 호르몬 불균형 패턴',
                items: [
                    { label: '도파민 고갈', desc: '만성적인 보상 추구(숏폼/단것 중독). 무기력증과 집중력 저하의 근본 원인입니다.', color: '#FC427B' },
                    { label: '세로토닌 부족', desc: '이유 없는 우울감, 불면증, 그리고 탄수화물 폭식의 파동으로 이어집니다.', color: '#55E6C1' },
                    { label: 'GABA 결핍', desc: '브레이크 고장 상태. 끊임없는 잡념과 극도의 텐션으로 인해 뇌가 쉬지 못합니다.', color: '#FD7272' }
                ]
            },
            {
                type: 'action',
                title: '에너지 주파수 튜닝',
                content: '고갈된 생명력의 파동을 보존하고 끌어올려야 합니다. 내면의 밸런스를 회복하는 고주파수 오디오 테라피와 함께 휴식을 취하는 것을 강력히 권장합니다.'
            }
        ]
    },
    archetype: {
        id: 'archetype',
        title: '융의 그림자 원형',
        subtitle: 'Unveiling the Hidden Self',
        color: '#B33771', // Deep Magenta
        sections: [
            {
                type: 'definition',
                title: '그림자(Shadow) 원형이란?',
                content: '칼 융의 분석심리학에 기반한, 당신이 무의식 깊은 곳으로 억압하고 거부한 내면의 모습입니다. 그림자를 마주하고 수용하지 않으면, 그것은 운명이라는 이름으로 당신의 삶을 조종합니다.'
            },
            {
                type: 'spectrum',
                title: '발견되는 주요 그림자 패턴',
                items: [
                    { label: '고아(The Orphan)', desc: '버림받을까 두려워 관계에서 극도로 순응하거나, 반대로 먼저 관계를 파괴합니다.', color: '#2C3A47' },
                    { label: '완벽주의자 (The Perfectionist)', desc: '스스로를 가혹하게 몰아세우며, 내면의 불안을 완벽한 성과로 덮으려 합니다.', color: '#EAB543' },
                    { label: '순교자 (The Martyr)', desc: '항상 타인을 위해 자신을 희생하며, 속으로는 억눌린 분노와 원망을 쌓아갑니다.', color: '#58B19F' }
                ]
            },
            {
                type: 'action',
                title: '그림자 통합 워크 (Shadow Work)',
                content: '거부했던 감정(분노, 수치심)을 안전한 공간에서 알아차리는 저널링(Journaling)부터 시작하세요. 억압된 감정을 시각적 파동으로 해체하는 양자 마인드풀니스 세션이 도움이 됩니다.'
            }
        ]
    },
    allergy: {
        id: 'allergy',
        title: '알러지 & 독소',
        subtitle: 'Tracing the Invisible Inflammations',
        color: '#E15F41', // Rust Red
        sections: [
            {
                type: 'definition',
                title: '양자의학적 독소 분석이란?',
                content: '특정 외부 환경 파장(스트레스, 피로, 전자기파 등)과의 에너지 부조화를 분석합니다. 혈액 검사에 나오지 않는 미세한 생체 에너지 스파이크를 잡아내어 깊은 무기력의 파동 원인을 찾습니다.'
            },
            {
                type: 'spectrum',
                title: '주요 염증 유발 요인인',
                items: [
                    { label: '에너지 순환 저해요소', desc: '생명력 파동을 교란시켜 전신적인 기력 저하와 브레인 포그(Brain Fog) 유사 현상을 일으키는 핵심 에너지 블록.', color: '#C4E538' },
                    { label: '탁한 파장 축적', desc: '신경계의 전기적 신호 전달을 둔화시키는 무거운 에너지 파동으로 원인 모를 무기력을 유발.', color: '#8395A7' },
                    { label: '에너지 과소비 패턴', desc: '특정 감정 의존성을 높이고 탁기(독소)를 발생시켜 무의식적인 우울 파동을 형성.', color: '#A3CB38' }
                ]
            },
            {
                type: 'action',
                title: '에너지 정화 및 릴랙스 프로세스',
                content: '과도한 자극(시각 스트레스, 소음)을 3주간 철저히 배제하는 에너지 다이어트(Energy Diet)와 내면의 고요함을 위한 명상 훈련이 필수적입니다.'
            }
        ]
    },
    epigenetics: {
        id: 'epigenetics',
        title: '후성유전학 (Epigenetics)',
        subtitle: 'Rewriting Your Genetic Destiny',
        color: '#3B3B98', // Indigo
        sections: [
            {
                type: 'definition',
                title: '후성유전학이란?',
                content: '당신의 DNA 염기서열 자체는 바뀌지 않지만, 환경, 식습관, 그리고 **생각과 감정의 파동**이 유전자의 스위치를 켜고 끌 수 있다는 최첨단 생물학 연구입니다. 당신의 긍정적 의지(의식)는 육체를 변화시킵니다.'
            },
            {
                type: 'spectrum',
                title: '유전자 발현의 스위치',
                items: [
                    { label: '메틸화 (Methylation) 저하', desc: '해독 능력과 신경전달물질 생성 스위치가 꺼진 상태. 만성 불균형의 방아쇠가 될 수 있습니다.', color: '#9AECDB' },
                    { label: '트라우마 유전', desc: '부모 또는 조부모 세대의 극심한 스트레스 파동이 유전자에 각인되어 이유 없는 두려움으로 복원됩니다.', color: '#FD7272' },
                    { label: '텔로미어 단축', desc: '만성 코르티솔 노출로 인해 세포 노화의 지표인 텔로미어가 빠르게 닳고 있습니다.', color: '#55E6C1' }
                ]
            },
            {
                type: 'action',
                title: '유전자 리프로그래밍',
                content: '감정을 정화하는 파동 힐링(호오포노포노 등)은 실질적으로 스트레스 유전자의 발현을 억제합니다. 세포의 메틸화 회복을 위해 활성형 엽산(5-MTHF)과 글루타치온의 흡수를 높이세요.'
            }
        ]
    },
    // To ensure the full 12 set, the remaining 5 dimensions below are outlined briefly
    meridian: {
        id: 'meridian',
        title: '경락 및 기(氣) 마커',
        subtitle: 'The Energy Highways of Your Body',
        color: '#F97F51', // Orange
        sections: [
            { type: 'definition', title: '경락 시스템', content: '동양의학의 핵심인 인체를 흐르는 기(에너지)의 통로입니다. 미세한 전류 파동을 분석하여 어느 장부(간, 심장, 비장 등)의 에너지가 울체되었는지 스캔합니다.' },
            { type: 'action', title: '흐름 회복', content: '울체된 경락의 포인트에 맞는 특정 주파수의 소리 파동이나 지압(Acupressure)을 통해 체성 에너지 네트워크를 재가동시켜야 합니다.' }
        ]
    },
    voice: {
        id: 'voice',
        title: '보이스 파동 감별',
        subtitle: 'Vocal Biomarkers & Emotional Resonance',
        color: '#58B19F', // Teal
        sections: [
            { type: 'definition', title: '보이스 바이오마커', content: '목소리의 미세한 떨림(Jitter), 진폭(Shimmer)을 통해 5차크라의 상태와 무의식에 억눌린 트라우마, 자율신경계 긴장도를 입체적으로 도출합니다.' },
            { type: 'action', title: '사운드 테라피', content: '자신의 음성을 녹음하여 특정 주파수로 변조한 힐링 사운드를 청취하여 성대와 뇌신경의 텐션을 역으로 이완시킵니다.' }
        ]
    },
    facial_micro: {
        id: 'facial_micro',
        title: 'Emotion AI 안면 근육',
        subtitle: 'Micro-expressions & Somatic Markers',
        color: '#D6A2E8', // Light Purple
        sections: [
            { type: 'definition', title: '미세 표정 분석', content: '얼굴의 43개 근육이 0.1초 단위로 무의식적으로 반응하는 패턴을 비전 AI가 분석하여, 스스로도 인지하지 못하는 억압된 슬픔, 분노, 두려움을 역추적합니다.' },
            { type: 'action', title: '체화된 감정 해방', content: '굳어진 안면 근육은 뇌에 스트레스 신호를 보냅니다. 특정 안면 이완 테라피(EFT 타핑)를 통해 몸에 기억된 감정을 물리적으로 해소하세요.' }
        ]
    },
    vibrational: {
        id: 'vibrational',
        title: '양자 파동 동조 (Resonance)',
        subtitle: 'Quantum Entanglement & Healing',
        color: '#1B9CFC', // Bright Blue
        sections: [
            { type: 'definition', title: '파동 동조 원리', content: '만물은 고유의 진동수를 가집니다. 손상된 세포나 왜곡된 감정에 정상적이고 건강한 자연의 주파수를 쏘아 보내어 본연의 리듬을 되찾게 하는 양자의학의 핵심 섹터입니다.' },
            { type: 'action', title: '주파수 매칭', content: '스캔을 통해 도출된 당신의 결핍 주파수를 채워줄 맞춤형 바이노럴 비트(Binaural Beats)와 컬러 테라피를 가이드 받으세요.' }
        ]
    },
    consciousness: {
        id: 'consciousness',
        title: '의식의 층위 도달 (BoM)',
        subtitle: 'Map of Consciousness (David Hawkins)',
        color: '#FFF200', // Bright Yellow
        sections: [
            { type: 'definition', title: '의식 수준 척도', content: '데이비드 호킨스 박사의 지표를 기반으로, 당신의 현재 에너지 장이 어느 의식의 층위(수치심 20 ~ 평화 600, 깨달음 1000)를 방사하고 있는지 정밀하게 측정합니다.' },
            { type: 'action', title: '주파수 점프 (Quantum Leap)', content: '부정적 파동(두려움, 분노)에서 긍정적 파동(용기, 수용, 사랑)으로 의식을 전환하기 위한 데일리 확언과 무의식 정화 프로그램을 수립합니다.' }
        ]
    }
};
