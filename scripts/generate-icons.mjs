// Generates all PWA icon PNGs from public/icons/icon.svg using Puppeteer.
// Run once: node scripts/generate-icons.mjs
// Outputs PNG files into public/icons/ — commit them, don't regenerate every build.

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir   = path.resolve(__dirname, "..");
const iconsDir  = path.join(rootDir, "public", "icons");
const sourceLogo = path.join(rootDir, "components", "ui", "Logo", "Daily Meds Icon.png");
const sourceUrl  = `file://${sourceLogo.replace(/ /g, "%20")}`;

// Icon sizes to generate.
// "maskable" versions have extra padding so Android adaptive icons look right.
const icons = [
  { name: "icon-192.png",          size: 192, maskable: false },
  { name: "icon-512.png",          size: 512, maskable: false },
  { name: "icon-maskable-192.png", size: 192, maskable: true  },
  { name: "icon-maskable-512.png", size: 512, maskable: true  },
  { name: "apple-touch-icon.png",  size: 180, maskable: false },
  { name: "favicon-32.png",        size: 32,  maskable: false },
  { name: "favicon-16.png",        size: 16,  maskable: false },
];

// Maskable icons need ~15% safe-zone padding on all sides
// so the visible content isn't clipped by Android's circle mask.
function buildHtml(sourceUrl, size, maskable) {
  const padding = maskable ? Math.round(size * 0.15) : 0;
  const innerSize = size - padding * 2;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size}px; height: ${size}px; background: #000000; overflow: hidden; }
  .wrap {
    width: ${size}px;
    height: ${size}px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  img { width: ${innerSize}px; height: ${innerSize}px; object-fit: contain; }
</style>
</head>
<body>
<div class="wrap"><img src="${sourceUrl}"></div>
</body>
</html>`;
}

async function run() {
  console.log("Launching Puppeteer…");
  const browser = await puppeteer.launch({ headless: "new" });
  const page    = await browser.newPage();

  for (const icon of icons) {
    const { name, size, maskable } = icon;
    const html = buildHtml(sourceUrl, size, maskable);

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });

    const outPath = path.join(iconsDir, name);
    await page.screenshot({ path: outPath, type: "png", clip: { x: 0, y: 0, width: size, height: size } });

    console.log(`  ✓ ${name} (${size}×${size}${maskable ? ", maskable" : ""})`);
  }

  await browser.close();
  console.log("\nAll icons written to public/icons/");
  console.log("Commit these files — they don't need to be regenerated unless you change icon.svg.");
}

run().catch((err) => { console.error(err); process.exit(1); });
