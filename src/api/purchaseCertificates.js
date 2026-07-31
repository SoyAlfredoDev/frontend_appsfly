import axios from "./axios.js";

export const getPurchaseCertificates = (params) =>
    axios.get("/purchase-certificates", { params });

export const getPurchaseCertificatesBySaleId = (saleId) =>
    axios.get(`/sales/${saleId}/purchase-certificates`);

export const getPurchaseCertificateById = (id) =>
    axios.get(`/purchase-certificates/${id}`);

export const createPurchaseCertificate = (data) =>
    axios.post("/purchase-certificates", data);

export const updatePurchaseCertificate = (id, data) =>
    axios.put(`/purchase-certificates/${id}`, data);

export const issuePurchaseCertificate = (id) =>
    axios.patch(`/purchase-certificates/${id}/issue`);

export const voidPurchaseCertificate = (id) =>
    axios.patch(`/purchase-certificates/${id}/void`);

export const deletePurchaseCertificate = (id) =>
    axios.delete(`/purchase-certificates/${id}`);
