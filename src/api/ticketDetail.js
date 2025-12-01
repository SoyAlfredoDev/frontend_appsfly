import axios from "./axios.js"
export const createTicketDetail = ticketDetail => axios.post('/ticket-details', ticketDetail);
export const getTicketDetails = () => axios.get('/ticket-details');