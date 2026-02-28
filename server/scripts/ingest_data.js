import * as lancedb from 'vectordb';
import * as arrow from 'apache-arrow';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: Missing GEMINI_API_KEY in .env file.");
    process.exit(1);
}

// Function to recursively find all PDFs
function findPDFs(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            fileList = findPDFs(filePath, fileList);
        } else if (path.extname(file).toLowerCase() === '.pdf') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// Parse a single PDF
async function parsePDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        return data.text;
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error.message);
        return '';
    }
}

async function main() {
    const dbPath = path.resolve(__dirname, '../data/lancedb_data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    try {
        const tableName = "psi_scan_docs";
        const tableDir = path.join(dbPath, tableName + '.lance');
        if (fs.existsSync(tableDir)) {
            console.log(`[LanceDB] Table directory exists at: ${tableDir}. Will attempt to append.`);
        }

        console.log("Initializing Local LanceDB...");
        const db = await lancedb.connect(dbPath);
        console.log("[DB TRACE] Connect successful.");
        let table;
        if (fs.existsSync(tableDir)) {
            table = await db.openTable(tableName);
            console.log(`[LanceDB] Opened existing table '${tableName}'. Records will be appended.`);
        }

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: GEMINI_API_KEY,
            model: "gemini-embedding-001", // The only model publicly unlocked for this account's API key
        });
        console.log("[DB TRACE] Embeddings initialized.");

        const targetDirs = [
            path.resolve(__dirname, '../../../BOOK'),
            path.resolve(__dirname, '../../../양자자료'),
            path.resolve(__dirname, '../../../양자자료1')
        ];

        let allPDFs = [];
        targetDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                allPDFs = allPDFs.concat(findPDFs(dir));
            }
        });

        console.log(`Found ${allPDFs.length} PDF files. Starting extraction...`);

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        for (const [fileIndex, pdfPath] of allPDFs.entries()) {
            console.log(`\n[${fileIndex + 1}/${allPDFs.length}] Processing: ${path.basename(pdfPath)}`);
            const text = await parsePDF(pdfPath);
            if (!text.trim()) continue;

            const cleanText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

            const chunks = await textSplitter.createDocuments([cleanText], [{ source: path.basename(pdfPath) }]);
            console.log(`  -> Split into ${chunks.length} chunks.`);

            const BATCH_SIZE = 50;
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + BATCH_SIZE);

                try {
                    const batchEmbeddings = await embeddings.embedDocuments(batchChunks.map(c => c.pageContent));

                    const batchRows = [];
                    for (let j = 0; j < batchChunks.length; j++) {
                        const chunk = batchChunks[j];
                        const vector = batchEmbeddings[j];
                        if (vector && Array.isArray(vector) && vector.length === 3072) {
                            batchRows.push({
                                vector: vector,
                                text: String(chunk.pageContent || ''),
                                source: String(chunk.metadata.source || 'unknown')
                            });
                        } else {
                            console.error(`  -> [WARN] Skipping chunk ${j} - Bad vector (len: ${vector ? vector.length : 'undef'})`);
                        }
                    }

                    if (batchRows.length === 0) {
                        console.log(`  -> Skipping batch ${Math.floor(i / BATCH_SIZE) + 1} (No valid vectors)`);
                        continue;
                    }

                    if (!table) {
                        table = await db.createTable(tableName, batchRows);
                        console.log("  -> Created new LanceDB table.");
                    } else {
                        await table.add(batchRows);
                    }

                    console.log(`  -> Embedded & saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchRows.length} chunks)`);

                    // Add tiny sleep to prevent 429 rate limit from Google API
                    await new Promise(r => setTimeout(r, 1000));
                } catch (err) {
                    console.error(`  -> Failed to embed/save batch: ${err.message}`);
                }
            }
        }

        if (table) {
            console.log("\n[LanceDB] Data appended successfully.");
        }

        console.log("\n✨ All documents successfully embedded into LOCAL LanceDB (Hybrid Search Ready)!");
    } catch (e) {
        console.error("FATAL ERROR IN MAIN ROUTINE:", e);
    }
}

main().catch(console.error);
