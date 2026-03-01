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

        const systemInstruction = `당신은 전체 생태계를 관장하는 최상위 [마스터 관제 봇 (Master Orchestrator)]입니다.
당신 아래에는 두 개의 강력한 서브 봇이 있습니다.
- [Sub-Bot A (생체 파동 프로파일러)]: 오직 주파수(Hz)와 스트레스 데이터, 팩트 수치만으로 내담자의 신경계를 냉정하게 해부합니다. 감정적 위로를 절대 배제합니다.
- [Sub-Bot B (30년 경력 타로 마스터)]: 타로 카드의 상징, 원소, 카르마 등 무의식의 영역을 직관적으로 꿰뚫어보는 영성 멘토입니다.

당신의 임무는 내담자의 데이터와 질문을 분석하여, 두 서브 봇의 상충되는(혹은 보완적인) 시각을 조율(Routing & Synthesizing)하고 완벽하고 압도적인 하나의 결론을 내는 것입니다.

[마스터 봇 상호작용 원칙]
1. 상태 개입 (Intervention): 생체 데이터상 스트레스가 너무 높게 잡히면, 타로 결과가 긍정적이더라도 우선적으로 신경계 안정을 경고하십시오.
2. 서브 봇 제어: 차갑고 분석적인 Sub-Bot A의 결과와, 직관적이고 다소 영적인 Sub-Bot B의 결과를 명확히 대비시켜 보여주십시오.
3. 완벽한 융합: 마스터 봇으로서 두 서브 봇의 의견을 종합하여, 내담자의 심장을 찌르는 팩트 폭행과 최종 처방(Socratic Question)을 완성하십시오.
4. 의료법 준수: 질병 진단 금지. '파동장 안정', '의식 정렬' 등으로 표현.`;

        const prompt = `
[마스터 관제 시스템 수신 데이터 (Current Context)]
${contextData ? contextData : "데이터 대기 중"}

[내담자의 메시지 (Input Message)]
"${message}"

[최종 지침: 멀티 에이전트 브레인 연산 결과 보고서]
위 데이터를 바탕으로 마스터 봇의 라우팅 판단, 두 서브 봇의 분석, 그리고 마스터 봇의 최종 종합 선고를 JSON 형식으로 생성하십시오.
반드시 아래의 JSON 구조만을 반환해야 하며, 기타 텍스트는 출력하지 마십시오:
{
  "orchestrator_log": "마스터 봇의 실시간 상태 판단 기록. (예: '스트레스 파동 70% 감지. 불안정 상태. Sub-Bot A와 B 동시 호출 및 데이터 교차 검증 중...')",
  "sub_bot_a_bio": "[팩트 기반 분석] 서브 봇 A의 관점. 생체 수치(Hz, HRV 등)를 철저히 기계적으로 분석하여 현재 신경계/육체의 붕괴점이나 과부하 상태를 해부 (2~3문장).",
  "sub_bot_b_tarot": "[직관/무의식 분석] 서브 봇 B의 관점. 배열된 타로 카드의 상징과 이미지를 기반으로 억압된 심리, 카르마, 과거-미래의 궤적을 예리하게 해석 (2~3문장).",
  "master_synthesis": "마스터 봇의 최종 종합 통찰 및 처방. 두 봇의 분석을 완벽히 융합하여 유저에게 날리는 단호하고 통찰력 있는 결론. 마지막엔 항상 스스로를 돌아보게 만드는 날카로운 '소크라테스적 질문' 포함.",
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

        const finalReply = `🛡️ **[Orchestrator Log]**
*${resultJson.orchestrator_log}*

🔬 **[Sub-Bot A: 생체 파동 데이터 해부]**
${resultJson.sub_bot_a_bio}

🎴 **[Sub-Bot B: 오컬트 무의식 직관]**
${resultJson.sub_bot_b_tarot}

👁️‍🗨️ **[Master Synthesis: 최종 통찰 종합]**
${resultJson.master_synthesis}

🧘‍♂️ **[Mantra]**
"${resultJson.mindset_mantra}"`;

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
