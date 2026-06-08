import axios from "./axios.js";

export const getInventorySummary = (config) =>
    axios.get("/inventory/summary", config);

export const getInventoryStock = (params, config) =>
    axios.get("/inventory/stock", { params, ...config });

export const getInventoryMovements = (params, config) =>
    axios.get("/inventory/movements", { params, ...config });

export const createInventoryAdjustment = (data) =>
    axios.post("/inventory/adjustments", data);
