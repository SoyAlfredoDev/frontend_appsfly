import axios from "./axios.js";

export const getUsers = () => axios.get('/users');
export const validateRutUserExists = (rut) => axios.get(`/users/validateRutExists/${rut}`);
export const getUsersBusinessDB = () => axios.get('/db/users');
export const getUserByIdRequest = (id) => axios.get(`/users/${id}`);
export const userIsSuperAdminRequest = () => axios.get('/users/isSuperAdmin');
export const updateUserConfirmEmailRequest = (id) => axios.put(`/users/updateConfirmEmail/${id}`);
export const countUsersRequest = () => axios.get('/users/count');





