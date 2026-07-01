import { buildWhatsAppUrl } from "./providerContact.js";

function formatClp(amount) {
    const value = Number(amount) || 0;
    return value.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
}

export function buildQuotationWhatsAppMessage({
    customerName,
    businessName,
    quotationNumber,
    quotationDate,
    total,
    itemCount = 0,
}) {
    const greeting = customerName?.trim() ? `Hola ${customerName.trim()},` : "Hola,";
    const biz = businessName?.trim() || "nuestra empresa";
    const number = quotationNumber ? ` #${quotationNumber}` : "";
    const dateLine = quotationDate ? `\nFecha: ${quotationDate}` : "";
    const itemsLine = itemCount > 0 ? `\nÍtems: ${itemCount}` : "";

    return `${greeting}

${biz} le comparte su cotización${number}.
Total: ${formatClp(total)}${dateLine}${itemsLine}

Quedamos atentos a sus consultas o para confirmar la cotización.`;
}

export function buildQuotationWhatsAppShareUrl({
    customerCodePhoneNumber,
    customerPhoneNumber,
    message,
}) {
    const baseUrl = buildWhatsAppUrl(customerCodePhoneNumber, customerPhoneNumber);
    if (!baseUrl || !message?.trim()) return null;
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
}
