import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as lancedb from "vectordb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

async function testLangchainLanceDB() {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "text-embedding-004",
        });

        const uri = path.resolve(__dirname, '../data/lancedb_data');
        console.log("Saving DB to:", uri);

        // Dummy document
        const docs = [{ pageContent: "This is a dummy text", metadata: { source: "test" } }];

        console.log("Testing LanceDB.fromDocuments...");
        await LanceDB.fromDocuments(docs, embeddings, {
            uri: uri,
            tableName: "langchain_dummy",
            mode: "overwrite" // Usually not supported natively in fromDocuments, but we'll try
        });

        console.log("Success! Now let's try reading it back.");
        const db = await lancedb.connect(uri);
        console.log("Tables:", await db.tableNames());

    } catch (e) {
        console.error("Test failed:", e);
    }
}
testLangchainLanceDB();
