import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../docs/screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";
const email = process.env.E2E_EMAIL_ADMIN || process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD_ADMIN || process.env.E2E_PASSWORD;
const businessId = process.env.E2E_BUSINESS_ID;

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

    let targetId = businessId;
    if (!targetId) {
        const token = await page.evaluate(() => localStorage.getItem("token"));
        const res = await page.evaluate(async (tok) => {
            const r = await fetch("/api/admin/businesses", {
                headers: { Authorization: `Bearer ${tok}` },
            });
            const data = await r.json();
            return Array.isArray(data) && data[0]?.businessId ? data[0].businessId : null;
        }, token);
        targetId = res;
    }

    if (targetId) {
        await page.goto(`${BASE}/admin/businesses/${targetId}`);
        await page.waitForTimeout(3000);
        const path = join(outDir, "admin-business-detail-360.png");
        await page.screenshot({ path, fullPage: true });
        console.log(`✓ ${path}`);
    } else {
        console.log("No business id available for capture");
    }
} else {
    await page.goto(`${BASE}/admin/businesses/demo-id`);
    await page.waitForTimeout(2000);
    const path = join(outDir, "admin-business-detail-unauth.png");
    await page.screenshot({ path, fullPage: true });
    console.log(`✓ ${path} (sin credenciales)`);
}

await browser.close();
