/**
 * Configuración Mercado Pago Chile — Frontend (Vite).
 *
 * REGLA DE SEGURIDAD: este módulo es el ÚNICO lugar del frontend
 * que puede leer credenciales MP. Solo la clave pública:
 *   import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY
 *
 * Prohibido: ACCESS_TOKEN, CLIENT_ID, CLIENT_SECRET en el cliente.
 */

/** Locale oficial para Checkout Bricks en Chile */
export const MP_LOCALE = "es-CL";

/** Moneda por defecto del checkout SaaS */
export const MP_CURRENCY = "CLP";

/** Clave pública — variable oficial Vite */
export function getMercadoPagoPublicKey() {
    return import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY?.trim() ?? "";
}

export function isMercadoPagoConfigured() {
    return getMercadoPagoPublicKey().length > 0;
}

/** true cuando la public key es de entorno TEST (Checkout Bricks sandbox) */
export function isMercadoPagoTestMode() {
    return getMercadoPagoPublicKey().startsWith("TEST-");
}
