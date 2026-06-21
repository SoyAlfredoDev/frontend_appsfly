/**
 * Cuándo un administrador puede iniciar pago / renovación manual desde el perfil.
 */
export function canAdminPayNextSubscription(billing) {
    const sub = billing?.subscription;

    if (!billing?.hasSubscription || !sub) return true;

    if (sub.isPromoFreeTrial) return true;

    if (!sub.accessStillValid) return true;

    if (sub.isPaidCommercial && !sub.autoRenewEnabled) return true;

    return false;
}

export function getSubscriptionPayActionLabel(billing) {
    const sub = billing?.subscription;

    if (!billing?.hasSubscription || !sub) {
        return "Contratar plan comercial";
    }
    if (sub.isPromoFreeTrial) {
        return "Contratar plan de pago";
    }
    if (!sub.accessStillValid) {
        return "Renovar suscripción";
    }
    if (sub.isPaidCommercial && !sub.autoRenewEnabled) {
        return "Reactivar suscripción mensual";
    }
    return "Pagar siguiente periodo";
}
