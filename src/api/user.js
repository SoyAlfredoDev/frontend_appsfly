import axios from "./axios.js";

export const getUsers = () => axios.get('/users');
export const validateRutUserExists = (rut) => axios.get(`/users/validateRutExists/${rut}`);
export const getUsersBusinessDB = (config) => axios.get('/db/users', config);
export const getUserByIdRequest = (id) => axios.get(`/users/${id}`);
export const userIsSuperAdminRequest = () => axios.get('/users/isSuperAdmin');
export const userIsPlatformOwnerRequest = () => axios.get('/users/isPlatformOwner');
export const updateUserConfirmEmailRequest = (id) => axios.put(`/users/updateConfirmEmail/${id}`);
export const countUsersRequest = () => axios.get('/users/count');
export const sendConfirmEmailRequest = (userId) =>
    axios.post(`/users/${userId}/send-confirm-email`);
export const forgotPasswordRequest = (userEmail) => axios.post('/forgot-password', { userEmail });
export const resetPasswordRequest = (token, newPassword) => axios.post(`/reset-password`, { token, newPassword});
