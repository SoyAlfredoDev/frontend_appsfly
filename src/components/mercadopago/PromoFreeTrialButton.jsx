import { FaArrowRight, FaGift } from "react-icons/fa";
import { usePromoFreeTrialSubscription } from "../../hooks/mercadopago/index.js";
import { FREE_TRIAL_PLAN_ID } from "../../utils/subscriptionAccess.js";

/**
 * Activación plan promocional $0 — sin SDK ni scripts de Mercado Pago.
 */
export default function PromoFreeTrialButton({
    businessId,
    planId = FREE_TRIAL_PLAN_ID,
    disabled = false,
    refreshSubscriptions,
    onSuccess,
    onError,
}) {
    const { loading, activateFreeTrial } = usePromoFreeTrialSubscription({
        refreshSubscriptions,
        onSuccess,
        onError,
    });

    const handleClick = () => {
        if (loading || disabled) return;
        activateFreeTrial({ businessId, planId }).catch(() => {});
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading || disabled}
            className={`group w-full py-2 px-3 rounded-lg font-bold text-xs text-white shadow-md shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-1.5 ${
                loading || disabled
                    ? "bg-slate-100 cursor-not-allowed text-slate-400 shadow-none"
                    : "bg-primary hover:bg-primary-hover hover:-translate-y-0.5"
            }`}
        >
            {loading ? (
                "Activando promoción..."
            ) : (
                <>
                    <FaGift className="text-[11px]" />
                    Obtener 2 meses gratis
                    <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
                </>
            )}
        </button>
    );
}
