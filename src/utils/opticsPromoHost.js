/**
 * Host de la landing promocional de ópticas (subdominio).
 * En local / preview se usa la ruta /optica como fallback.
 */
export function isOpticsPromoHost(hostname = typeof window !== "undefined" ? window.location.hostname : "") {
    const host = String(hostname || "").toLowerCase().split(":")[0];
    return (
        host === "optica.appsfly.app" ||
        host === "optica.localhost" ||
        host === "optica.127.0.0.1"
    );
}

export const OPTICS_PROMO_REGISTER_TO = {
    pathname: "/register",
    search: "?source=optica",
};

export const OPTICS_PROMO_SITE_URL = "https://optica.appsfly.app";
