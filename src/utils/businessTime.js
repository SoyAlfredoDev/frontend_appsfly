/**
 * Zona horaria operativa del negocio (frontend).
 * Default Chile; usar business.businessTimezone cuando esté disponible.
 */

export const DEFAULT_BUSINESS_TIMEZONE = "America/Santiago";

export function resolveBusinessTimezone(timezoneOrBusiness) {
    if (!timezoneOrBusiness) return DEFAULT_BUSINESS_TIMEZONE;
    if (typeof timezoneOrBusiness === "string") {
        return timezoneOrBusiness.trim() || DEFAULT_BUSINESS_TIMEZONE;
    }
    return (
        timezoneOrBusiness.businessTimezone?.trim() ||
        DEFAULT_BUSINESS_TIMEZONE
    );
}

function isUtcMidnight(date) {
    return (
        date.getUTCHours() === 0 &&
        date.getUTCMinutes() === 0 &&
        date.getUTCSeconds() === 0 &&
        date.getUTCMilliseconds() === 0
    );
}

/** YYYY-MM-DD en TZ del negocio (compat: medianoche UTC exacta = date-only legacy). */
export function toBusinessDateKey(value, timeZone = DEFAULT_BUSINESS_TIMEZONE) {
    if (value == null || value === "") return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        return value.trim();
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    if (isUtcMidnight(date)) {
        return date.toISOString().slice(0, 10);
    }
    return date.toLocaleDateString("en-CA", {
        timeZone: resolveBusinessTimezone(timeZone),
    });
}

export function getTodayBusinessDate(timeZone = DEFAULT_BUSINESS_TIMEZONE) {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: resolveBusinessTimezone(timeZone),
    });
}

/** Valor para <input type="date"> sin usar toISOString() (UTC). */
export function toDateInputValue(value, timeZone = DEFAULT_BUSINESS_TIMEZONE) {
    return toBusinessDateKey(value, timeZone);
}

export function formatBusinessDate(
    value,
    timeZone = DEFAULT_BUSINESS_TIMEZONE,
    options = {},
) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        const [y, m, d] = value.trim().split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es-CL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            ...options,
        });
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    if (isUtcMidnight(date)) {
        const key = date.toISOString().slice(0, 10);
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es-CL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            ...options,
        });
    }

    return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: resolveBusinessTimezone(timeZone),
        ...options,
    });
}

export function formatBusinessDateTime(
    value,
    timeZone = DEFAULT_BUSINESS_TIMEZONE,
) {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("es-CL", {
        timeZone: resolveBusinessTimezone(timeZone),
    });
}

export function getBusinessMonthKey(timeZone = DEFAULT_BUSINESS_TIMEZONE) {
    return getTodayBusinessDate(timeZone).slice(0, 7);
}
