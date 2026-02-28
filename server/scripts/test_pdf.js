import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function test() {
    try {
        const buffer = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity\\scratch\\manus cde\\마케팅\\양자자료1\\첫째 시간.pdf');
        console.log("Buffer size:", buffer.length);
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        console.log("Parsed length:", data.text.length);
        console.log("Snippet:", data.text.substring(0, 50));
    } catch (e) {
        console.error("Failed:", e.message);
    }
}
test();
