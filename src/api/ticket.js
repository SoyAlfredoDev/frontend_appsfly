import axios from "./axios.js"

export const createTicket = ticket => axios.post('/tickets', ticket);
export const getTickets = () => axios.get('/tickets');
export const getTicketById = (id) => axios.get(`/tickets/${id}`);
export const updateTicketStatus = (id, ticketStatus) =>
    axios.patch(`/tickets/${id}`, { ticketStatus });