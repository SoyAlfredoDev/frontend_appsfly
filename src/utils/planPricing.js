/** IVA Chile — precios de plan en BD/API son netos; el cobro mensual incluye IVA. */
export const PLAN_IVA_RATE = 0.19;

export function getPlanNetPrice(planPrice) {
    return Math.round(Number(planPrice) || 0);
}

export function getPlanIvaAmount(netPrice) {
    return Math.round(getPlanNetPrice(netPrice) * PLAN_IVA_RATE);
}

export function getPlanTotalWithIva(netPrice) {
    const net = getPlanNetPrice(netPrice);
    return net + getPlanIvaAmount(net);
}

export function getPlanPricing(netPrice) {
    const net = getPlanNetPrice(netPrice);
    const iva = getPlanIvaAmount(net);
    return {
        net,
        iva,
        total: net + iva,
        ivaRate: PLAN_IVA_RATE,
    };
}
