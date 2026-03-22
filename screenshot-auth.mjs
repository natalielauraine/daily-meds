// Screenshots the login and signup pages for visual comparison
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

// Desktop screenshot
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/login-desktop.png', fullPage: true });
console.log('Login desktop saved');

await page.goto('http://localhost:3001/signup', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/signup-desktop.png', fullPage: true });
console.log('Signup desktop saved');

// Mobile screenshot
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/login-mobile.png', fullPage: true });
console.log('Login mobile saved');

await page.goto('http://localhost:3001/signup', { waitUntil: 'networkidle0', timeout: 20000 });
await page.screenshot({ path: '/tmp/signup-mobile.png', fullPage: true });
console.log('Signup mobile saved');

await browser.close();
console.log('All screenshots done');
