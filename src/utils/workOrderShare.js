import { buildWhatsAppUrl } from "./providerContact.js";

export function buildWorkOrderReadyWhatsAppMessage({
    customerName,
    businessName,
    workOrderNumber,
    saleNumber,
    productName,
}) {
    const greeting = customerName?.trim() ? `Hola ${customerName.trim()},` : "Hola,";
    const biz = businessName?.trim() || "nuestra óptica";
    const ot = workOrderNumber ? ` OT #${workOrderNumber}` : "";
    const saleLine = saleNumber ? `\nVenta: #${saleNumber}` : "";
    const productLine = productName?.trim() ? `\nProducto: ${productName.trim()}` : "";

    return `${greeting}

${biz} le informa que su pedido${ot} está listo para retiro.${saleLine}${productLine}

Puede pasar a retirarlo en nuestro local. ¡Lo esperamos!`;
}

export function buildWorkOrderReadyWhatsAppShareUrl({
    customerCodePhoneNumber,
    customerPhoneNumber,
    message,
}) {
    const baseUrl = buildWhatsAppUrl(customerCodePhoneNumber, customerPhoneNumber);
    if (!baseUrl || !message?.trim()) return null;
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
}
