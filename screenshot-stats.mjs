import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

// Desktop
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3001/stats', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/stats-desktop.png', fullPage: true });
console.log('Stats desktop saved');

// Mobile
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:3001/stats', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/stats-mobile.png', fullPage: true });
console.log('Stats mobile saved');

await browser.close();
console.log('Done');
