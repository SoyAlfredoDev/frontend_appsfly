import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../docs/screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.VITE_DEV_URL || "http://localhost:5174";
const email = process.env.E2E_EMAIL_ADMIN || process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD_ADMIN || process.env.E2E_PASSWORD;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

if (email && password) {
    await page.goto(`${BASE}/login`);
    await page.evaluate(async ({ userEmail, userPassword }) => {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, userPassword }),
        });
        const data = await res.json();
        if (data?.token) localStorage.setItem("token", data.token);
    }, { userEmail: email, userPassword: password });
}

await page.goto(`${BASE}/admin/payments`);
await page.waitForTimeout(3500);

const path = join(outDir, "admin-payments-premium.png");
await page.screenshot({ path, fullPage: true });
console.log(`✓ ${path}`);

await browser.close();
