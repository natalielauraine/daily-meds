import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

// Full desktop page
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3001/session/1', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/session-desktop.png', fullPage: true });
console.log('Session desktop saved');

// Zoomed in — just the player card area
await page.setViewport({ width: 800, height: 900 });
await page.goto('http://localhost:3001/session/1', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/session-player-zoom.png', fullPage: true });
console.log('Session player zoom saved');

// Mobile
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:3001/session/1', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/session-mobile.png', fullPage: true });
console.log('Session mobile saved');

await browser.close();
console.log('Done');
