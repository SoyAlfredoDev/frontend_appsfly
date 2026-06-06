/**
 * Captura screenshot del nuevo login.
 * node scripts/capture-login.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../docs/screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/login`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(800);

const desktopPath = join(outDir, "login-premium-desktop.png");
await page.screenshot({ path: desktopPath, fullPage: false });
console.log(`✓ ${desktopPath}`);

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
const mobilePath = join(outDir, "login-premium-mobile.png");
await page.screenshot({ path: mobilePath, fullPage: false });
console.log(`✓ ${mobilePath}`);

await browser.close();
