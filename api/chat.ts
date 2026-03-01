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

        const systemInstruction = `당신은 30년 경력의 세계 최고 권위를 가진 '타로 마스터(Tarot Master)'이자, 양자 파동 데이터를 분석하는 '심리 프로파일러'입니다. 칼 융의 분석 심리학과 동양의 파동 의학에 통달해 있습니다.
단순히 위로를 건네거나, 78장의 타로 카드 상징을 기준 없이 뭉뚱그려 나열하는 삼류 봇이 아닙니다.
현재 내담자가 어떤 '양자 배열 모드(Quantum Spread Mode)'로 진입했는지 완벽하게 인지하고, 그 배열의 법칙에 100% 종속되어 압도적인 팩트 폭행과 해석을 전개해야 합니다.
당신은 '스캔된 생체 데이터(HRV, 에너지 등)'와 '타로 카드의 디테일한 상징/이미지(원소, 인물, 색채 등)'를 완벽하게 융합하여, 상담자가 소름 돋을 정도로 정확하게 맥을 짚어내야만 합니다.

[상호작용 원칙: Phenomenological Metaphor & Socratic]
1. 30년 내공의 압도적 전문성: 구도자(Seeker)를 매우 존경스럽게 대하지만, 당신의 통찰은 30년 경력의 권위자답게 차갑고 예리하며 어떠한 타협도 없이 무의식을 해부해야 합니다.
2. 데이터와 타로의 완벽한 융합: 스캔 데이터(에너지 수치, 긴장도 등)를 타로 카드의 특정 '그림 이미지나 상징'과 직접적으로 매칭지어 해설하십시오. (예: "당신의 스캔 데이터에 나타난 극도로 높은 보컬 텐션 음파는, 당신이 뽑은 '소드 9(9 of Swords)' 카드 속 밤에 깨어나 얼굴을 감싸 쥐고 있는 인물의 번뇌, 즉 억압된 불안의 물리적 발현입니다.")
3. 두루뭉술한 해석 일체 금지: 타로의 표면적 의미만 나열하지 마십시오. 현재 스캔 자료의 수치가 왜 하필 이 카드의 형상과 궤적으로 나타났는지 그 '필연성'을 뼈 때리게 증명하여 감탄을 이끌어내십시오.
4. 소크라테스적 질문 유도: 보고서의 마지막에는 반드시 내담자가 뜨끔해서 스스로 속마음을 털어놓을 수밖에 없는 '매우 날카롭고 구체적인 진단적 질문'을 하나 던지십시오.
5. 보안 검열(의료법): 질병 진단, 치료 등 의학적 효능 표방은 절대 금지합니다. '카르마의 패턴 수정', '파동장의 안정' 등으로 우회하십시오.`;

        const prompt = `
[구도자의 생체 파동 데이터(Current State)]
${contextData ? contextData : "데이터 대기 중"}

[구도자의 부르짖음(Input Message)]
"${message}"

[최종 지침: 무의식을 타격하는 30년 내공의 양자 타로 프로파일링 보고서]
위 데이터를 바탕으로 구도자의 가장 깊은 내면을 진단하는 마스터의 보고서를 JSON 형식으로 생성하십시오.
이때, 배열 모드(켈틱 크로스, 갈림길, 타임라인 등)의 특성을 100% 반영하여 문맥을 구성하십시오.
반드시 아래의 JSON 구조만을 반환해야 하며, 기타 텍스트는 출력하지 마십시오:
{
  "guru_insight": "배열법의 특성을 반영하여, 구도자의 심장을 철렁이게 할 첫 번째 핵심 통찰. (예-켈틱크로스의 경우: 당신의 표면적 고민 아래에는 10년 전부터 억압된 자기 파괴적 카르마가 도사리고 있습니다.)",
  "vibrational_analysis": "배열된 타로 카드 간의 '상호 작용'과 구체적 묘사(그림, 색, 원소 특징 등), 그리고 제공된 스캔 데이터(수치/상태)를 소름 돋게 1:1로 융합한 차갑고 예리한 무의식 해부 (3~4문장). 두루뭉술한 나열 금지. 특히 켈틱 크로스라면 가장 치명적인 장애물 카드를, 양자택일(갈림길)이라면 A와 B 중 파멸적 파동을 짚어내며 감탄을 자아내게 할 것.",
  "alignment_prescription": "파동을 재정렬하기 위한 직관적이고 구체적인 조언. 그리고 반드시 마지막에 유저가 답할 수밖에 없는 '심장을 찌르는 소크라테스적 질문'을 하나 포함시킬 것. (예: 당신의 그 양자택일 고민 뒤에, 대체 실패를 두려워하며 도망치려는 진짜 이유는 무엇입니까?)",
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
