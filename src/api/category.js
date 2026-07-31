import axios from "./axios.js"

export const getCategories = (config) => axios.get('/categories', config);
export const createCategory = (category) => axios.post('/categories', category);
export const updateCategory = (id, data) => axios.put(`/categories/${id}`, data);
export const deleteCategory = (id) => axios.delete(`/categories/${id}`);

export const createCategoryAttribute = (categoryId, data) =>
    axios.post(`/categories/${categoryId}/attributes`, data);
export const updateCategoryAttribute = (categoryId, attributeId, data) =>
    axios.put(`/categories/${categoryId}/attributes/${attributeId}`, data);
export const patchCategoryAttribute = (categoryId, attributeId, data) =>
    axios.patch(`/categories/${categoryId}/attributes/${attributeId}`, data);
export const deleteCategoryAttribute = (categoryId, attributeId) =>
    axios.delete(`/categories/${categoryId}/attributes/${attributeId}`);
