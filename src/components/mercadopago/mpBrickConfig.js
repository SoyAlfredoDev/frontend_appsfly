/**
 * Configuración del Payment Brick — Checkout Bricks Mercado Pago Chile.
 * @see https://www.mercadopago.cl/developers/es/docs/checkout-bricks/payment-brick/default-rendering
 */

/** Métodos habilitados en el Payment Brick para suscripciones SaaS */
export const MP_PAYMENT_BRICK_CUSTOMIZATION = {
    paymentMethods: {
        creditCard: "all",
        prepaidCard: "all",
        debitCard: "all",
        mercadoPago: "all",
    },
};

/** Estados MP mapeados a fases de UI */
export const MP_BRICK_UI_PHASE = {
    IDLE: "idle",
    LOADING: "loading",
    READY: "ready",
    PROCESSING: "processing",
    APPROVED: "approved",
    ERROR: "error",
};
