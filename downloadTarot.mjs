import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webDir = path.join(__dirname, 'public', 'assets', 'tarot');
const mobileDir = path.join(__dirname, '..', 'psi-scan-mobile', 'assets', 'tarot');

if (!fs.existsSync(webDir)) fs.mkdirSync(webDir, { recursive: true });
if (!fs.existsSync(mobileDir)) fs.mkdirSync(mobileDir, { recursive: true });

const baseUrl = 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/';
const jsonUrl = 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/tarot-images.json';

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => file.close(resolve));
            } else {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    console.log("Fetching Tarot JSON Map...");
    try {
        const res = await fetch(jsonUrl);
        const data = await res.json();
        const cards = data.cards;

        console.log(`Found ${cards.length} cards, starting download...`);
        for (let i = 0; i < cards.length; i++) {
            const filename = cards[i].img;
            const url = baseUrl + filename;
            const destWeb = path.join(webDir, filename);
            const destMobile = path.join(mobileDir, filename);

            try {
                if (!fs.existsSync(destWeb)) {
                    await downloadFile(url, destWeb);
                }
                if (!fs.existsSync(destMobile)) {
                    await downloadFile(url, destMobile);
                }
                process.stdout.write(`Downloaded ${i + 1}/${cards.length}: ${filename}\r`);
            } catch (e) {
                console.error(`\nError downloading ${filename}:`, e.message);
            }
        }
        console.log('\nAll 78 Tarot images downloaded successfully into both Web and Mobile assets!');

        // Output a sample data mapping to use next
        fs.writeFileSync(path.join(__dirname, 'src', 'data', 'tarotGenData.json'), JSON.stringify(cards, null, 2));
    } catch (err) {
        console.error("Script failed:", err);
    }
}

run();
