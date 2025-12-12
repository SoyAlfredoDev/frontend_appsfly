import axios from "./axios.js"
export const getSales = () => axios.get('/sales');
export const createSale = (data) => axios.post('/sales', data);
export const getSaleById = (id) => axios.get(`/sales/${id}`);
export const getMonthlySales = (month, year) => axios.get(`/sales/month/${month}/${year}`);
export const getMonthlySalesNow = () => axios.get('/sales/monthNow');
export const getDaySales = (day, month, year) => axios.get(`/sales/day/${day}/${month}/${year}`);
export const getSalesByCustomerIdRequest = (customerId) => axios.get(`/sales/customer/${customerId}`);
export const countSalesMonthRequest = (month, year) => axios.get(`/sales/count/${month}/${year}`);

