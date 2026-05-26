const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });

  page.on('pageerror', error => {
    console.log('BROWSER PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully. Checking body...');
    const body = await page.evaluate(() => document.body.innerHTML);
    if (!body || body.trim() === '<div id="root"></div>') {
      console.log('Body is empty! Root failed to render.');
    } else {
      console.log('Body is NOT empty. Length:', body.length);
    }
  } catch (err) {
    console.log('NAVIGATION ERROR:', err.message);
  }

  await browser.close();
})();
