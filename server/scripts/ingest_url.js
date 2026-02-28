import * as lancedb from 'vectordb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import puppeteer from 'puppeteer';
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

const targetUrl = process.argv[2];

if (!targetUrl) {
    console.error("Please provide a URL as an argument:\nnode ingest_url.js <https://example.com>");
    process.exit(1);
}

async function scrapeUrl(url) {
    console.log(`\n[Scraping] Fetching content from: ${url}`);
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const content = await page.evaluate(() => {
            const selectorsToRemove = ['nav', 'header', 'footer', '.sidebar', '.ads', 'script', 'style', 'iframe', '.comments'];
            selectorsToRemove.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.remove());
            });
            const article = document.querySelector('article') || document.querySelector('main') || document.body;
            return article ? article.innerText : '';
        });
        await browser.close();
        return content;
    } catch (e) {
        await browser.close();
        console.error("Scraping failed:", e.message);
        return null;
    }
}

async function main() {
    const textContext = await scrapeUrl(targetUrl);

    if (!textContext || textContext.trim() === '') {
        console.error("Failed to extract meaningful text from URL.");
        process.exit(1);
    }

    const cleanText = textContext.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanText.length < 50) {
        console.error("Extracted text is too short. Skipping ingestion.");
        process.exit(1);
    }
    console.log(`[Scraping] Successfully extracted ${cleanText.length} characters.`);

    const dbPath = path.resolve(__dirname, '../data/lancedb_data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    try {
        const tableName = "psi_scan_docs";
        const tableDir = path.join(dbPath, tableName + '.lance');

        console.log("\n[LanceDB] Connecting...");
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

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const chunks = await textSplitter.createDocuments([cleanText], [{ source: targetUrl }]);
        console.log(`[Processor] Split text into ${chunks.length} chunks.`);

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
                    }
                }

                if (batchRows.length === 0) continue;

                if (!table) {
                    table = await db.createTable(tableName, batchRows);
                    console.log(`  -> Created new table '${tableName}' with first batch.`);
                } else {
                    await table.add(batchRows);
                }
                console.log(`  -> Embedded & saved batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchRows.length} chunks)`);
                await new Promise(r => setTimeout(r, 1000)); // rate limit prevention
            } catch (err) {
                console.error(`  -> Failed to process batch: ${err.message}`);
            }
        }

        if (table) {
            console.log("\n[LanceDB] Data appended successfully.");
        }

        console.log(`\n✨ Successfully ingested URL: ${targetUrl}`);
    } catch (e) {
        console.error("FATAL ERROR IN INGESTION:", e);
    }
}

main().catch(console.error);
