import axios from "./axios.js"

export const createDailySales = dailySales => axios.post('/dailySales', dailySales);
export const getDailySales = () => axios.get('/dailySales');
export const getDailySaleById = (id) => axios.get(`/dailySales/${id}`);
export const getDailySaleDetail = (id) => axios.get(`/dailySales/${id}/detail`);
export const getClosureStatus = () => axios.get('/dailySales/closure-status');
export const closeAllPendingClosures = () => axios.post('/dailySales/close-all-pending');