import axios from "./axios.js"

export const getPlansRequest = () => axios.get(`/plans`);
