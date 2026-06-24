const STATUS_STYLES = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    SENT: "bg-blue-100 text-blue-800 border-blue-200",
    ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
    ERROR: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS = {
    PENDING: "Pendiente",
    SENT: "Enviado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
    ERROR: "Error",
};

export default function TaxDocumentStatusBadge({ status }) {
    const key = status ?? "PENDING";
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                STATUS_STYLES[key] ?? STATUS_STYLES.PENDING
            }`}
        >
            {STATUS_LABELS[key] ?? key}
        </span>
    );
}
