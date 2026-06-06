/**
 * Captura /reports con panel abierto y tras generar reporte (si hay credenciales).
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../docs/screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

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

await page.goto(`${BASE}/reports`);
await page.waitForTimeout(1200);

const card = page.getByRole("button", { name: /Ventas del Mes/i });
if (await card.count()) {
    await card.click();
    await page.waitForTimeout(600);
}

await page.screenshot({ path: join(outDir, "reports-panel-open.png"), fullPage: true });
console.log("✓ reports-panel-open.png");

const verBtn = page.getByRole("button", { name: /Ver reporte/i });
if (await verBtn.isVisible() && await verBtn.isEnabled()) {
    await verBtn.click();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: join(outDir, "reports-preview.png"), fullPage: true });
    console.log("✓ reports-preview.png");
}

await browser.close();
