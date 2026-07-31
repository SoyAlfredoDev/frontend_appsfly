import axios from "./axios.js";

export const getLaboratories = ({ activeOnly = false } = {}) =>
    axios.get("/laboratories", { params: activeOnly ? { activeOnly: true } : undefined });

export const getLaboratoryById = (id) => axios.get(`/laboratories/${id}`);

export const createLaboratory = (laboratory) => axios.post("/laboratories", laboratory);

export const updateLaboratory = (id, laboratory) => axios.put(`/laboratories/${id}`, laboratory);

export const deleteLaboratoryById = (id) => axios.delete(`/laboratories/${id}`);
