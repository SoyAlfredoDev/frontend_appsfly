/**
 * Captura screenshots del panel del negocio para el hero de la landing.
 *
 * Uso recomendado (misma sesión que el backend):
 *   cd frontend
 *   set -a && source ../backend/.env && set +a
 *   VITE_DEV_URL=http://localhost:5173 node scripts/capture-hero-screenshots.mjs
 *
 * O con credenciales de un usuario tenant:
 *   E2E_EMAIL_TENANT=... E2E_PASSWORD_TENANT=... node scripts/capture-hero-screenshots.mjs
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadBackendEnv() {
    const envPath = join(__dirname, "../../backend/.env");
    if (!existsSync(envPath)) return;
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
    }
}

loadBackendEnv();

const { createAccessToken } = await import("../../backend/libs/jwt.js");
const { PrismaClient: PrismaGeneral } = await import(
    "../../backend/src/generated/general/index.js"
);

const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";
const outDir = join(__dirname, "../public/hero");
mkdirSync(outDir, { recursive: true });

const SHOTS = [
    { route: "/dashboard", file: "dashboard.png" },
    { route: "/sales/register", file: "sales-register.png" },
    { route: "/sales", file: "sales-table.png" },
];

async function loginViaApi(page, email, password) {
    await page.goto(`${BASE}/login`);
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
    return loggedIn;
}

async function loginViaDbToken(page) {
    if (!process.env.TOKEN_SECRET) return null;

    const prisma = new PrismaGeneral();
    try {
        const superAdminIds = (process.env.SUPER_ADMIN_IDS || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        const membership = await prisma.userBusiness.findFirst({
            where: superAdminIds.length
                ? { userBusinessUserId: { notIn: superAdminIds } }
                : undefined,
            orderBy: { createdAt: "asc" },
        });

        const fallback = membership
            ? membership
            : await prisma.userBusiness.findFirst({ orderBy: { createdAt: "asc" } });

        if (!fallback) return null;

        const token = await createAccessToken({ id: fallback.userBusinessUserId });

        await page.goto(`${BASE}/login`);
        await page.evaluate(({ authToken, businessId }) => {
            localStorage.setItem("token", authToken);
            sessionStorage.setItem("appsfly_business_id", businessId);
        }, {
            authToken: token,
            businessId: fallback.userBusinessBusinessId,
        });

        const verified = await page.evaluate(async () => {
            const res = await fetch("/api/verify", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return res.ok;
        });

        if (!verified) return null;

        await page.goto(`${BASE}/dashboard`);
        await page.waitForTimeout(1500);
        return fallback.userBusinessBusinessId;
    } finally {
        await prisma.$disconnect();
    }
}

async function waitForTenantShell(page) {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(
        () => !window.location.pathname.startsWith("/login"),
        { timeout: 25000 },
    );
    await page.waitForSelector(".app-main, aside nav", { timeout: 25000 });
    await page.waitForTimeout(2000);
}

async function assertTenantView(page, route) {
    if (page.url().includes("/login")) {
        throw new Error(`Redirigido a login al capturar ${route}`);
    }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const email = process.env.E2E_EMAIL_TENANT || process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD_TENANT || process.env.E2E_PASSWORD;

let authenticated = false;
if (email && password) {
    authenticated = await loginViaApi(page, email, password);
    if (authenticated) console.log("✓ Login por API");
}

if (!authenticated) {
    const businessId = await loginViaDbToken(page);
    authenticated = Boolean(businessId);
    if (authenticated) console.log("✓ Sesión generada desde base de datos");
}

if (!authenticated) {
    console.error(
        "No se pudo autenticar. Usa E2E_EMAIL_TENANT/E2E_PASSWORD_TENANT o ejecuta con: source ../backend/.env",
    );
    await browser.close();
    process.exit(1);
}

for (const shot of SHOTS) {
    await page.goto(`${BASE}${shot.route}`);
    await waitForTenantShell(page);
    await assertTenantView(page, shot.route);
    const outPath = join(outDir, shot.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ ${outPath}`);
}

await browser.close();
console.log("Capturas del hero listas en frontend/public/hero/");
