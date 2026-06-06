/**
 * Prueba E2E de /reports — los 3 tipos de reporte.
 * Uso: E2E_EMAIL=... E2E_PASSWORD=... node scripts/test-reports-e2e.mjs
 */
const BASE = process.env.VITE_DEV_URL || "http://localhost:5173";
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

if (!email || !password) {
    console.error("Define E2E_EMAIL y E2E_PASSWORD");
    process.exit(1);
}

async function login() {
    const res = await fetch(`${BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, userPassword: password }),
    });
    if (!res.ok) throw new Error(`Login falló: ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error("Sin token en respuesta de login");
    return data.token;
}

async function testReport(token, type, params) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/api/reports/${type}?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (!res.ok) {
        throw new Error(`${type} → ${res.status}: ${body.error || JSON.stringify(body)}`);
    }
    if (!body.reportType || !Array.isArray(body.rows) || !body.summary) {
        throw new Error(`${type} → respuesta inválida`);
    }
    console.log(`✓ ${type}: ${body.rows.length} filas`);
    return body;
}

const token = await login();
const now = new Date();
const month = String(now.getMonth() + 1);
const year = String(now.getFullYear());
const startDate = `${year}-${month.padStart(2, "0")}-01`;
const endDate = now.toISOString().slice(0, 10);

await testReport(token, "monthly-sales", { month, year });
await testReport(token, "yearly-sales", { year });
await testReport(token, "inventory-movements", { startDate, endDate });

console.log("Todos los reportes respondieron correctamente.");
