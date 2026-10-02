import axios from "./axios.js";

export const getExpenseCategories = () => axios.get("/expense-categories");
export const createExpenseCategory = (expenseCategoryName) =>
  axios.post("/expense-categories", { expenseCategoryName });
export const deleteExpenseCategory = (id) => axios.delete(`/expense-categories/${id}`);
export const createExpense = (data) => axios.post("/expenses", data);
export const getExpenseById = (id) => axios.get(`/expenses/${id}`);
export const getExpenses = (params) => axios.get("/expenses", { params });
export const getExpensesByMonth = (month, year) =>
  axios.get("/expenses", { params: { month, year } });
export const deleteExpense = (id) => axios.delete(`/expenses/delete/${id}`);
export const getSumExpensesByPaymentMethod = (paymentMethod) =>
  axios.get(`/expenses/sum/${paymentMethod}`);
export const getSumExpensesByMonth = (month, year) =>
  axios.get(`/expenses/sum/${month}/${year}`);
