import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRocket, FaUserCircle, FaGift } from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import SubscriptionPlanPicker from "../../components/subscription/SubscriptionPlanPicker.jsx";
import RestrictedAccessShell from "../../components/layout/RestrictedAccessShell.jsx";
import { usePromoFreeTrialSubscription } from "../../hooks/mercadopago/index.js";
import { FREE_TRIAL_PLAN_ID } from "../../utils/subscriptionAccess.js";
import { getMercadoPagoStatusMessage } from "../../config/mercadopago/mpStatusMessages.js";
import { isMercadoPagoTestMode } from "../../config/mercadopago/mpConfig.js";

/**
 * Escenario A: negocio nuevo sin historial de suscripción.
 * P001 trial + P002 comercial + P003 profesional disponibles.
 */
export default function SubscriptionWelcomePage({ embedded = false, fullScreen = false }) {
    const {
        user,
        business,
        hasBusiness,
        activeBusinessId,
        canClaimFreeTrial,
        refreshSubscriptions,
        reloadTenantContext,
    } = useAuth();
    const toast = useToast();

    useEffect(() => {
        if (user?.userId && hasBusiness && !activeBusinessId) {
            reloadTenantContext(user.userId);
        }
    }, [user?.userId, hasBusiness, activeBusinessId, reloadTenantContext]);

    const handlePaymentError = useCallback(
        (error) => {
            const statusDetail = error.statusDetail || error.message;
            const fromApi =
                error.response?.data?.message ??
                error.response?.data?.error;
            const message =
                fromApi && !String(fromApi).startsWith("cc_")
                    ? fromApi
                    : getMercadoPagoStatusMessage(statusDetail, {
                          testMode: isMercadoPagoTestMode(),
                      });
            toast.error("Error al activar la suscripción", message);
        },
        [toast],
    );

    const handlePromoSuccess = useCallback(() => {
        toast.success(
            "Prueba activada",
            "Tu trial de 2 meses está activo. Revisa tu correo — te enviamos la bienvenida con los detalles.",
        );
    }, [toast]);

    const { loading, activateFreeTrial } = usePromoFreeTrialSubscription({
        refreshSubscriptions,
        onSuccess: handlePromoSuccess,
        onError: handlePaymentError,
    });

    const handleActivateTrial = useCallback(() => {
        if (loading) return;

        if (!activeBusinessId) {
            toast.error(
                "Negocio no listo",
                "Espera un momento y vuelve a intentar. Si persiste, cierra sesión e ingresa de nuevo.",
            );
            return;
        }

        if (!canClaimFreeTrial) {
            toast.error(
                "Promoción no disponible",
                "Este negocio ya tiene historial de suscripción y no califica para la prueba gratuita.",
            );
            return;
        }

        activateFreeTrial({
            businessId: activeBusinessId,
            planId: FREE_TRIAL_PLAN_ID,
        }).catch(() => {});
    }, [
        loading,
        activeBusinessId,
        canClaimFreeTrial,
        activateFreeTrial,
        toast,
    ]);

    const activateTrialDisabled = loading || !canClaimFreeTrial || !activeBusinessId;

    return (
        <RestrictedAccessShell
            icon={FaRocket}
            title="¡Bienvenido a AppsFly!"
            subtitle="Elige tu plan: prueba gratis de 2 meses, comercial o profesional."
            headerClassName="bg-gradient-to-br from-[#021f41] via-[#0a2d52] to-[#01c676]/80"
            embedded={embedded}
            fullScreen={fullScreen}
            compact={fullScreen}
        >
            <div className="flex flex-col flex-1 min-h-0 gap-2.5">
                <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 flex gap-2">
                    <FaGift className="text-primary mt-0.5 shrink-0 text-xs" />
                    <p className="text-[11px] sm:text-xs text-slate-700 leading-snug">
                        Hola <span className="font-semibold">{user?.userFirstName}</span>,{" "}
                        <span className="font-semibold">{business?.businessName ?? "tu negocio"}</span>{" "}
                        puede activar la promoción de 2 meses gratis, contratar el plan comercial ($9.990 neto/mes)
                        o el plan profesional ($39.990 neto/mes). Al pagar se suma IVA (19%). Mientras tanto, solo{" "}
                        <Link to="/profile" className="text-secondary font-semibold no-underline">
                            Mi perfil
                        </Link>{" "}
                        está disponible.
                    </p>
                </div>

                <div
                    id="activar-plan"
                    className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/40"
                >
                    <SubscriptionPlanPicker
                        variant="welcome"
                        onActivateTrial={handleActivateTrial}
                        activateTrialLoading={loading}
                        activateTrialDisabled={activateTrialDisabled}
                    />
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-2 pt-0.5">
                    <Link
                        to="/profile"
                        className="btn-ghost flex-1 justify-center no-underline border-slate-200 !py-2.5 !text-sm"
                    >
                        <FaUserCircle className="text-sm" />
                        Ir a mi perfil
                    </Link>
                </div>
            </div>
        </RestrictedAccessShell>
    );
}
