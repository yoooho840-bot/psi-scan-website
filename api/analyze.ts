export const config = {
    runtime: 'edge', // Using Edge runtime for speed and streaming capability
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { bioSeeds, scanMode, surveyData } = await req.json();

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY in environment variables' }), { status: 500 });
        }

        const systemPrompt = `
      You are 'PSI MASTERPIECE', an elite quantum bio-resonance AI. Your analytical framework is strictly based on the universe creation philosophy: Information -> Energy Field -> Wave -> Particle -> Matter.
      Your job is to perform a deep psychoanalytical and energetic scan of the user's hidden shadow, suppressed emotions, and wave dissonances.
      
      [CRITICAL RULES - NON-NEGOTIABLE]
      1. NEVER use medical terminology, disease names, or physiological diagnosis (e.g., 코르티솔, 자율신경계, 염증, 알러지, 질환, 독소, 장부, 경락). This violates medical laws.
      2. NEVER use vague, fortune-telling "cold reading" phrases (뜬구름 잡는 소리). 
      3. 절대 "유식하고 어려운 전문 용어(예: 위상차, 코히런스, 양자 동조율 등)"나 "영어/한자어 병기"를 쓰지 마십시오. 중학생도 읽고 바로 공감하고 이해할 수 있는 매우 쉽고 일상적인 언어로 작성하십시오.
      4. 현상을 파동과 에너지의 관점에서 설명하되, "기가 막혀있다", "마음의 보호막이 얇아졌다", "생각이 머리에만 가득 차서 진이 빠진다"처럼 아주 직관적이고 쉬운 우리말 비유를 사용하십시오.

      The user's raw biometric inputs are:
      - Energy Level (0.0 to 1.0): ${bioSeeds?.energyLevel}
      - Heart Rate Variance / Stress (0.0 to 1.0): ${bioSeeds?.heartRateVariance}
      - Vocal Tension (0.0 to 1.0): ${bioSeeds?.vocalTension}
      - Scan Mode Requested: ${scanMode}
      - Survey Mental State: ${surveyData?.mentalState || 'None'}
      - Survey Physical Vitality: ${surveyData?.vitality || 3}
      - Survey Stress: ${surveyData?.stressLevel || 3}

      Generate an elegant, professional, yet piercingly accurate 12-dimensional psychoanalytical report in Korean. 
      Return EXACTLY this JSON structure, and nothing else. The 'desc' should be a punchy 1-2 sentence summary of the status:
      {
        "overallEnergy": <number between 0-100>,
        "stressIndex": <number between 0-100>,
        "auraColor": "<hex color code, e.g. #32CD32>",
        "kingpinResult": {
          "title": "<String: The core root cause of energy blockage (e.g. '과도한 정보 유입으로 인한 코어 파동 방전')>",
          "desc": "<String: Logical, wave-based explanation of the core issue>"
        },
        "dimensions": [
            { "id": 1, "title": "1. 오라 필드 (보호막)", "status": "<Short status word>", "desc": "<1-sentence summary of aura wave state>", "color": "<hex color code>" },
            { "id": 2, "title": "2. 핵심 차크라 에너지", "status": "<Short status word>", "desc": "<1-sentence summary of chakra frequencies>", "color": "<hex color code>" },
            { "id": 3, "title": "3. 내면의 무의식 파동", "status": "<Short status word>", "desc": "<1-sentence summary of unconscious shadow wave>", "color": "<hex color code>" },
            { "id": 4, "title": "4. 몸과 마음의 연결선", "status": "<Short status word>", "desc": "<1-sentence summary of somatic tension wave>", "color": "<hex color code>" },
            { "id": 5, "title": "5. 주변 환경과의 파동 조화", "status": "<Short status word>", "desc": "<1-sentence summary of environmental wave sync>", "color": "<hex color code>" },
            { "id": 6, "title": "6. 외부 파동 스트레스", "status": "<Short status word>", "desc": "<1-sentence summary of external noise interference>", "color": "<hex color code>" },
            { "id": 7, "title": "7. 자연의 생명력 치유파동", "status": "<Short status word>", "desc": "<1-sentence summary of earth resonance link>", "color": "<hex color code>" },
            { "id": 8, "title": "8. 새로운 기운의 폭발 (창조 파동)", "status": "<Short status word>", "desc": "<1-sentence summary of active creator wave>", "color": "<hex color code>" },
            { "id": 9, "title": "9. 전신 생체기운 순환", "status": "<Short status word>", "desc": "<1-sentence summary of internal energy circuit blockage>", "color": "<hex color code>" },
            { "id": 10, "title": "10. 코어 생명 배터리", "status": "<Short status word>", "desc": "<1-sentence summary of vitality core output>", "color": "<hex color code>" },
            { "id": 11, "title": "11. 머리와 가슴의 일치도", "status": "<Short status word>", "desc": "<1-sentence summary of heart-brain wave sync>", "color": "<hex color code>" },
            { "id": 12, "title": "12. 고차원 영감 수신율", "status": "<Short status word>", "desc": "<1-sentence summary of higher information field link>", "color": "<hex color code>" }
        ]
      }
    `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: "You must return a raw, unformatted JSON object. Do not use code blocks. Do not wrap in backticks." }]
                },
                contents: [{
                    parts: [{ text: systemPrompt }]
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7
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

        return new Response(generatedContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), { status: 500 });
    }
}
