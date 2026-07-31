import axios from "./axios.js";

export const getPrescriptionsByCustomerId = (customerId) =>
    axios.get(`/customers/${customerId}/prescriptions`);

export const createPrescription = (customerId, data) =>
    axios.post(`/customers/${customerId}/prescriptions`, data);

export const getPrescriptionById = (prescriptionId) =>
    axios.get(`/prescriptions/${prescriptionId}`);

export const updatePrescription = (prescriptionId, data) =>
    axios.put(`/prescriptions/${prescriptionId}`, data);

export const deletePrescription = (prescriptionId) =>
    axios.delete(`/prescriptions/${prescriptionId}`);
