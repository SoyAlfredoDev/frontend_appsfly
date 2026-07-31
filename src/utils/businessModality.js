/**
 * Helpers de modalidad de negocio.
 * Por ahora el producto se enfoca en óptica; el flag permite
 * mostrar secciones sin afectar otros tipos de negocio.
 */
export { toDateInputValue } from "./businessTime.js";

const NON_OPTICS_TYPES = new Set([
    "minimarket",
    "cafe",
    "veterinary",
    "hair_salon",
    "clothing_store",
]);

/** Normaliza businessType (p. ej. "Óptica" → "optica"). */
export function normalizeBusinessType(businessType) {
    return String(businessType ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "");
}

export function isOpticsBusiness(business) {
    const type = normalizeBusinessType(business?.businessType);
    return type === "optics" || type === "optica";
}

/** Otras modalidades explícitas (menú plano legacy). */
export function isKnownNonOpticsBusiness(business) {
    return NON_OPTICS_TYPES.has(normalizeBusinessType(business?.businessType));
}
