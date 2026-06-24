/**
 * Datos de marca para el comprobante PDF a partir del negocio (General DB).
 */
export function getReceiptBranding(business) {
    if (!business) {
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

    const code = business.businessCodePhoneNumber?.trim() ?? "";
    const phoneRaw =
        business.businessReceiptPhone?.trim()
        || business.businessPhoneNumber?.trim()
        || "";
    const phone = phoneRaw
        ? `${code && !phoneRaw.startsWith("+") ? `${code} ` : ""}${phoneRaw}`.trim()
        : "";

    return {
        displayName: business.businessName?.trim() ?? "",
        documentLabel:
            business.businessDocumentType?.trim()?.toUpperCase() === "RUT"
                ? "RUT"
                : (business.businessDocumentType?.trim() || "Documento"),
        documentNumber: business.businessDocumentNumber?.trim() ?? "",
        logoUrl: business.businessReceiptLogoUrl ?? null,
        address:
            business.businessReceiptAddress?.trim()
            || business.businessCountry?.trim()
            || "",
        phone,
        email:
            business.businessReceiptEmail?.trim()
            || business.businessEmail?.trim()
            || "",
        social: business.businessReceiptSocial?.trim() ?? "",
        footerNote: business.businessReceiptFooterNote?.trim() ?? "",
    };
}

export function isCreditSalesEnabled(business) {
    return Boolean(business?.businessAllowCreditSales);
}

export function isDeliveryControlEnabled(business) {
    return Boolean(business?.businessDeliveryControlEnabled);
}
