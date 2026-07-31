export const PURCHASE_CERTIFICATE_STATUS_LABELS = {
    DRAFT: "Borrador",
    ISSUED: "Emitido",
    VOID: "Anulado",
};

export const DEFAULT_CERTIFICATE_COMMENT =
    "Según receta médica presentada por el paciente.";

export function formatCertificateMoney(centsOrPesos) {
    const value = Number(centsOrPesos) || 0;
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(value);
}
