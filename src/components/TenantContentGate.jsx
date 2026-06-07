import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useTenantSubscriptionBlock from "../hooks/useTenantSubscriptionBlock.js";
import SubscriptionWelcomePage from "../pages/dashboard/SubscriptionWelcomePage.jsx";
import SubscriptionExpiredPage from "../pages/dashboard/SubscriptionExpiredPage.jsx";

/**
 * Puerta de contenido del tenant: bifurca bloqueo según historial de suscripción.
 * - none  → Escenario A: bienvenida + trial P001
 * - expired → Escenario B: cuenta suspendida + plan de pago
 * Única exención con negocio: /profile
 */
export default function TenantContentGate() {
    const location = useLocation();
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
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="inline-flex items-center gap-3 text-sm text-slate-500">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Verificando acceso…
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {blocked ? (
                <motion.div
                    key={isFirstTime ? "subscription-welcome" : "subscription-expired"}
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="h-[calc(100dvh-3.5rem)] md:h-[100dvh] overflow-y-auto md:overflow-hidden"
                >
                    {isFirstTime ? (
                        <SubscriptionWelcomePage fullScreen />
                    ) : (
                        <SubscriptionExpiredPage fullScreen />
                    )}
                </motion.div>
            ) : (
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    <Outlet />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
