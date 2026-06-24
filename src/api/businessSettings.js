import axios from "./axios.js";

export const getBusinessSettingsRequest = (businessId) =>
    axios.get(`/business/${businessId}/settings`);

export const updateBusinessSettingsRequest = (businessId, data) =>
    axios.put(`/business/${businessId}/settings`, data);
