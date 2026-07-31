import axios from "./axios.js";

export const getWorkOrders = ({ status, saleId, laboratoryId, customerId } = {}) =>
    axios.get("/work-orders", { params: { status, saleId, laboratoryId, customerId } });

export const getWorkOrdersBySaleId = (saleId) => axios.get(`/sales/${saleId}/work-orders`);

export const generateWorkOrders = ({ saleId, saleDetailIds, prescriptionId, laboratoryId, notes }) =>
    axios.post("/work-orders/generate", { saleId, saleDetailIds, prescriptionId, laboratoryId, notes });

export const getWorkOrderById = (id) => axios.get(`/work-orders/${id}`);

export const updateWorkOrder = (id, data) => axios.put(`/work-orders/${id}`, data);

export const updateWorkOrderStatus = (id, status) =>
    axios.patch(`/work-orders/${id}/status`, { status });

export const receiveWorkOrder = (id) => axios.patch(`/work-orders/${id}/receive`);

export const deleteWorkOrderById = (id) => axios.delete(`/work-orders/${id}`);
