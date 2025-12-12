import axios from './axios';

export const subscribeNewsletter = (email) => axios.post('/newsletter/subscribe', { email });
