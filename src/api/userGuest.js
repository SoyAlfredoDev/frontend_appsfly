import axios from "./axios.js"

export const createUserGuest = (data) => axios.post('/userGuest', data);
export const getUserGuestsRequest = () => axios.get('/userGuest');
export const userGuestExistsRequest = (email) => axios.get(`/userGuest/exists/${email}`);
export const userGuestUpdateAcceptRequest = (userGuestId) => axios.put(`/userGuest/update/${userGuestId}`);
