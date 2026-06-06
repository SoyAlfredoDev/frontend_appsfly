import axios from "./axios.js"

export const getCategories = (config) => axios.get('/categories', config);
export const createCategory = (category) => axios.post('/categories', category);
//export const validateRutUserExists = (rut) => axios.get(`/users/validateRutExists/${rut}`);
