import { WORK_ORDER_STATUS_LABELS } from "../../utils/workOrderStatus.js";

const STYLES = {
    CREATED: "bg-gray-50 text-gray-600 border-gray-200",
    PENDING_SHIPMENT: "bg-amber-50 text-amber-700 border-amber-200",
    SENT_TO_LAB: "bg-blue-50 text-blue-700 border-blue-200",
    RECEIVED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    QUALITY_CONTROL: "bg-purple-50 text-purple-700 border-purple-200",
    READY_FOR_DELIVERY: "bg-cyan-50 text-cyan-700 border-cyan-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function WorkOrderStatusBadge({ status, className = "" }) {
    if (!status) return null;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200"} ${className}`}
        >
            {WORK_ORDER_STATUS_LABELS[status] ?? status}
        </span>
    );
}
