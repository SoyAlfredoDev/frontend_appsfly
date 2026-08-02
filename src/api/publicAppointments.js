import axios from "axios";
import config from "../config/env.js";

const publicApi = axios.create({
    baseURL: config.apiUrl,
});

export const fetchPublicAppointmentPage = (businessId) =>
    publicApi.get(`/public/appointments/${businessId}`);

export const fetchPublicAppointmentSlots = (businessId, params = {}) =>
    publicApi.get(`/public/appointments/${businessId}/slots`, { params });

export const createPublicAppointment = (businessId, payload) =>
    publicApi.post(`/public/appointments/${businessId}`, payload);
