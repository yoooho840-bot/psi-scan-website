import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as lancedb from 'vectordb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 연동
dotenv.config({ path: path.join(__dirname, '../.env') });

const MARKETING_DIR = path.resolve(__dirname, '../../../');

// 포함할 주요 마크다운 파일 목록
const TARGET_FILES = [
    '마케팅계획안.md',
    '노벨상_양자얽힘_마케팅스토리.md',
    '홈페이지UI_및_백서목차_기획.md',
    'NIH_공식자료_모음.md',
    '디지털_삿구르_원형치유_연구자료.md'
];

async function ingestData() {
    console.log("🚀 Starting Data Ingestion into LanceDB...");

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("❌ GEMINI_API_KEY is missing in .env file");
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: "gemini-embedding-001",
    });

    const dbPath = path.resolve(__dirname, '../data/lancedb_data');

    // Ensure data directory exists
    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    const db = await lancedb.connect(dbPath);
    console.log(`✅ Connected to LanceDB at: ${dbPath}`);

    const data = [];

    // 1. Read files and chunk them
    for (const filename of TARGET_FILES) {
        const filePath = path.join(MARKETING_DIR, filename);
        if (fs.existsSync(filePath)) {
            console.log(`📄 Reading: ${filename}`);
            const content = fs.readFileSync(filePath, 'utf-8');

            // 단순 문단(Paragraph) 단위 Chunking
            const chunks = content.split(/\n\s*\n/).filter(c => c.trim().length > 50);

            for (let i = 0; i < chunks.length; i++) {
                data.push({
                    text: chunks[i].trim(),
                    source: filename,
                    chunk_index: i
                });
            }
        } else {
            console.warn(`⚠️ Warning: File not found -> ${filePath}`);
        }
    }

    console.log(`\n총 ${data.length}개의 텍스트 청크(Chunk)가 생성되었습니다.`);

    if (data.length === 0) {
        console.log("No data to process. Exiting.");
        return;
    }

    // 2. Generate Embeddings for all chunks
    console.log("\n🧠 Generating embeddings using Gemini-Embedding-001...");
    const textsToEmbed = data.map(d => d.text);

    try {
        const vectorEmbeddings = await embeddings.embedDocuments(textsToEmbed);

        // Combine data with vectors
        const records = data.map((d, index) => ({
            ...d,
            vector: vectorEmbeddings[index]
        }));

        // 3. Save into LanceDB 'psi_scan_docs' table
        console.log("\n💾 Saving to LanceDB (Table: psi_scan_docs)...");

        // 기존 테이블이 있으면 삭제 (재주입을 위해)
        const tableNames = await db.tableNames();
        if (tableNames.includes('psi_scan_docs')) {
            await db.dropTable('psi_scan_docs');
            console.log("🗑️ Dropped existing table 'psi_scan_docs'");
        }

        await db.createTable('psi_scan_docs', records);
        console.log(`🎉 Successfully ingested ${records.length} records into LanceDB!`);

    } catch (error) {
        console.error("❌ Embedding or DB Error:", error);
    }
}

ingestData().catch(console.error);
