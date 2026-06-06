/**
 * Captura layout tenant: sidebar navy + contenido claro.
 * Uso:
 *   E2E_EMAIL_TENANT=... E2E_PASSWORD_TENANT=... \
 *   VITE_DEV_URL=http://localhost:5174 \
 *   node scripts/capture-tenant-layout.mjs
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
    for (const route of ["/dashboard", "/customers", "/expenses"]) {
        await page.goto(`${BASE}${route}`);
        await page.waitForTimeout(2800);
        const slug = route.replace(/^\//, "").replace(/\//g, "-") || "dashboard";
        const outPath = join(outDir, `tenant-layout-${slug}-desktop.png`);
        await page.screenshot({ path: outPath, fullPage: false });
        console.log(`✓ ${outPath}`);
    }
} else {
    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(1500);
    const outPath = join(outDir, "tenant-layout-login.png");
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ ${outPath} (sin credenciales E2E)`);
}

await browser.close();
