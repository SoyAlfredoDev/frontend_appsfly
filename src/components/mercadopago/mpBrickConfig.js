import { isMercadoPagoTestMode } from "../../config/mercadopago/mpConfig.js";

/**
 * Configuración del Payment Brick — Checkout Bricks Mercado Pago Chile.
 * @see https://www.mercadopago.cl/developers/es/docs/checkout-bricks/payment-brick/default-rendering
 */

const CARD_METHODS = {
    creditCard: "all",
    prepaidCard: "all",
    debitCard: "all",
};

/** Producción: tarjetas + cuenta Mercado Pago */
const PRODUCTION_PAYMENT_METHODS = {
    ...CARD_METHODS,
    mercadoPago: "all",
};

/**
 * Sandbox: solo tarjetas.
 * Pagar con "cuenta Mercado Pago" en TEST exige un usuario comprador @testuser.com;
 * si el pagador usa su cuenta real, MP muestra:
 * "Una de las partes con la que intentas hacer el pago es de prueba."
 */
const SANDBOX_PAYMENT_METHODS = {
    ...CARD_METHODS,
};

export function getPaymentBrickCustomization() {
    return {
        paymentMethods: isMercadoPagoTestMode()
            ? SANDBOX_PAYMENT_METHODS
            : PRODUCTION_PAYMENT_METHODS,
    };
}

/** @deprecated Usar getPaymentBrickCustomization() */
export const MP_PAYMENT_BRICK_CUSTOMIZATION = getPaymentBrickCustomization();

/** Estados MP mapeados a fases de UI */
export const MP_BRICK_UI_PHASE = {
    IDLE: "idle",
    LOADING: "loading",
    READY: "ready",
    PROCESSING: "processing",
    APPROVED: "approved",
    ERROR: "error",
};
