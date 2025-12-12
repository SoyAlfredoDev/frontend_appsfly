import axios from "./axios.js";

export const sendEmailRequest = (emailData) => axios.post('/send-email', emailData);
