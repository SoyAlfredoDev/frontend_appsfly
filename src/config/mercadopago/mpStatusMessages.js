/**
 * Mensajes amigables para status_detail de Mercado Pago Chile.
 * @see https://www.mercadopago.cl/developers/es/docs/checkout-api/response-handling/collection-results
 */
const MP_STATUS_MESSAGES = {
    cc_rejected_bad_filled_card_number: "Revisa el número de la tarjeta.",
    cc_rejected_bad_filled_date: "Revisa la fecha de vencimiento.",
    cc_rejected_bad_filled_other: "Revisa los datos ingresados.",
    cc_rejected_bad_filled_security_code: "Revisa el código de seguridad (CVV).",
    cc_rejected_blacklist: "No pudimos procesar esta tarjeta.",
    cc_rejected_call_for_authorize: "Debes autorizar el pago con tu banco.",
    cc_rejected_card_disabled: "La tarjeta está deshabilitada. Contacta a tu banco.",
    cc_rejected_duplicated_payment: "Ya existe un pago con el mismo monto. Espera unos minutos e intenta de nuevo.",
    cc_rejected_high_risk: "El pago fue rechazado por seguridad.",
    cc_rejected_insufficient_amount: "Fondos insuficientes.",
    cc_rejected_invalid_installments: "Cuotas no disponibles para esta tarjeta.",
    cc_rejected_max_attempts: "Superaste el límite de intentos. Intenta con otra tarjeta.",
    cc_rejected_other_reason:
        "El pago fue rechazado. En modo prueba usa titular APRO y tarjeta 5031 7557 3453 0604 (CVV 123, vence 11/30).",
};

export function getMercadoPagoStatusMessage(statusDetail, { testMode = false } = {}) {
    const code = String(statusDetail || "").trim();
    if (!code) {
        return "El pago no fue aprobado. Verifica los datos e intenta nuevamente.";
    }
    if (MP_STATUS_MESSAGES[code]) {
        return MP_STATUS_MESSAGES[code];
    }
    if (!code.startsWith("cc_") && !code.includes("_rejected")) {
        return code;
    }
    if (testMode && code.startsWith("cc_rejected")) {
        return `${MP_STATUS_MESSAGES.cc_rejected_other_reason} (código: ${code})`;
    }
    return `Pago rechazado (${code}). Verifica los datos o intenta con otra tarjeta.`;
}
