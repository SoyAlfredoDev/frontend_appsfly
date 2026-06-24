/**
 * Datos de marca para el comprobante PDF a partir del negocio (General DB).
 * Acepta el objeto Business completo o el payload serializado de settings.
 */
function normalizeBusinessSource(business) {
    if (!business) return null;

    return {
        businessName: business.businessName,
        businessDocumentType: business.businessDocumentType,
        businessDocumentNumber: business.businessDocumentNumber,
        businessEmail: business.businessEmail,
        businessPhoneNumber: business.businessPhoneNumber,
        businessCodePhoneNumber: business.businessCodePhoneNumber,
        businessCountry: business.businessCountry,
        businessReceiptLogoUrl: business.businessReceiptLogoUrl ?? business.receiptLogoUrl ?? null,
        businessReceiptAddress: business.businessReceiptAddress ?? business.receiptAddress ?? null,
        businessReceiptPhone: business.businessReceiptPhone ?? business.receiptPhone ?? null,
        businessReceiptEmail: business.businessReceiptEmail ?? business.receiptEmail ?? null,
        businessReceiptSocial: business.businessReceiptSocial ?? business.receiptSocial ?? null,
        businessReceiptFooterNote: business.businessReceiptFooterNote ?? business.receiptFooterNote ?? null,
    };
}

export function getReceiptBranding(business) {
    const source = normalizeBusinessSource(business);
    if (!source) {
        return {
            displayName: "",
            documentLabel: "RUT",
            documentNumber: "",
            logoUrl: null,
            address: "",
            phone: "",
            email: "",
            social: "",
            footerNote: "",
        };
    }

    const code = source.businessCodePhoneNumber?.trim() ?? "";
    const phoneRaw =
        source.businessReceiptPhone?.trim()
        || source.businessPhoneNumber?.trim()
        || "";
    const phone = phoneRaw
        ? `${code && !phoneRaw.startsWith("+") ? `${code} ` : ""}${phoneRaw}`.trim()
        : "";

    return {
        displayName: source.businessName?.trim() ?? "",
        documentLabel:
            source.businessDocumentType?.trim()?.toUpperCase() === "RUT"
                ? "RUT"
                : (source.businessDocumentType?.trim() || "Documento"),
        documentNumber: source.businessDocumentNumber?.trim() ?? "",
        logoUrl: source.businessReceiptLogoUrl?.trim() || null,
        address:
            source.businessReceiptAddress?.trim()
            || source.businessCountry?.trim()
            || "",
        phone,
        email:
            source.businessReceiptEmail?.trim()
            || source.businessEmail?.trim()
            || "",
        social: source.businessReceiptSocial?.trim() ?? "",
        footerNote: source.businessReceiptFooterNote?.trim() ?? "",
    };
}

export function isCreditSalesEnabled(business) {
    return Boolean(business?.businessAllowCreditSales);
}

export function isDeliveryControlEnabled(business) {
    return Boolean(business?.businessDeliveryControlEnabled);
}
