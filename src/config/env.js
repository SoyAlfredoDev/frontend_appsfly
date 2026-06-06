const appEnv = import.meta.env.VITE_APP_ENV ?? (import.meta.env.DEV ? "development" : "production");

const isDevelopment = appEnv === "development";
const isProduction = appEnv === "production";

const config = {
    appEnv,
    isDevelopment,
    isProduction,
    // En desarrollo usamos el proxy de Vite (/api → localhost:3000) para evitar CORS.
    apiUrl: isDevelopment ? "/api" : import.meta.env.VITE_API_URL,
    frontendUrl: import.meta.env.VITE_FRONTEND_URL ?? "",
};

if (isDevelopment && !import.meta.env.VITE_APP_ENV) {
    console.warn("[AppsFly] VITE_APP_ENV no definido; usando 'development'.");
}

if (isProduction && !import.meta.env.VITE_API_URL) {
    console.error("[AppsFly] VITE_API_URL es obligatorio en producción.");
}

export default config;
