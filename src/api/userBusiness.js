import axios from "./axios.js"

export const createUserBusinessRequest = (data) => axios.post('/userBusiness', data);
export const getUserBusinessById = () => axios.get('/userBusiness');
export const getBusinessMembersRequest = (businessId, config) =>
    axios.get(`/userBusiness/${businessId}/members`, config);

