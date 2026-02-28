import * as lancedb from 'vectordb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function check() {
    try {
        const dbPath = path.resolve(__dirname, '../data/lancedb_data');
        const db = await lancedb.connect(dbPath);
        console.log("Tables found:", await db.tableNames());
    } catch (e) {
        console.error("Error:", e);
    }
}
check();
