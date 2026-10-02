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
    const { loadingAuth, tenantAccessReady, blocked, subscriptionAccess } =
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
