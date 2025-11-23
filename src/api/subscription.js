import axios from "./axios.js"

export const getSubscriptionsByBusinessIdRequest = (businessId) => axios.get(`/subscriptions/${businessId}`);
export const createSubscriptionRequest = (subscription) => axios.post('/subscriptions', subscription);