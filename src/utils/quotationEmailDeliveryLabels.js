export const QUOTATION_EMAIL_DELIVERY_STYLES = {
    PENDING: "bg-slate-50 text-slate-600 border-slate-200",
    SENT: "bg-amber-50 text-amber-700 border-amber-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    BOUNCED: "bg-red-50 text-red-700 border-red-200",
};

export const QUOTATION_EMAIL_DELIVERY_LABELS = {
    PENDING: "Pendiente de envío",
    SENT: "Enviado — aún no recibido",
    DELIVERED: "Recibido por el cliente",
    FAILED: "No recibido (error de envío)",
    BOUNCED: "No recibido (rebotado)",
};

export function getQuotationEmailDeliveryLabel(status, { openedAt } = {}) {
    if (!status) return "Sin envío por correo";
    if (status === "DELIVERED" && openedAt) {
        return "Recibido y abierto";
    }
    return QUOTATION_EMAIL_DELIVERY_LABELS[status] ?? status;
}

export function getQuotationEmailDeliveryStyle(status) {
    if (!status) return "bg-gray-50 text-gray-500 border-gray-200";
    return QUOTATION_EMAIL_DELIVERY_STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

export function hasQuotationEmailBeenSent(status) {
    return Boolean(status);
}

export function hasQuotationEmailBeenReceived(status) {
    return status === "DELIVERED";
}
