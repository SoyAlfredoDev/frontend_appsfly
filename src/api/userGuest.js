import axios from "./axios.js";

export const createUserGuest = (data) => axios.post("/userGuest", data);
export const getUserGuestsRequest = () => axios.get("/userGuest");
export const getMyPendingInvitesRequest = () => axios.get("/userGuest/pending/me");
export const userGuestExistsRequest = (email) =>
    axios.get(`/userGuest/exists/${encodeURIComponent(email)}`);
export const responseUserGuestRequest = (data) =>
    axios.put("/userGuest/update/", data);
export const getUserGuestByBusinessIdRequest = (businessId, config) =>
    axios.get(`/userGuest/${businessId}`, config);
export const deleteUserGuestRequest = (userGuestId) =>
    axios.delete(`/userGuest/invitation/${userGuestId}`);
export const resendUserGuestRequest = (userGuestId) =>
    axios.post(`/userGuest/invitation/${userGuestId}/resend`);
