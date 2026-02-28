import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function listModels() {
    try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
        const data = await res.json();
        if (data.models) {
            const emb = data.models.filter(m => m.name.includes("embedding"));
            console.log(JSON.stringify(emb.map(e => ({ name: e.name, supportedGenerationMethods: e.supportedGenerationMethods })), null, 2));
        }
    } catch (e) {
        console.error("Failed:", e);
    }
}
listModels();
