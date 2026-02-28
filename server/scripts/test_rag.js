import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as lancedb from "vectordb";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function testQuery() {
    try {
        console.log("Connecting to LanceDB...");
        const dbPath = path.resolve(__dirname, "../data/lancedb_data");
        console.log("Using DB Path:", dbPath);
        const db = await lancedb.connect(dbPath);

        // Let's get the table name if it's not 'docs'. Usually we use vectorStore.table
        const tables = await db.tableNames();
        console.log("Available tables:", tables);

        if (tables.length === 0) {
            console.log("No tables found. DB might be empty or in wrong directory.");
            return;
        }

        const tableName = tables[0]; // Assuming there's mostly one
        console.log("Using table:", tableName);

        const table = await db.openTable(tableName);

        console.log("Setting up embedding model...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "gemini-embedding-001",
        });
        const query = "후성유전학과 생물학의 관계성에 대해 설명해줘";
        console.log(`\nQuerying for: "${query}"...`);

        // Use native LanceDB querying instead of broken Langchain wrapper
        const queryVector = await embeddings.embedQuery(query);
        const results = await table.search(queryVector).limit(3).execute();

        console.log("\nTop 3 Results:\n");
        results.forEach((r, i) => {
            console.log(`[${i + 1}] Score: ${r._distance} | Source: ${r.source}`);
            console.log(`${r.text.substring(0, 150)}...\n`);
        });

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testQuery();
