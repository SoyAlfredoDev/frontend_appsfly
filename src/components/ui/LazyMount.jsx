import { useEffect, useRef, useState } from "react";

/**
 * Monta hijos solo tras el primer render (lazy de secciones/pestañas).
 * Una vez activado, permanece montado (conserva estado).
 */
export function LazyMount({ active, children, fallback = null }) {
    const [activated, setActivated] = useState(Boolean(active));
    const wasActive = useRef(Boolean(active));

    useEffect(() => {
        if (active && !wasActive.current) {
            setActivated(true);
        }
        wasActive.current = Boolean(active);
        if (active) setActivated(true);
    }, [active]);

    if (!activated) return fallback;
    return children;
}
