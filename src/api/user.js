import axios from "./axios.js";

export const getUsers = () => axios.get('/users');
export const validateRutUserExists = (rut) => axios.get(`/users/validateRutExists/${rut}`);
export const getUsersBusinessDB = () => axios.get('/db/users');




