/** Debe coincidir con backend/config/subscriptionCancel.js */
export const SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE = "SÍ, ELIMINAR";

export function normalizeCancelConfirmation(value) {
    return String(value ?? "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function isCancelConfirmationValid(value) {
    return normalizeCancelConfirmation(value)
        === normalizeCancelConfirmation(SUBSCRIPTION_CANCEL_CONFIRMATION_PHRASE);
}
