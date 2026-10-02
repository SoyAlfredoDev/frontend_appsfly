import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import useTenantSubscriptionBlock from "../hooks/useTenantSubscriptionBlock.js";
import SubscriptionWelcomePage from "../pages/dashboard/SubscriptionWelcomePage.jsx";
import SubscriptionExpiredPage from "../pages/dashboard/SubscriptionExpiredPage.jsx";
import { PageDataSkeleton } from "./ui/DataSkeleton.tsx";

/**
 * Puerta de contenido del tenant: bifurca bloqueo según historial de suscripción.
 * - none  → Escenario A: bienvenida + trial P001
 * - expired → Escenario B: cuenta suspendida + plan de pago
 * Única exención con negocio: /profile
 */
export default function TenantContentGate() {
    const { loadingAuth, tenantAccessReady, blocked, subscriptionAccess, refreshSubscriptions } =
        useTenantSubscriptionBlock();

    const isFirstTime = subscriptionAccess === "none";

    useEffect(() => {
        if (!blocked) return undefined;

        const media = window.matchMedia("(min-width: 768px)");
        const syncOverflow = () => {
            const lock = media.matches;
            document.documentElement.classList.toggle("overflow-hidden", lock);
            document.body.classList.toggle("overflow-hidden", lock);
        };

        syncOverflow();
        media.addEventListener("change", syncOverflow);
        return () => {
            media.removeEventListener("change", syncOverflow);
            document.documentElement.classList.remove("overflow-hidden");
            document.body.classList.remove("overflow-hidden");
        };
    }, [blocked]);

    if (loadingAuth || !tenantAccessReady) {
        return <PageDataSkeleton label="Verificando acceso" />;
    }

    if (subscriptionAccess === "error") {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
                <h1 className="text-xl font-semibold text-slate-900">No se pudo verificar tu suscripción</h1>
                <p className="max-w-md text-sm text-slate-600">Intenta nuevamente. Tus datos y tu beneficio de prueba no han cambiado.</p>
                <button type="button" className="btn-primary" onClick={() => refreshSubscriptions()}>Reintentar</button>
            </div>
        );
    }

    if (blocked) {
        return (
            <div className="h-[calc(100dvh-3.5rem)] md:h-[100dvh] overflow-y-auto md:overflow-hidden">
                {isFirstTime ? (
                    <SubscriptionWelcomePage fullScreen />
                ) : (
                    <SubscriptionExpiredPage fullScreen />
                )}
            </div>
        );
    }

    return <Outlet />;
}
