import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        // Mock a real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9'
        });

        await page.goto('https://www.simplypsychology.org/carl-jung.html', { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract main content - checking for standard content containers
        const content = await page.evaluate(() => {
            // Remove unnecessary elements
            const selectorsToRemove = ['nav', 'header', 'footer', '.sidebar', '.ads', 'script', 'style', 'iframe', '.comments'];
            selectorsToRemove.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.remove());
            });

            const article = document.querySelector('article') || document.querySelector('main') || document.body;
            return article ? article.innerText : '';
        });

        console.log(content);
        await browser.close();
    } catch (e) {
        console.error("Scraping failed:", e);
        process.exit(1);
    }
})();
