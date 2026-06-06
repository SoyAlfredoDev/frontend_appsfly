import config from "../config/env.js";

export const ApiErrorType = {
    NETWORK: "network",
    SERVER: "server",
    CREDENTIALS: "credentials",
    CLIENT: "client",
    UNKNOWN: "unknown",
};

export function classifyApiError(error) {
    if (!error?.response) {
        return ApiErrorType.NETWORK;
    }

    const status = error.response.status;

    if (status === 400) {
        return ApiErrorType.CREDENTIALS;
    }

    if (status >= 500) {
        return ApiErrorType.SERVER;
    }

    if (status >= 400) {
        return ApiErrorType.CLIENT;
    }

    return ApiErrorType.UNKNOWN;
}

export function getLoginErrorMessage(error) {
    const type = classifyApiError(error);

    switch (type) {
        case ApiErrorType.CREDENTIALS:
            return "Credenciales incorrectas. Por favor verifica tu correo y contraseña.";
        case ApiErrorType.SERVER:
        case ApiErrorType.NETWORK:
            return config.isDevelopment
                ? "No se pudo conectar con el servidor. Verifica que el backend esté activo en el puerto 3000."
                : "Disculpe, en este momento tenemos un inconveniente. Por favor intente más tarde.";
        case ApiErrorType.CLIENT:
            return "Error al iniciar sesión. Intenta nuevamente.";
        default:
            return "Error al iniciar sesión. Intenta nuevamente.";
    }
}

export function isServerUnavailableError(error) {
    const type = classifyApiError(error);
    return type === ApiErrorType.NETWORK || type === ApiErrorType.SERVER;
}
