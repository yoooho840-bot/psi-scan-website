import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'tarotGenData.json'), 'utf8'));
const existingCode = fs.readFileSync(path.join(__dirname, 'src', 'data', 'tarotData.ts'), 'utf8');

// We will recreate tarotData.ts by injecting the new 56 cards at the end of the existing array,
// and modifying the existing 22 to include the `imgFileName` property.

// Temporary naive approach: we know the first 22 items in rawData are major arcana in order (0 to 21).
let modifiedCode = existingCode.replace(/imageUrl: "[^"]+"/g, (match, offset, str) => {
    // This is risky, let's just do a clean rebuild of the entire TS file.
    return match;
});

// Better approach:
let outputTs = `export interface TarotCard {
    id: number;
    name: string;
    romanNumeral: string;
    element: string;
    resonanceFrequency: string;
    quantumState: string;
    description: string;
    advice: string;
    imgFileName: string; 
}

export const tarotDeck: TarotCard[] = [\n`;

// Since I am inside a node script, I can't easily import TS. 
// Let's use regex to extract the 22 Major Arcana objects from existingCode.
const objectRegex = /{\s*id:\s*\d+,[^}]+}/g;
const existingObjects = [...existingCode.matchAll(objectRegex)].map(m => m[0]);

let idCounter = 0;

for (let i = 0; i < rawData.length; i++) {
    const card = rawData[i];

    if (card.arcana === 'Major Arcana' && existingObjects[i]) {
        // Inject imgFileName into existing object
        let objStr = existingObjects[i];
        objStr = objStr.replace(/imageUrl:\s*"[^"]*"/, `imgFileName: "${card.img}"`);
        // If it didn't have imageUrl, append it
        if (!objStr.includes('imgFileName')) {
            objStr = objStr.replace(/\s*}$/, `,\n        imgFileName: "${card.img}"\n    }`);
        }
        outputTs += `    ${objStr},\n`;
        idCounter++;
    } else {
        // Minor Arcana
        const suitToElement = { 'Wands': 'Fire', 'Cups': 'Water', 'Swords': 'Air', 'Pentacles': 'Earth', 'Coins': 'Earth' };
        const suitToFreq = { 'Wands': '417Hz', 'Cups': '741Hz', 'Swords': '852Hz', 'Pentacles': '396Hz' };
        const romanMap = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X', 'page': 'Page', 'knight': 'Knight', 'queen': 'Queen', 'king': 'King', 'ace': 'Ace' };

        let numStr = card.number.toString().toLowerCase();
        const element = suitToElement[card.suit] || 'Aether';
        const freq = suitToFreq[card.suit] || '432Hz';
        const roman = romanMap[numStr] || card.number;

        outputTs += `    {
        id: ${idCounter++},
        name: "${card.name}",
        romanNumeral: "${roman}",
        element: "${element}",
        resonanceFrequency: "${freq}",
        quantumState: "Vector Resonance (벡터 공명)",
        description: "${card.name}의 파동은 ${element} 원소의 양자적 진동을 유도합니다. 세부적인 무의식적 해석과 상호작용은 AI 오라클(챗봇) 상담을 통해 더 깊이 탐구할 수 있습니다.",
        advice: "이 파동의 결을 따라 자신의 주파수를 부드럽게 동조시키십시오.",
        imgFileName: "${card.img}"
    },\n`;
    }
}

outputTs += `];\n`;

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'tarotData.ts'), outputTs);
fs.writeFileSync(path.join(__dirname, '..', 'psi-scan-mobile', 'data', 'tarotData.ts'), outputTs);

console.log("Successfully rebuilt tarotData.ts with all 78 completely integrated cards.");
