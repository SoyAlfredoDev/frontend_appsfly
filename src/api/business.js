import axios from "./axios.js"

export const createBusiness = (data) => axios.post('/business', data);