import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { shouldBlockTenantOperations } from "../utils/subscriptionAccess.js";

/**
 * Estado centralizado del bloqueo operativo del tenant.
 * Usar en layout, sidebar o vistas que necesiten saber si la membresía restringe el acceso.
 */
export default function useTenantSubscriptionBlock() {
    const location = useLocation();
    const {
        loadingAuth,
        tenantAccessReady,
        hasBusiness,
        hasActiveSubscription,
        isSuperAdmin,
        subscriptionAccess,
    } = useAuth();

    const blocked = useMemo(
        () =>
            shouldBlockTenantOperations({
                hasBusiness,
                hasActiveSubscription,
                pathname: location.pathname,
            }),
        [hasBusiness, hasActiveSubscription, location.pathname],
    );

    const subscriptionLocked = useMemo(
        () => hasBusiness && !hasActiveSubscription,
        [hasBusiness, hasActiveSubscription],
    );

    return {
        loadingAuth,
        tenantAccessReady,
        blocked,
        subscriptionLocked,
        subscriptionAccess,
        isFirstTimeSubscriber: subscriptionAccess === "none",
        isExpiredSubscriber: subscriptionAccess === "expired",
        hasBusiness,
        hasActiveSubscription,
        isSuperAdmin,
        pathname: location.pathname,
    };
}
