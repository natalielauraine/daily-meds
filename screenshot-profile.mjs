import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

// Desktop — capture quickly before client-side auth redirect fires
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3001/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
// Wait 1.5s — enough for the page to render but before getUser() redirects
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: '/tmp/profile-desktop.png', fullPage: true });
console.log('Profile desktop saved');

// Mobile
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:3001/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: '/tmp/profile-mobile.png', fullPage: true });
console.log('Profile mobile saved');

await browser.close();
console.log('Done');
