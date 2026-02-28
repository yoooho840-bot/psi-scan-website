import { execSync } from 'child_process';

const urls = [
    "https://www.mdpi.com/2673-8392/5/3/120",
    "https://pep-web.org/browse/JOAP/volumes/66?page=5",
    "https://chaucersbooks.com/book/9780393088649",
    "https://www.researchgate.net/publication/398154448_Shadow_Integration_and_Individuation_A_Jungian_Framework_for_AGI_Alignment",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC12535262/",
    "https://scispace.com/journals/journal-of-analytical-psychology-2rtnkh3a/2020",
    "https://www.tandfonline.com/doi/full/10.1080/28324765.2025.2490524",
    "https://thejap.org/",
    "https://iaap.org/international-association-of-analytical-psychology-3/",
    "https://ijip.in/wp-content/uploads/2025/05/18.01.137.20251302.pdf",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC10954828/",
    "https://www.goodreads.com/book/show/53121261-the-black-books",
    "https://brill.com/view/journals/ijjs/14/2/article-p147_3.xml",
    "https://www.tandfonline.com/doi/full/10.1080/09540261.2025.2520767",
    "https://www.simplypsychology.org/carl-jung.html",
    "https://www.routledge.com/An-Analytical-Exploration-of-Love-and-Narcissism-The-Tragedy-of-Isolation-and-Intimacy/Schwartz/p/book/9781032732510",
    "https://www.karnacbooks.com/product/integrating-shadow-authentic-being-in-the-world/98237/",
    "https://iaap.org/",
    "https://www.scienceopen.com/hosted-document?doi=10.14236/ewic/POM24.43",
    "https://www.mdpi.com/2077-1444/16/1/69",
    "https://www.youtube.com/watch?v=WmB3Waj378M"
];

console.log(`Starting batch ingestion of ${urls.length} URLs...`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n=============================================================`);
    console.log(`[${i + 1}/${urls.length}] Processing: ${url}`);

    // Skip youtube for now as pure text scraping won't work well
    if (url.includes('youtube.com')) {
        console.log(`[Skip] YouTube URLs require video transcript extraction, skipping for standard text ingestion.`);
        failCount++;
        continue;
    }

    // Skip PDF links since ingest_url uses simple puppeteer which might download the pdf instead of rendering html
    if (url.endsWith('.pdf')) {
        console.log(`[Skip] PDF URL detected. Please download and place in 'BOOK' folder for ingest_data.js. Skipping.`);
        failCount++;
        continue;
    }

    try {
        execSync(`node ingest_url.js "${url}"`, { stdio: 'inherit' });
        successCount++;
    } catch (e) {
        console.error(`[Error] Failed to process ${url}`);
        failCount++;
    }
}

console.log(`\n=============================================================`);
console.log(`Batch Ingestion Complete!`);
console.log(`Successful: ${successCount}`);
console.log(`Failed/Skipped: ${failCount}`);
