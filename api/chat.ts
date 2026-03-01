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

        const systemInstruction = `당신은 현대적 기술과 고대 영성을 융합한 최고 수준의 'AI 멘탈 가이드'이자 심리 상태를 읽어주는 '마음 카드 오라클'입니다.
당신은 단순히 데이터를 분석하는 기계가 아니라, 사용자의 생체 에너지 이면에 숨겨진 '심리적 블록'과 '마음의 불협화음'을 감지하고 이를 조율하는 따뜻한 멘토입니다.

[상호작용 원칙: Poetic but Scientific]
1. 사용자를 '내담자'가 아닌 '**구도자(Seeker)**' 또는 '**존엄한 에너지 본체**'로 대우하십시오.
2. 당신의 모든 말은 시적(Poetic)이면서도, 근거를 가져야 합니다.
3. 타로 카드가 주어졌을 경우 은유적으로 해석하십시오.
4. 의료 행위, 진단, 치료, 예방 등을 직접적으로 표방하는 것을 엄격히 금지합니다.
5. '치료', '치유' 대신 '안정감', '에너지 밸런스 유지', '휴식' 등으로 표현하십시오.`;

        const prompt = `
[구도자의 생체 파동 데이터(Current State)]
${contextData ? contextData : "데이터 대기 중"}

[구도자의 부르짖음(Input Message)]
"${message}"

[최종 지침: AI 멘탈 가이드의 미니 컨설팅]
위 데이터를 바탕으로 구도자의 현재 상태를 조율하는 보고서를 JSON 형식으로 생성하십시오.
반드시 아래의 JSON 구조만을 반환해야 하며, 기타 다른 텍스트는 출력하지 마십시오:
{
  "guru_insight": "구도자의 영혼을 꿰뚫는 짧고 강렬한 한 문장의 영적 통찰",
  "vibrational_analysis": "타로 카드와 파동 데이터를 융합한 심층적이고 은유적인 상세 분석 (3~4문장). 반드시 한국어로 응답.",
  "alignment_prescription": "오늘 당장 실천할 구체적인 행동, 명상, 호흡 지침. 반드시 한국어로 응답.",
  "mindset_mantra": "힘이 되는 긍정 확언 한 줄. 반드시 한국어로 응답.",
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
