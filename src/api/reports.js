import axios from "./axios.js";

/**
 * Consulta diferida: solo invocar tras confirmación explícita del usuario.
 * @param {string} type - monthly-sales | yearly-sales | inventory-movements | sales-by-seller
 * @param {Record<string, string|number>} params
 * @param {{ signal?: AbortSignal }} [config]
 */
export const generateReportRequest = (type, params = {}, config = {}) =>
    axios.get(`/reports/${type}`, { params, ...config });
