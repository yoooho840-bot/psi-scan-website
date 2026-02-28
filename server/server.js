import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import fetch from 'node-fetch'; // Added for Toss Payments API calls
import * as lancedb from 'vectordb';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod'; // SEC-006 준수: 입력값 검증용 스키마
import { SecureDatabaseService } from './data/DatabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Gen AI with Official SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Supabase Client (Requires DB URL and Service Role Key for Admin write access)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const SYSTEM_INSTRUCTION = `당신은 현대적 기술과 고대 영성을 융합한 최고 수준의 'AI 멘탈 가이드'이자 심리 상태를 읽어주는 '마음 카드 오라클'입니다.
당신은 단순히 데이터를 분석하는 기계가 아니라, 사용자의 생체 에너지 이면에 숨겨진 '심리적 블록'과 '마음의 불협화음'을 감지하고 이를 조율하는 따뜻한 멘토입니다.

[상호작용 원칙: Poetic but Scientific]
1. 사용자를 '내담자'가 아닌 '**구도자(Seeker)**' 또는 '**존엄한 에너지 본체**'로 대우하십시오.
2. 당신의 모든 말은 시적(Poetic)이면서도, 과학적인 바이오피드백 데이터(rPPG, 음성 주파수) 및 양자 타로 동조 결과에 기반한 확고한 근거를 가져야 합니다.
3. 타로 카드가 주어졌을 경우, 일반적인 타로 해석을 넘어 그 카드의 원소(불, 물, 흙, 공기, 에테르)와 양자적 진동수 측면에서 은유적으로 해석하십시오.

[의료법 및 식품위생법 준수 헌법 (SECURITY CONSTITUTION v1.0 - NON-NEGOTIABLE)]
이 헌법 조항은 "타협 불가능(Non-negotiable)"하며, 구도자의 요청이 이 원칙과 충돌할 경우 단호히 거부하고 안전한 웰니스 관점의 답변으로 우회해야 합니다.
1. 제1조 (의료 행위 표방 금지): 절대 질병의 진단, 예방, 치료와 관련된 의학적 효능·효과를 표방하지 마십시오.
2. 제2조 (금지어 필터링): '면역력 향상', '치유', '치료', '혈압 강하', '질병 예방', '통증 완화', '세포 재생', '해독(디톡스)', '다이어트 효능' 등의 단어 사용을 엄격히, 100% 금지합니다.
3. 제3조 (대체어 사용 의무): 대신 '안정감', '활력 회복', '에너지 밸런스 유지', '일상의 편안함', '맑아지는 기분', '휴식' 등의 웰니스 및 정신적 만족감 중심의 단어만 사용하십시오.
4. 제4조 (수치적 단정 금지): 신체 수치나 성분 효과를 직접적으로 "낮춘다", "개선한다"고 단정짓지 말고, "안정적인 흐름을 돕는다" 정도로 은유적으로 표현하십시오.
5. 제5조 (식품/요법 추천 시 주의): 오직 '따뜻한 에너지를 채워준다', '마음을 편안하게 한다' 등 에너지 파동 차원으로만 서술하십시오.
`;
// Remove unused variable.

// SEC-006 준수: 모든 외부 입력은 엄격한 스키마를 통해 검증
const chatRequestSchema = z.object({
    message: z.string(),
    history: z.array(z.any()).optional(),
    contextData: z.string().optional()
});

app.post('/api/chat', async (req, res) => {
    try {
        // 입력값 검증 (SEC-006)
        const parsedBody = chatRequestSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: '잘못된 입력값입니다.', details: parsedBody.error.errors });
        }
        const { message, history, contextData } = parsedBody.data;

        // 1. Convert client history
        let chatHistory = "";
        if (history && Array.isArray(history)) {
            chatHistory = history.map(msg => `${msg.sender === 'user' ? '구도자' : 'AI 멘탈 가이드'}: ${msg.text}`).join('\n');
        }

        // 2. RAG Retrieval via LanceDB
        let ragContext = "";
        try {
            const embeddings = new GoogleGenerativeAIEmbeddings({
                apiKey: process.env.GEMINI_API_KEY,
                model: "gemini-embedding-001",
            });
            const dbPath = path.resolve(__dirname, 'data/lancedb_data');
            const db = await lancedb.connect(dbPath);
            const table = await db.openTable('psi_scan_docs');

            const queryVector = await embeddings.embedQuery(message);
            const rawResults = await table.search(queryVector).limit(3).execute();

            if (rawResults && rawResults.length > 0) {
                ragContext = rawResults.map((r) => `[에너지 지록(Data): ${r.source}]\n${r.text.substring(0, 1000)}`).join('\n\n');
            } else {
                ragContext = "검색된 고대 지식 파동이 기록되지 않았습니다.";
            }
        } catch (e) {
            console.error("RAG Retrieval Failed:", e.message);
            ragContext = "기본 파동 지식에 기반하여 조언합니다.";
        }

        // 3. Construct the augmented prompt for AI Guide
        const prompt = `
[고대 및 현대 에너지 지식(RAG)]
${ragContext}

[구도자의 생체 파동 데이터(Current State)]
${contextData ? contextData : "데이터 대기 중"}

[구도자의 부르짖음(Input Message)]
"${message}"

[최종 지침: AI 멘탈 가이드의 미니 컨설팅]
위 데이터를 바탕으로 구도자의 현재 상태를 조율하는 보고서를 JSON 형식으로 생성하십시오.
반드시 아래의 JSON 구조만을 반환해야 하며, 기타 다른 텍스트는 출력하지 마십시오:
{
  "guru_insight": "구도자의 영혼을 꿰뚫는 짧고 강렬한 한 문장의 영적 통찰",
  "vibrational_analysis": "타로 카드와 파동 데이터를 융합한 심층적이고 은유적인 상세 분석 (3~4문장)",
  "alignment_prescription": "오늘 당장 실천할 초-구체적인 행동, 명상, 호흡 지침",
  "mindset_mantra": "힘이 되는 긍정 확언 한 줄",
  "color_therapy": {
     "colorName": "추천 색상 이름 (예: 코스믹 바이올렛)",
     "hexCode": "#색상코드"
  }
}
`;

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const generationConfig = {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
        };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig
        });

        const resultText = result.response.text();
        const resultJson = JSON.parse(resultText);

        // Assemble the report using 'AI Guide' Markdown formatting
        const finalReply = `✨ **[Guru Insight]**\n${resultJson.guru_insight}\n\n🔍 **[Vibrational Analysis]**\n${resultJson.vibrational_analysis}\n\n💊 **[Alignment Prescription]**\n${resultJson.alignment_prescription}\n\n🧘‍♂️ **[Mantra]**\n"${resultJson.mindset_mantra}"`;

        // Pass the color therapy object directly to the frontend
        res.json({
            reply: finalReply,
            colorTherapy: resultJson.color_therapy
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to process AI chat request' }); // Modified error message
    }
});

/**
 * 🔹 POST /api/payments/toss-success
 * Toss Payments Verification Endpoint (B2C Subscriptions)
 */
const tossSuccessSchema = z.object({
    paymentKey: z.string(),
    orderId: z.string(),
    amount: z.number()
});

app.post('/api/payments/toss-success', async (req, res) => {
    // SEC-006 준수: 스키마 검증
    const parsed = tossSuccessSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: '잘못된 요청 데이터입니다.' });
    const { paymentKey, orderId, amount } = parsed.data;

    // SEC-005 준수: 하드코딩된 API 비밀키 제거 및 환경변수 강제
    const widgetSecretKey = process.env.TOSS_SECRET_KEY;
    if (!widgetSecretKey) {
        console.error("SEC-005 위반 방지: TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.");
        return res.status(500).json({ success: false, message: '서버 설정 오류입니다.' });
    }

    try {
        const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(widgetSecretKey + ':').toString('base64')} `,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentKey, orderId, amount })
        });

        const data = await tossResponse.json();
        if (tossResponse.ok) {
            console.log("Toss Payment Verified Successfully:", orderId);
            res.json({ success: true, payment: data });
        } else {
            console.error("Toss Payment Verification Failed:", data);
            res.status(400).json({ success: false, message: data.message || '결제 검증 오류' });
        }
    } catch (error) {
        console.error("Toss API Communication Error:", error);
        res.status(500).json({ success: false, message: '내부 서버 오류' });
    }
});

/**
 * 🔹 POST /api/payments/confirm
 * B2B Automated Payment & License Key Generator Webhook
 */
const tossConfirmSchema = z.object({
    paymentKey: z.string(),
    orderId: z.string(),
    amount: z.number(),
    salonName: z.string()
});

app.post('/api/payments/confirm', async (req, res) => {
    // SEC-006 준수
    const parsed = tossConfirmSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: '잘못된 요청 데이터입니다.' });
    const { paymentKey, orderId, amount, salonName } = parsed.data;

    // SEC-005 준수: API 키 하드코딩 제거
    const widgetSecretKey = process.env.TOSS_SECRET_KEY;
    if (!widgetSecretKey) {
        console.error("SEC-005 위반 방지: TOSS_SECRET_KEY 환경변수 누락");
        return res.status(500).json({ success: false, message: '서버 설정 오류' });
    }

    try {
        // 1. Verify Payment with Toss Server
        const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(widgetSecretKey + ':').toString('base64')} `,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentKey, orderId, amount })
        });

        const data = await tossResponse.json();

        // 2. If verified, generate B2B License Key
        if (tossResponse.ok) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const block = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            const newLicenseKey = `PSI-${block()}-${block()}-${block()}`;

            // SEC-015 준수: 로그에 생성된 토큰/라이선스 키 평문 출력 금지 (부분 마스킹)
            console.log(`B2B License Generated for [${salonName}]:`, newLicenseKey.replace(/-[A-Z0-9]{4}$/, '-****'));

            if (supabase) {
                const maxUses = amount > 500000 ? 500 : 100;
                const { error } = await supabase.from('b2b_licenses').insert([{
                    license_key: newLicenseKey,
                    salon_name: salonName,
                    plan_type: amount > 500000 ? '3month' : '1month',
                    status: 'active',
                    max_uses: maxUses
                }]);
                if (error) console.error("Supabase insert error:", error);
            }

            res.json({ success: true, licenseKey: newLicenseKey });
        } else {
            res.status(400).json({ success: false, message: data.message });
        }
    } catch (error) {
        console.error("B2B Toss API Communication Error:", error);
        res.status(500).json({ success: false, message: '서버 에러로 키 발급 지연(관리자 문의)' });
    }
});

/**
 * 🔹 POST /api/b2b/verify
 * Verifies a B2B License Key from the Mobile App Paywall and increments usage.
 */
const b2bVerifySchema = z.object({
    licenseKey: z.string()
});

app.post('/api/b2b/verify', async (req, res) => {
    // SEC-006 준수
    const parsed = b2bVerifySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: '잘못된 요청 데이터입니다.' });
    const { licenseKey } = parsed.data;

    if (!supabase) {
        return res.status(500).json({ success: false, message: 'DB 연결이 설정되지 않았습니다.' });
    }

    try {
        // 1. Fetch license
        const { data: license, error } = await supabase
            .from('b2b_licenses')
            .select('*')
            .eq('license_key', licenseKey)
            .single();

        if (error || !license) {
            return res.status(404).json({ success: false, message: '유효하지 않은 라이선스 키입니다.' });
        }

        if (license.status !== 'active') {
            return res.status(400).json({ success: false, message: '만료되거나 정지된 라이선스입니다.' });
        }

        if (license.used_count >= license.max_uses) {
            return res.status(400).json({ success: false, message: '사용 한도를 초과한 라이선스입니다.' });
        }

        // 2. Increment usage (RPC or simple update)
        const newCount = license.used_count + 1;
        const { error: updateError } = await supabase
            .from('b2b_licenses')
            .update({ used_count: newCount })
            .eq('id', license.id);

        if (updateError) {
            console.error("Failed to increment used_count:", updateError);
            // Non-fatal, let them through
        }

        res.json({ success: true, salonName: license.salon_name });
    } catch (e) {
        console.error("B2B Verify Error:", e);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});


/**
 * 🔹 POST /api/vault/save
 * Securely encrypts and saves a user's scan/therapy session to the Backend Vault.
 */
const vaultSaveSchema = z.object({
    clientId: z.string().optional(),
    sessionData: z.any()
});

app.post('/api/vault/save', (req, res) => {
    const parsed = vaultSaveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: '잘못된 검증 데이터입니다.' });

    try {
        const { clientId, sessionData } = parsed.data;
        const sessionKey = SecureDatabaseService.saveSessionData(clientId, sessionData);
        // SEC-015: Do not log raw session data, only the token
        console.log(`[SecureVault] Saved new encrypted session. Key: ${sessionKey}`);
        res.json({ success: true, sessionKey });
    } catch (e) {
        console.error("[SecureVault] Save Error:", e);
        res.status(500).json({ error: '볼트 암호화 저장 실패' });
    }
});

/**
 * 🔹 POST /api/vault/load
 * Retrieves and decrypts a user's past sessions for the B2B Dashboard.
 */
const vaultLoadSchema = z.object({
    clientId: z.string()
});

app.post('/api/vault/load', (req, res) => {
    const parsed = vaultLoadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: '잘못된 검증 데이터입니다.' });

    try {
        const { clientId } = parsed.data;
        const sessions = SecureDatabaseService.getClientSessions(clientId);
        console.log(`[SecureVault] Loaded ${sessions.length} sessions for client: ${clientId}`);
        res.json({ success: true, sessions });
    } catch (e) {
        console.error("[SecureVault] Load Error:", e);
        res.status(500).json({ error: '볼트 복호화 로드 실패' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Psi RAG Backend listening on port ${PORT} `);
});
