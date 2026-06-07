/**
 * Reglas de acceso operativo por membresía del tenant.
 * Una suscripción es válida solo si status === ACTIVE y subscriptionEndDate > ahora.
 */

/** Plan promocional único para negocios sin historial de suscripción */
export const FREE_TRIAL_PLAN_ID = "P001";

export function isSubscriptionRecordActive(sub) {
    if (!sub || !["ACTIVE", "CANCELLED"].includes(sub.subscriptionStatus)) return false;
    const end = new Date(sub.subscriptionEndDate);
    return !isNaN(end) && end > new Date();
}

/** @returns {'active' | 'expired' | 'none'} */
export function getSubscriptionAccessState(subscriptions) {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    if (list.length === 0) return "none";
    if (list.some(isSubscriptionRecordActive)) return "active";
    return "expired";
}

export function hasActiveSubscription(subscriptions) {
    return getSubscriptionAccessState(subscriptions) === "active";
}

/** Escenario A: negocio sin ningún registro previo de suscripción */
export function isFirstTimeSubscriber(subscriptions) {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    return list.length === 0;
}

/** Escenario B: ya tuvo al menos una suscripción y ninguna está vigente */
export function isExpiredSubscriber(subscriptions) {
    return getSubscriptionAccessState(subscriptions) === "expired";
}

export function hasSubscriptionHistory(subscriptions) {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    return list.length > 0;
}

export function canClaimFreeTrial(subscriptions) {
    return isFirstTimeSubscriber(subscriptions);
}

export function getLatestSubscription(subscriptions) {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    if (!list.length) return null;
    return [...list].sort(
        (a, b) => new Date(b.subscriptionEndDate ?? 0) - new Date(a.subscriptionEndDate ?? 0),
    )[0];
}

/**
 * Rutas permitidas sin membresía vigente.
 * Con negocio asociado: únicamente /profile.
 * Sin negocio: registro de empresa habilitado.
 */

export function isProfilePath(pathname) {
    return pathname === "/profile" || pathname.startsWith("/profile/");
}

export function isBusinessRegisterPath(pathname) {
    return pathname === "/business/register" || pathname.startsWith("/business/register/");
}

export function isSubscriptionPaymentReturnPath(pathname) {
    return pathname === "/subscription/payment/return"
        || pathname.startsWith("/subscription/payment/return");
}

export function isSubscriptionExemptPath(pathname, { hasBusiness = false } = {}) {
    if (isProfilePath(pathname)) return true;
    if (isSubscriptionPaymentReturnPath(pathname)) return true;
    if (!hasBusiness && isBusinessRegisterPath(pathname)) return true;
    return false;
}

export function isOperationalTenantPath(pathname) {
    if (isProfilePath(pathname)) return false;
    if (isBusinessRegisterPath(pathname)) return false;
    return true;
}

export function shouldBlockTenantOperations({
    hasBusiness,
    hasActiveSubscription,
    pathname,
}) {
    if (!hasBusiness) return false;
    if (hasActiveSubscription) return false;
    return !isSubscriptionExemptPath(pathname, { hasBusiness });
}

export function isTenantSubscriptionBlocked(auth) {
    return shouldBlockTenantOperations({
        hasBusiness: auth.hasBusiness,
        hasActiveSubscription: auth.hasActiveSubscription,
        pathname: auth.pathname ?? "",
    });
}
