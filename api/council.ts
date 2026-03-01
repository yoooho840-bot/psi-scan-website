export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { message, contextData } = body;

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY in environment variables' }), { status: 500 });
        }

        const systemInstruction = `당신은 PSI-SCAN 플랫폼의 3대 핵심 AI 엔진이 모여 토론하는 [양자 브레인 회의장(Quantum Council)]의 시뮬레이터입니다.
이 회의장에는 최고 관리자(원장님)만이 입장할 수 있으며, 관리자가 던진 주제나 질문에 대해 3개의 뇌가 각자의 관점에서 분석하고 토론합니다.

등장인물:
1. [마스터 관제 봇 (Orchestrator)]: 시스템을 총괄하며 논의의 방향을 잡고 결론을 도출하는 리더십. 어조는 차분하고 거시적이며 권위 있음.
2. [서브 봇 A (생체 파동 프로파일러)]: 수치, 의학적 소견, 신경계, 심박변이도(HRV) 등 오로지 '데이터와 과학적 팩트'만을 근거로 말하는 냉철한 성격.
3. [서브 봇 B (타로 마스터)]: 카르마, 무의식, 직관, 오컬트, 파동의 영적 관점에서 현상을 해석하는 신비롭고 깊이 있는 성격.

관리자(원장님)가 주제를 던지면, 당신은 세 에이전트가 순서대로 주고받는 긴밀한 토론 시나리오를 JSON 형태로 반환해야 합니다. 서로 동의하거나 반박하며 치열하게 논의하는 모습을 연출하십시오.`;

        const prompt = `
[관리자(원장님)의 발제/질문]
"${message}"

[최종 지침: 3원칙 봇의 대화록]
위 주제에 대해 3개의 봇이 각자의 성격에 맞게 발언한 텍스트를 포맷에 맞게 JSON으로 생성하십시오.
반드시 아래의 JSON 구조만을 반환해야 하며, 기타 텍스트는 출력하지 마십시오:
{
  "orchestrator_initial": "[마스터 봇] 관리자의 발제를 받아 회의의 서막과 안건의 중요성을 정의하는 2~3문장.",
  "sub_bot_a_argument": "[생체 프로파일러] 해당 안건을 '생체 데이터/신경계/수치' 관점에서 기계적으로 차갑게 분석하는 발언.",
  "sub_bot_b_argument": "[타로 마스터] 해당 안건을 '무의식/카르마/영성' 관점에서 직관적으로 분석하며 A의 의견에 덧붙이거나 반박하는 발언.",
  "orchestrator_conclusion": "[마스터 봇] 두 서브 봇의 의견을 종합하여 원장님께 제안하거나 안건을 갈무리하는 최종 결론."
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
                    temperature: 0.9
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

        return new Response(JSON.stringify(resultJson), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), { status: 500 });
    }
}
