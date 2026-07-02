/**
 * ID del negocio activo del tenant — misma resolución en suscripción y APIs.
 */
export function resolveTenantBusinessId({ businessSelected, business } = {}) {
    return (
        businessSelected?.userBusinessBusinessId ??
        business?.businessId ??
        businessSelected?.businessId ??
        (typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem("appsfly_business_id")
            : null) ??
        null
    );
}
