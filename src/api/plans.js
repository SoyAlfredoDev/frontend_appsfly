import axios from "./axios.js";

export const getPlansRequest = () => axios.get("/plans");

export const getAdminPlansRequest = () => axios.get("/admin/plans");

export const createPlanRequest = (data) => axios.post("/admin/plans", data);

export const updatePlanRequest = (planId, data) => axios.patch(`/admin/plans/${planId}`, data);

export const updatePlanStatusRequest = (planId, planActive) =>
    axios.patch(`/admin/plans/${planId}/status`, { planActive });

export const deletePlanRequest = (planId) => axios.delete(`/admin/plans/${planId}`);
