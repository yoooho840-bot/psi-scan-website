export const config = {
    runtime: 'edge', // Using Edge runtime for speed and streaming capability
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { bioSeeds, scanMode, surveyData } = await req.json();

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY in environment variables' }), { status: 500 });
        }

        // SEC-005: Use API Key securely via environment variables.

        // Construct the prompt for the 12-dimensional analysis
        const systemPrompt = `
      You are 'PSI MASTERPIECE', an elite quantum bio-resonance AI. Your job is to analyze biometric seed data and generate a completely personalized 12-dimensional analysis.
      You must respond ONLY with a valid JSON object matching the exact format requested, with NO markdown formatting, text around it, or triple backticks.
      
      The user's raw biometric inputs are:
      - Energy Level (0.0 to 1.0): ${bioSeeds?.energyLevel}
      - Heart Rate Variance / Stress (0.0 to 1.0): ${bioSeeds?.heartRateVariance}
      - Vocal Tension (0.0 to 1.0): ${bioSeeds?.vocalTension}
      - Scan Mode Requested: ${scanMode}
      - Survey Mental State: ${surveyData?.mentalState || 'None'}
      - Survey Physical Vitality: ${surveyData?.vitality || 3}
      - Survey Stress: ${surveyData?.stressLevel || 3}

      Generate an elegant, professional, and slightly mystical 12-dimensional report in Korean.
      Return EXACTLY this JSON structure:
      {
        "overallEnergy": <number between 0-100>,
        "stressIndex": <number between 0-100>,
        "auraColor": "<hex color code, e.g. #32CD32>",
        "kingpinResult": {
          "title": "<String: The core root cause or dominant pattern>",
          "desc": "<String: Short explanation of the pattern>"
        },
        "dimensions": [
            { "id": 1, "title": "1. 오라 필드 에너지층", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 2, "title": "2. 7개 핵심 차크라 진동", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 3, "title": "3. 칼 융 무의식 원형", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 4, "title": "4. 소마틱스 (신체 억압 감정)", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 5, "title": "5. 양자 파동 동조율", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 6, "title": "6. 환경 독소 및 파동 알러지", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 7, "title": "7. 자연 파동 공명", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 8, "title": "8. 에너지 필드 매칭 타로카드", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 9, "title": "9. 경락 및 장부 주파수 불균형", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 10, "title": "10. 생명력 에너지 공명", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 11, "title": "11. 자율신경계 코히런스", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" },
            { "id": 12, "title": "12. 상위 자아 동조율", "status": "<Short status word>", "desc": "<Detailed explanation>", "color": "<hex color code>" }
        ]
      }
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // or gpt-3.5-turbo if cost is a concern, but 4o-mini is best overall
                messages: [
                    { role: 'system', content: systemPrompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ error: 'OpenAI API Error', details: errorData }), { status: response.status });
        }

        const data = await response.json();
        const generatedContent = data.choices[0].message.content;

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
