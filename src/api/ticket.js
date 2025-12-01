import axios from "./axios.js"

export const createTicket = ticket => axios.post('/tickets', ticket);
export const getTickets = () => axios.get('/tickets');