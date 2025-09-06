import axios from "./axios.js"

export const getCategories = () => axios.get('/categories');
export const createCategory = (category) => axios.post('/categories', category);
//export const validateRutUserExists = (rut) => axios.get(`/users/validateRutExists/${rut}`);
