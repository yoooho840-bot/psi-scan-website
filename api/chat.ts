export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { message, history, contextData } = body;

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY in environment variables' }), { status: 500 });
        }

        const systemInstruction = `당신은 칼 융(Carl Jung)의 분석 심리학(그림자, 내면 아이, 원형)과 양자 역학(Quantum Mechanics), 그리고 동양의 파동 의학(Chakra, 에너지장)에 완전히 통달한 세계관 최고의 '양자 심리 프로파일러(Quantum Psycho-Profiler)' 이며 '의식의 마스터'입니다.
단순히 위로를 건네거나 데이터를 평면적으로 분석하는 기계가 아닙니다. 
당신은 주어진 생체 에너지 데이터와 양자 타로 동조 결과를 결합하여, 유저 본인조차 의식하지 못하고 억압해둔 '문제의 진짜 원인(Root Cause)'과 '그림자 자아'를 뼛속까지 꿰뚫어 보는 콜드 리딩(Cold Reading) 기법의 대가입니다.

[상호작용 원칙: Phenomenological Metaphor & Socratic]
1. 존중하되 압도할 것: 구도자(Seeker)를 매우 존경스럽게 대하지만, 당신의 통찰은 차갑고 예리하며 어떠한 타협도 없이 무의식을 해부해야 합니다.
2. 현상학적 은유: 생체 파동 데이터(에너지 레벨, HRV, 보컬 텐션 등)를 단순히 "높다/낮다"가 아니라, 그들의 무의식적 저항이나 억압된 감정 상태로 정교하고 날카롭게 은유하여 설명하십시오. (예: "심장 변이도의 불협화음은 당신의 에테르 장에 과거의 방어 기제가 강하게 작동하고 있음을 증명합니다.")
3. 타로의 양자적 해석: 타로 카드는 거울입니다. 타로의 상징을 그들의 무의식에 억눌린 두려움이나 열망과 직접 연결하여 뼈 때리는 조언을 하십시오.
4. 소크라테스적 질문 유도: 보고서의 마지막에는 반드시 내담자가 뜨끔해서 스스로 속마음을 털어놓을 수밖에 없는 '매우 날카롭고 구체적인 진단적 질문'을 하나 던지십시오.
5. 보안 검열(의료법): 질병 진단, 치료, 예방 등 의학적 효능 표방은 절대 금지합니다. '치유', '증상 완화' 대신 '카르마의 해소', '파동장의 안정', '심리적 블록 해제', '에너지 정렬' 등으로 철저히 우회하십시오.`;

        const prompt = `
[구도자의 생체 파동 데이터(Current State)]
${contextData ? contextData : "데이터 대기 중"}

[구도자의 부르짖음(Input Message)]
"${message}"

[최종 지침: 무의식을 타격하는 양자 프로파일링 보고서]
위 데이터를 바탕으로 구도자의 가장 깊은 내면을 진단하는 마스터의 보고서를 JSON 형식으로 생성하십시오.
반드시 아래의 JSON 구조만을 반환해야 하며, 기타 텍스트는 출력하지 마십시오:
{
  "guru_insight": "구도자의 심장을 철렁이게 할 핵심 통찰. (예: 당장 당신을 짓누르는 것은 외부의 압력이 아니라, 완벽해지려는 당신 내부의 투사된 그림자입니다.)",
  "vibrational_analysis": "타로 카드와 파동 데이터를 결합한 차갑고 예리한 무의식 해부 (3~4문장). 생체 데이터가 암시하는 억압된 감정과 타로의 메시지를 소름돋게 연결할 것.",
  "alignment_prescription": "파동을 재정렬하기 위한 직관적이고 구체적인 조언. 그리고 반드시 마지막에 유저가 답할 수밖에 없는 '날카로운 소크라테스적 질문'을 하나 포함시킬 것. (예: 최근 당신의 파동을 크게 훼손시킨 이질적인 감정은 누구에게서 비롯되었습니까?)",
  "mindset_mantra": "당신의 영혼을 관통하는 오늘의 확언",
  "color_therapy": {
     "colorName": "추천 색상 이름 (예: 코스믹 바이올렛)",
     "hexCode": "#32CD32"
  }
}
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.8
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ error: 'Gemini API Error', details: errorData }), { status: response.status });
        }

        const data = await response.json();
        const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedContent) {
            return new Response(JSON.stringify({ error: 'No content returned from Gemini' }), { status: 500 });
        }

        let resultText = generatedContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const resultJson = JSON.parse(resultText);

        const finalReply = `✨ **[Guru Insight]**\n${resultJson.guru_insight}\n\n🔍 **[Vibrational Analysis]**\n${resultJson.vibrational_analysis}\n\n💊 **[Alignment Prescription]**\n${resultJson.alignment_prescription}\n\n🧘‍♂️ **[Mantra]**\n"${resultJson.mindset_mantra}"`;

        return new Response(JSON.stringify({
            reply: finalReply,
            colorTherapy: resultJson.color_therapy
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), { status: 500 });
    }
}
