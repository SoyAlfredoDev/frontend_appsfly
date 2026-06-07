import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { createSubscriptionRequest } from "../../api/subscription.js";
import { FREE_TRIAL_PLAN_ID } from "../../utils/subscriptionAccess.js";

/**
 * Hook para plan promocional $0 — NO carga SDK ni scripts de Mercado Pago.
 * Registra suscripción + pago PROMO_FREE_TRIAL en GeneralDB.
 */
export default function usePromoFreeTrialSubscription({ refreshSubscriptions, onSuccess, onError }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const activateFreeTrial = useCallback(
        async ({ businessId, planId = FREE_TRIAL_PLAN_ID }) => {
            if (planId !== FREE_TRIAL_PLAN_ID) {
                throw new Error("Este hook solo aplica al plan promocional gratuito.");
            }

            setLoading(true);
            try {
                const res = await createSubscriptionRequest({
                    subscriptionId: uuidv4(),
                    subscriptionBusinessId: businessId,
                    subscriptionPlanId: planId,
                });

                if (res.status === 201) {
                    await refreshSubscriptions?.(businessId);
                    onSuccess?.(res.data);
                    setTimeout(() => navigate("/dashboard"), 2000);
                    return res.data;
                }

                throw new Error(res.data?.message ?? "No se pudo activar la promoción.");
            } catch (err) {
                onError?.(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [refreshSubscriptions, onSuccess, onError, navigate],
    );

    return { loading, activateFreeTrial };
}
