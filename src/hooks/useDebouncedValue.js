import { useEffect, useState } from "react";

/**
 * Debounce de un valor (p. ej. texto de buscador) para reducir requests.
 * @param {any} value
 * @param {number} delayMs
 */
export default function useDebouncedValue(value, delayMs = 350) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(id);
    }, [value, delayMs]);

    return debounced;
}
