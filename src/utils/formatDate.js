import {
    DEFAULT_BUSINESS_TIMEZONE,
    formatBusinessDate,
    resolveBusinessTimezone,
} from "./businessTime.js";

/**
 * Formatea fechas en la zona horaria del negocio (default Chile).
 * @param {string|Date} dateString
 * @param {string|{businessTimezone?: string}} [timeZoneOrBusiness]
 */
export default function formatDate(
    dateString,
    timeZoneOrBusiness = DEFAULT_BUSINESS_TIMEZONE,
) {
    return formatBusinessDate(dateString, resolveBusinessTimezone(timeZoneOrBusiness));
}
