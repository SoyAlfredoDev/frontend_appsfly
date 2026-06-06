/**
 * Prueba interactividad de /reports
 */
import { chromium } from "playwright";

const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

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
await page.waitForTimeout(1500);

const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

// Click first report card
const cards = page.locator('button[type="button"]');
const cardCount = await cards.count();
console.log("Buttons found:", cardCount);

const firstCard = page.getByRole("button").filter({ hasText: "Ventas del Mes" });
await firstCard.click();
await page.waitForTimeout(800);

const panelVisible = await page.getByText("Parámetros — Ventas del Mes").isVisible();
console.log("Panel visible after card click:", panelVisible);

const select = page.locator("select.select-field").first();
if (await select.count()) {
    const before = await select.inputValue();
    const options = await select.locator("option").all();
    const secondVal = options.length > 1 ? await options[1].getAttribute("value") : null;
    if (secondVal) {
        await select.selectOption(secondVal);
        const after = await select.inputValue();
        console.log("Select changed:", before, "->", after, "OK:", before !== after);
    }
}

const verBtn = page.getByRole("button", { name: /Ver reporte/i });
console.log("Ver reporte enabled:", await verBtn.isEnabled());
await verBtn.click();
await page.waitForTimeout(3000);

const apiCalls = [];
page.on("request", (req) => {
    if (req.url().includes("/api/reports/")) apiCalls.push(req.url());
});

console.log("Console logs:", logs.slice(-10));
console.log("Done");

await browser.close();
