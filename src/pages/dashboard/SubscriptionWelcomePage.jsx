import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRocket, FaUserCircle, FaGift, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/authContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Subscription from "../../components/Subscriptions.jsx";
import RestrictedAccessShell from "../../components/layout/RestrictedAccessShell.jsx";
import { usePromoFreeTrialSubscription } from "../../hooks/mercadopago/index.js";
import { FREE_TRIAL_PLAN_ID } from "../../utils/subscriptionAccess.js";
import { getMercadoPagoStatusMessage } from "../../config/mercadopago/mpStatusMessages.js";
import { isMercadoPagoTestMode } from "../../config/mercadopago/mpConfig.js";

/**
 * Escenario A: negocio nuevo sin historial de suscripción.
 * Oferta promocional P001 — 2 meses gratis.
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
            toast.error("Error al activar la prueba gratuita", message);
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

    const handleActivate = useCallback(() => {
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

    const activateDisabled = loading || !canClaimFreeTrial || !activeBusinessId;

    return (
        <RestrictedAccessShell
            icon={FaRocket}
            title="¡Bienvenido a AppsFly!"
            subtitle="Activa tu prueba gratuita de 2 meses y desbloquea todas las herramientas."
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
                        califica para la promoción de lanzamiento. Activa el Plan Básico sin costo por 2
                        meses. Mientras tanto, solo{" "}
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
                    <Subscription
                        embedded
                        compact
                        offerType="trial"
                        onActivateTrial={handleActivate}
                        activateTrialLoading={loading}
                        activateTrialDisabled={activateDisabled}
                    />
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-2 pt-0.5">
                    <button
                        type="button"
                        onClick={handleActivate}
                        disabled={activateDisabled}
                        className="btn-primary flex-1 justify-center !py-2.5 !text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="text-sm animate-spin" />
                                Activando…
                            </>
                        ) : (
                            <>
                                <FaGift className="text-sm" />
                                Activar 2 meses gratis
                            </>
                        )}
                    </button>
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
