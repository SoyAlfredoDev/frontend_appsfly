import axios from "./axios.js";

export const getLabDispatches = ({ status, laboratoryId } = {}) =>
    axios.get("/lab-dispatches", { params: { status, laboratoryId } });

export const createLabDispatch = ({ laboratoryId, workOrderIds, labDispatchNotes }) =>
    axios.post("/lab-dispatches", { laboratoryId, workOrderIds, labDispatchNotes });

export const getLabDispatchById = (id) => axios.get(`/lab-dispatches/${id}`);

export const receiveLabDispatch = (id, { workOrderIds } = {}) =>
    axios.patch(`/lab-dispatches/${id}/receive`, { workOrderIds });
