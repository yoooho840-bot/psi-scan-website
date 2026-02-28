import * as lancedb from 'vectordb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: Missing GEMINI_API_KEY in .env file.");
    process.exit(1);
}

async function main() {
    const dbPath = path.resolve(__dirname, '../data/lancedb_data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    try {
        const tableName = "psi_scan_docs";
        const tableDir = path.join(dbPath, tableName + '.lance');

        console.log("Initializing Local LanceDB...");
        const db = await lancedb.connect(dbPath);
        let table;
        if (fs.existsSync(tableDir)) {
            table = await db.openTable(tableName);
            console.log(`[LanceDB] Opened existing table '${tableName}'. Records will be appended.`);
        }

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: GEMINI_API_KEY,
            model: "gemini-embedding-001",
        });

        const targetFile = path.resolve(__dirname, '../data/tarot_core_lore.md');
        if (!fs.existsSync(targetFile)) {
            console.error("Target file not found:", targetFile);
            return;
        }

        console.log(`Processing: ${path.basename(targetFile)}`);
        const text = fs.readFileSync(targetFile, 'utf8');

        const cleanText = text.replace(/\n+/g, '\n').trim();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 800,
            chunkOverlap: 100,
        });

        // Use standard Langchain Document creation
        const chunks = await textSplitter.createDocuments([cleanText], [{ source: "tarot_core_lore.md" }]);
        console.log(`  -> Split into ${chunks.length} chunks.`);

        const BATCH_SIZE = 50;
        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batchChunks = chunks.slice(i, i + BATCH_SIZE);

            try {
                // Use standard Langchain embedding
                const batchEmbeddings = await embeddings.embedDocuments(batchChunks.map(c => c.pageContent));

                const batchRows = [];
                for (let j = 0; j < batchChunks.length; j++) {
                    const chunk = batchChunks[j];
                    const vector = batchEmbeddings[j];
                    if (vector && Array.isArray(vector) && vector.length > 0) {
                        batchRows.push({
                            vector: vector,
                            text: String(chunk.pageContent || ''),
                            source: String(chunk.metadata.source || 'unknown')
                        });
                    }
                }

                if (batchRows.length === 0) continue;

                if (!table) {
                    table = await db.createTable(tableName, batchRows);
                    console.log("  -> Created new LanceDB table.");
                } else {
                    await table.add(batchRows);
                }

                console.log(`  -> Embedded & saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchRows.length} chunks)`);
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error(`  -> Failed to embed/save batch: ${err.message}`);
            }
        }

        console.log("\n✨ Master Sadhguru Lore successfully embedded into LOCAL LanceDB!");
    } catch (e) {
        console.error("FATAL ERROR IN MAIN ROUTINE:", e);
    }
}

main().catch(console.error);
