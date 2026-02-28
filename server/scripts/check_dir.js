import * as lancedb from 'vectordb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createAndCheck() {
    try {
        const dbPath = path.resolve(__dirname, '../data/lancedb_data');
        console.log("Connecting to:", dbPath);
        const db = await lancedb.connect(dbPath);

        let tables = await db.tableNames();
        console.log("Initial tables:", tables);

        if (tables.length === 0) {
            console.log("No tables found. Trying to create a dummy table to see if file is created...");
            const data = [{ id: 1, text: "dummy" }];
            await db.createTable('dummy_table', data, { mode: "overwrite" });

            tables = await db.tableNames();
            console.log("Tables after creation:", tables);

            // Check file system directly for the created table
            import('fs').then(fs => {
                if (fs.existsSync(dbPath)) {
                    console.log("Data folder contents:", fs.readdirSync(dbPath));
                    const tablePath = path.join(dbPath, 'dummy_table.lance');
                    if (fs.existsSync(tablePath)) {
                        console.log("It wrote to:", tablePath);
                    }
                }
            })
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
createAndCheck();
