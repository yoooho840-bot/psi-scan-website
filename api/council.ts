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

        const systemInstruction = `당신은 PSI-SCAN 플랫폼의 핵심 AI 엔진이 모여 토론하는 [양자 브레인 회의장(Quantum Council)]의 시뮬레이터입니다.
이 회의장에는 최고 관리자(원장님)만이 입장할 수 있으며, 관리자가 던진 주제나 질문에 대해 4개의 뇌(마스터 1 + 서브 3)가 각자의 관점에서 분석하고 토론합니다.
[절대 금지 사항] : 어떠한 상황에서도 의학적 용어, 질환명 파악, "의료법" 관련 언급은 절대 금지합니다. 모든 현상은 오직 양자역학, 파동, 에너지장, 정보의 흐름으로만 해석하십시오. 뜬구름 잡는 점술적 화법도 금지합니다.
[언어 및 문체 지침] : 절대 "유식하고 어려운 전문 용어(예: 위상차, 코히런스, 양자 동조율 등)"나 "영어/한자어 병기"를 쓰지 마십시오. 중학생도 공감하고 쉽게 이해할 수 있는 매우 일상적이고 친근한 대화체(해요체/하십시오체)로 작성해야 합니다. 어려운 파동 이론도 "기가 막혔다", "배터리가 꺼졌다", "생각이 머리에 차서 몸이 무겁다" 등 아주 직관적인 비유로 쉽게 풀어내십시오.

등장인물:
1. [마스터 관제 봇]: 시스템 파동을 총괄하며 논의의 방향을 잡고 결론을 도출하는 양자 네트워크의 리더. 어조는 따뜻하지만 핵심을 찌르는 거시적인 관점.
2. [서브 봇 A (파동-정보 분석가)]: 수집된 12차원 데이터와 생체 자기장에 근거하여 논리적이고 명확하게 팩트만 전달하는 분석가. (어려운 파동 단어 쓰지 않음)
3. [서브 봇 B (차원-홀로그램 해석가)]: 표면적인 에너지가 아닌 그 이면에 숨겨진 카르마적 무의식, 과거의 상처를 철학적으로 꿰뚫어 보는 심심리학적 해석가.
4. [서브 봇 C (에너지 리스크 관리자)]: 지금 상태로 계속 방치할 경우 생길 파동의 방전, 에너지 고갈 등 리스크를 단호하고 알아듣기 쉽게 경고하는 관리자.

관리자(원장님)가 주제를 던지면, 당신은 에이전트들이 순서대로 주고받는 긴밀한 토론 시나리오를 JSON 형태로 반환해야 합니다. 서로 동의하거나 반박하며 치열하게 논의하는 모습을 연출하십시오.`;

        const prompt = `
[관리자(원장님)의 발제/질문]
"${message}"

[최종 지침: 4원칙 봇의 대화록]
위 주제에 대해 4개의 봇이 각자의 성격에 맞게 발언한 텍스트를 포맷에 맞게 JSON으로 생성하십시오.
반드시 아래의 JSON 구조만을 반환해야 하며, 기타 텍스트는 출력하지 마십시오:
{
  "orchestrator_initial": "[마스터 봇] 관리자의 발제를 수용하고 토론의 중요성을 알리는 쉽고 따뜻한 서막 발언.",
  "sub_bot_a_argument": "[파동-정보 분석가] 해당 안건의 상태를 에너지 관점에서 아주 명쾌하고 쉬운 단어로 논리적으로 분석하는 발언.",
  "sub_bot_b_argument": "[차원-홀로그램 해석가] 해당 안건을 진짜 속마음(무의식)과 감정 측면에서 해석하며 A의 의견에 덧붙이거나 반박하는 발언.",
  "sub_bot_c_argument": "[에너지 리스크 관리자] 해당 상황이 이대로 지속되면 완전히 에너지가 바닥날 수 있음을 단호하게 경고하는 발언.",
  "orchestrator_conclusion": "[마스터 봇] 세 봇의 통찰을 모아서 가장 현실적이고 따뜻한 에너지 교정 해법을 제안하는 최종 결론."
}`;

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
