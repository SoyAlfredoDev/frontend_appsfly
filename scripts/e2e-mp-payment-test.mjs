/**
 * E2E Mercado Pago — token SDK TEST + API backend.
 * Uso (desde frontend/): node scripts/e2e-mp-payment-test.mjs [--force-expire]
 */
import { chromium } from "playwright";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "../../backend");

dotenv.config({ path: join(backendRoot, ".env") });
dotenv.config({ path: join(__dirname, "../.env") });

const { PrismaClient } = await import(
    join(backendRoot, "src/generated/general/index.js")
);
const prisma = new PrismaClient();

const API = process.env.BACKEND_URL || "http://localhost:3000";
const MP_PUBLIC_KEY = process.env.VITE_MERCADO_PAGO_PUBLIC_KEY?.trim() ?? "";
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() ?? "";

const SANDBOX_CARD = {
    cardNumber: "5031753573450604",
    cardholderName: "APRO",
    cardExpirationMonth: "11",
    cardExpirationYear: "2030",
    securityCode: "123",
    identificationType: "RUT",
    identificationNumber: "111111111",
};

async function findTestContext({ forceExpire = false } = {}) {
    const subs = await prisma.subscription.findMany({ orderBy: { subscriptionEndDate: "desc" } });
    const now = new Date();
    const byBusiness = new Map();
    for (const sub of subs) {
        if (!byBusiness.has(sub.subscriptionBusinessId)) {
            byBusiness.set(sub.subscriptionBusinessId, []);
        }
        byBusiness.get(sub.subscriptionBusinessId).push(sub);
    }

    for (const [businessId, businessSubs] of byBusiness) {
        const activeSub = businessSubs.find((sub) => {
            const end = new Date(sub.subscriptionEndDate);
            return sub.subscriptionStatus === "ACTIVE" && end > now;
        });
        if (activeSub && !forceExpire) continue;

        const ub = await prisma.userBusiness.findFirst({
            where: { userBusinessBusinessId: businessId },
            include: { User: true, Business: true },
        });
        if (!ub?.User) continue;

        let restoreSubId = null;
        let restoreEndDate = null;
        if (activeSub && forceExpire) {
            restoreSubId = activeSub.subscriptionId;
            restoreEndDate = activeSub.subscriptionEndDate;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            await prisma.subscription.update({
                where: { subscriptionId: activeSub.subscriptionId },
                data: { subscriptionEndDate: yesterday },
            });
            console.log("⚠ Suscripción vencida temporalmente para la prueba.");
        }

        return {
            userId: ub.User.userId,
            userEmail: ub.User.userEmail,
            businessId,
            businessName: ub.Business?.businessName,
            restoreSubId,
            restoreEndDate,
        };
    }
    throw new Error("No hay negocio disponible para la prueba.");
}

async function createJwt(userId) {
    const { createAccessToken } = await import(join(backendRoot, "libs/jwt.js"));
    return createAccessToken({ id: userId });
}

async function createCardTokenViaSdk() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("about:blank");

    const cardToken = await page.evaluate(async ({ publicKey, card }) => {
        await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://sdk.mercadopago.com/js/v2";
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
        // eslint-disable-next-line no-undef
        const mp = new MercadoPago(publicKey, { locale: "es-CL" });
        return mp.createCardToken({
            cardNumber: card.cardNumber,
            cardholderName: card.cardholderName,
            cardExpirationMonth: card.cardExpirationMonth,
            cardExpirationYear: card.cardExpirationYear,
            securityCode: card.securityCode,
            identificationType: card.identificationType,
            identificationNumber: card.identificationNumber,
        });
    }, { publicKey: MP_PUBLIC_KEY, card: SANDBOX_CARD });

    await browser.close();
    return cardToken;
}

async function api(path, { method = "GET", token, body } = {}) {
    const res = await fetch(`${API}/api${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function main() {
    console.log("=== E2E Mercado Pago (SDK + API) ===\n");

    if (!MP_PUBLIC_KEY?.startsWith("TEST-")) {
        throw new Error(
            `Define VITE_MERCADO_PAGO_PUBLIC_KEY (TEST) en frontend/.env. Actual: ${MP_PUBLIC_KEY?.slice(0, 12) || "vacía"}`,
        );
    }
    if (!MP_ACCESS_TOKEN) {
        throw new Error("Define MERCADO_PAGO_ACCESS_TOKEN en backend/.env");
    }

    const forceExpire = process.argv.includes("--force-expire");
    const ctx = await findTestContext({ forceExpire });
    console.log("Usuario:", ctx.userEmail);
    console.log("Negocio:", ctx.businessName);

    const paidPlan = await prisma.plan.findFirst({
        where: { planActive: { not: false }, planPrice: { gt: 0 } },
    });
    if (!paidPlan) throw new Error("No hay plan de pago.");

    const jwt = await createJwt(ctx.userId);
    const subscriptionId = randomUUID();

    console.log("\n1) POST /subscriptions/checkout …");
    const checkout = await api("/subscriptions/checkout", {
        method: "POST",
        token: jwt,
        body: {
            subscriptionId,
            subscriptionBusinessId: ctx.businessId,
            subscriptionPlanId: paidPlan.planId,
        },
    });
    if (checkout.status !== 201) {
        throw new Error(`Checkout ${checkout.status}: ${checkout.data?.message}`);
    }
    const { paymentId, amount } = checkout.data;
    console.log("   ✓ paymentId:", paymentId, "| amount:", amount);

    console.log("\n2) Token tarjeta sandbox (SDK v2) …");
    const cardToken = await createCardTokenViaSdk();
    console.log("   ✓ token:", cardToken.id?.slice(0, 20) + "…");

    console.log("\n3) POST /subscriptions/process-payment …");
    const payment = await api("/subscriptions/process-payment", {
        method: "POST",
        token: jwt,
        body: {
            subscriptionPaymentId: paymentId,
            formData: {
                token: cardToken.id,
                transaction_amount: Number(amount),
                installments: 1,
                payment_method_id: cardToken.payment_method_id || "master",
                payer: {
                    email: ctx.userEmail,
                    identification: { type: "RUT", number: "111111111" },
                },
            },
            selectedPaymentMethod: "credit_card",
        },
    });

    if (payment.status !== 200) {
        throw new Error(`Process-payment ${payment.status}: ${payment.data?.message}`);
    }

    const payStatus = payment.data?.payment?.status;
    const mpStatus = payment.data?.mpPayment?.status;
    const subId = payment.data?.subscription?.subscriptionId;
    const mpPaymentId = payment.data?.payment?.mpPaymentId || payment.data?.mpPayment?.id;

    console.log("   ✓ payment.status:", payStatus);
    console.log("   ✓ mpPayment.status:", mpStatus);
    console.log("   ✓ mpPaymentId:", mpPaymentId);
    console.log("   ✓ subscriptionId:", subId);

    const record = await prisma.subscriptionPayment.findUnique({
        where: { subscriptionPaymentId: paymentId },
        include: { subscription: true },
    });
    console.log("\n4) BD → status:", record?.status, "| linked sub:", record?.subscriptionId);

    const success = payStatus === "APPROVED" && record?.status === "APPROVED" && record?.subscriptionId;

    console.log("\n=== RESULTADO:", success ? "✅ PAGO APROBADO — FLUJO OK" : "❌ FALLO", "===");

    if (ctx.restoreSubId) {
        if (success) {
            await prisma.subscription.update({
                where: { subscriptionId: ctx.restoreSubId },
                data: { subscriptionStatus: "EXPIRED" },
            });
            console.log("↩ Suscripción anterior marcada EXPIRED (nueva MP activa).");
        } else if (ctx.restoreEndDate) {
            await prisma.subscription.update({
                where: { subscriptionId: ctx.restoreSubId },
                data: { subscriptionEndDate: ctx.restoreEndDate },
            });
            console.log("↩ Suscripción restaurada.");
        }
    }

    if (!success) process.exit(1);
}

main()
    .catch((e) => {
        console.error("\n❌", e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
