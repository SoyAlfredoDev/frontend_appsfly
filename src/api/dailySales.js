import axios from "./axios.js"

export const createDailySales = dailySales => axios.post('/dailySales', dailySales);
export const getDailySales = () => axios.get('/dailySales');
export const getDailySaleById = (id) => axios.get(`/dailySales/${id}`);
export const getDailySaleDetail = (id, config) => axios.get(`/dailySales/${id}/detail`, config);
export const getClosureStatus = (config) => axios.get('/dailySales/closure-status', config);
export const closeAllPendingClosures = () => axios.post('/dailySales/close-all-pending');