const appEnv = import.meta.env.VITE_APP_ENV ?? (import.meta.env.DEV ? "development" : "production");

const isDevelopment = appEnv === "development";
const isProduction = appEnv === "production";

const PRODUCTION_API_FALLBACK = "https://backend-appsfly.vercel.app/api";
const DEPRECATED_API_HOST = "api.appsfly.app";

function resolveProductionApiUrl() {
    const configured = import.meta.env.VITE_API_URL?.trim();
    if (!configured) return PRODUCTION_API_FALLBACK;

    try {
        const hostname = new URL(configured).hostname;
        // Dominio custom desvinculado en Vercel (DEPLOYMENT_NOT_FOUND).
        if (hostname === DEPRECATED_API_HOST) {
            return PRODUCTION_API_FALLBACK;
        }
    } catch {
        return PRODUCTION_API_FALLBACK;
    }

    return configured;
}

const config = {
    appEnv,
    isDevelopment,
    isProduction,
    // En desarrollo usamos el proxy de Vite (/api → localhost:3000) para evitar CORS.
    apiUrl: isDevelopment ? "/api" : resolveProductionApiUrl(),
    frontendUrl: import.meta.env.VITE_FRONTEND_URL ?? "",
};

if (isDevelopment && !import.meta.env.VITE_APP_ENV) {
    console.warn("[AppsFly] VITE_APP_ENV no definido; usando 'development'.");
}

if (isProduction && !import.meta.env.VITE_API_URL) {
    console.warn(
        "[AppsFly] VITE_API_URL no definido; usando fallback",
        PRODUCTION_API_FALLBACK,
    );
}

export default config;
