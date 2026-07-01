const STYLES = {
    DRAFT: "bg-slate-50 text-slate-700 border-slate-200",
    SENT: "bg-blue-50 text-blue-700 border-blue-200",
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    EXPIRED: "bg-rose-50 text-rose-700 border-rose-200",
};

const LABELS = {
    DRAFT: "Borrador",
    SENT: "Enviado",
    ACCEPTED: "Aceptado",
    EXPIRED: "Expirado",
};

export default function QuotationStatusBadge({ status, className = "" }) {
    if (!status) return null;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200"} ${className}`}
        >
            {LABELS[status] ?? status}
        </span>
    );
}
