/**
 * Captura pantalla bloqueo por suscripción vencida (viewport 1440×900, sin fullPage).
 * Uso:
 *   E2E_EMAIL_TENANT=... E2E_PASSWORD_TENANT=... \
 *   VITE_DEV_URL=http://localhost:5174 \
 *   node scripts/capture-subscription-blocked.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../docs/screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.VITE_DEV_URL || "http://localhost:5174";
const email = process.env.E2E_EMAIL_TENANT || process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD_TENANT || process.env.E2E_PASSWORD;

async function login(page) {
    await page.goto(`${BASE}/login`);
    await page.evaluate(
        async ({ userEmail, userPassword }) => {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail, userPassword }),
            });
            const data = await res.json();
            if (data?.token) localStorage.setItem("token", data.token);
        },
        { userEmail: email, userPassword: password },
    );
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

if (email && password) {
    await login(page);
    for (const route of ["/dashboard", "/customers"]) {
        await page.goto(`${BASE}${route}`);
        await page.waitForTimeout(2800);
        const slug = route.replace(/\//g, "").replace(/^$/, "root") || "dashboard";
        const outPath = join(outDir, `subscription-blocked-${slug || "dashboard"}-desktop.png`);
        await page.screenshot({ path: outPath, fullPage: false });
        const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
        const hasScroll = scrollHeight > clientHeight + 2;
        console.log(`${hasScroll ? "⚠ scroll" : "✓ no scroll"} ${outPath} (${scrollHeight}px / ${clientHeight}px)`);
    }
} else {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(1500);
    const outPath = join(outDir, "subscription-blocked-no-auth.png");
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ ${outPath} (sin credenciales E2E — vista login/home)`);
}

await browser.close();
