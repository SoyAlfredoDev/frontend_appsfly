/** Celular Chile: 9 dígitos, empieza en 9. */
export const CHILE_MOBILE_RE = /^9\d{8}$/;

export function isValidChileMobile(phoneNumber) {
    return CHILE_MOBILE_RE.test(String(phoneNumber || "").trim());
}

export function normalizeChileMobileInput(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 9);
}
