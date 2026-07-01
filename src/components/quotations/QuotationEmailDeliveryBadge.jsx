import {
    getQuotationEmailDeliveryLabel,
    getQuotationEmailDeliveryStyle,
} from "../../utils/quotationEmailDeliveryLabels.js";

export default function QuotationEmailDeliveryBadge({
    status,
    openedAt = null,
    className = "",
}) {
    if (!status) return null;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getQuotationEmailDeliveryStyle(status)} ${className}`}
            title={getQuotationEmailDeliveryLabel(status, { openedAt })}
        >
            {getQuotationEmailDeliveryLabel(status, { openedAt })}
        </span>
    );
}
