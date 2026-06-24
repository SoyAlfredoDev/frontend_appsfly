import { FaFileInvoice, FaReceipt, FaFileAlt } from "react-icons/fa";

const OPTIONS = [
    {
        id: "RECEIPT",
        title: "Comprobante interno",
        description: "Sin emisión al SII. PDF interno de la venta.",
        icon: FaReceipt,
    },
    {
        id: "BOLETA",
        title: "Boleta electrónica",
        description: "DTE tipo 39 vía Auth.cl.",
        icon: FaFileAlt,
    },
    {
        id: "FACTURA",
        title: "Factura electrónica",
        description: "DTE tipo 33. Requiere datos del receptor.",
        icon: FaFileInvoice,
    },
];

export default function ReceiptTypeSelector({ value, onChange, disabled = false }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = value === option.id;
                return (
                    <button
                        key={option.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(option.id)}
                        className={`text-left rounded-xl border p-4 transition-all ${
                            selected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`p-2 rounded-lg ${
                                    selected
                                        ? "bg-primary/10 text-primary"
                                        : "bg-slate-100 text-slate-500"
                                }`}
                            >
                                <Icon />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {option.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 leading-snug">
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
