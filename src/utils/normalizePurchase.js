/**
 * Normaliza la respuesta de la API de compras (axios o payload directo).
 */
export function unwrapPurchaseResponse(response) {
    const payload = response?.data ?? response;
    if (payload && typeof payload === "object" && payload.purchase) {
        return payload.purchase;
    }
    return payload;
}

/** Detalle de líneas — soporta variantes de nombre en el JSON. */
export function getPurchaseDetails(purchase) {
    if (!purchase || typeof purchase !== "object") return [];
    const details =
        purchase.PurchaseDetail ??
        purchase.purchaseDetails ??
        purchase.purchaseDetail ??
        purchase.details;
    return Array.isArray(details) ? details : [];
}
