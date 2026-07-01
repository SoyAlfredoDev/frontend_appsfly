import { FaFileInvoice, FaReceipt, FaFileAlt, FaClipboardList } from "react-icons/fa";

export const DOCUMENT_TYPE = {
    RECEIPT: "RECEIPT",
    BOLETA: "BOLETA",
    FACTURA: "FACTURA",
    QUOTATION: "QUOTATION",
};

export const RECEIPT_SHORT_LABELS = {
    RECEIPT: "Comprobante de venta",
    BOLETA: "Boleta",
    FACTURA: "Factura",
    QUOTATION: "Cotización",
};

const OPTIONS = [
    {
        id: DOCUMENT_TYPE.RECEIPT,
        title: "Comprobante de venta",
        description: "Sin emisión al SII. PDF interno de la venta.",
        icon: FaReceipt,
        disabled: false,
    },
    {
        id: DOCUMENT_TYPE.BOLETA,
        title: "Boleta electrónica",
        description: "DTE tipo 39 vía Auth.cl.",
        icon: FaFileAlt,
        disabled: true,
    },
    {
        id: DOCUMENT_TYPE.FACTURA,
        title: "Factura electrónica",
        description: "DTE tipo 33. Requiere datos del receptor.",
        icon: FaFileInvoice,
        disabled: true,
    },
    {
        id: DOCUMENT_TYPE.QUOTATION,
        title: "Cotización",
        description: "Documento informativo sin registrar venta.",
        icon: FaClipboardList,
        disabled: false,
    },
];

export function isQuotationDocumentType(documentType) {
    return documentType === DOCUMENT_TYPE.QUOTATION;
}

export default function ReceiptTypeSelector({ value, onChange, disabled = false, variant = "default" }) {
    if (variant === "compact") {
        return (
            <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Tipo de comprobante">
                {OPTIONS.map((option) => {
                    const selected = value === option.id;
                    const isDisabled = disabled || option.disabled;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => !isDisabled && onChange(option.id)}
                            title={option.title}
                            role="radio"
                            aria-checked={selected}
                            className={`min-h-9 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold border transition-all touch-manipulation ${
                                isDisabled
                                    ? "opacity-45 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                                    : selected
                                      ? "border-primary bg-primary text-white shadow-sm"
                                      : "border-slate-200 bg-white text-slate-600 active:bg-slate-50"
                            }`}
                        >
                            {RECEIPT_SHORT_LABELS[option.id]}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-2 min-w-0">
            {OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = value === option.id;
                const isDisabled = disabled || option.disabled;
                return (
                    <button
                        key={option.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && onChange(option.id)}
                        className={`w-full min-w-0 text-left rounded-xl border p-3 transition-all ${
                            isDisabled
                                ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                                : selected
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                    >
                        <div className="flex items-start gap-2.5 min-w-0">
                            <div
                                className={`shrink-0 p-2 rounded-lg ${
                                    selected && !isDisabled
                                        ? "bg-primary/10 text-primary"
                                        : "bg-slate-100 text-slate-500"
                                }`}
                            >
                                <Icon className="text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800 break-words leading-snug">
                                    {option.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-snug break-words">
                                    {option.description}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
