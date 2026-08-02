import axios from "./axios.js";

export const getAppointmentSettings = () => axios.get("/appointments/settings");

export const updateAppointmentSettings = (payload) =>
    axios.put("/appointments/settings", payload);

export const getAppointmentPublicLink = () => axios.get("/appointments/public-link");

export const getAppointments = (params = {}) =>
    axios.get("/appointments", { params });

export const patchAppointment = (appointmentId, payload) =>
    axios.patch(`/appointments/${appointmentId}`, payload);

export const getTenantAppointmentSlots = (params = {}) =>
    axios.get("/appointments/slots", { params });
