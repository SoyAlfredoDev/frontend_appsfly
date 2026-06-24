import axios from "./axios.js";

export const getTaxBillingDashboardRequest = (config) =>
    axios.get("/tax-documents/dashboard", config);

export const listTaxDocumentsRequest = (params, config) =>
    axios.get("/tax-documents", { params, ...config });

export const getTaxDocumentRequest = (id, config) =>
    axios.get(`/tax-documents/${id}`, config);

export const issueTaxDocumentRequest = (payload, config) =>
    axios.post("/tax-documents/issue", payload, config);

export const syncTaxDocumentStatusRequest = (id, config) =>
    axios.post(`/tax-documents/${id}/sync`, null, config);

export const retryTaxDocumentRequest = (id, config) =>
    axios.post(`/tax-documents/${id}/retry`, null, config);

export const getTaxConfigRequest = (config) =>
    axios.get("/tax-documents/config", config);

export const upsertTaxConfigRequest = (payload, config) =>
    axios.put("/tax-documents/config", payload, config);
