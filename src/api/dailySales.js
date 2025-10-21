import axios from "./axios.js"

export const createDailySales = dailySales => axios.post('/dailySales', dailySales);
export const getDailySales = () => axios.get('/dailySales');