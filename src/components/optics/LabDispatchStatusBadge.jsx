import { LAB_DISPATCH_STATUS_LABELS } from "../../utils/workOrderStatus.js";

const STYLES = {
    SENT: "bg-blue-50 text-blue-700 border-blue-200",
    PARTIAL_RECEIVED: "bg-amber-50 text-amber-700 border-amber-200",
    RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function LabDispatchStatusBadge({ status, className = "" }) {
    if (!status) return null;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200"} ${className}`}
        >
            {LAB_DISPATCH_STATUS_LABELS[status] ?? status}
        </span>
    );
}
