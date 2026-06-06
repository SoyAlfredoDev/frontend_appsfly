/**
 * Capturas de la zona /admin — dashboard super-admin y bloqueo 403.
 * Uso:
 *   E2E_EMAIL_ADMIN=... E2E_PASSWORD_ADMIN=... \
 *   E2E_EMAIL_TENANT=... E2E_PASSWORD_TENANT=... \
 *   node scripts/capture-admin-zone.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../docs/screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";

async function login(page, email, password) {
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

const browser = await chromium.launch({ headless: true });

const tenantEmail = process.env.E2E_EMAIL_TENANT || process.env.E2E_EMAIL;
const tenantPassword = process.env.E2E_PASSWORD_TENANT || process.env.E2E_PASSWORD;
const adminEmail = process.env.E2E_EMAIL_ADMIN || process.env.E2E_EMAIL;
const adminPassword = process.env.E2E_PASSWORD_ADMIN || process.env.E2E_PASSWORD;

if (tenantEmail && tenantPassword && adminEmail && adminPassword && tenantEmail !== adminEmail) {
    const denyPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await login(denyPage, tenantEmail, tenantPassword);
    await denyPage.goto(`${BASE}/admin/dashboard`);
    await denyPage.waitForTimeout(2500);
    const denyPath = join(outDir, "admin-access-denied-403.png");
    await denyPage.screenshot({ path: denyPath, fullPage: true });
    console.log(`✓ ${denyPath}`);
    await denyPage.close();
}

if (adminEmail && adminPassword) {
    const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await login(adminPage, adminEmail, adminPassword);
    await adminPage.goto(`${BASE}/admin/dashboard`);
    await adminPage.waitForTimeout(3000);
    const dashPath = join(outDir, "admin-dashboard-premium.png");
    await adminPage.screenshot({ path: dashPath, fullPage: true });
    console.log(`✓ ${dashPath}`);

    await adminPage.goto(`${BASE}/admin/tickets`);
    await adminPage.waitForTimeout(2000);
    const ticketsPath = join(outDir, "admin-tickets-with-nav.png");
    await adminPage.screenshot({ path: ticketsPath, fullPage: true });
    console.log(`✓ ${ticketsPath}`);
    await adminPage.close();
} else {
    const guestPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await guestPage.goto(`${BASE}/admin/dashboard`);
    await guestPage.waitForTimeout(2000);
    const loginPath = join(outDir, "admin-unauthenticated-login.png");
    await guestPage.screenshot({ path: loginPath, fullPage: true });
    console.log(`✓ ${loginPath} (sin credenciales E2E)`);
    await guestPage.close();
}

await browser.close();
