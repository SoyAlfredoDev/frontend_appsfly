import { useEffect } from "react";

/**
 * Ejecuta un efecto con AbortSignal. Al desmontar o cambiar deps, aborta la petición
 * y evita setState sobre componentes desmontados (Strict Mode / navegación rápida).
 */
export function useAbortEffect(effect, deps = []) {
  useEffect(() => {
    const controller = new AbortController();
    effect(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Ignora actualizaciones si el componente ya se desmontó o abortó. */
export function isAbortError(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}
