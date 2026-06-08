import axios from "./axios.js";

export const getPurchases = (config) => axios.get("/purchases", config);

/** @deprecated Use getPurchases — mantiene compatibilidad */
export const getPurchaseRequests = getPurchases;

export const getPurchaseById = (id, config) =>
    axios.get(`/purchases/${id}`, config);

export const createPurchaseCompleteRequest = (purchaseData) =>
    axios.post("/purchases/complete", purchaseData);

export const updatePurchase = (id, data) =>
    axios.put(`/purchases/${id}`, data);

export const cancelPurchaseRequest = (id) =>
    axios.post(`/purchases/${id}/cancel`);
