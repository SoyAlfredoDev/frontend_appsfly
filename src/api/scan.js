import axios from "./axios.js";

export const resolveScanCode = (code, config) =>
    axios.get("/scan/resolve", { ...config, params: { code, ...(config?.params || {}) } });

export const getProductCodes = (productId, config) =>
    axios.get(`/products/${productId}/codes`, config);

export const deleteScanCode = (scanCodeId) => axios.delete(`/scan/codes/${scanCodeId}`);
