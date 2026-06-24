const STYLES = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const LABELS = {
    PENDING: "Pendiente de entrega",
    DELIVERED: "Entregado",
};

export default function SaleDeliveryBadge({ status, className = "" }) {
    if (!status) return null;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200"} ${className}`}
        >
            {LABELS[status] ?? status}
        </span>
    );
}
