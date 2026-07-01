import { buildWhatsAppUrl } from "./providerContact.js";

function formatClp(amount) {
    const value = Number(amount) || 0;
    return value.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
}

export function buildSaleWhatsAppMessage({
    customerName,
    businessName,
    saleNumber,
    saleDate,
    documentLabel = "Comprobante de venta",
    total,
    itemCount = 0,
    publicUrl,
}) {
    const greeting = customerName?.trim() ? `Hola ${customerName.trim()},` : "Hola,";
    const biz = businessName?.trim() || "nuestra empresa";
    const number = saleNumber ? ` #${saleNumber}` : "";
    const doc = documentLabel?.trim() || "Comprobante de venta";
    const dateLine = saleDate ? `\nFecha: ${saleDate}` : "";
    const itemsLine = itemCount > 0 ? `\nÍtems: ${itemCount}` : "";
    const linkLine = publicUrl?.trim()
        ? `\n\nPuede ver y descargar su comprobante aquí:\n${publicUrl.trim()}`
        : "";

    return `${greeting}

${biz} le comparte su ${doc.toLowerCase()}${number}.
Total: ${formatClp(total)}${dateLine}${itemsLine}${linkLine}

Quedamos atentos a sus consultas.`;
}

export function buildSaleWhatsAppShareUrl({
    customerCodePhoneNumber,
    customerPhoneNumber,
    message,
}) {
    const baseUrl = buildWhatsAppUrl(customerCodePhoneNumber, customerPhoneNumber);
    if (!baseUrl || !message?.trim()) return null;
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
}

export function mapPublicReceiptForPdf(receipt) {
    if (!receipt) return { sale: {}, tableProductAndService: [], business: {}, customerName: "" };

    const sale = {
        saleNumber: receipt.saleNumber,
        createdAt: receipt.saleDate,
        saleTotal: receipt.total,
        salePendingAmount: receipt.pendingAmount,
        saleComment: receipt.saleComment,
    };

    const tableProductAndService = (receipt.items ?? []).map((item, index) => ({
        saleDetailId: `public-${index}`,
        saleDetailType: item.type === "SERVICE" ? "SERVICE" : "PRODUCT",
        saleDetailQuantity: item.quantity,
        saleDetailPrice: item.unitPrice,
        saleDetailTotal: item.lineTotal,
        product: item.type !== "SERVICE" ? { productName: item.name, productSKU: item.sku } : undefined,
        service: item.type === "SERVICE" ? { serviceName: item.name, serviceSKU: item.sku } : undefined,
    }));

    const business = {
        businessName: receipt.business?.name,
        businessReceiptLogoUrl: receipt.business?.logoUrl,
        businessReceiptEmail: receipt.business?.email,
        businessReceiptPhone: receipt.business?.phone,
        businessReceiptAddress: receipt.business?.address,
        businessDocumentType: receipt.business?.document?.includes(":") ? "RUT" : null,
        businessDocumentNumber: receipt.business?.document?.split(":").pop()?.trim(),
        businessReceiptFooterNote: receipt.business?.footerNote,
    };

    return {
        sale,
        tableProductAndService,
        business,
        customerName: receipt.customerName,
    };
}
