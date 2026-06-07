/**
 * Configuración centralizada de Mercado Pago Chile.
 * Consumir exclusivamente vía import.meta.env — nunca hardcodear credenciales.
 */
export const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY?.trim() ?? "";

/** Locale oficial para Checkout Bricks en Chile */
export const MP_LOCALE = "es-CL";

/** Moneda por defecto del checkout SaaS */
export const MP_CURRENCY = "CLP";

export function isMercadoPagoConfigured() {
    return MP_PUBLIC_KEY.length > 0;
}

/** true cuando la public key es de entorno TEST (Checkout Bricks sandbox) */
export function isMercadoPagoTestMode() {
    return MP_PUBLIC_KEY.startsWith("TEST-");
}
