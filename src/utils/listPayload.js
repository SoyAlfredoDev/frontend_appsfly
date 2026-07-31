/**
 * Normaliza respuestas de listados:
 * - Array legacy → { rows, pagination: null }
 * - { rows, pagination } → igual
 */
export function unwrapListPayload(data) {
    if (Array.isArray(data)) {
        return { rows: data, pagination: null };
    }
    if (data && Array.isArray(data.rows)) {
        return {
            rows: data.rows,
            pagination: data.pagination ?? null,
        };
    }
    return { rows: [], pagination: null };
}
