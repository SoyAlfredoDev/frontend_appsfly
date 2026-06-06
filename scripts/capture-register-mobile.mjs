/**
 * Captura screenshots móvil de /sales/register.
 * Uso: E2E_EMAIL=... E2E_PASSWORD=... node scripts/capture-register-mobile.mjs
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../docs/screenshots");
mkdirSync(outDir, { recursive: true });

const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

const viewports = [
  { name: "iphone-se", ...devices["iPhone SE"] },
  { name: "iphone-14", ...devices["iPhone 14"] },
  { name: "pixel-7", ...devices["Pixel 7"] },
];

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({ ...vp });
  const page = await context.newPage();

  if (email && password) {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("domcontentloaded");
    const loggedIn = await page.evaluate(async ({ userEmail, userPassword }) => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userEmail, userPassword }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data?.token) localStorage.setItem("token", data.token);
        return Boolean(data?.token);
      } catch {
        return false;
      }
    }, { userEmail: email, userPassword: password });
    if (!loggedIn) {
      console.warn("⚠ Login API falló — captura mostrará login si no hay sesión");
    }
    await page.waitForTimeout(500);
  }

  await page.goto(`${BASE}/sales/register`);
  await page.waitForTimeout(3500);

  const path = join(outDir, `register-mobile-${vp.name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`✓ ${path}`);

  await context.close();
}

await browser.close();
console.log("Capturas listas en docs/screenshots/");
